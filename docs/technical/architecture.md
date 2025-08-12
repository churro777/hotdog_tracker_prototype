# System Architecture

This document defines the target system architecture and data model for the Hot Dog Tracker application.

## 🎯 Architecture Overview

### Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Database**: Firebase Firestore (NoSQL, real-time)
- **Authentication**: Firebase Auth (email/password, Google, Apple, Twitter)
- **Hosting**: Firebase Hosting (global CDN)
- **State Management**: React hooks + Context API

### Core Principles

- **Single Contest Focus**: All data belongs to one contest
- **Real-time Updates**: Live leaderboard and feed updates
- **Atomic Operations**: Consistent data updates using Firebase batch operations
- **User-Centric Security**: Users can only modify their own data

## 📊 Data Model

### `users` Collection

```typescript
interface User {
  id: string                   // Firebase Auth UID (e.g. "abc123xyz")
  email: string                // User's email from Firebase Auth
  displayName: string          // User-chosen display name
  avatar?: string              // Optional profile picture URL
  createdAt: Date              // Account creation timestamp (same as contest join date)
  lastActive: Date             // Last app usage
  totalCount: number           // Running total of hot dogs eaten
  
  // Future fields
  bio?: string                 // Optional user bio
  bestDay?: {                  // Personal best single day
    count: number
    date: Date
  }
  achievements?: string[]      // Array of achievement IDs
  preferences?: {              // User settings
    notifications: boolean
    theme: 'light' | 'dark'
  }
}
```

### `contest-posts` Collection

```typescript
interface ContestPost {
  id: string                   // Firestore auto-generated ID
  userId: string               // Firebase Auth UID
  userName: string             // Display name
  count: number                // Hot dogs eaten (always required)
  image?: string               // Optional image URL
  timestamp: Date              // When posted
  description?: string         // Optional comment
  
  // Future fields
  reactions?: {               // User reactions to posts
    [userId: string]: 'like' | 'fire' | 'wow'
  }
  location?: {                // Optional location data
    lat: number
    lng: number
    name?: string
  }
}
```

### `contest-info` Document (Optional)

```typescript
// Single document at: contest-info/default
interface ContestInfo {
  name: string                 // "Hot Dog Eating Contest 2025"
  description?: string         // Contest description/rules
  startDate: Date              // When contest started
  endDate: Date                // When contest ends
  totalParticipants: number    // Count of joined users
  totalHotDogs: number         // Sum of all hot dogs eaten
  rules: string[]              // Contest rules

  // Optional settings
  prizes?: string[]            // Prize descriptions
}
```

## 🔄 Data Relationships

```text
users (1) ──── userId (FK) ──→ contest-posts (M)
```

**Key Design Decisions:**

- Single contest: no `contestId` fields needed
- Every authenticated user is automatically a contest participant
- User signup = contest joining (same action)
- Contest data (totalCount) stored directly in users collection

## 🔍 Core Queries

### Leaderboard

```typescript
// Get top 10 participants ordered by total count
const leaderboard = query(
  collection(db, 'users'),
  orderBy('totalCount', 'desc'),
  limit(10)
)

// Real-time leaderboard updates
onSnapshot(leaderboard, (snapshot) => {
  const rankings = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  setLeaderboard(rankings)
})
```

### Activity Feed

```typescript
// Get recent posts from all users
const recentPosts = query(
  collection(db, 'contest-posts'),
  orderBy('timestamp', 'desc'),
  limit(20)
)

// Real-time feed updates
onSnapshot(recentPosts, (snapshot) => {
  const posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  setFeed(posts)
})
```

### User Posts

```typescript
// Get specific user's posting history
const userPosts = query(
  collection(db, 'contest-posts'),
  where('userId', '==', currentUser.uid),
  orderBy('timestamp', 'desc')
)
```

## ⚡ Atomic Operations

### Creating a Post

```typescript
const createPost = async (count: number, description?: string, image?: string) => {
  const batch = writeBatch(db)
  
  // 1. Add the post
  const postRef = doc(collection(db, 'contest-posts'))
  batch.set(postRef, {
    userId: currentUser.uid,
    userName: currentUser.displayName,
    count,
    description,
    image,
    timestamp: Timestamp.now()
  })
  
  // 2. Update user's total count atomically
  const userRef = doc(db, 'users', currentUser.uid)
  batch.update(userRef, {
    totalCount: increment(count)
  })
  
  // 3. Update contest statistics
  const contestRef = doc(db, 'contest-info', 'default')
  batch.update(contestRef, {
    totalHotDogs: increment(count)
  })
  
  await batch.commit() // All operations succeed or fail together
}
```

### User Signup (Contest Joining)

```typescript
const signUpUser = async (email: string, password: string, displayName: string) => {
  // 1. Create Firebase Auth account
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user
  
  // 2. Create user document (automatically joins contest)
  const batch = writeBatch(db)
  
  const userRef = doc(db, 'users', user.uid)
  batch.set(userRef, {
    id: user.uid,
    email: user.email,
    displayName,
    createdAt: Timestamp.now(),
    lastActive: Timestamp.now(),
    totalCount: 0 // Starts in contest with 0 hot dogs
  })
  
  // 3. Update contest participant count
  const contestRef = doc(db, 'contest-info', 'default')
  batch.update(contestRef, {
    totalParticipants: increment(1)
  })
  
  await batch.commit()
}
```

## 🔐 Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users - read all (for leaderboard), write own only
    match /users/{userId} {
      allow read: if true; // Anyone can read for guest leaderboard viewing
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Contest posts - read all (for guest feed viewing), write own only
    match /contest-posts/{document} {
      allow read: if true; // Anyone can read for guest viewing
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Contest info - read all, admin write only
    match /contest-info/{document} {
      allow read: if true; // Anyone can read contest info
      allow write: if false; // Admin only in future
    }
  }
}
```

## 🚀 Performance Considerations

### Indexing Strategy

```javascript
// Firestore indexes (firestore.indexes.json)
{
  "indexes": [
    {
      "collectionGroup": "users",
      "fields": [
        { "fieldPath": "totalCount", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "contest-posts", 
      "fields": [
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "contest-posts",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### Caching Strategy

- **Real-time listeners** for leaderboard and feed (automatic caching)
- **Optimistic updates** for user actions (immediate UI feedback)
- **Offline support** via Firebase's built-in offline persistence

### Scaling Limits

- **Firestore**: 10K writes/second, 1M reads/second
- **Authentication**: 1M active users included
- **Hosting**: Unlimited bandwidth, global CDN
- **Real-time listeners**: Up to 100 concurrent per collection

## 📱 Client Architecture

### State Management

```typescript
// AuthContext - User authentication state
interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// ContestContext - Contest data and actions
interface ContestContextType {
  leaderboard: User[]           // Users ordered by totalCount
  recentPosts: ContestPost[]
  userPosts: ContestPost[]
  loading: boolean
  error: string | null
  createPost: (count: number, description?: string, image?: string) => Promise<void>
  refreshData: () => Promise<void>
}
```

### Component Structure

```text
App
├── AuthProvider
│   ├── LandingPage (unauthenticated - guest can view leaderboard)
│   └── MainApp (authenticated - can post and compete)
│       ├── ContestProvider
│       ├── Leaderboard
│       ├── ActivityFeed
│       └── PostForm
└── ErrorBoundary
```

## 🔄 Migration Strategy

See [Current State](./current-state.md) for details on migrating from the existing implementation to this target architecture.

# System Architecture

This document defines the target system architecture and data model for the Hot Dog Tracker application.

## 🎯 Architecture Overview

### Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Database**: Firebase Firestore (NoSQL, real-time)
- **Authentication**: Firebase Auth (email/password)
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
  createdAt: Date              // Account creation timestamp
  lastActive: Date             // Last app usage
  hasJoinedContest: boolean    // Whether user has joined the contest
  
  // Future fields
  bio?: string                 // Optional user bio
  preferences?: {              // User settings
    notifications: boolean
    theme: 'light' | 'dark'
  }
}
```

### `contest-users` Collection

```typescript
interface ContestUser {
  id: string                   // Firestore auto-generated ID
  userId: string               // Firebase Auth UID (links to users collection)
  userName: string             // Display name 
  totalCount: number           // Running total of hot dogs eaten
  joinedAt: Date              // When user joined the contest
  
  // Future fields
  rank?: number               // Current rank in contest
  bestDay?: {                 // Personal best single day
    count: number
    date: Date
  }
  achievements?: string[]     // Array of achievement IDs
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
  totalParticipants: number    // Count of joined users
  totalHotDogs: number         // Sum of all hot dogs eaten
  
  // Optional settings
  rules?: string               // Contest rules
  prizes?: string[]            // Prize descriptions
  socialLinks?: {              // Links to social media
    instagram?: string
    twitter?: string
  }
}
```

## 🔄 Data Relationships

```text
users (1) ──── hasJoinedContest ──→ contest-users
  │
  └── userId (FK) ──→ contest-users
                           │
                           └── userId (FK) ──→ contest-posts
```

**Key Design Decisions:**

- Single contest: no `contestId` fields needed
- Users either joined or haven't: simple boolean flag
- All collections share the same contest scope

## 🔍 Core Queries

### Leaderboard

```typescript
// Get top 10 participants ordered by total count
const leaderboard = query(
  collection(db, 'contest-users'),
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
  const userRef = doc(db, 'contest-users', userDocId)
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

### Joining Contest

```typescript
const joinContest = async (userId: string, userName: string) => {
  const batch = writeBatch(db)
  
  // 1. Create contest-users entry
  const contestUserRef = doc(collection(db, 'contest-users'))
  batch.set(contestUserRef, {
    userId,
    userName,
    totalCount: 0,
    joinedAt: Timestamp.now()
  })
  
  // 2. Update user's contest status
  const userRef = doc(db, 'users', userId)
  batch.update(userRef, {
    hasJoinedContest: true
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
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Contest users - read all, write own only
    match /contest-users/{document} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Contest posts - read all, write own only
    match /contest-posts/{document} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Contest info - read all, admin write only
    match /contest-info/{document} {
      allow read: if request.auth != null;
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
      "collectionGroup": "contest-users",
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
  joinContest: () => Promise<void>
}

// ContestContext - Contest data and actions
interface ContestContextType {
  leaderboard: ContestUser[]
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
│   ├── LandingPage (unauthenticated)
│   └── MainApp (authenticated)
│       ├── ContestProvider
│       ├── Leaderboard
│       ├── ActivityFeed
│       └── PostForm
└── ErrorBoundary
```

## 🔄 Migration Strategy

See [Current State](./current-state.md) for details on migrating from the existing implementation to this target architecture.

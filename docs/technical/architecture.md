# Data Model Architecture

## Current Collections

### `contest-posts`

```typescript
interface ContestPost {
  id: string                    // Firestore auto-generated ID
  contestId: string            // "default" (hardcoded)
  userId: string               // Hardcoded user IDs (1, 2, 3, etc.)
  userName: string             // Display name
  count?: number               // Hot dogs eaten (optional for join/invite posts)
  image?: string               // Image URL
  timestamp: Date              // When posted
  description?: string         // Optional comment
  type: 'entry' | 'join' | 'invite'  // Post type
  invitedUsers?: string[]      // For invite posts
}
```

### `contest-users`

```typescript
interface ContestUser {
  id: string                   // Firestore auto-generated ID
  contestId: string           // "default" (hardcoded)
  userId: string              // Hardcoded user IDs (1, 2, 3, etc.)
  userName: string            // Display name
  totalCount: number          // Running total of hot dogs consumed
}
```

## Proposed Data Model (With Authentication)

### `users` (NEW COLLECTION)

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

### `contest-users` (UPDATED)

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

### `contest-posts` (MINIMAL UPDATES)

```typescript
interface ContestPost {
  id: string                   // Same as before
  userId: string               // Now Firebase Auth UID instead of hardcoded
  userName: string             // Same as before
  count?: number               // Hot dogs eaten (required for 'entry' type)
  image?: string               // Same as before
  timestamp: Date              // Same as before
  description?: string         // Same as before
  type: 'entry' | 'join'       // Simplified: just entry or join posts
  
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

### `contest-info` (SINGLE DOCUMENT - Optional)

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

## Data Relationships

```text
users (1) ──── hasJoinedContest ──→ contest-users
  │
  └── userId (FK) ──→ contest-users
                           │
                           └── userId (FK) ──→ contest-posts
```

**Simplified Structure:**

- One contest, no `contestId` needed in collections
- Users either joined the contest or haven't
- All posts and users belong to the same contest

## Key Changes Needed

### 1. Migration Strategy

- **Phase 1**: Add authentication, keep hardcoded users working
- **Phase 2**: Allow new user registration alongside existing users  
- **Phase 3**: Migrate hardcoded users to real accounts (optional)

### 2. User ID Updates

```typescript
// BEFORE: Hardcoded user IDs
userId: "1" | "2" | "3" | "4" | "5"

// AFTER: Firebase Auth UIDs  
userId: "abc123xyz789" // Firebase Auth UID
```

### 3. Query Updates

```typescript
// Get user's posts (simplified - no contestId needed)
const userPosts = query(
  collection(db, 'contest-posts'),
  where('userId', '==', currentUser.uid),
  orderBy('timestamp', 'desc')
)

// Get contest leaderboard (simplified - all users in same contest)
const leaderboard = query(
  collection(db, 'contest-users'),
  orderBy('totalCount', 'desc'),
  limit(10)
)

// Get all recent posts
const allPosts = query(
  collection(db, 'contest-posts'),
  orderBy('timestamp', 'desc'),
  limit(20)
)
```

## Security Considerations

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Contest users - read all in contest, write own only
    match /contest-users/{document} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Contest posts - read all in contest, write own only
    match /contest-posts/{document} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Contest info - read all, write admin only (optional)
    match /contest-info/{document} {
      allow read: if request.auth != null;
      // Only specific admin users can update contest info
      allow write: if false; // Set to admin-only in future
    }
  }
}
```

### Data Validation

- Ensure `userId` matches authenticated user
- Validate contest participation before allowing posts
- Prevent negative counts or unrealistic values
- Rate limit post creation

## Implementation Priority

### Phase 1 (MVP Authentication)

1. Add `users` collection
2. Update `userId` fields to use Firebase Auth UIDs
3. Implement user registration/login
4. Basic contest joining flow

### Phase 2 (Enhanced Features)  

1. Add optional `contest-info` document for contest details
2. Enhanced user profiles with avatars
3. Improved leaderboards with rankings
4. Personal statistics (best day, streaks, etc.)

### Phase 3 (Social Features)

1. Post reactions (like, fire, wow)
2. Achievement badges (milestones, streaks)
3. User statistics and personal bests
4. Optional admin features for contest management

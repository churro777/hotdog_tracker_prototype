# User Authentication & Contest Joining

## Current State

- No authentication system
- Users are hardcoded (Joey Chestnut, Takeru Kobayashi, Matt Stonie)
- No way for new users to join contests
- No user identification/session management

## Requirements

- **User Registration**: New users can create accounts
- **User Login**: Returning users can sign in
- **Contest Joining**: Authenticated users can join contests
- **User Identity**: Track who is making posts
- **Session Management**: Keep users logged in
- **User Profiles**: Basic user information

## Firebase Authentication Options

### Option 1: Email/Password (RECOMMENDED for MVP)

**Pros:**

- Simple, standard authentication
- No external dependencies
- Full control over user data
- Works for all users

**Cons:**

- Users need to create passwords
- Email verification complexity

### Option 2: Google Sign-In

**Pros:**

- Frictionless for users with Google accounts
- No password management
- Trusted provider

**Cons:**

- Not all users have Google accounts
- External dependency

### Option 3: Anonymous Authentication + Upgrade

**Pros:**

- Users can start immediately
- Can upgrade to full accounts later
- Good for MVP testing

**Cons:**

- Users lose data if they don't upgrade
- More complex user flow

## Recommended Implementation: Email/Password

### Firebase Setup

```typescript
// firebase.ts
import { getAuth } from 'firebase/auth'

export const auth = getAuth(app)
```

### User Flow

1. **Landing Page**: Show contest info + "Join Contest" button
2. **Auth Modal**: Sign up or log in
3. **Contest Join**: Create `contest-users` entry
4. **Main App**: Access full functionality

### Authentication Context

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  joinContest: () => Promise<void>
}
```

### Data Model Updates

#### Add User Collection

```typescript
// New collection: users
interface User {
  id: string              // Firebase Auth UID
  email: string           // From Firebase Auth
  displayName: string     // User chosen name
  avatar?: string         // Optional profile picture
  createdAt: Date         // When account created
  hasJoinedContest: boolean // Whether user joined the contest
}
```

#### Update ContestUser

```typescript
// contest-users collection (existing)
interface ContestUser {
  id: string              // Firestore doc ID
  userId: string          // Firebase Auth UID (links to users collection)
  userName: string        // Display name
  totalCount: number      // Hot dog total
  joinedAt: Date          // When joined the contest
}
```

#### Update ContestPost

```typescript
// contest-posts collection (existing - minimal changes)
interface ContestPost {
  id: string              // Same as before
  userId: string          // Firebase Auth UID (instead of hardcoded)
  userName: string        // Same as before
  // ... rest stays the same (no contestId needed)
}
```

## User Journey

### New User

1. Visits app → sees landing page
2. Clicks "Join Contest" → auth modal opens
3. Signs up with email/password/display name
4. Automatically joins default contest
5. Redirected to main app

### Returning User  

1. Visits app → auto-login if session exists
2. If not logged in → shows landing page
3. Clicks "Sign In" → auth modal
4. Signs in → redirected to main app
5. If not joined contest yet, can join from main app

### Contest Joining

```typescript
async function joinContest(userId: string, userName: string) {
  // Check if already joined
  const existingEntry = await getContestUser(userId)
  if (existingEntry) return

  // Create contest-users entry
  await addDoc(collection(db, 'contest-users'), {
    userId,
    userName,
    totalCount: 0,
    joinedAt: new Date()
  })

  // Update user's contest status
  await updateDoc(doc(db, 'users', userId), {
    hasJoinedContest: true
  })
}
```

## Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Contest users - can read all, write own
    match /contest-users/{document} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Contest posts - can read all, write own
    match /contest-posts/{document} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Implementation Steps

1. Set up Firebase Auth in project
2. Create AuthContext and auth utilities
3. Build authentication modal/forms
4. Update data service to use authenticated user ID
5. Add landing page for unauthenticated users
6. Implement contest joining flow
7. Update Firestore security rules
8. Migrate existing hardcoded users (optional)

## Future Enhancements

- **Social login**: Google, Apple, GitHub
- **User profiles**: Avatars, bios, stats
- **Email verification**: Verify user emails
- **Password reset**: Forgot password flow
- **Admin features**: Contest management

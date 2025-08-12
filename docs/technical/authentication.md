# User Authentication & Contest Joining

## Requirements

- **User Registration**: New users can create accounts
- **User Login**: Returning users can sign in
- **Automatic Contest Entry**: User signup automatically joins contest
- **User Identity**: Track who is making posts
- **Session Management**: Keep users logged in
- **User Profiles**: Basic user information

## Firebase Authentication Methods

The application supports multiple authentication methods for maximum user convenience:

### Primary Methods

#### Email/Password

- **Use Case**: Users who prefer traditional signup
- **Benefits**: Works for everyone, no external dependencies
- **Implementation**: Firebase Auth email/password provider

#### Google Sign-In

- **Use Case**: Users with Google accounts (most common)
- **Benefits**: One-click signup, no password to remember
- **Implementation**: Firebase Auth Google provider

#### Apple Sign-In

- **Use Case**: iOS users, privacy-conscious users
- **Benefits**: Required for App Store, enhanced privacy
- **Implementation**: Firebase Auth Apple provider

#### Twitter Sign-In

- **Use Case**: Social media users, viral sharing potential
- **Benefits**: Easy for social sharing features
- **Implementation**: Firebase Auth Twitter provider

### Guest Access

- **Use Case**: Users who want to browse before signing up
- **Permissions**: View leaderboard and activity feed only
- **Limitations**: Cannot post or compete

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

### Data Model

See [Architecture Overview](./architecture.md) for complete data model specifications.

#### User Collection

```typescript
interface User {
  id: string              // Firebase Auth UID
  email: string           // From Firebase Auth
  displayName: string     // User chosen name
  avatar?: string         // Optional profile picture
  createdAt: Date         // When account created (same as contest join date)
  totalCount: number      // Running total of hot dogs eaten
  lastActive: Date        // Last app usage
}
```

**Key Points:**

- Every authenticated user is automatically a contest participant
- No separate contest-users collection needed
- User signup = contest joining (single action)

## User Journey

### Guest User (Unauthenticated)

1. **Landing Page**: Views contest info, current leaderboard
2. **Browse Mode**: Can view leaderboard and activity feed
3. **Join Prompt**: "Sign up to start competing" call-to-action
4. **Auth Modal**: Choose from multiple sign-in options

### New User Signup

1. **Authentication**: Choose preferred method (email, Google, Apple, Twitter)
2. **Account Creation**: Firebase Auth creates user account
3. **Contest Entry**: User document created with `totalCount: 0`
4. **Immediate Access**: Redirected to main app, ready to post

### Returning User

1. **Auto-Login**: Automatic if session exists
2. **Manual Login**: If session expired, use any configured auth method
3. **Main App**: Full access to posting and competition features

### Authentication Implementation

```typescript
const signUpUser = async (email: string, password: string, displayName: string) => {
  // 1. Create Firebase Auth account
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  const user = userCredential.user
  
  // 2. Create user document (automatically joins contest)
  await setDoc(doc(db, 'users', user.uid), {
    id: user.uid,
    email: user.email,
    displayName,
    createdAt: Timestamp.now(),
    lastActive: Timestamp.now(),
    totalCount: 0 // Starts in contest with 0 hot dogs
  })
}
```

## Security Rules

See [Architecture Overview](./architecture.md) for complete security rule specifications.

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

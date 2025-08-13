# Current Implementation State

This document describes the existing codebase and data structures as they exist today. This is **not** the target architecture - see [Architecture Overview](./architecture.md) for the final design.

## 🔄 Purpose

This document helps developers understand:

- What exists in the current codebase
- How the current implementation works
- Migration paths from current to target state

## 📊 Current Data Collections

### `contest-posts` (Current)

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

### `contest-users` (Current)

```typescript
interface ContestUser {
  id: string                   // Firestore auto-generated ID
  contestId: string           // "default" (hardcoded)
  userId: string              // Hardcoded user IDs (1, 2, 3, etc.)
  userName: string            // Display name
  totalCount: number          // Running total of hot dogs consumed
}
```

## 🏗️ Current Implementation

### Data Service Layer

The app currently uses a service layer abstraction (`src/services/dataService.ts`) that can switch between:

- **LocalStorageDataService**: For development/testing
- **FirebaseDataService**: For production

Selection is controlled by environment variables:

```typescript
const useFirebase = import.meta.env['VITE_USE_FIREBASE'] === 'true'
```

### Hardcoded Users

Current users are predefined:

- Joey Chestnut (ID: "1")
- Takeru Kobayashi (ID: "2")
- Matt Stonie (ID: "3")
- Plus additional hardcoded entries

### Authentication State

Currently **no authentication system** - users are selected from hardcoded list in the UI.

## 🔄 Migration Strategy

### Phase 1: Add Authentication

1. Implement Firebase Auth
2. Create `users` collection
3. Allow new user registration alongside existing hardcoded users

### Phase 2: Simplify Data Model

1. Remove `type` field from posts
2. Remove `contestId` fields (single contest)
3. Update `userId` fields to use Firebase Auth UIDs

### Phase 3: Clean Up

1. Migrate or remove hardcoded users
2. Remove LocalStorage fallback if not needed
3. Optimize queries for final data structure

## 🗂️ Current File Structure

### Key Files

- `src/services/dataService.ts` - Data abstraction layer
- `src/hooks/useContestData.ts` - Data fetching hooks (current)
- `src/hooks/useContestDataV2.ts` - Firebase-specific hooks (newer)
- `src/constants/index.ts` - Hardcoded user/contest IDs

### Environment Configuration

- `.env` - Development configuration with Firebase keys
- `.env.production` - Production config (injected via CI/CD)

## 🎯 Known Issues

1. **Mixed Data Hooks**: App uses both `useContestData` and `useContestDataV2`
2. **Authentication Gap**: No user authentication or session management
3. **Hardcoded Dependencies**: User selection tied to predefined list
4. **Data Inconsistency**: Post types create complexity in UI logic

## ➡️ Next Steps

See [Architecture Overview](./architecture.md) for the target data model and implementation approach that addresses these current limitations.

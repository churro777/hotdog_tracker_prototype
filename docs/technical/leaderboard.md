# Leaderboard System

## Current State

- Static leaderboard showing hardcoded users
- Data comes from `contest-users` collection with `totalCount` field
- No dynamic updates when posts are created

## Requirements

- **Dynamic Updates**: Leaderboard should update in real-time when users post new entries
- **Accurate Calculation**: Total counts must be accurate and consistent
- **Performance**: Should be fast to load and display
- **Real-time**: Multiple users should see updates instantly

## Architecture Options

### Option 1: Update `totalCount` on Every Post (RECOMMENDED)

**How it works:**

- When user creates a post with `count: 5`, we update their `contest-users.totalCount += 5`
- Use Firebase batch operations to ensure atomicity
- Leaderboard simply queries `contest-users` ordered by `totalCount DESC`

**Pros:**

- Fast leaderboard queries (no aggregation needed)
- Real-time updates via Firestore listeners
- Simple implementation
- Consistent data

**Cons:**

- Need to ensure atomic updates (solved with batch operations)
- Slightly more complex post creation

### Option 2: Calculate Leaderboard from Posts (NOT RECOMMENDED)

**How it works:**

- Query all posts for each user and sum their counts
- Recalculate leaderboard on every view

**Pros:**

- Simple post creation
- Always accurate (source of truth)

**Cons:**

- Expensive queries (gets worse with scale)
- Slower leaderboard loading
- More complex aggregation logic

### Option 3: Separate Leaderboard Collection (OVERKILL)

**How it works:**

- Dedicated `leaderboards` collection
- Update via Cloud Functions on post creation

**Pros:**

- Clean separation
- Could support multiple contest types

**Cons:**

- Over-engineered for current needs
- Requires Cloud Functions (extra complexity)
- More moving parts

## Recommended Implementation

### Data Updates (When Post Created)

```typescript
// In FirebaseDataService.addPost()
const batch = writeBatch(db)

// 1. Add the post
const postRef = doc(collection(db, 'contest-posts'))
batch.set(postRef, postData)

// 2. Update user's total count
const userRef = doc(db, 'contest-users', userDocId)
batch.update(userRef, {
  totalCount: increment(postData.count || 0)
})

await batch.commit()
```

### Leaderboard Query

```typescript
// Simple query, ordered by totalCount
const usersRef = collection(db, 'contest-users')
const leaderboardQuery = query(
  usersRef, 
  where('contestId', '==', contestId),
  orderBy('totalCount', 'desc'),
  limit(10) // Top 10
)
```

### Real-time Updates

```typescript
// Listen to contest-users collection for real-time updates
const unsubscribe = onSnapshot(leaderboardQuery, (snapshot) => {
  const leaderboard = snapshot.docs.map(doc => doc.data())
  setLeaderboard(leaderboard)
})
```

## Implementation Steps

1. Modify `FirebaseDataService.addPost()` to use batch operations
2. Find user document ID when creating post (need user lookup)
3. Update leaderboard component to use Firestore listener
4. Add error handling for concurrent updates
5. Test with multiple users posting simultaneously

## Edge Cases to Handle

- **User doesn't exist**: Should create user entry first
- **Concurrent updates**: Batch operations handle this
- **Negative counts**: Validation to prevent negative totals
- **Contest switching**: Filter leaderboard by contestId

## Future Enhancements

- **Leaderboard history**: Track daily/weekly leaderboards
- **Multiple contests**: Support different contest types
- **Achievements**: Badges for milestones
- **Social features**: Following other users

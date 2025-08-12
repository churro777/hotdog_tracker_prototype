# Leaderboard System

## Requirements

- **Dynamic Updates**: Leaderboard should update in real-time when users post new entries
- **Accurate Calculation**: Total counts must be accurate and consistent
- **Performance**: Should be fast to load and display
- **Real-time**: Multiple users should see updates instantly

## Implementation Strategy

The leaderboard uses a **pre-computed totals approach** with Firebase batch operations to ensure data consistency and optimal performance.

### Atomic Post Creation & Count Update

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

### Leaderboard Query

```typescript
// Simple, fast query using pre-computed totals
const leaderboard = query(
  collection(db, 'users'),
  orderBy('totalCount', 'desc'),
  limit(10) // Top 10 contestants
)
```

### Real-time Updates

```typescript
// Listen to users collection for real-time leaderboard updates
const unsubscribe = onSnapshot(leaderboard, (snapshot) => {
  const rankings = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
  setLeaderboard(rankings)
})
```

## Performance Considerations

### Indexing

```javascript
// Firestore index for fast leaderboard queries
{
  "collectionGroup": "users",
  "fields": [
    { "fieldPath": "totalCount", "order": "DESCENDING" }
  ]
}
```

### Scalability

- **Atomic operations**: Firebase `increment()` handles concurrent updates
- **Real-time listeners**: Automatic caching and efficient delta updates
- **Query optimization**: Index on `totalCount` enables fast sorting
- **Batch operations**: Ensure data consistency across collections

## Error Handling

### Validation Rules

```typescript
const validatePost = (count: number) => {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error('Count must be a positive integer')
  }
  if (count > 100) {
    throw new Error('Count seems unrealistic (max 100 per post)')
  }
}
```

### Edge Cases

- **Concurrent updates**: Firebase batch operations are atomic
- **Network failures**: Operations retry automatically
- **Invalid data**: Client-side validation prevents bad data
- **User authentication**: Security rules enforce user ownership

## Future Enhancements

- **Leaderboard history**: Track daily/weekly snapshots
- **Achievement system**: Badges for milestones (10, 50, 100+ hot dogs)
- **Personal statistics**: Individual progress charts and analytics
- **Social features**: User following and activity notifications

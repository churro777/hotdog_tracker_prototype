/**
 * Data service abstraction layer
 * Provides a consistent interface for data operations that can be easily swapped
 * between localStorage (current) and Firebase (future) implementations
 */

import type { ContestPost, User, Contest, PostComment } from '@types'

/**
 * Generic data service interface
 */
export interface DataService {
  // Contests
  getContests(): Promise<Contest[]>
  addContest(contest: Omit<Contest, 'id'>): Promise<Contest>
  updateContest(id: string, updates: Partial<Contest>): Promise<Contest>
  deleteContest(id: string): Promise<void>

  // Contest Posts
  getPosts(contestId?: string): Promise<ContestPost[]>
  addPost(post: Omit<ContestPost, 'id'>): Promise<ContestPost>
  updatePost(id: string, updates: Partial<ContestPost>): Promise<ContestPost>
  deletePost(id: string, deletedBy?: string): Promise<void>
  getDeletedPosts(): Promise<ContestPost[]>
  restorePost(id: string): Promise<void>
  syncContestScores(): Promise<{ updated: number; errors: string[] }>

  // Users (simplified architecture - includes contest data)
  getUsers(): Promise<User[]>
  updateUser(id: string, updates: Partial<User>): Promise<User>
  addUser(user: Omit<User, 'id'>): Promise<User>
  hideUser(userId: string, hiddenBy: string): Promise<void>
  unhideUser(userId: string): Promise<void>
  getHiddenUsers(): Promise<User[]>

  // Post reactions
  togglePostReaction(
    postId: string,
    userId: string,
    emoji: string
  ): Promise<void>
  togglePostFlag(postId: string, userId: string): Promise<void>
  /** @deprecated Use togglePostReaction instead */
  togglePostUpvote(postId: string, userId: string): Promise<void>

  // Admin post management
  clearPostFlags(postId: string): Promise<void>
  getFlaggedPosts(threshold?: number): Promise<ContestPost[]>

  // Post comments
  getPostComments(postId: string, limit?: number): Promise<PostComment[]>
  addPostComment(
    postId: string,
    commentData: Omit<PostComment, 'id' | 'postId'>
  ): Promise<PostComment>
  deletePostComment(
    postId: string,
    commentId: string,
    deletedBy?: string
  ): Promise<void>

  // Batch operations
  batchUpdate(operations: BatchOperation[]): Promise<void>
}

/**
 * Batch operation interface for atomic updates
 */
export type BatchOperation =
  | { type: 'create'; collection: 'contests'; data: Omit<Contest, 'id'> }
  | { type: 'create'; collection: 'posts'; data: Omit<ContestPost, 'id'> }
  | { type: 'create'; collection: 'users'; data: Omit<User, 'id'> }
  | {
      type: 'update'
      collection: 'contests'
      id: string
      data: Partial<Contest>
    }
  | {
      type: 'update'
      collection: 'posts'
      id: string
      data: Partial<ContestPost>
    }
  | {
      type: 'update'
      collection: 'users'
      id: string
      data: Partial<User>
    }
  | { type: 'delete'; collection: 'contests'; id: string }
  | { type: 'delete'; collection: 'posts'; id: string }

/**
 * Firebase-based data service implementation
 * Provides real-time data synchronization with Firestore
 */
class FirebaseDataService implements DataService {
  private readonly contestsCollection = 'contests'
  private readonly postsCollection = 'contest-posts'
  private readonly usersCollection = 'users'

  async getContests(): Promise<Contest[]> {
    try {
      const { collection, getDocs, orderBy, query } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      const contestsRef = collection(db, this.contestsCollection)
      const q = query(contestsRef, orderBy('startDate', 'desc'))
      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => {
        const data = doc.data() as Record<string, unknown>
        const startDate = data['startDate'] as { toDate(): Date } | undefined
        const endDate = data['endDate'] as { toDate(): Date } | undefined
        const createdAt = data['createdAt'] as { toDate(): Date } | undefined
        const endOfReviewDate = data['endOfReviewDate'] as
          | { toDate(): Date }
          | undefined
        return {
          id: doc.id,
          ...data,
          startDate: startDate?.toDate() ?? new Date(),
          endDate: endDate?.toDate() ?? new Date(),
          createdAt: createdAt?.toDate() ?? new Date(),
          ...(endOfReviewDate && {
            endOfReviewDate: endOfReviewDate.toDate(),
          }),
        }
      }) as Contest[]
    } catch (error) {
      const { logFirebaseError } = await import('@utils/errorLogger')
      logFirebaseError('Failed to fetch contests', error as Error, 'contests')
      throw error
    }
  }

  async addContest(contestData: Omit<Contest, 'id'>): Promise<Contest> {
    try {
      const { collection, addDoc, Timestamp } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      const contestsRef = collection(db, this.contestsCollection)
      const dataWithTimestamps = {
        ...contestData,
        startDate: Timestamp.fromDate(contestData.startDate),
        endDate: Timestamp.fromDate(contestData.endDate),
        createdAt: Timestamp.fromDate(contestData.createdAt),
        ...(contestData.endOfReviewDate && {
          endOfReviewDate: Timestamp.fromDate(contestData.endOfReviewDate),
        }),
      }

      const docRef = await addDoc(contestsRef, dataWithTimestamps)

      return {
        id: docRef.id,
        ...contestData,
      }
    } catch (error) {
      console.error('Error adding contest to Firebase:', error)
      throw error
    }
  }

  async updateContest(id: string, updates: Partial<Contest>): Promise<Contest> {
    try {
      const { doc, updateDoc, getDoc, Timestamp } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      const contestRef = doc(db, this.contestsCollection, id)
      const updatesWithTimestamps = {
        ...updates,
        ...(updates.startDate && {
          startDate: Timestamp.fromDate(updates.startDate),
        }),
        ...(updates.endDate && {
          endDate: Timestamp.fromDate(updates.endDate),
        }),
        ...(updates.createdAt && {
          createdAt: Timestamp.fromDate(updates.createdAt),
        }),
        ...(updates.endOfReviewDate && {
          endOfReviewDate: Timestamp.fromDate(updates.endOfReviewDate),
        }),
      }

      await updateDoc(contestRef, updatesWithTimestamps)

      const updatedDoc = await getDoc(contestRef)
      const data = updatedDoc.data() as Record<string, unknown>
      const startDate = data['startDate'] as { toDate(): Date } | undefined
      const endDate = data['endDate'] as { toDate(): Date } | undefined
      const createdAt = data['createdAt'] as { toDate(): Date } | undefined
      const endOfReviewDate = data['endOfReviewDate'] as
        | { toDate(): Date }
        | undefined

      return {
        id,
        ...data,
        startDate: startDate?.toDate() ?? new Date(),
        endDate: endDate?.toDate() ?? new Date(),
        createdAt: createdAt?.toDate() ?? new Date(),
        ...(endOfReviewDate && {
          endOfReviewDate: endOfReviewDate.toDate(),
        }),
      } as Contest
    } catch (error) {
      console.error('Error updating contest in Firebase:', error)
      throw error
    }
  }

  async deleteContest(id: string): Promise<void> {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      const { db } = await import('@config/firebase')

      const contestRef = doc(db, this.contestsCollection, id)
      await deleteDoc(contestRef)
    } catch (error) {
      console.error('Error deleting contest from Firebase:', error)
      throw error
    }
  }

  async getPosts(contestId?: string): Promise<ContestPost[]> {
    try {
      const { collection, getDocs, orderBy, query, where } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      const postsRef = collection(db, this.postsCollection)

      // Base query - filter deleted posts client-side to avoid composite index
      let q
      if (contestId) {
        q = query(
          postsRef,
          where('contestId', '==', contestId),
          orderBy('timestamp', 'desc')
        )
      } else {
        q = query(postsRef, orderBy('timestamp', 'desc'))
      }

      const snapshot = await getDocs(q)

      return snapshot.docs
        .map(doc => {
          const data = doc.data() as Record<string, unknown>
          const timestamp = data['timestamp'] as { toDate(): Date } | undefined
          return {
            id: doc.id,
            ...data,
            timestamp: timestamp?.toDate() ?? new Date(),
          }
        })
        .filter(
          post => !(post as unknown as { isDeleted?: boolean }).isDeleted
        ) as ContestPost[]
    } catch (error) {
      const { logFirebaseError } = await import('@utils/errorLogger')
      logFirebaseError('Failed to fetch posts', error as Error, 'contest-posts')
      throw error
    }
  }

  async addPost(postData: Omit<ContestPost, 'id'>): Promise<ContestPost> {
    try {
      const { collection, addDoc, Timestamp } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      // Log Firebase post details for debugging
      console.log('🔥 Firebase addPost started:', {
        userId: postData.userId,
        userName: postData.userName,
        count: postData.count,
        hasImage: !!postData.image,
        imageSize: postData.image?.length ?? 0,
        hasDescription: !!postData.description,
        timestamp: postData.timestamp,
      })

      const postsRef = collection(db, this.postsCollection)
      const dataWithTimestamp = {
        ...postData,
        timestamp: Timestamp.fromDate(postData.timestamp),
      }

      const docRef = await addDoc(postsRef, dataWithTimestamp)

      console.log('✅ Firebase addPost successful:', {
        docId: docRef.id,
        collection: this.postsCollection,
      })

      return {
        id: docRef.id,
        ...postData,
      }
    } catch (error) {
      console.error('❌ Error adding post to Firebase:', {
        error,
        postData: {
          userId: postData.userId,
          count: postData.count,
          hasImage: !!postData.image,
          imageSize: postData.image?.length ?? 0,
        },
      })
      throw error
    }
  }

  async updatePost(
    id: string,
    updates: Partial<ContestPost>
  ): Promise<ContestPost> {
    try {
      const { doc, updateDoc, getDoc, Timestamp } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      const postRef = doc(db, this.postsCollection, id)
      const updatesWithTimestamp = {
        ...updates,
        ...(updates.timestamp && {
          timestamp: Timestamp.fromDate(updates.timestamp),
        }),
      }

      await updateDoc(postRef, updatesWithTimestamp)

      const updatedDoc = await getDoc(postRef)
      if (!updatedDoc.exists()) {
        throw new Error(`Post with id ${id} not found`)
      }

      const data = updatedDoc.data() as Record<string, unknown>
      const timestamp = data['timestamp'] as { toDate(): Date } | undefined
      return {
        id: updatedDoc.id,
        ...data,
        timestamp: timestamp?.toDate() ?? new Date(),
      } as ContestPost
    } catch (error) {
      console.error('Error updating post in Firebase:', error)
      throw error
    }
  }

  async deletePost(id: string, deletedBy?: string): Promise<void> {
    try {
      const { doc, updateDoc, getDoc, Timestamp, increment } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      // First get the post to know the count and user
      const postRef = doc(db, this.postsCollection, id)
      const postSnap = await getDoc(postRef)

      if (!postSnap.exists()) {
        throw new Error('Post not found')
      }

      const postData = postSnap.data()
      const userId = postData['userId'] as string
      const count = postData['count'] as number

      // Soft delete the post
      await updateDoc(postRef, {
        isDeleted: true,
        deletedAt: Timestamp.now(),
        deletedBy: deletedBy ?? 'unknown',
      })

      // Subtract count from user's totalCount
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        totalCount: increment(-count),
      })
    } catch (error) {
      console.error('Error soft deleting post from Firebase:', error)
      throw error
    }
  }

  async getDeletedPosts(): Promise<ContestPost[]> {
    try {
      const { collection, getDocs, orderBy, query, where } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      const postsRef = collection(db, this.postsCollection)
      const q = query(
        postsRef,
        where('isDeleted', '==', true),
        orderBy('deletedAt', 'desc')
      )

      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => {
        const data = doc.data() as Record<string, unknown>
        const timestamp = data['timestamp'] as { toDate(): Date } | undefined
        const deletedAt = data['deletedAt'] as { toDate(): Date } | undefined
        return {
          id: doc.id,
          ...data,
          timestamp: timestamp?.toDate() ?? new Date(),
          deletedAt: deletedAt?.toDate() ?? new Date(),
        }
      }) as ContestPost[]
    } catch (error) {
      console.error('Error fetching deleted posts from Firebase:', error)
      throw error
    }
  }

  async restorePost(id: string): Promise<void> {
    try {
      const { doc, updateDoc, getDoc, deleteField, increment } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      // First get the post to know the count and user
      const postRef = doc(db, this.postsCollection, id)
      const postSnap = await getDoc(postRef)

      if (!postSnap.exists()) {
        throw new Error('Post not found')
      }

      const postData = postSnap.data()
      const userId = postData['userId'] as string
      const count = postData['count'] as number

      // Restore the post (remove deletion flags)
      await updateDoc(postRef, {
        isDeleted: deleteField(),
        deletedAt: deleteField(),
        deletedBy: deleteField(),
      })

      // Add count back to user's totalCount
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        totalCount: increment(count),
      })
    } catch (error) {
      console.error('Error restoring post from Firebase:', error)
      throw error
    }
  }

  async syncContestScores(): Promise<{ updated: number; errors: string[] }> {
    try {
      const { collection, getDocs, writeBatch, doc } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      const errors: string[] = []
      let updated = 0

      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'))

      // Get all posts and filter non-deleted client-side
      const postsSnapshot = await getDocs(collection(db, this.postsCollection))
      const validPosts = postsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((post: unknown) => !(post as { isDeleted?: boolean }).isDeleted)

      // Calculate actual scores for each user
      const userScores = new Map<string, number>()

      for (const post of validPosts) {
        const userId = (post as unknown as { userId: string }).userId
        const count = (post as unknown as { count: number }).count
        userScores.set(userId, (userScores.get(userId) ?? 0) + count)
      }

      // Prepare batch updates
      const batch = writeBatch(db)

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data()
        const userId = userDoc.id
        const currentTotal = userData['totalCount'] as number
        const actualTotal = userScores.get(userId) ?? 0

        if (currentTotal !== actualTotal) {
          const userRef = doc(db, 'users', userId)
          batch.update(userRef, { totalCount: actualTotal })
          updated++
        }
      }

      // Execute batch update
      if (updated > 0) {
        await batch.commit()
      }

      return { updated, errors }
    } catch (error) {
      console.error('Error syncing contest scores:', error)
      return { updated: 0, errors: [(error as Error).message] }
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const { collection, getDocs, orderBy, query } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      const usersRef = collection(db, this.usersCollection)
      const q = query(usersRef, orderBy('totalCount', 'desc'))
      const snapshot = await getDocs(q)

      return snapshot.docs
        .map(doc => {
          const data = doc.data() as Record<string, unknown>
          const createdAt = data['createdAt'] as { toDate(): Date } | undefined
          const lastActive = data['lastActive'] as
            | { toDate(): Date }
            | undefined

          return {
            id: doc.id,
            ...data,
            createdAt: createdAt?.toDate() ?? new Date(),
            lastActive: lastActive?.toDate() ?? new Date(),
          }
        })
        .filter(
          user => !(user as unknown as { isHidden?: boolean }).isHidden
        ) as User[]
    } catch (error) {
      const { logFirebaseError } = await import('@utils/errorLogger')
      logFirebaseError('Failed to fetch users', error as Error, 'users')
      throw error
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      const { doc, updateDoc, getDoc, Timestamp } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      const userRef = doc(db, this.usersCollection, id)
      const updatesWithTimestamp = {
        ...updates,
        ...(updates.createdAt && {
          createdAt: Timestamp.fromDate(updates.createdAt),
        }),
        ...(updates.lastActive && {
          lastActive: Timestamp.fromDate(updates.lastActive),
        }),
      }

      await updateDoc(userRef, updatesWithTimestamp)

      const updatedDoc = await getDoc(userRef)
      if (!updatedDoc.exists()) {
        throw new Error(`User with id ${id} not found`)
      }

      const data = updatedDoc.data() as Record<string, unknown>
      const createdAt = data['createdAt'] as { toDate(): Date } | undefined
      const lastActive = data['lastActive'] as { toDate(): Date } | undefined

      return {
        id: updatedDoc.id,
        ...data,
        createdAt: createdAt?.toDate() ?? new Date(),
        lastActive: lastActive?.toDate() ?? new Date(),
      } as User
    } catch (error) {
      console.error('Error updating user in Firebase:', error)
      throw error
    }
  }

  async addUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      const { collection, addDoc, Timestamp } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      const usersRef = collection(db, this.usersCollection)
      const dataWithTimestamp = {
        ...userData,
        createdAt: Timestamp.fromDate(userData.createdAt),
        lastActive: Timestamp.fromDate(userData.lastActive),
      }

      const docRef = await addDoc(usersRef, dataWithTimestamp)

      return {
        id: docRef.id,
        ...userData,
      }
    } catch (error) {
      console.error('Error adding user to Firebase:', error)
      throw error
    }
  }

  async hideUser(userId: string, hiddenBy: string): Promise<void> {
    try {
      const { doc, updateDoc, Timestamp } = await import('firebase/firestore')
      const { db } = await import('@config/firebase')

      const userRef = doc(db, this.usersCollection, userId)
      await updateDoc(userRef, {
        isHidden: true,
        hiddenAt: Timestamp.now(),
        hiddenBy,
      })
    } catch (error) {
      console.error('Error hiding user in Firebase:', error)
      throw error
    }
  }

  async unhideUser(userId: string): Promise<void> {
    try {
      const { doc, updateDoc, deleteField } = await import('firebase/firestore')
      const { db } = await import('@config/firebase')

      const userRef = doc(db, this.usersCollection, userId)
      await updateDoc(userRef, {
        isHidden: deleteField(),
        hiddenAt: deleteField(),
        hiddenBy: deleteField(),
      })
    } catch (error) {
      console.error('Error unhiding user in Firebase:', error)
      throw error
    }
  }

  async getHiddenUsers(): Promise<User[]> {
    try {
      const { collection, getDocs, orderBy, query, where } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      const usersRef = collection(db, this.usersCollection)
      const q = query(
        usersRef,
        where('isHidden', '==', true),
        orderBy('hiddenAt', 'desc')
      )
      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => {
        const data = doc.data() as Record<string, unknown>
        const createdAt = data['createdAt'] as { toDate(): Date } | undefined
        const lastActive = data['lastActive'] as { toDate(): Date } | undefined
        const hiddenAt = data['hiddenAt'] as { toDate(): Date } | undefined

        return {
          id: doc.id,
          ...data,
          createdAt: createdAt?.toDate() ?? new Date(),
          lastActive: lastActive?.toDate() ?? new Date(),
          hiddenAt: hiddenAt?.toDate(),
        }
      }) as User[]
    } catch (error) {
      const { logFirebaseError } = await import('@utils/errorLogger')
      logFirebaseError('Failed to fetch hidden users', error as Error, 'users')
      throw error
    }
  }

  async togglePostReaction(
    postId: string,
    userId: string,
    emoji: string
  ): Promise<void> {
    try {
      const { doc, updateDoc, arrayUnion, arrayRemove, getDoc } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      const postRef = doc(db, this.postsCollection, postId)
      const postSnap = await getDoc(postRef)

      if (!postSnap.exists()) {
        throw new Error('Post not found')
      }

      const postData = postSnap.data() as ContestPost
      const currentReactions = postData.reactions ?? {}

      // Handle legacy upvotes
      const legacyUpvotes = postData.upvotes ?? []
      if (legacyUpvotes.length > 0 && !currentReactions['👍']) {
        currentReactions['👍'] = legacyUpvotes
      }

      // Check if user already has this specific reaction
      const currentUserIds = currentReactions[emoji] ?? []
      const userHasThisReaction = currentUserIds.includes(userId)

      const updates: Record<string, any> = {} // eslint-disable-line @typescript-eslint/no-explicit-any

      // Toggle the specific emoji reaction
      if (emoji) {
        if (userHasThisReaction) {
          // Remove user from this reaction
          if (currentUserIds.length <= 1) {
            // Remove the reaction entirely if this is the only user
            updates[`reactions.${emoji}`] = arrayRemove(...currentUserIds)
          } else {
            // Remove user from the reaction
            updates[`reactions.${emoji}`] = arrayRemove(userId)
          }
        } else {
          // Add user to this reaction
          updates[`reactions.${emoji}`] = arrayUnion(userId)
        }
      }

      // Clear legacy upvotes if we're transitioning to new system
      if (legacyUpvotes.length > 0 && currentReactions['👍']) {
        updates['upvotes'] = arrayRemove(...legacyUpvotes)
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(postRef, updates)
      }
    } catch (error) {
      const { logFirebaseError } = await import('@utils/errorLogger')
      logFirebaseError(
        'Failed to toggle post reaction',
        error as Error,
        'posts'
      )
      throw error
    }
  }

  /** @deprecated Use togglePostReaction instead */
  async togglePostUpvote(postId: string, userId: string): Promise<void> {
    // Forward to new reaction system with thumbs up emoji
    return this.togglePostReaction(postId, userId, '👍')
  }

  async togglePostFlag(postId: string, userId: string): Promise<void> {
    try {
      const { doc, updateDoc, arrayUnion, arrayRemove, getDoc } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      const postRef = doc(db, this.postsCollection, postId)
      const postSnap = await getDoc(postRef)

      if (!postSnap.exists()) {
        throw new Error('Post not found')
      }

      const postData = postSnap.data() as ContestPost
      const currentFlags = postData.fishyFlags ?? []
      const hasFlagged = currentFlags.includes(userId)

      await updateDoc(postRef, {
        fishyFlags: hasFlagged ? arrayRemove(userId) : arrayUnion(userId),
      })
    } catch (error) {
      const { logFirebaseError } = await import('@utils/errorLogger')
      logFirebaseError('Failed to toggle post flag', error as Error, 'posts')
      throw error
    }
  }

  async clearPostFlags(postId: string): Promise<void> {
    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('@config/firebase')

      const postRef = doc(db, this.postsCollection, postId)
      await updateDoc(postRef, {
        fishyFlags: [],
      })
    } catch (error) {
      const { logFirebaseError } = await import('@utils/errorLogger')
      logFirebaseError('Failed to clear post flags', error as Error, 'posts')
      throw error
    }
  }

  async getFlaggedPosts(threshold = 3): Promise<ContestPost[]> {
    try {
      const { collection, getDocs, orderBy, query } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      const postsRef = collection(db, this.postsCollection)
      const q = query(postsRef, orderBy('timestamp', 'desc'))
      const snapshot = await getDocs(q)

      const flaggedPosts: ContestPost[] = []

      snapshot.docs.forEach(doc => {
        const data = doc.data() as Record<string, unknown>
        const timestamp = data['timestamp'] as { toDate(): Date } | undefined
        const fishyFlags = (data['fishyFlags'] as string[]) || []

        if (fishyFlags.length >= threshold) {
          flaggedPosts.push({
            id: doc.id,
            ...data,
            timestamp: timestamp?.toDate() ?? new Date(),
            upvotes: (data['upvotes'] as string[]) || [],
            fishyFlags,
          } as ContestPost)
        }
      })

      return flaggedPosts
    } catch (error) {
      const { logFirebaseError } = await import('@utils/errorLogger')
      logFirebaseError('Failed to fetch flagged posts', error as Error, 'posts')
      throw error
    }
  }

  async getPostComments(
    postId: string,
    limit?: number
  ): Promise<PostComment[]> {
    try {
      const {
        collection,
        getDocs,
        orderBy,
        query,
        doc,
        limit: limitFn,
      } = await import('firebase/firestore')
      const { db } = await import('@config/firebase')

      const postRef = doc(db, this.postsCollection, postId)
      const commentsRef = collection(postRef, 'comments')

      // Query comments ordered by timestamp ascending (oldest first)
      let q = query(commentsRef, orderBy('timestamp', 'asc'))

      // Apply limit if specified
      if (limit) {
        q = query(q, limitFn(limit))
      }

      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => {
        const data = doc.data() as Record<string, unknown>
        const timestamp = data['timestamp'] as { toDate(): Date } | undefined
        return {
          id: doc.id,
          postId,
          ...data,
          timestamp: timestamp?.toDate() ?? new Date(),
        } as PostComment
      })
    } catch (error) {
      const { logFirebaseError } = await import('@utils/errorLogger')
      logFirebaseError(
        'Failed to fetch post comments',
        error as Error,
        'comments'
      )
      throw error
    }
  }

  async addPostComment(
    postId: string,
    commentData: Omit<PostComment, 'id' | 'postId'>
  ): Promise<PostComment> {
    try {
      const { collection, addDoc, doc, Timestamp } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      // Validate comment text length
      if (commentData.text.length > 256) {
        throw new Error('Comment text exceeds 256 character limit')
      }

      const postRef = doc(db, this.postsCollection, postId)
      const commentsRef = collection(postRef, 'comments')

      const dataWithTimestamp = {
        ...commentData,
        timestamp: Timestamp.fromDate(commentData.timestamp),
      }

      const docRef = await addDoc(commentsRef, dataWithTimestamp)

      console.log('✅ Firebase addPostComment successful:', {
        postId,
        commentId: docRef.id,
        userId: commentData.userId,
      })

      return {
        id: docRef.id,
        postId,
        ...commentData,
      }
    } catch (error) {
      console.error('❌ Error adding comment to Firebase:', {
        error,
        postId,
        userId: commentData.userId,
      })
      throw error
    }
  }

  async deletePostComment(
    postId: string,
    commentId: string,
    deletedBy?: string
  ): Promise<void> {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      const { db } = await import('@config/firebase')

      const postRef = doc(db, this.postsCollection, postId)
      const commentRef = doc(postRef, 'comments', commentId)

      await deleteDoc(commentRef)

      console.log('✅ Firebase deletePostComment successful:', {
        postId,
        commentId,
        deletedBy,
      })
    } catch (error) {
      console.error('❌ Error deleting comment from Firebase:', {
        error,
        postId,
        commentId,
      })
      throw error
    }
  }

  async batchUpdate(operations: BatchOperation[]): Promise<void> {
    try {
      const { writeBatch, collection, doc, Timestamp } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      const batch = writeBatch(db)

      for (const operation of operations) {
        switch (operation.type) {
          case 'create': {
            if (operation.collection === 'posts') {
              const postsRef = collection(db, this.postsCollection)
              const newPostRef = doc(postsRef)
              const dataWithTimestamp = {
                ...operation.data,
                timestamp: Timestamp.fromDate(
                  (operation.data as ContestPost).timestamp
                ),
              }
              batch.set(newPostRef, dataWithTimestamp)
            } else if (operation.collection === 'users') {
              const usersRef = collection(db, this.usersCollection)
              const newUserRef = doc(usersRef)
              batch.set(newUserRef, operation.data)
            }
            break
          }
          case 'update': {
            const collectionName =
              operation.collection === 'posts'
                ? this.postsCollection
                : this.usersCollection
            const updateRef = doc(db, collectionName, operation.id)
            const updateData =
              operation.collection === 'posts' && operation.data.timestamp
                ? {
                    ...operation.data,
                    timestamp: Timestamp.fromDate(operation.data.timestamp),
                  }
                : operation.data
            batch.update(updateRef, updateData)
            break
          }
          case 'delete': {
            const deleteRef = doc(db, this.postsCollection, operation.id)
            batch.delete(deleteRef)
            break
          }
        }
      }

      await batch.commit()
    } catch (error) {
      console.error('Error executing batch update in Firebase:', error)
      throw error
    }
  }
}

/**
 * Data service factory
 * Returns Firebase data service - localStorage fallback removed
 */
function createDataService(): DataService {
  // Always use Firebase now that we're removing mock data
  return new FirebaseDataService()
}

// Export singleton instance
export const dataService = createDataService()

// Export class for testing
export { FirebaseDataService }

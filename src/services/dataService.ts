/**
 * Data service abstraction layer
 * Provides a consistent interface for data operations that can be easily swapped
 * between localStorage (current) and Firebase (future) implementations
 */

import type { ContestPost, User } from '@types'

/**
 * Generic data service interface
 */
export interface DataService {
  // Contest Posts
  getPosts(): Promise<ContestPost[]>
  addPost(post: Omit<ContestPost, 'id'>): Promise<ContestPost>
  updatePost(id: string, updates: Partial<ContestPost>): Promise<ContestPost>
  deletePost(id: string): Promise<void>

  // Users (simplified architecture - includes contest data)
  getUsers(): Promise<User[]>
  updateUser(id: string, updates: Partial<User>): Promise<User>
  addUser(user: Omit<User, 'id'>): Promise<User>

  // Batch operations
  batchUpdate(operations: BatchOperation[]): Promise<void>
}

/**
 * Batch operation interface for atomic updates
 */
export type BatchOperation =
  | { type: 'create'; collection: 'posts'; data: Omit<ContestPost, 'id'> }
  | { type: 'create'; collection: 'users'; data: Omit<User, 'id'> }
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
  | { type: 'delete'; collection: 'posts'; id: string }

/**
 * Firebase-based data service implementation
 * Provides real-time data synchronization with Firestore
 */
class FirebaseDataService implements DataService {
  private readonly postsCollection = 'contest-posts'
  private readonly usersCollection = 'users'

  async getPosts(): Promise<ContestPost[]> {
    try {
      const { collection, getDocs, orderBy, query } = await import(
        'firebase/firestore'
      )
      const { db } = await import('@config/firebase')

      const postsRef = collection(db, this.postsCollection)
      const q = query(postsRef, orderBy('timestamp', 'desc'))
      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => {
        const data = doc.data() as Record<string, unknown>
        const timestamp = data['timestamp'] as { toDate(): Date } | undefined
        return {
          id: doc.id,
          ...data,
          timestamp: timestamp?.toDate() ?? new Date(),
        }
      }) as ContestPost[]
    } catch (error) {
      console.error('Error fetching posts from Firebase:', error)
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

  async deletePost(id: string): Promise<void> {
    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      const { db } = await import('@config/firebase')

      const postRef = doc(db, this.postsCollection, id)
      await deleteDoc(postRef)
    } catch (error) {
      console.error('Error deleting post from Firebase:', error)
      throw error
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

      return snapshot.docs.map(doc => {
        const data = doc.data() as Record<string, unknown>
        const createdAt = data['createdAt'] as { toDate(): Date } | undefined
        const lastActive = data['lastActive'] as { toDate(): Date } | undefined

        return {
          id: doc.id,
          ...data,
          createdAt: createdAt?.toDate() ?? new Date(),
          lastActive: lastActive?.toDate() ?? new Date(),
        }
      }) as User[]
    } catch (error) {
      console.error('Error fetching users from Firebase:', error)
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

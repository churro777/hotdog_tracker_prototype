/**
 * Data service abstraction layer
 * Provides a consistent interface for data operations that can be easily swapped
 * between localStorage (current) and Firebase (future) implementations
 */

import type { ContestPost, ContestUser } from '@types'

/**
 * Generic data service interface
 */
export interface DataService {
  // Contest Posts
  getPosts(): Promise<ContestPost[]>
  addPost(post: Omit<ContestPost, 'id'>): Promise<ContestPost>
  updatePost(id: string, updates: Partial<ContestPost>): Promise<ContestPost>
  deletePost(id: string): Promise<void>

  // Contest Users
  getUsers(): Promise<ContestUser[]>
  updateUser(id: string, updates: Partial<ContestUser>): Promise<ContestUser>
  addUser(user: Omit<ContestUser, 'id'>): Promise<ContestUser>

  // Batch operations
  batchUpdate(operations: BatchOperation[]): Promise<void>
}

/**
 * Batch operation interface for atomic updates
 */
export type BatchOperation =
  | { type: 'create'; collection: 'posts'; data: Omit<ContestPost, 'id'> }
  | { type: 'create'; collection: 'users'; data: Omit<ContestUser, 'id'> }
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
      data: Partial<ContestUser>
    }
  | { type: 'delete'; collection: 'posts'; id: string }

/**
 * Storage keys for localStorage implementation
 */
const STORAGE_KEYS = {
  POSTS: 'hotdog-contest-posts',
  USERS: 'hotdog-contest-contest-users',
} as const

/**
 * localStorage-based data service implementation
 * Current implementation that will be replaced with Firebase
 */
class LocalStorageDataService implements DataService {
  private async delay(ms = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  private getFromStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key)
      if (!data) return []

      const parsed = JSON.parse(data) as T[]

      // Handle timestamp conversion for posts
      if (key === STORAGE_KEYS.POSTS) {
        return (parsed as ContestPost[]).map(
          (item: ContestPost & { timestamp: string | Date }) => ({
            ...item,
            timestamp:
              typeof item.timestamp === 'string'
                ? new Date(item.timestamp)
                : item.timestamp,
          })
        ) as T[]
      }

      return parsed
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error)
      return []
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Error saving to localStorage key ${key}:`, error)
      throw new Error(`Failed to save data to ${key}`)
    }
  }

  // Contest Posts implementation
  async getPosts(): Promise<ContestPost[]> {
    await this.delay(10) // Simulate async operation
    return this.getFromStorage<ContestPost>(STORAGE_KEYS.POSTS)
  }

  async addPost(postData: Omit<ContestPost, 'id'>): Promise<ContestPost> {
    await this.delay(50) // Simulate network delay

    const posts = await this.getPosts()
    const newPost: ContestPost = {
      ...postData,
      id: this.generateId(),
    }

    const updatedPosts = [newPost, ...posts]
    this.saveToStorage(STORAGE_KEYS.POSTS, updatedPosts)

    return newPost
  }

  async updatePost(
    id: string,
    updates: Partial<ContestPost>
  ): Promise<ContestPost> {
    await this.delay(50) // Simulate network delay

    const posts = await this.getPosts()
    const postIndex = posts.findIndex(p => p.id === id)

    if (postIndex === -1) {
      throw new Error(`Post with id ${id} not found`)
    }

    const updatedPost = { ...posts[postIndex], ...updates }
    posts[postIndex] = updatedPost

    this.saveToStorage(STORAGE_KEYS.POSTS, posts)
    return updatedPost
  }

  async deletePost(id: string): Promise<void> {
    await this.delay(50) // Simulate network delay

    const posts = await this.getPosts()
    const filteredPosts = posts.filter(p => p.id !== id)

    if (posts.length === filteredPosts.length) {
      throw new Error(`Post with id ${id} not found`)
    }

    this.saveToStorage(STORAGE_KEYS.POSTS, filteredPosts)
  }

  // Contest Users implementation
  async getUsers(): Promise<ContestUser[]> {
    await this.delay(10) // Simulate async operation
    return this.getFromStorage<ContestUser>(STORAGE_KEYS.USERS)
  }

  async updateUser(
    id: string,
    updates: Partial<ContestUser>
  ): Promise<ContestUser> {
    await this.delay(50) // Simulate network delay

    const users = await this.getUsers()
    const userIndex = users.findIndex(u => u.id === id)

    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`)
    }

    const updatedUser = { ...users[userIndex], ...updates }
    users[userIndex] = updatedUser

    this.saveToStorage(STORAGE_KEYS.USERS, users)
    return updatedUser
  }

  async addUser(userData: Omit<ContestUser, 'id'>): Promise<ContestUser> {
    await this.delay(50) // Simulate network delay

    const users = await this.getUsers()
    const newUser: ContestUser = {
      ...userData,
      id: this.generateId(),
    }

    const updatedUsers = [...users, newUser]
    this.saveToStorage(STORAGE_KEYS.USERS, updatedUsers)

    return newUser
  }

  // Batch operations implementation
  async batchUpdate(operations: BatchOperation[]): Promise<void> {
    await this.delay(100) // Simulate network delay for batch operation

    // For localStorage implementation, we'll execute operations sequentially
    // In Firebase, this would be a true atomic batch operation
    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'create':
            if (operation.collection === 'posts') {
              await this.addPost(operation.data)
            } else if (operation.collection === 'users') {
              await this.addUser(operation.data)
            }
            break
          case 'update':
            if (operation.collection === 'posts') {
              await this.updatePost(operation.id, operation.data)
            } else if (operation.collection === 'users') {
              await this.updateUser(operation.id, operation.data)
            }
            break
          case 'delete':
            if (operation.collection === 'posts') {
              await this.deletePost(operation.id)
            }
            break
        }
      } catch (error) {
        console.error('Batch operation failed:', operation, error)
        throw error
      }
    }
  }
}

/**
 * Firebase-based data service implementation
 * Provides real-time data synchronization with Firestore
 */
class FirebaseDataService implements DataService {
  private readonly postsCollection = 'contest-posts'
  private readonly usersCollection = 'contest-users'

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

      const postsRef = collection(db, this.postsCollection)
      const dataWithTimestamp = {
        ...postData,
        timestamp: Timestamp.fromDate(postData.timestamp),
      }

      const docRef = await addDoc(postsRef, dataWithTimestamp)

      return {
        id: docRef.id,
        ...postData,
      }
    } catch (error) {
      console.error('Error adding post to Firebase:', error)
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

  async getUsers(): Promise<ContestUser[]> {
    try {
      const { collection, getDocs } = await import('firebase/firestore')
      const { db } = await import('@config/firebase')

      const usersRef = collection(db, this.usersCollection)
      const snapshot = await getDocs(usersRef)

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ContestUser[]
    } catch (error) {
      console.error('Error fetching users from Firebase:', error)
      throw error
    }
  }

  async updateUser(
    id: string,
    updates: Partial<ContestUser>
  ): Promise<ContestUser> {
    try {
      const { doc, updateDoc, getDoc } = await import('firebase/firestore')
      const { db } = await import('@config/firebase')

      const userRef = doc(db, this.usersCollection, id)
      await updateDoc(userRef, updates)

      const updatedDoc = await getDoc(userRef)
      if (!updatedDoc.exists()) {
        throw new Error(`User with id ${id} not found`)
      }

      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      } as ContestUser
    } catch (error) {
      console.error('Error updating user in Firebase:', error)
      throw error
    }
  }

  async addUser(userData: Omit<ContestUser, 'id'>): Promise<ContestUser> {
    try {
      const { collection, addDoc } = await import('firebase/firestore')
      const { db } = await import('@config/firebase')

      const usersRef = collection(db, this.usersCollection)
      const docRef = await addDoc(usersRef, userData)

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
 * Returns the appropriate data service based on configuration
 */
function createDataService(): DataService {
  // Check environment variables to determine which service to use
  try {
    // Use dynamic import to avoid circular dependencies
    const useFirebase = import.meta.env['VITE_USE_FIREBASE'] === 'true'
    const projectId = import.meta.env['VITE_FIREBASE_PROJECT_ID'] as string

    if (useFirebase && projectId) {
      return new FirebaseDataService()
    }
  } catch {
    console.warn(
      'Firebase configuration not found, falling back to localStorage'
    )
  }

  return new LocalStorageDataService()
}

// Export singleton instance
export const dataService = createDataService()

// Export classes for testing
export { LocalStorageDataService, FirebaseDataService }

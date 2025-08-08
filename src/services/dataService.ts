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
export interface BatchOperation {
  type: 'create' | 'update' | 'delete'
  collection: 'posts' | 'users'
  id?: string
  data?: any
}

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
  private async delay(ms: number = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  private async getFromStorage<T>(key: string): Promise<T[]> {
    try {
      const data = localStorage.getItem(key)
      if (!data) return []
      
      const parsed = JSON.parse(data)
      
      // Handle timestamp conversion for posts
      if (key === STORAGE_KEYS.POSTS) {
        return parsed.map((item: any) => ({
          ...item,
          timestamp: typeof item.timestamp === 'string' 
            ? new Date(item.timestamp) 
            : item.timestamp
        }))
      }
      
      return parsed
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error)
      return []
    }
  }

  private async saveToStorage<T>(key: string, data: T[]): Promise<void> {
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
    await this.saveToStorage(STORAGE_KEYS.POSTS, updatedPosts)
    
    return newPost
  }

  async updatePost(id: string, updates: Partial<ContestPost>): Promise<ContestPost> {
    await this.delay(50) // Simulate network delay
    
    const posts = await this.getPosts()
    const postIndex = posts.findIndex(p => p.id === id)
    
    if (postIndex === -1) {
      throw new Error(`Post with id ${id} not found`)
    }
    
    const updatedPost = { ...posts[postIndex], ...updates }
    posts[postIndex] = updatedPost
    
    await this.saveToStorage(STORAGE_KEYS.POSTS, posts)
    return updatedPost
  }

  async deletePost(id: string): Promise<void> {
    await this.delay(50) // Simulate network delay
    
    const posts = await this.getPosts()
    const filteredPosts = posts.filter(p => p.id !== id)
    
    if (posts.length === filteredPosts.length) {
      throw new Error(`Post with id ${id} not found`)
    }
    
    await this.saveToStorage(STORAGE_KEYS.POSTS, filteredPosts)
  }

  // Contest Users implementation
  async getUsers(): Promise<ContestUser[]> {
    await this.delay(10) // Simulate async operation
    return this.getFromStorage<ContestUser>(STORAGE_KEYS.USERS)
  }

  async updateUser(id: string, updates: Partial<ContestUser>): Promise<ContestUser> {
    await this.delay(50) // Simulate network delay
    
    const users = await this.getUsers()
    const userIndex = users.findIndex(u => u.id === id)
    
    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`)
    }
    
    const updatedUser = { ...users[userIndex], ...updates }
    users[userIndex] = updatedUser
    
    await this.saveToStorage(STORAGE_KEYS.USERS, users)
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
    await this.saveToStorage(STORAGE_KEYS.USERS, updatedUsers)
    
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
            if (!operation.id) throw new Error('Update operation requires id')
            if (operation.collection === 'posts') {
              await this.updatePost(operation.id, operation.data)
            } else if (operation.collection === 'users') {
              await this.updateUser(operation.id, operation.data)
            }
            break
          case 'delete':
            if (!operation.id) throw new Error('Delete operation requires id')
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
 * Firebase-based data service implementation (placeholder for future)
 * This will be implemented when Firebase integration is added
 */
class FirebaseDataService implements DataService {
  async getPosts(): Promise<ContestPost[]> {
    throw new Error('Firebase implementation not yet available')
  }

  async addPost(_postData: Omit<ContestPost, 'id'>): Promise<ContestPost> {
    throw new Error('Firebase implementation not yet available')
  }

  async updatePost(_id: string, _updates: Partial<ContestPost>): Promise<ContestPost> {
    throw new Error('Firebase implementation not yet available')
  }

  async deletePost(_id: string): Promise<void> {
    throw new Error('Firebase implementation not yet available')
  }

  async getUsers(): Promise<ContestUser[]> {
    throw new Error('Firebase implementation not yet available')
  }

  async updateUser(_id: string, _updates: Partial<ContestUser>): Promise<ContestUser> {
    throw new Error('Firebase implementation not yet available')
  }

  async addUser(_userData: Omit<ContestUser, 'id'>): Promise<ContestUser> {
    throw new Error('Firebase implementation not yet available')
  }

  async batchUpdate(_operations: BatchOperation[]): Promise<void> {
    throw new Error('Firebase implementation not yet available')
  }
}

/**
 * Data service factory
 * Returns the appropriate data service based on configuration
 */
function createDataService(): DataService {
  // For now, always return localStorage implementation
  // Later, this will check environment variables to determine which service to use
  // if (env.USE_FIREBASE) return new FirebaseDataService()
  return new LocalStorageDataService()
}

// Export singleton instance
export const dataService = createDataService()

// Export classes for testing
export { LocalStorageDataService, FirebaseDataService }
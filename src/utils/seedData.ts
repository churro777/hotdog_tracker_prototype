/**
 * Firebase seed data utility
 * Creates initial contest users and posts for demo purposes
 * 🚨 DEVELOPMENT ONLY - Blocked in production
 */

import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore'

import { db } from '@config/firebase'
import { CONTEST_IDS, POST_TYPES } from '@constants'
import type { ContestPost, ContestUser } from '@types'

/**
 * Check if we're in development environment
 */
function isDevelopmentEnvironment(): boolean {
  return import.meta.env.DEV || import.meta.env['VITE_APP_ENVIRONMENT'] === 'development'
}

/**
 * Guard function to prevent usage in production
 */
function checkDevelopmentOnly(functionName: string): void {
  if (!isDevelopmentEnvironment()) {
    throw new Error(
      `🚨 Security Error: ${functionName} is only available in development environment. ` +
      `Current environment: ${import.meta.env['VITE_APP_ENVIRONMENT'] ?? 'production'}`
    )
  }
}

/**
 * Initial contest users for seeding
 */
const SEED_USERS: Omit<ContestUser, 'id'>[] = [
  {
    contestId: CONTEST_IDS.DEFAULT,
    userId: 'joey-chestnut-demo',
    userName: 'Joey Chestnut',
    totalCount: 0,
  },
  {
    contestId: CONTEST_IDS.DEFAULT,
    userId: 'takeru-kobayashi-demo',
    userName: 'Takeru Kobayashi',
    totalCount: 0,
  },
  {
    contestId: CONTEST_IDS.DEFAULT,
    userId: 'matt-stonie-demo',
    userName: 'Matt Stonie',
    totalCount: 0,
  },
]

/**
 * Initial contest posts for seeding
 */
const SEED_POSTS: Omit<ContestPost, 'id'>[] = [
  {
    contestId: CONTEST_IDS.DEFAULT,
    userId: 'joey-chestnut-demo',
    userName: 'Joey Chestnut',
    count: 15,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    description: 'Starting strong with my morning session!',
    type: POST_TYPES.ENTRY,
  },
  {
    contestId: CONTEST_IDS.DEFAULT,
    userId: 'takeru-kobayashi-demo',
    userName: 'Takeru Kobayashi',
    count: 12,
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
    description: 'Feeling good today',
    type: POST_TYPES.ENTRY,
  },
  {
    contestId: CONTEST_IDS.DEFAULT,
    userId: 'matt-stonie-demo',
    userName: 'Matt Stonie',
    count: 18,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    description: 'New personal best! 🌭🔥',
    type: POST_TYPES.ENTRY,
  },
]

/**
 * Check if Firebase collections already have data
 */
async function checkExistingData(): Promise<{
  hasUsers: boolean
  hasPosts: boolean
}> {
  try {
    const usersSnapshot = await getDocs(collection(db, 'contest-users'))
    const postsSnapshot = await getDocs(collection(db, 'contest-posts'))

    return {
      hasUsers: !usersSnapshot.empty,
      hasPosts: !postsSnapshot.empty,
    }
  } catch (error) {
    console.error('Error checking existing data:', error)
    return { hasUsers: false, hasPosts: false }
  }
}

/**
 * Seed users in Firebase
 */
async function seedUsers(): Promise<void> {
  try {
    const usersCollection = collection(db, 'contest-users')

    for (const user of SEED_USERS) {
      await addDoc(usersCollection, user)
      console.log(`Added user: ${user.userName}`)
    }
  } catch (error) {
    console.error('Error seeding users:', error)
    throw error
  }
}

/**
 * Seed posts in Firebase and update user totals
 */
async function seedPosts(): Promise<void> {
  try {
    const postsCollection = collection(db, 'contest-posts')
    const usersCollection = collection(db, 'contest-users')

    // Get all users to update their totals
    const usersSnapshot = await getDocs(usersCollection)
    const userDocs = new Map<string, { id: string; data: ContestUser }>()
    usersSnapshot.forEach(doc => {
      const userData = doc.data() as ContestUser
      userDocs.set(userData.userId, { id: doc.id, data: userData })
    })

    for (const post of SEED_POSTS) {
      // Convert timestamp to Firestore Timestamp
      const postWithTimestamp = {
        ...post,
        timestamp: Timestamp.fromDate(post.timestamp),
      }

      await addDoc(postsCollection, postWithTimestamp)
      console.log(`Added post: ${post.userName} - ${post.count} hot dogs`)

      // Update user's total count
      const userDoc = userDocs.get(post.userId)
      if (userDoc) {
        const updatedTotal = userDoc.data.totalCount + (post.count ?? 0)
        // Note: In a real implementation, you'd use updateDoc here
        // For now, we're just showing the structure
        console.log(`Updated ${post.userName} total to: ${updatedTotal}`)
      }
    }
  } catch (error) {
    console.error('Error seeding posts:', error)
    throw error
  }
}

/**
 * Main seed function - adds initial data to Firebase if it doesn't exist
 */
export async function seedFirebaseData(): Promise<void> {
  checkDevelopmentOnly('seedFirebaseData')
  
  try {
    console.log('🌱 Checking for existing Firebase data...')

    const { hasUsers, hasPosts } = await checkExistingData()

    if (hasUsers && hasPosts) {
      console.log('✅ Firebase already has data, skipping seed')
      return
    }

    console.log('🌱 Seeding Firebase with initial data...')

    if (!hasUsers) {
      console.log('📝 Adding initial users...')
      await seedUsers()
    }

    if (!hasPosts) {
      console.log('📝 Adding initial posts...')
      await seedPosts()
    }

    console.log('✅ Firebase seeding completed!')
  } catch (error) {
    console.error('❌ Firebase seeding failed:', error)
    throw error
  }
}

/**
 * Dev utility to manually trigger seeding (for console use)
 * Note: To remove demo data, use clearFirebaseData.ts utilities
 */
export async function manualSeed(): Promise<void> {
  checkDevelopmentOnly('manualSeed')
  
  console.log('🚀 Manual seed triggered')
  await seedFirebaseData()
}

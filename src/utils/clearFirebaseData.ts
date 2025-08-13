/**
 * Firebase database cleanup utility
 * Removes demo/seed data from Firestore collections
 * 🚨 DEVELOPMENT ONLY - Blocked in production
 */

import type { UpdateData } from 'firebase/firestore'
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
} from 'firebase/firestore'

import { db } from '@config/firebase'
import { CONTEST_IDS } from '@constants'

/**
 * Check if we're in development environment
 */
function isDevelopmentEnvironment(): boolean {
  return (
    import.meta.env.DEV ||
    import.meta.env['VITE_APP_ENVIRONMENT'] === 'development'
  )
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
 * Demo user IDs that should be removed (from the old seed data)
 */
const DEMO_USER_IDS = [
  'joey-chestnut-demo',
  'takeru-kobayashi-demo',
  'matt-stonie-demo',
  // Legacy IDs from old seed data
  '2', // Joey Chestnut
  '3', // Takeru Kobayashi
  '4', // Matt Stonie
]

/**
 * Check what data currently exists in Firestore
 */
async function checkFirestoreData(): Promise<{
  users: { id: string; userId: string; userName: string; totalCount: number }[]
  posts: {
    id: string
    userId: string
    userName: string
    count: number
    description?: string
  }[]
}> {
  checkDevelopmentOnly('checkFirestoreData')

  try {
    console.log('🔍 Checking Firestore data...')

    // Get users
    const usersSnapshot = await getDocs(collection(db, 'contest-users'))
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data['userId'] as string,
        userName: data['userName'] as string,
        totalCount: (data['totalCount'] as number) ?? 0,
      } as { id: string; userId: string; userName: string; totalCount: number }
    })

    // Get posts
    const postsSnapshot = await getDocs(collection(db, 'contest-posts'))
    const posts: {
      id: string
      userId: string
      userName: string
      count: number
      description?: string
    }[] = postsSnapshot.docs.map(doc => {
      const data = doc.data() as Record<string, unknown>
      const post: {
        id: string
        userId: string
        userName: string
        count: number
        description?: string
      } = {
        id: doc.id,
        userId: data['userId'] as string,
        userName: data['userName'] as string,
        count: (data['count'] as number) ?? 0,
      }

      if (data['description']) {
        post.description = data['description'] as string
      }

      return post
    })

    console.log(`📊 Found ${users.length} users and ${posts.length} posts`)
    console.log('Users:', users)
    console.log('Posts:', posts)

    return { users, posts }
  } catch (error) {
    console.error('❌ Error checking Firestore data:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Unknown error occurred'
    )
  }
}

/**
 * Clear demo users from Firestore
 */
async function clearDemoUsers(): Promise<number> {
  checkDevelopmentOnly('clearDemoUsers')

  try {
    console.log('🧹 Clearing demo users...')

    const usersSnapshot = await getDocs(collection(db, 'contest-users'))
    let deletedCount = 0

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data()
      if (DEMO_USER_IDS.includes(userData['userId'] as string)) {
        await deleteDoc(doc(db, 'contest-users', userDoc.id))
        console.log(
          `🗑️ Deleted demo user: ${userData['userName']} (${userData['userId']})`
        )
        deletedCount++
      }
    }

    console.log(`✅ Deleted ${deletedCount} demo users`)
    return deletedCount
  } catch (error) {
    console.error('❌ Error clearing demo users:', error)
    throw error
  }
}

/**
 * Clear posts from demo users
 */
async function clearDemoPosts(): Promise<number> {
  checkDevelopmentOnly('clearDemoPosts')

  try {
    console.log('🧹 Clearing demo posts...')

    const postsSnapshot = await getDocs(collection(db, 'contest-posts'))
    let deletedCount = 0

    for (const postDoc of postsSnapshot.docs) {
      const postData = postDoc.data()
      if (DEMO_USER_IDS.includes(postData['userId'] as string)) {
        await deleteDoc(doc(db, 'contest-posts', postDoc.id))
        console.log(
          `🗑️ Deleted demo post: ${postData['userName']} - ${postData['count']} hot dogs`
        )
        deletedCount++
      }
    }

    console.log(`✅ Deleted ${deletedCount} demo posts`)
    return deletedCount
  } catch (error) {
    console.error('❌ Error clearing demo posts:', error)
    throw error
  }
}

/**
 * Clear ALL data from Firestore (use with caution!)
 */
async function clearAllFirestoreData(): Promise<{
  users: number
  posts: number
}> {
  checkDevelopmentOnly('clearAllFirestoreData')

  try {
    console.log('⚠️ CLEARING ALL FIRESTORE DATA...')

    // Clear all users
    const usersSnapshot = await getDocs(collection(db, 'contest-users'))
    const userDeletePromises = usersSnapshot.docs.map(userDoc =>
      deleteDoc(doc(db, 'contest-users', userDoc.id))
    )
    await Promise.all(userDeletePromises)

    // Clear all posts
    const postsSnapshot = await getDocs(collection(db, 'contest-posts'))
    const postDeletePromises = postsSnapshot.docs.map(postDoc =>
      deleteDoc(doc(db, 'contest-posts', postDoc.id))
    )
    await Promise.all(postDeletePromises)

    const deletedCounts = {
      users: usersSnapshot.size,
      posts: postsSnapshot.size,
    }

    console.log(
      `🗑️ Deleted ${deletedCounts.users} users and ${deletedCounts.posts} posts`
    )
    return deletedCounts
  } catch (error) {
    console.error('❌ Error clearing all Firestore data:', error)
    throw error
  }
}

/**
 * Main cleanup function - removes only demo data, preserves real user data
 */
async function cleanupDemoData(): Promise<void> {
  checkDevelopmentOnly('cleanupDemoData')

  try {
    console.log('🧹 Starting demo data cleanup...')

    const { users, posts } = await checkFirestoreData()

    if (users.length === 0 && posts.length === 0) {
      console.log('✅ Database is already clean!')
      return
    }

    // Clear demo posts first (to avoid FK issues)
    const deletedPosts = await clearDemoPosts()

    // Then clear demo users
    const deletedUsers = await clearDemoUsers()

    console.log(
      `✅ Cleanup complete! Removed ${deletedUsers} demo users and ${deletedPosts} demo posts`
    )

    // Show remaining data
    console.log('📊 Checking remaining data...')
    await checkFirestoreData()
  } catch (error) {
    console.error('❌ Demo data cleanup failed:', error)
    throw error
  }
}

/**
 * Fix missing contest users - for existing Firebase Auth users
 */
async function fixMissingContestUsers(): Promise<void> {
  checkDevelopmentOnly('fixMissingContestUsers')

  try {
    console.log(
      '🔧 Checking for Firebase Auth users missing from contest data...'
    )

    // Get all Firebase Auth users from the users collection
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const authUsers = usersSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        uid: data['id'] as string,
        displayName: data['displayName'] as string,
        email: data['email'] as string,
      }
    })

    console.log(`Found ${authUsers.length} Firebase Auth users`)

    // Check which ones are missing from contest-users
    const contestUsersSnapshot = await getDocs(collection(db, 'contest-users'))
    const existingContestUserIds = new Set(
      contestUsersSnapshot.docs.map(doc => doc.data()['userId'] as string)
    )

    const missingUsers = authUsers.filter(
      user => !existingContestUserIds.has(user.uid)
    )

    if (missingUsers.length === 0) {
      console.log(
        '✅ All Firebase Auth users already have contest user records!'
      )
      return
    }

    console.log(
      `🔧 Found ${missingUsers.length} users missing from contest data:`
    )
    missingUsers.forEach(user =>
      console.log(`- ${user.displayName} (${user.email})`)
    )

    // Add missing users to contest
    for (const user of missingUsers) {
      await addDoc(collection(db, 'contest-users'), {
        contestId: CONTEST_IDS.DEFAULT,
        userId: user.uid,
        userName: user.displayName ?? user.email?.split('@')[0] ?? 'Anonymous',
        totalCount: 0,
      })
      console.log(`✅ Added ${user.displayName} to contest`)
    }

    console.log(
      `🎉 Successfully added ${missingUsers.length} users to contest!`
    )
  } catch (error) {
    console.error('❌ Error fixing missing contest users:', error)
    throw error
  }
}

/**
 * Fix missing fields in existing user data
 */
async function fixUserDataIntegrity(): Promise<void> {
  checkDevelopmentOnly('fixUserDataIntegrity')

  try {
    console.log('🔧 Checking for missing fields in existing user data...')

    // Fix users collection
    const usersSnapshot = await getDocs(collection(db, 'users'))
    let usersFixed = 0

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data()
      const updates: UpdateData<{
        displayName?: string
        totalCount?: number
        createdAt?: Date
        updatedAt?: Date
      }> = {}

      // Check for missing required fields
      if (!userData['displayName']) {
        updates.displayName =
          (userData['email'] as string)?.split('@')[0] ?? 'Anonymous'
      }
      if (!userData['totalCount'] && userData['totalCount'] !== 0) {
        updates.totalCount = 0
      }
      if (!userData['createdAt']) {
        updates.createdAt = new Date()
      }
      if (!userData['updatedAt']) {
        updates.updatedAt = new Date()
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'users', userDoc.id), updates)
        console.log(
          `Fixed user ${(userData['displayName'] as string) ?? (userData['email'] as string)}: ${Object.keys(updates).join(', ')}`
        )
        usersFixed++
      }
    }

    // Fix contest-users collection
    const contestUsersSnapshot = await getDocs(collection(db, 'contest-users'))
    let contestUsersFixed = 0

    for (const contestUserDoc of contestUsersSnapshot.docs) {
      const userData = contestUserDoc.data()
      const updates: UpdateData<{
        contestId?: string
        userName?: string
        totalCount?: number
      }> = {}

      // Check for missing required fields
      if (!userData['contestId']) {
        updates.contestId = CONTEST_IDS.DEFAULT
      }
      if (!userData['userName']) {
        updates.userName = (userData['userId'] as string) ?? 'Anonymous'
      }
      if (!userData['totalCount'] && userData['totalCount'] !== 0) {
        updates.totalCount = 0
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'contest-users', contestUserDoc.id), updates)
        console.log(
          `Fixed contest user ${(userData['userName'] as string) ?? (userData['userId'] as string)}: ${Object.keys(updates).join(', ')}`
        )
        contestUsersFixed++
      }
    }

    console.log(
      `🎉 Fixed ${usersFixed} user records and ${contestUsersFixed} contest user records!`
    )
  } catch (error) {
    console.error('❌ Error fixing user data integrity:', error)
    throw error
  }
}

/**
 * Interactive cleanup - prompts user before clearing
 */
async function interactiveCleanup(): Promise<void> {
  checkDevelopmentOnly('interactiveCleanup')

  try {
    const { users, posts } = await checkFirestoreData()

    if (users.length === 0 && posts.length === 0) {
      console.log('✅ Database is already clean!')
      return
    }

    console.log('\n🤔 Choose cleanup option:')
    console.log('1. Remove only demo data (recommended)')
    console.log('2. Remove ALL data (destructive!)')
    console.log('3. Just show current data')
    console.log('4. Fix missing contest users')

    // For manual console use - user can call specific functions
    console.log('\n💡 To use:')
    console.log('• cleanupDemoData() - Remove only demo users/posts')
    console.log('• clearAllFirestoreData() - Remove everything (careful!)')
    console.log('• checkFirestoreData() - Just check what exists')
    console.log(
      '• fixMissingContestUsers() - Add Firebase Auth users to contest'
    )
  } catch (error) {
    console.error('❌ Interactive cleanup failed:', error)
    throw error
  }
}

// Export functions for manual console use
export {
  checkFirestoreData,
  clearDemoUsers,
  clearDemoPosts,
  clearAllFirestoreData,
  cleanupDemoData,
  fixMissingContestUsers,
  fixUserDataIntegrity,
  interactiveCleanup,
  DEMO_USER_IDS,
}

// Export migration functions
export {
  migrateToSimplifiedArchitecture,
  verifyMigration,
  removeContestUsersCollection,
  interactiveMigration,
} from './migrateToSimplifiedArchitecture'

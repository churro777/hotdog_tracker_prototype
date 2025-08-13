/**
 * Firebase database cleanup utility
 * Removes demo/seed data from Firestore collections
 * 🚨 DEVELOPMENT ONLY - Blocked in production
 */

import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'

import { db } from '@config/firebase'

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
  users: Array<{ id: string; userId: string; userName: string; totalCount: number }>
  posts: Array<{ id: string; userId: string; userName: string; count: number; description?: string }>
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
      }
    })

    // Get posts
    const postsSnapshot = await getDocs(collection(db, 'contest-posts'))
    const posts = postsSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        userId: data['userId'] as string,
        userName: data['userName'] as string,
        count: (data['count'] as number) ?? 0,
        ...(data['description'] && { description: data['description'] as string }),
      }
    })

    console.log(`📊 Found ${users.length} users and ${posts.length} posts`)
    console.log('Users:', users)
    console.log('Posts:', posts)

    return { users, posts }
  } catch (error) {
    console.error('❌ Error checking Firestore data:', error)
    throw error
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
        console.log(`🗑️ Deleted demo user: ${userData['userName']} (${userData['userId']})`)
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
        console.log(`🗑️ Deleted demo post: ${postData['userName']} - ${postData['count']} hot dogs`)
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
async function clearAllFirestoreData(): Promise<{ users: number; posts: number }> {
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

    console.log(`🗑️ Deleted ${deletedCounts.users} users and ${deletedCounts.posts} posts`)
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

    console.log(`✅ Cleanup complete! Removed ${deletedUsers} demo users and ${deletedPosts} demo posts`)

    // Show remaining data
    console.log('📊 Checking remaining data...')
    await checkFirestoreData()
  } catch (error) {
    console.error('❌ Demo data cleanup failed:', error)
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

    // For manual console use - user can call specific functions
    console.log('\n💡 To use:')
    console.log('• cleanupDemoData() - Remove only demo users/posts')
    console.log('• clearAllFirestoreData() - Remove everything (careful!)')
    console.log('• checkFirestoreData() - Just check what exists')
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
  interactiveCleanup,
  DEMO_USER_IDS,
}
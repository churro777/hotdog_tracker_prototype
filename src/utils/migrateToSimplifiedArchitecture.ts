/**
 * Migration utility to consolidate contest-users data into users collection
 * Implements the simplified architecture where users collection contains all user data
 * 🚨 DEVELOPMENT ONLY - Blocked in production
 */

import type { UpdateData } from 'firebase/firestore'
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore'

import { db } from '@config/firebase'

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
 * Migrate contest-users data into users collection
 * This implements the simplified architecture where users collection contains all data
 */
export async function migrateToSimplifiedArchitecture(): Promise<void> {
  checkDevelopmentOnly('migrateToSimplifiedArchitecture')

  try {
    console.log('🔄 Starting migration to simplified architecture...')

    // Get all users and contest-users data
    const [usersSnapshot, contestUsersSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'contest-users')),
    ])

    const users = new Map<string, Record<string, unknown>>()
    usersSnapshot.forEach(doc => {
      users.set(doc.id, { id: doc.id, ...doc.data() })
    })

    const contestUsers = new Map<string, Record<string, unknown>>()
    contestUsersSnapshot.forEach(doc => {
      const data = doc.data()
      if (typeof data['userId'] === 'string') {
        contestUsers.set(data['userId'], { id: doc.id, ...data })
      }
    })

    console.log(
      `📊 Found ${users.size} users and ${contestUsers.size} contest-users records`
    )

    // Migrate data using batch operations
    const batch = writeBatch(db)
    let updateCount = 0

    // Update users collection with contest data
    for (const [userId, userData] of users) {
      const contestData = contestUsers.get(userId)

      if (contestData) {
        const userRef = doc(db, 'users', userId)
        const updates: UpdateData<{
          totalCount?: number
          displayName?: string
        }> = {}

        // Migrate totalCount if it doesn't exist or is different
        const userCount = userData['totalCount'] as number
        const contestCount = contestData['totalCount'] as number
        if (typeof userCount !== 'number') {
          updates.totalCount =
            typeof contestCount === 'number' ? contestCount : 0
        } else if (
          userCount !== contestCount &&
          typeof contestCount === 'number'
        ) {
          // Use the higher count (in case of discrepancy)
          updates.totalCount = Math.max(userCount, contestCount)
        }

        // Ensure other required fields exist
        if (
          !userData['displayName'] &&
          typeof contestData['userName'] === 'string'
        ) {
          updates.displayName = contestData['userName']
        }

        if (Object.keys(updates).length > 0) {
          batch.update(userRef, updates)
          updateCount++
          const displayName =
            typeof userData['displayName'] === 'string'
              ? userData['displayName']
              : typeof userData['email'] === 'string'
                ? userData['email']
                : 'Unknown User'
          console.log(
            `📝 Updating user ${displayName}: ${Object.keys(updates).join(', ')}`
          )
        }
      } else {
        // User exists but no contest-users record - ensure they have totalCount
        if (typeof userData['totalCount'] !== 'number') {
          const userRef = doc(db, 'users', userId)
          batch.update(userRef, { totalCount: 0 })
          updateCount++
          const displayName =
            typeof userData['displayName'] === 'string'
              ? userData['displayName']
              : typeof userData['email'] === 'string'
                ? userData['email']
                : 'Unknown User'
          console.log(`📝 Adding totalCount to user ${displayName}`)
        }
      }
    }

    // Commit user updates
    if (updateCount > 0) {
      await batch.commit()
      console.log(`✅ Updated ${updateCount} user records`)
    } else {
      console.log('✅ All users already have correct data')
    }

    console.log('🎉 Migration to simplified architecture completed!')
    console.log('📋 Next steps:')
    console.log('1. Verify users collection has all required data')
    console.log('2. Update application code to use simplified model')
    console.log('3. Remove contest-users collection when ready')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

/**
 * Verify migration was successful by checking data consistency
 */
export async function verifyMigration(): Promise<void> {
  checkDevelopmentOnly('verifyMigration')

  try {
    console.log('🔍 Verifying migration...')

    const [usersSnapshot, contestUsersSnapshot] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'contest-users')),
    ])

    let usersValid = 0
    let usersMissingData = 0

    console.log('\n📊 Users Collection Status:')
    usersSnapshot.forEach(doc => {
      const data = doc.data() as Record<string, unknown>
      const hasRequiredFields =
        data['id'] &&
        data['email'] &&
        data['displayName'] &&
        typeof data['totalCount'] === 'number'

      if (hasRequiredFields) {
        usersValid++
      } else {
        usersMissingData++
        const displayName =
          typeof data['displayName'] === 'string'
            ? data['displayName']
            : typeof data['email'] === 'string'
              ? data['email']
              : 'Unknown User'
        console.log(`⚠️  User ${displayName} missing fields`)
      }
    })

    console.log(`✅ ${usersValid} users have all required fields`)
    if (usersMissingData > 0) {
      console.log(`⚠️  ${usersMissingData} users missing required data`)
    }

    console.log(
      `\n📋 Contest-users collection: ${contestUsersSnapshot.size} records`
    )
    console.log(
      '💡 After verification, you can remove contest-users collection'
    )
  } catch (error) {
    console.error('❌ Verification failed:', error)
    throw error
  }
}

/**
 * Remove contest-users collection after successful migration
 * Only run this after verifying migration was successful
 */
export async function removeContestUsersCollection(): Promise<void> {
  checkDevelopmentOnly('removeContestUsersCollection')

  try {
    console.log('🗑️  Removing contest-users collection...')

    const contestUsersSnapshot = await getDocs(collection(db, 'contest-users'))

    if (contestUsersSnapshot.empty) {
      console.log('✅ Contest-users collection is already empty')
      return
    }

    console.log(
      `📊 Found ${contestUsersSnapshot.size} contest-users documents to delete`
    )

    // Delete in batches to avoid timeout
    const batch = writeBatch(db)
    let deleteCount = 0

    contestUsersSnapshot.forEach(doc => {
      batch.delete(doc.ref)
      deleteCount++
    })

    await batch.commit()
    console.log(`🗑️  Deleted ${deleteCount} contest-users documents`)
    console.log('✅ Contest-users collection removed successfully')
  } catch (error) {
    console.error('❌ Failed to remove contest-users collection:', error)
    throw error
  }
}

/**
 * Interactive migration with prompts and verification steps
 */
export function interactiveMigration(): void {
  checkDevelopmentOnly('interactiveMigration')

  try {
    console.log('🚀 Interactive Migration to Simplified Architecture')
    console.log('\n📋 Steps:')
    console.log(
      '1. migrateToSimplifiedArchitecture() - Consolidate data into users collection'
    )
    console.log('2. verifyMigration() - Check migration was successful')
    console.log(
      '3. removeContestUsersCollection() - Remove old collection (after code update)'
    )
    console.log('\n💡 Run each step manually to ensure safe migration')
  } catch (error) {
    console.error('❌ Interactive migration failed:', error)
    throw error
  }
}

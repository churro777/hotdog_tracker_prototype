/**
 * Database migration utilities for converting legacy upvotes to new reaction format
 */

import type { ContestPost } from '@types'

/**
 * Migrate a post's legacy upvotes to new reactions format
 * Converts upvotes array to reactions['👍'] array
 */
export function migratePostReactions(post: ContestPost): Partial<ContestPost> {
  const updates: Partial<ContestPost> = {}

  // If post has legacy upvotes but no reactions, migrate them
  if (post.upvotes && post.upvotes.length > 0 && !post.reactions?.['👍']) {
    updates.reactions = {
      ...post.reactions,
      '👍': [...post.upvotes], // Copy upvotes to thumbs up reactions
    }

    // Mark for removal of legacy field (will be handled by caller)
    updates.upvotes = []
  }

  return updates
}

/**
 * Check if a post needs migration from legacy upvotes format
 */
export function postNeedsMigration(post: ContestPost): boolean {
  return !!(
    post.upvotes?.length &&
    post.upvotes.length > 0 &&
    !post.reactions?.['👍']
  )
}

/**
 * Migration script that can be run to convert all legacy posts
 * This would typically be used in a one-time migration script
 */
export async function migrateLegacyPosts(): Promise<{
  migrated: number
  skipped: number
  errors: number
}> {
  try {
    // Dynamic import to avoid loading Firebase in all contexts
    const { collection, getDocs, doc, writeBatch } = await import(
      'firebase/firestore'
    )
    const { db } = await import('@config/firebase')

    const postsRef = collection(db, 'contest-posts')
    const snapshot = await getDocs(postsRef)

    let migrated = 0
    let skipped = 0
    let errors = 0

    // Use batch writes for better performance
    const batch = writeBatch(db)
    let batchSize = 0
    const MAX_BATCH_SIZE = 500 // Firestore batch limit

    for (const docSnapshot of snapshot.docs) {
      try {
        const post = docSnapshot.data() as ContestPost

        if (!postNeedsMigration(post)) {
          skipped++
          continue
        }

        const updates = migratePostReactions(post)
        if (Object.keys(updates).length === 0) {
          skipped++
          continue
        }

        // Add to batch
        const postRef = doc(db, 'contest-posts', docSnapshot.id)
        batch.update(postRef, updates)
        batchSize++

        // Commit batch if it's getting large
        if (batchSize >= MAX_BATCH_SIZE) {
          await batch.commit()
          batchSize = 0
        }

        migrated++
      } catch (error) {
        console.error(`Error migrating post ${docSnapshot.id}:`, error)
        errors++
      }
    }

    // Commit remaining batch
    if (batchSize > 0) {
      await batch.commit()
    }

    console.log(
      `Migration completed: ${migrated} migrated, ${skipped} skipped, ${errors} errors`
    )
    return { migrated, skipped, errors }
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

/**
 * Utility to manually trigger migration from browser console
 * Usage: Call this function in browser dev tools to migrate existing data
 */
export async function runMigrationFromConsole(): Promise<void> {
  try {
    console.log('Starting legacy upvotes migration...')
    const result = await migrateLegacyPosts()
    console.log('Migration completed:', result)
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

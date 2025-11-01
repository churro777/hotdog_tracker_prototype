import type { Contest } from '@types'

/**
 * Contest phase types representing different states of a contest lifecycle
 */
export type ContestPhase = 'upcoming' | 'active' | 'review' | 'completed'

/**
 * Determines the current phase of a contest based on its dates
 *
 * Phases:
 * - upcoming: Before startDate
 * - active: Between startDate and endDate (users can post)
 * - review: Between endDate and endOfReviewDate (users can view but not post)
 * - completed: After endOfReviewDate (if set) or after endDate (if endOfReviewDate not set)
 *
 * @param contest - The contest to check
 * @returns The current phase of the contest
 */
export function getContestPhase(contest: Contest): ContestPhase {
  const now = new Date()
  const startDate = new Date(contest.startDate)
  const endDate = new Date(contest.endDate)
  const endOfReviewDate = contest.endOfReviewDate
    ? new Date(contest.endOfReviewDate)
    : null

  // Before contest starts
  if (now < startDate) {
    return 'upcoming'
  }

  // Contest is active (can post)
  if (now >= startDate && now < endDate) {
    return 'active'
  }

  // After contest ends
  if (endOfReviewDate) {
    // If we have a review period and we're in it
    if (now >= endDate && now < endOfReviewDate) {
      return 'review'
    }
    // After review period ends
    return 'completed'
  }

  // No review period, contest is completed after endDate
  return 'completed'
}

/**
 * Checks if users can create new posts in the contest
 * Posts are only allowed during the 'active' phase
 *
 * @param contest - The contest to check
 * @returns True if users can post, false otherwise
 */
export function canPostToContest(contest: Contest): boolean {
  return getContestPhase(contest) === 'active'
}

/**
 * Checks if the contest should display a winner instead of a leader
 * This happens during the review and completed phases
 *
 * @param contest - The contest to check
 * @returns True if we should show winner, false if we should show leader
 */
export function shouldShowWinner(contest: Contest): boolean {
  const phase = getContestPhase(contest)
  return phase === 'review' || phase === 'completed'
}

/**
 * Checks if the contest should display a countdown timer
 * Countdown is only shown during upcoming and active phases
 *
 * @param contest - The contest to check
 * @returns True if countdown should be shown, false otherwise
 */
export function shouldShowCountdown(contest: Contest): boolean {
  const phase = getContestPhase(contest)
  return phase === 'upcoming' || phase === 'active'
}

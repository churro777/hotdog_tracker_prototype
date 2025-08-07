import type { ContestPost, ContestUser } from '../types'
import useLocalStorage from './useLocalStorage'
import { STORAGE_KEYS, DEFAULT_DATA, CONTEST_IDS, USER_IDS, POST_TYPES } from '../constants'

/**
 * Return type for the useContestData hook
 * @interface UseContestDataReturn
 */
interface UseContestDataReturn {
  /** Array of posts for the current contest */
  contestPosts: ContestPost[]
  /** Array of users participating in the current contest */
  contestUsers: ContestUser[]
  /** Function to add a new post to the contest */
  addPost: (count: number, description?: string, image?: string) => void
  /** Function to edit an existing post */
  editPost: (postId: string, newCount: number, newDescription?: string) => void
  /** Array of all posts across all contests */
  allContestPosts: ContestPost[]
  /** Array of all contest users */
  allContestUsers: ContestUser[]
  /** Setter function for all contest posts */
  setAllContestPosts: React.Dispatch<React.SetStateAction<ContestPost[]>>
  /** Setter function for all contest users */
  setAllContestUsers: React.Dispatch<React.SetStateAction<ContestUser[]>>
}

const defaultContestUsers: ContestUser[] = [...DEFAULT_DATA.USERS]

const defaultContestPosts: ContestPost[] = [
  {
    id: '1',
    contestId: CONTEST_IDS.DEFAULT, 
    userId: USER_IDS.JOEY_CHESTNUT, 
    userName: 'Joey Chestnut', 
    count: DEFAULT_DATA.POST.COUNT, 
    timestamp: new Date(), 
    description: DEFAULT_DATA.POST.DESCRIPTION,
    type: POST_TYPES.ENTRY
  }
]

/**
 * Custom hook for managing contest data including posts and users.
 * Handles data persistence via localStorage and provides functions for adding and editing posts.
 * Automatically updates user totals when posts are added or modified.
 * 
 * @param {string} contestId - The ID of the contest to manage data for
 * @param {string} currentUserId - The ID of the current user
 * @returns {UseContestDataReturn} Object containing contest data and management functions
 */
function useContestData(contestId: string, currentUserId: string): UseContestDataReturn {
  const [rawContestPosts, setRawContestPosts] = useLocalStorage<(ContestPost & { timestamp: string | Date })[]>(
    STORAGE_KEYS.POSTS, 
    defaultContestPosts
  )
  const [allContestUsers, setAllContestUsers] = useLocalStorage<ContestUser[]>(
    STORAGE_KEYS.CONTEST_USERS, 
    defaultContestUsers
  )
  
  // Convert timestamp strings back to Date objects
  const allContestPosts: ContestPost[] = rawContestPosts.map(post => ({
    ...post,
    timestamp: typeof post.timestamp === 'string' ? new Date(post.timestamp) : post.timestamp
  }))
  
  /**
   * Adds a new post to the contest and updates the user's total count.
   * 
   * @param {number} count - Number of items consumed in this post
   * @param {string} [description] - Optional description for the post
   * @param {string} [image] - Optional image URL for the post
   */
  const addPost = (count: number, description?: string, image?: string) => {
    const currentContestUser = allContestUsers.find(u => u.userId === currentUserId)
    if (!currentContestUser) return
    
    const newPost: ContestPost = {
      id: Date.now().toString(),
      contestId,
      userId: currentUserId,
      userName: currentContestUser.userName,
      count,
      image,
      timestamp: new Date(),
      description,
      type: POST_TYPES.ENTRY
    }
    
    setRawContestPosts(prev => [newPost, ...prev])
    setAllContestUsers(prev => prev.map(user => 
      user.userId === currentUserId
        ? { ...user, totalCount: user.totalCount + count }
        : user
    ))
  }
  
  /**
   * Edits an existing post and adjusts the user's total count accordingly.
   * 
   * @param {string} postId - The ID of the post to edit
   * @param {number} newCount - The new count value for the post
   * @param {string} [newDescription] - The new description for the post
   */
  const editPost = (postId: string, newCount: number, newDescription?: string) => {
    setRawContestPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const oldCount = post.count || 0
        const updatedPost = {
          ...post,
          count: newCount,
          description: newDescription
        }
        
        // Update contest user's total count
        setAllContestUsers(prevUsers => prevUsers.map(user => 
          user.userId === post.userId
            ? { ...user, totalCount: user.totalCount - oldCount + newCount }
            : user
        ))
        
        return updatedPost
      }
      return post
    }))
  }
  
  // Filter data for the specific contest
  const contestPosts = allContestPosts.filter(p => p.contestId === contestId)
  const contestUsers = allContestUsers.filter(u => u.contestId === contestId)
  
  return {
    contestPosts,
    contestUsers,
    addPost,
    editPost,
    allContestPosts,
    allContestUsers,
    setAllContestPosts: setRawContestPosts,
    setAllContestUsers
  }
}

export default useContestData
import type { ContestPost, ContestUser } from '../types'
import useLocalStorage from './useLocalStorage'
import { STORAGE_KEYS, DEFAULT_DATA, CONTEST_IDS, USER_IDS, POST_TYPES } from '../constants'

interface UseContestDataReturn {
  contestPosts: ContestPost[]
  contestUsers: ContestUser[]
  addPost: (count: number, description?: string, image?: string) => void
  editPost: (postId: string, newCount: number, newDescription?: string) => void
  allContestPosts: ContestPost[]
  allContestUsers: ContestUser[]
  setAllContestPosts: React.Dispatch<React.SetStateAction<ContestPost[]>>
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
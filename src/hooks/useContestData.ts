import type { ContestPost, ContestUser } from '../types'
import useLocalStorage from './useLocalStorage'

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

const defaultContestUsers: ContestUser[] = [
  { id: 'cu-1', contestId: 'hotdog-contest', userId: '2', userName: 'Joey Chestnut', totalCount: 23 },
  { id: 'cu-2', contestId: 'hotdog-contest', userId: '3', userName: 'Takeru Kobayashi', totalCount: 18 },
  { id: 'cu-3', contestId: 'hotdog-contest', userId: '4', userName: 'Matt Stonie', totalCount: 15 },
  { id: 'cu-4', contestId: 'hotdog-contest', userId: '1', userName: 'You', totalCount: 3 },
  { id: 'cu-5', contestId: 'hotdog-contest', userId: '5', userName: 'Your Friend', totalCount: 7 }
]

const defaultContestPosts: ContestPost[] = [
  {
    id: '1',
    contestId: 'hotdog-contest', 
    userId: '2', 
    userName: 'Joey Chestnut', 
    count: 5, 
    timestamp: new Date(), 
    description: 'Just crushed 5 more! 🌭',
    type: 'entry'
  }
]

function useContestData(contestId: string, currentUserId: string): UseContestDataReturn {
  const [rawContestPosts, setRawContestPosts] = useLocalStorage<any[]>(
    'hotdog-contest-posts', 
    defaultContestPosts
  )
  const [allContestUsers, setAllContestUsers] = useLocalStorage<ContestUser[]>(
    'hotdog-contest-contest-users', 
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
      type: 'entry'
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
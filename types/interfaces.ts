export interface Answer {
  _id: string
  text: string
  user_name: string
  user_id: string
  date: string
  likes: number
  dislikes: number
  liked: boolean
  disliked: boolean
  likedBy: string[]
  dislikedBy: string[]
}

export interface Question {
  _id: string
  userName: string
  user_id: string
  questionText: string
  date: string
  likes: number
  dislikes: number
  liked: boolean
  disliked: boolean
  likedBy: string[]
  dislikedBy: string[]
  answers: Answer[]
  answersCount: number
  showAnswers: boolean
}
export interface IUser {
  id?: string
  username: string
  email: string
  role: string
  password: string
  createdAt: Date
  generateToken: Function
}

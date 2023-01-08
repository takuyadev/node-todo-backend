import { Document } from "mongoose"

export interface IUser {
  username: string
  email: string
  role: string
  password: string
  createdAt: Date
  isEmailConfirmed: boolean
  isEmailConfirmedToken: string
  resetPasswordToken: string
  resetPasswordExpire: Date
  generateToken: Function
  getEmailToken: Function
}

export interface IUserWithId extends IUser {
  id: string
}

export interface IUserSchema extends IUser, Document {}

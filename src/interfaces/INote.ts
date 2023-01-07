import { Types } from "mongoose"

export interface INote {
  note: string
  createdAt: Date
  user: Types.ObjectId
}

import { Types, Schema, model } from "mongoose"

interface INote {
  note: string
  createdAt: Date
  user: Types.ObjectId
}

const NoteSchema = new Schema<INote>({
  note: {
    type: String,
    required: [true, "Please add a note"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
})

NoteSchema.index({ user: 1 })

module.exports = model("Note", NoteSchema)

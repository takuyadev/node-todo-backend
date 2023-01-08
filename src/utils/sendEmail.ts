import { IEmailParams } from "../interfaces/IEmailParams"
import { IEmailResponse } from "../interfaces/IEmailResponse"
const nodemailer = require("nodemailer")

export const sendEmail = async (
  params: IEmailParams
): Promise<IEmailResponse> => {
  // Establish connection to email using provided information
  const transporter = nodemailer.createTransport({
    service: process.env.NODEMAILER_SERVICE,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  })

  // Send email based on specifications
  const mailOptions = {
    from: "takuya.k.toyokawa@protonmail.com",
    to: params.reply_to,
    subject: params.subject,
    text: params.message,
  }

  // Send email using Nodemailer, and return response from server
  return await transporter.sendMail(mailOptions)
}

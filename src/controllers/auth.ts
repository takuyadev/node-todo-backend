import { Request, Response, NextFunction } from "express"
import { IEmailParams } from "../interfaces/IEmailParams"
import { IEmailResponse } from "../interfaces/IEmailResponse"
import { IUserWithId, IUserSchema } from "../interfaces/IUser"
import { sendEmail } from "../utils/sendEmail"
const crypto = require("crypto")
const User = require("../schemas/User")
const asyncHandler = require("../middlewares/async")

// Middleware for authentication; get token from model, save to cookie, and send response to server

const sendTokenResponse = (
  user: IUserWithId,
  statusCode: number,
  res: Response
) => {
  // Generate token using User's Schema method
  const token = user.generateToken()

  // Sets expiration date for the token
  const options = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      user: {
        _id: user.id,
        email: user.email,
        username: user.username,
        isEmailConfirmed: user.isEmailConfirmed,
      },
      token,
    })
}

const sendConfirmEmail = async (req: Request, user: IUserSchema) => {
  // Generate confirmation token for email
  const confirmEmailToken = await user.getEmailToken()
  const confirmEmailLink = `${req.protocol}://${req.get(
    "host"
  )}/auth/confirmemail/${confirmEmailToken}`

  // Save generated tokens to database
  await user.save({ validateBeforeSave: false })

  // Send confirmation email to user
  return await sendEmail({
    reply_to: req.body.email,
    subject: "Confirm Email",
    message: confirmEmailLink,
  })
}

// @desc Registers user, and sends token to cookie for authentication
// @route /auth/register
// @access Public: All roles

exports.register = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { username, email, password } = req.body

    // Error handle if form not filled
    if (!username || !email || !password) {
      res.status(404).json({
        message: "Please provide username, email, and password",
        success: false,
        data: {},
      })
    }

    // Create User based on information provided
    const user = await User.create({
      username,
      email,
      password,
    })

    sendConfirmEmail(req, user)
    // If User.create doesn't fail, generate token to user
    sendTokenResponse(user, 200, res)
  }
)

// @desc Login user, and send token for authentication
// @route /auth/login
// @access Public: All roles

exports.login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body

    // Error handle if form not filled
    if (!email || !password) {
      res.status(404).json({
        success: false,
        message: "Please provide email and password",
        data: {},
      })
    }

    // Find user, and also select encrypted password in database
    const user = await User.findOne({ email }).select("+password")

    // If user doesn't exist, then error handle
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Invalid credentials",
        data: {},
      })
    }

    // Match the entered password against the encrypted password, decrypt, and see if it matches.
    const isMatch = await user.matchPassword(password)

    // If match returns false, then error handle that password returned incorrect
    if (!isMatch) {
      res.status(404).json({
        success: false,
        message: "Incorrect password.",
        data: {},
      })
      next()
    }

    // If all checks pass, then allow user to login and generate token
    sendTokenResponse(user, 200, res)
  }
)

// @desc Logout user from session, clears token from cookie and header
// @routes /auth/logout
// @access Private: Authenticated Users

exports.logout = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    })

    res.status(200).json({
      success: true,
      token: {},
    })
  }
)

// @desc Update user information: email and username
// @routes /auth/updatedetails/:id
// @access Private: User

exports.updateDetails = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { username, email } = req.body

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        username,
        email,
      },
      {
        new: true,
        runValidators: true,
      }
    )

    res.status(200).json({
      success: true,
      data: user,
    })
  }
)

// @desc Update user password
// @routes /auth/updatepassword/:id
// @access Private: User

exports.updatePassword = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.params.id).select("+password")
    if (!(await user.matchPassword(currentPassword))) {
      res.status(404).json({
        message: "Password incorrect, please enter your previous password",
        success: false,
      })
    }

    res.status(200).json({
      message: `Password reset to: ${newPassword}`,
      success: true,
    })
  }
)

// @desc Send email to user for password reset link
// @routes /auth/forgotpassword
// @access Public

exports.forgotPassword = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    // Find user based on email sent through request
    const user = await User.findOne({ email: req.body.email })

    // If user is not found on request, send error handle
    if (!user) {
      res.status(404).json({
        message: "No account found associated with email",
        success: false,
      })
    }

    // Generate password token to send to params inside email link
    const resetPasswordToken = await user.getPasswordToken()

    // Save settings for new tokens to database
    await user.save({ validateBeforeSave: false })

    // If it passes, send email to user
    const resetPasswordLink = `${req.protocol}://${req.get(
      "host"
    )}/auth/resetpassword/${resetPasswordToken}`

    const params: IEmailParams = {
      reply_to: req.body.email,
      subject: "Reset password",
      message: resetPasswordLink,
    }

    // Await for email response using sendEmail
    const emailResponse: IEmailResponse = await sendEmail(params)

    // If the returned accepted array returns 0, respond with error
    if (!emailResponse.accepted.length)
      res.status(404).json({
        success: false,
        emailResponse,
      })

    res.status(200).json({
      success: true,
      emailResponse,
    })
  }
)

// @desc Reset password using provided token
// @routes /auth/resetpassword/:id
// @access Public

exports.resetPassword = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    // Get new password from request
    const newPassword = req.body.newPassword

    if (!newPassword) {
      res.status(404).json({
        success: false,
        message: "Please enter password",
      })
    }

    // Hash to compare against saved hash reset password token in database
    const unhashedResetToken = req.params.id

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(unhashedResetToken)
      .digest("hex")

    // Find the user based on the token provided in the link
    const user = await User.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    // Error handle if user was not found
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Wrong or expired link, please try sending another form again",
      })
    }

    // If find check passes, overwrite previous password with new one
    // Remove password tokens from database
    user.password = newPassword
    user.resetPasswordToken = null
    user.resetPasswordExpire = null

    // Save new overwritten information above
    await user.save()

    // Generate token and set to header and cookies
    sendTokenResponse(user, 200, res)
  }
)

// @desc Confirm email with token received from registering
// @routes /auth/confirmemail/:id
// @access Public: User

exports.confirmEmail = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    // Get unhashed confirm token from email link
    const unhashedConfirmToken = req.params.id

    // Hash token to compare to database
    const hashedConfirmToken = crypto
      .createHash("sha256")
      .update(unhashedConfirmToken)
      .digest("hex")

    // Find and return user based on token provided
    const user = await User.findOne({
      isEmailConfirmed: false,
      isEmailConfirmedToken: hashedConfirmToken,
    })

    // Error handle if token is not found
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Error confirming email, please send confirm form again",
      })
    }

    // Set User schema to update email confirmation
    // Clear token from database
    user.isEmailConfirmed = true
    user.isEmailConfirmedToken = null

    // Save changes to database
    user.save()

    res.status(200).json({
      success: true,
      message: "Email confirmed!",
    })
  }
)

// @desc Resends confirmation email and overwrites previous token
// @routes /auth/confirmemail
// @access Public

exports.resendConfirmEmail = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    // Get email from request
    const { email } = req.body

    // Find user by provided email
    const user: IUserSchema = await User.findOne({ email })
    // If user does not exist, send error handler
    if (!user) {
      res.status(404).json({
        message: "User not found",
        success: false,
      })
    }

    // If user is already confirmed, don't send email
    if (user.isEmailConfirmed) {
      res.status(404).json({
        message: `${email} has already confirmed their email!`,
        success: false,
      })
    } else {
      // Resend confirmation mail
      await sendConfirmEmail(req, user)

      // Send success status
      res.status(200).json({
        success: true,
        message: "Confirmation sent!",
      })
    }
  }
)

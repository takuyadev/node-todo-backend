import { ErrorRequestHandler, Request, Response, NextFunction } from "express"

const errorHandler = (
  _err: ErrorRequestHandler,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(500).json({
    message: "Error",
    success: false,
    data: {},
  })
  next()
}

module.exports = errorHandler

// Callsback the controller function
// If promise is not resolved, try catching error
import { RequestHandler, Request, Response, NextFunction } from "express"

const asyncHandler = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) =>
   Promise.resolve(fn(req, res, next)).catch(next)

module.exports = asyncHandler
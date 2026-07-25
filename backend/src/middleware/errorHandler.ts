import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  console.error(`[Unhandled Error] ${err.name}: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  return sendError(
    res,
    process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    500
  );
};

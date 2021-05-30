import { ErrorRequestHandler } from 'express';

// TODO: Enhance
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log('[server][errorHandler] err :', err);

  if (res.headersSent) {
    next(err);
  } else {
    res.status(500);
    res.json({
      message: err.message,
    });
  }
};

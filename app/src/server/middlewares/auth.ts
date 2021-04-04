import chalk from 'chalk';
import jwt from 'jsonwebtoken';
import { Router, Request, Response, NextFunction } from 'express';
import { log } from '../../shared/common/utils';

const authenticationBaseUrls: RegExp[] = [/^\/api/];

const auth = (req, res, next: NextFunction) => {
  // TODO:
  // console.log('// auth. req.headers :', req.headers);
  console.log('// req.baseUrl :', req.baseUrl);

  let needAuthentication: boolean = false;
  for (let i = 0, max = authenticationBaseUrls.length; i < max; i++) {
    const urlRegex: RegExp = authenticationBaseUrls[i];
    if (urlRegex.test(req.baseUrl)) {
      needAuthentication = true;
      break;
    }
  }

  if (needAuthentication === true) {
    const authHeader = req.headers['authorization'];
    console.log('authHeader :', authHeader);

    const token = authHeader?.split(' ')[1]; // get JWT_TOKEN_STRING string from 'Bearer JWT_TOKEN_STRING' string
    console.log('token :', token);
    if (!token) {
      // Unauthorized
      res.status(401).json({
        message: 'NO_ACCESS_TOKEN',
      });
      return;
    }

    const secretKey: string = process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
    jwt.verify(token, secretKey, (error: any, decoded: any) => {
      if (error) {
        // TODO: 여기서 verify 실패한 사유를 알 수 있는가?
        //
        console.log(error);
        console.log(error.name);
        console.log(error.message);
        console.log('decoded :', decoded);

        if (error.name === 'TokenExpiredError') {
          // name: TokenExpiredError, message: jwt expired
          res.status(403).json({
            message: 'EXPIRED_TOKEN',
          });
        } else {
          // all other cases
          // name: JsonWebTokenError, message: invalid signature
          // ...
          res.status(401).json({
            message: 'UNAUTHORIZED',
          });
        }

        return;
      }

      log(chalk.green('authenticationTokenMiddleware. decoded :', decoded));
      // req.member = decoded;

      next();
    });
  } else {
    next();
  }
};

export default auth;

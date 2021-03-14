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

    const token = authHeader?.split(' ')[1]; // get JWT_TOKEN_STRING string
    console.log('token :', token);
    if (!token) {
      return res.sendStatus(401); // Unauthorized
    }

    const secretKey: string = process.env.JWT_ACCESS_TOKEN_SECRET_KEY || '';
    jwt.verify(token, secretKey, (error: any, member: any) => {
      if (error) {
        return res.sendStatus(403); // Forbidden
      }

      log(chalk.green('authenticationTokenMiddleware. decoded :', member));

      req.member = member;

      next();
    });
  } else {
    next();
  }
};

export default auth;

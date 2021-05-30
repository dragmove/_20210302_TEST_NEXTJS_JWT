// - Ref
// setting: https://www.youtube.com/watch?v=_FrWqYMvbhA

import chalk from 'chalk';
import next from 'next';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import passport from 'passport';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pingRouter from './routes/ping';
import authRouter from './routes/auth'; // passport auth router
// import pageAuth from './middlewares/pageAuth'; // page auth middleware
import auth from './middlewares/auth'; // auth middleware
import apiRouter from './routes/api';
import { errorHandler } from './middlewares/error';
import { log } from '../shared/common/utils';
import { Member } from '../shared/interfaces/common';
import dotenv from 'dotenv';
import axios from 'axios';
import { SERVER_PORT } from '../shared/constants/common';

dotenv.config();

const isDev = process.env.PHASE !== 'production'; // TODO: Change isDev to phase
console.log('[app-nextjs] isDev :', isDev);
console.log('[app-nextjs] PHASE :', process.env.PHASE);

async function init(): Promise<void> {
  // Ref: https://nextjs.org/docs/advanced-features/custom-server
  const nextApp = next({
    dev: isDev,
    quiet: isDev,
  });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  const app = express();
  app.disable('x-powered-by');

  // TODO: Connect DB

  // set middlewares
  app.use(
    helmet({
      hsts: false,
      contentSecurityPolicy: false,
    })
  );
  app.use(cors());
  app.use(express.static('public'));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb' }));
  app.use(compression());
  app.use(cookieParser());
  app.use(morgan('dev'));
  app.use(pingRouter);

  // authentication using passport
  app.use(passport.initialize());
  app.use(authRouter);

  // routers provide static resources
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (
      [/\/_next\/.*/, /\/assets\/.*/, /\/images\/.*/, /\/libs\/.*/].find(
        (regex: RegExp) => regex.test(req.path) === true
      )
    ) {
      return handle(req, res);
    }

    return next();
  });

  // TODO: routers do not require authorization
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if ([/\/login\/.*/].find((regex: RegExp) => regex.test(req.path) === true)) {
      return handle(req, res);
    }

    return next();
  });

  // custom middlewares
  app.use(function customMiddleware(err, req, res, next) {
    console.log('custom middleware');
    next();
  });

  // routers require authorization
  // FIXME: 잠시 진행을 멈추고, auth router 와 auth 미들웨어에서 할 일을 분리하자.
  // app.use(pageAuth); // FIXME: 다시 한번 auth 미들웨어로만 할 수 있을지 고민해보기로 했다.
  app.use(auth);
  app.use(apiRouter);

  // error handling
  app.use(errorHandler); // TODO: Check middleware line position

  // FIXME: Use webpack to build server/index.ts typescript file, and run.
  // Ref: https://webpack.js.org/guides/typescript/
  app.get('*', (req, res) => {
    handle(req, res);
  });

  const server = app.listen(SERVER_PORT, () => {
    log(chalk.bgGreen(`[server] Listening on port: ${SERVER_PORT}`));
  });
}

try {
  init();
} catch (err) {
  console.error('[server] Failed to start server :', err);
}

/*
// + 1. Call /login api setting
  // [Header] Key: 'Content-Type', Value: 'application/json'
  // [Body] { "id": "winter", "password": "8888" }
  // After calling /login, you can get { "accessToken": "JWT_TOKEN_STRING", "refreshToken": "JWT_REFRESH_TOKEN_STRING" }
  app.post('/login', async (req: Request, res: Response) => {
    // TODO:
    // Authentication
    const { id, password } = req.body;

    // Find a member has id/pw in database
    const members: Member[] = db.tbl_member.filter(
      (_member: Member): boolean => _member.id === id && _member.password === password
    );
    if (members.length <= 0) {
      log(chalk.bgRed('[/login] There is not a member matched on db.tbl_member table'));
      res.status(404).send('Not Found');
    }

    const member: Member = members[0];
    log(chalk.cyan('[/login] member id, pw :', member.id, member.password));

    const accessToken: string = generateAccessToken(member);
    const refreshToken: string = generateRefreshToken(member); // save refreshToken to redis
    // db.tbl_refreshTokens.push(refreshToken);

    log(chalk.green('jwt access token :', accessToken));
    log(chalk.green('jwt refresh token :', refreshToken));

    // save refreshToken on backend-redis
    let result;
    try {
      result = await axios({
        url: 'http://backend-redis:9000/refresh-token',
        method: 'post',
        data: {
          memberId: id,
          refreshToken,
        },
      });

      console.log('post. set refresh-token. status :', result.status);
    } catch (e) {
      console.error(e);

      res.status(500).json({
        message: 'Failed to save a refresh token on backend-redis',
      });
      return;
    }

    res.status(200).json({ accessToken, refreshToken });
  });
  */

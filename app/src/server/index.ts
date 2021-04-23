// - Ref
// setting: https://www.youtube.com/watch?v=_FrWqYMvbhA

import chalk from 'chalk';
import next from 'next';
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import auth from './middlewares/auth';
import { errorHandler } from './middlewares/error';
import getRoutes from './api/routes';
import { log } from '../shared/common/utils';
import { Member } from '../shared/interfaces/common';
import { generateAccessToken, generateRefreshToken } from './common/jwt';
import dotenv from 'dotenv';
import axios from 'axios';

// TODO: This is a tbl_member table on DB
const db = {
  tbl_member: [
    {
      id: 'typescript',
      password: '9999',
    },
    {
      id: 'winter',
      password: '8888',
    },
  ],
  // tbl_refreshTokens: [],
};

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

  const PORT: number = parseInt(process.env.PORT, 10) || 9001;

  const app = express();

  // TODO: Connect DB

  app.use(morgan('dev'));
  // app.use(helmet()); // TODO:
  app.use(bodyParser.json());
  app.use('*', auth);

  const customMiddleware = (err, req, res, next) => {
    console.log('custom');
    next();
  };
  app.use(customMiddleware);

  app.use('/api', getRoutes());
  app.use(errorHandler); // TODO: Check middleware line position

  // FIXME: Use webpack to build server/index.ts typescript file, and run.
  // Ref: https://webpack.js.org/guides/typescript/
  app.get('*', (req, res) => {
    handle(req, res);
  });

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

  const server = app.listen(PORT, () => {
    log(chalk.bgGreen(`Listening on port: ${PORT}`));
  });
}

try {
  init();
} catch (err) {
  console.error('Failed to start server :', err);
}

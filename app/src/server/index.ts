// - Ref
// setting: https://www.youtube.com/watch?v=_FrWqYMvbhA

import next from 'next';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import auth from './middlewares/auth';
import { errorHandler } from './middlewares/error';
import getRoutes from './api/routes';

const port: number = parseInt(process.env.PORT, 10) || 9001;
const isDev = process.env.NODE_ENV !== 'production';
console.log('isDev :', isDev);

async function init(): Promise<void> {
  // Ref: https://nextjs.org/docs/advanced-features/custom-server
  const nextApp = next({
    dev: isDev,
    quiet: isDev,
  });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  const app = express();

  // TODO: connect DB

  app.use(morgan('dev'));
  app.use(helmet());
  app.use(bodyParser.json());
  app.use(auth);
  app.use('/api', getRoutes());
  app.use(errorHandler);

  // custom middleware
  const customMiddleware = function (req, res, next) {
    console.log('LOGGED');
    next();
  };
  app.use(customMiddleware);

  // FIXME: Use webpack to build server/index.ts typescript file, and run.
  // Ref: https://webpack.js.org/guides/typescript/
  app.get('*', (req, res) => {
    handle(req, res);
  });

  const server = app.listen(port, () => {
    console.log('listening on port 9001');
  });
}

try {
  init();
} catch (err) {
  console.error('Failed to start server :', err);
}

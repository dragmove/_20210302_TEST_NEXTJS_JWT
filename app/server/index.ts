import next from 'next';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';

const isDev = process.env.NODE_ENV !== 'production';

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
  app.use(bodyParser.json());

  // FIXME: Use webpack to build server/index.ts typescript file, and run.
  // Ref: https://webpack.js.org/guides/typescript/
  app.get('*', (req, res) => {
    handle(req, res);
  });
  
  app.listen(process.env.PORT || 9001, (err) => {
    if (err) throw err;
    console.log('listening on port 9001')
  });
}

try {
  init();
} catch (e) {
  console.error('failed to start server :', e);
}
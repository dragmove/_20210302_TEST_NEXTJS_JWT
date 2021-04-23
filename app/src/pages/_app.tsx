// Ref: https://nextjs.org/docs/advanced-features/custom-app

// Add global CSS
// Ref: https://elad.medium.com/normalize-css-or-css-reset-9d75175c5d1e
import '../styles/normalize.scss';
import '../styles/reset.local.scss';
import '../styles/typography.scss';

import App from 'next/app';
import type { AppProps } from 'next/app';
import { Provider } from 'mobx-react';
import { stores } from '@client/stores';
import { PHASE } from '@client/constants/env';

function MyApp(props: AppProps) {
  const { Component, pageProps } = props;

  console.log('// MyApp props :', props);
  console.log('// MyApp PHASE :', PHASE);

  // TODO: Custom error handling using componentDidCatch

  return (
    <Provider {...stores}>
      <Component {...pageProps} />
    </Provider>
  );
}

MyApp.getInitialProps = async (appContext) => {
  const { router, ctx } = appContext;

  const pageProps = {
    // TODO: Add some infos
  };

  return { pageProps };
};

export default MyApp;

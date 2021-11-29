// Ref: https://nextjs.org/docs/advanced-features/custom-app

// Add global CSS
// Ref: https://elad.medium.com/normalize-css-or-css-reset-9d75175c5d1e
import '../styles/normalize.scss';
import '../styles/reset.local.scss';
import '../styles/typography.scss';

import type { AppProps } from 'next/app';
import { Provider } from 'mobx-react';
import { stores } from '@client/stores';
import { PHASE } from '@client/constants/env';
import { isBrowser } from '@shared/common/utils';

function App(props: AppProps) {
  const { Component, pageProps } = props;
  console.log('[_app] PHASE :', PHASE);
  console.log('[_app] pageProps :', pageProps);

  const member = pageProps.member;
  if (member) {
    stores.memberStore.set(member);

    if (isBrowser()) {
      sessionStorage.setItem('member.id', member.id);
    }
  }

  // TODO: Custom error handling using componentDidCatch

  return (
    <Provider {...stores}>
      <Component {...pageProps} />
    </Provider>
  );
}

App.getInitialProps = async (appContext) => {
  const { router, ctx } = appContext;
  console.log('[_app] getInitialProps :', ctx?.req?.member);

  const pageProps = {
    member: null,
  };

  if (ctx?.req?.member) {
    pageProps.member = ctx.req.member;
  }

  return { pageProps };
};

export default App;

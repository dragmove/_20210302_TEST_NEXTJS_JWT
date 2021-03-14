import { NextPageContext } from 'next';
import Router from 'next/router';

export const log = console.log;

export function isArray(val: unknown): boolean {
  return Array.isArray(val);
}

export const redirect = (redirectUrl: string, context: NextPageContext = null): void => {
  const isBrowser: boolean = typeof window !== 'undefined';
  if (isBrowser) {
    Router.push(redirectUrl);
    return;
  }

  if (context) {
    context.res.writeHead(302, { Location: redirectUrl }).end();
    return;
  }

  console.info('[redirectOnError] Cannot redirect beacuse of no context on server-side');
};

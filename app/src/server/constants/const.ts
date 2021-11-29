export const ACCESS_TOKEN_SECRET = {
  algorithm: 'HS256',
  key: 'qwert', // FIXME: 어떻게 유효한 access token secret key 를 만들지?
};
export const ACCESS_TOKEN_ISSUER: string = 'dragmove';
export const ACCESS_TOKEN_NAME: string = 'accessToken';
export const ACCESS_TOKEN_EXPIRES: number = 10 * 60 * 1000; // 10 minutes
// export const SESSION_TIME_MS: number = 60 * 60 * 1000; // 1 hour

export const REFRESH_TOKEN_SECRET = {
  algorithm: 'HS256',
  key: 'qwert', // FIXME: 어떻게 유효한 access token secret key 를 만들지?
};
export const REFRESH_TOKEN_ISSUER: string = 'dragmove';
export const REFRESH_TOKEN_NAME: string = 'refreshToken';
export const REFRESH_TOKEN_EXPIRES: number = 60 * 60 * 1000; // 1 hour
// export const REFRESH_TOKEN_EXPIRES: number = 7 * 24 * 60 * 60 * 1000; // expire after 7 days

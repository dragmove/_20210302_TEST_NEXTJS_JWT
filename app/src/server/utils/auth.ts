import { Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_ISSUER,
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_ISSUER,
  REFRESH_TOKEN_EXPIRES,
} from '../constants/const';

export function generateAccessToken(payload, options?: { issuer?: string; expiresIn?: string }): string {
  const defaultOptions = {
    algorithm: ACCESS_TOKEN_SECRET.algorithm,
    issuer: ACCESS_TOKEN_ISSUER,
    expiresIn: `${10 * 1000}ms`, // FIXME: 10초 후 access token 만료되도록 테스트 설정. 개발 완료 후, 다시 ACCESS_TOKEN_EXPIRES 으로 원복할 것
  };

  const accessToken: string = jwt.sign(payload, ACCESS_TOKEN_SECRET.key, { ...defaultOptions, ...options });
  console.log('[generateAccessToken] 10 초 :', accessToken);

  // const decoded: string = jwt.verify(accessToken, ACCESS_TOKEN_SECRET.key);
  // console.log('decoded :', decoded);

  return accessToken;
}

export function generateRefreshToken(payload, options?: { issuer?: string; expiresIn?: string }): string {
  const defaultOptions = {
    algorithm: REFRESH_TOKEN_SECRET.algorithm,
    issuer: REFRESH_TOKEN_ISSUER,
    expiresIn: `${REFRESH_TOKEN_EXPIRES}ms`,
  };

  return jwt.sign(payload, REFRESH_TOKEN_SECRET.key, { ...defaultOptions, ...options });
}

export function verifyRefreshToken(refreshToken, options?: { algorithmes?: string }) {
  // TODO: 정상 작동 확인 필요
  const defaultOptions = {
    algorithm: ACCESS_TOKEN_SECRET.algorithm,
    issuer: REFRESH_TOKEN_ISSUER,
  };

  return jwt.verify(refreshToken, REFRESH_TOKEN_SECRET.key, { ...defaultOptions, ...options });
}

/*
export function expireAuthCookie(res: Response): Response {
  return res.cookie(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: COOKIE_PATH,
    sameSite: 'strict',
  });
}
*/

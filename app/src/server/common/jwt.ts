import jwt from 'jsonwebtoken';
import { Member } from '@shared/interfaces/common';
import { log } from '../../shared/common/utils';

export function generateAccessToken(member: Member): string {
  const secretKey: string = process.env.JWT_ACCESS_TOKEN_SECRET_KEY;

  // Ref: https://www.npmjs.com/package/jsonwebtoken
  const accessToken: string = jwt.sign(
    {
      id: member.id,
    },
    secretKey,
    {
      expiresIn: 15, // 60 seconds
    }
  );

  return accessToken;
}

export function generateRefreshToken(member: Member): string {
  const secretKey: string = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;

  const refreshToken: string = jwt.sign(
    {
      id: member.id,
    },
    secretKey
  );

  return refreshToken;
}

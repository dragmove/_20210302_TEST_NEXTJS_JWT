import chalk from 'chalk';
import { Request, Response, NextFunction, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { log } from '../../../shared/common/utils';
import passport from 'passport';
import crypto from 'crypto';
import { COOKIE_PATH, LOGIN_ROUTE, SERVICE_PATH } from '../../../shared/constants/common';
import ENV from '../../../shared/env/domain';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import LocalStrategy from 'passport-local';
import { database } from '../../database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/auth';
import {
  ACCESS_TOKEN_NAME,
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_NAME,
  REFRESH_TOKEN_EXPIRES,
} from '../../constants/const';
// import { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, SESSION_TIME_MS } from '../../constants/const';
// import { expireAuthCookie, signJwt } from '../../utils/auth';
// import { LOGIN_HISTORY_MESSAGE_TEXT } from '../../../shared/enums/common';
// import { AdminMemberSchema } from '../../../shared/schemas/types/drt/AdminMemberSchema';
// import { AdminMemberOauthDtoSchema } from '../../../shared/schemas/types/dto/AdminMemberOauthDtoSchema';

/*
const basePath: string = `${ENV.SERVER_DOMAIN}${SERVICE_PATH}`;

const encryptPassword = (password: string, passwordSaltKey: string): Promise<string> => {
  // Ref: https://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback
  return new Promise((resolve, reject) => {
    try {
      crypto.pbkdf2(
        password,
        passwordSaltKey,
        100042, // iterations
        64,
        'sha512',
        (err: Error, derivedKey: Buffer) => {
          if (err) {
            throw err;
          }

          const hashed: string = derivedKey.toString('hex');
          resolve(hashed);
        }
      );
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
};
*/

passport.use(
  new LocalStrategy(
    {
      usernameField: 'id',
      passwordField: 'password',
      session: true,
    },
    async (memberId: string, password: string, done: (err, member?) => void) => {
      log('[LocalStrategy] memberId, password :', memberId, password);

      try {
        // find member on tbl_member table
        const _member = database.tbl_member.find((obj) => obj.id === memberId && obj.password === password);
        if (!_member) {
          return done({
            type: 'mismatch',
            status: 406,
            message: '아이디 및 패스워드를 정확히 입력해주세요.',
          });
        }

        // execute callback of '/auth/local' route
        done(null, _member);
      } catch (err) {
        console.error(err);
        done(err, null);
      }
    }
  )
);

const router: Router = Router();

// Local Login (Ref: http://www.passportjs.org/packages/passport-local/)
router.post(`${SERVICE_PATH}/auth/local`, (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'local',
    {
      failureRedirect: LOGIN_ROUTE,
    },
    async (
      err: { message: string; status?: number; type?: string } | Error,
      member?: {
        id: string;
        password: string;
      }
    ) => {
      log('err, member :', err, member);

      if (err) {
        if (err instanceof Error) {
          return res.status(500).json({ message: err.message });
        } else {
          // case: no member
          // case: password mismatch
          return res.status(err.status).json({
            message: err.message,
          });
        }
      }

      if (!member) {
        log(chalk.bgRed('[/login] There is not a member matched on db.tbl_member table'));
        return res.status(406).json({
          message: '등록되지 않은 아이디입니다. 담당자에게 문의해주세요.',
        });
      }

      // generate access token, refresh token
      const accessToken: string = generateAccessToken({
        id: member.id,
      });
      // const accessTokenExpiresIn = new Date(new Date().getTime() + ACCESS_TOKEN_EXPIRES);
      const refreshToken: string = generateRefreshToken({
        id: member.id,
      });
      console.log('accessToken, refreshToken :', accessToken, refreshToken);

      // FIXME: 일단 10초 짜리 토큰을 만들고, cookie 는 10분 동안 유지되도록 설정했다. // process 개발 후에 둘 모두 동일하도록 원복 필요

      res.cookie(ACCESS_TOKEN_NAME, accessToken, {
        httpOnly: true,
        maxAge: ACCESS_TOKEN_EXPIRES,
        path: COOKIE_PATH,
        secure: false,
        sameSite: 'strict',
      });

      res.status(200).json({
        accessToken,
        refreshToken,
      });
    }
  )(req, res, next);
});

router.post(`${SERVICE_PATH}/auth/refresh-access-token`, (req: Request, res: Response, next: NextFunction) => {
  console.log('/auth/refresh-access-token 호출. access token 을 refresh 합시다.');

  try {
    // 전달 받은 refresh token 이 유효한지 확인한다.
    const refreshToken: string = req.body.refreshToken;

    const decoded: any = verifyRefreshToken(refreshToken);
    const member = decoded;

    // generate access token, refresh token
    const accessToken: string = generateAccessToken({
      id: member.id,
    });
    console.log('accessToken :', accessToken);

    res.cookie(ACCESS_TOKEN_NAME, accessToken, {
      httpOnly: true,
      maxAge: ACCESS_TOKEN_EXPIRES,
      path: COOKIE_PATH,
      secure: false,
      sameSite: 'strict',
    });

    return res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error(err);

    // FIXME: 개발 필요
    // TODO: refresh token이 유효하지 않거나, access token을 새로 생성할 수 없는 상황이므로 login 페이지로 이동 처리
    // client authAxios.interceptor에서 response를 전달받아 정상 처리되는지 확인 필요
  }
});

// FIXME: Remove /auth/login
// + 1. Call /auth/local api setting
// [Header] Key: 'Content-Type', Value: 'application/json'
// [Body] { "id": "winter", "password": "8888" }

/*
router.post(`${SERVICE_PATH}/auth/login`, async (req: Request, res: Response) => {
  const { id, password } = req.body;
  console.log('req.body :', req.body);

  
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

/*
// Local Login (Ref: http://www.passportjs.org/packages/passport-local/)
router.post(`${SERVICE_PATH}/auth/local`, (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    'local',
    {
      failureRedirect: LOGIN_ROUTE,
    },
    async (err: { message: string; status?: number; type?: string } | Error, adminMember?: AdminMemberSchema) => {
      if (err) {
        if (err instanceof Error) {
          return res.status(500).json({ message: err.message });
        } else {
          // case: no adminMember
          // case: password mismatch
          return res.status(err.status).json({
            message: err.message,
          });
        }
      }

      if (!adminMember) {
        return res.status(406).json({
          message: '등록되지 않은 아이디입니다. 담당자에게 문의해주세요.',
        });
      }

      const authToken: string = await signJwt({
        member: {
          oauthType: 'local',
          oauthId: null,
          memberId: adminMember.adminMemberId,
          memberEmail: adminMember.email,
          memberName: adminMember.name,
          memberLevel: adminMember.level,
          memberPicture: adminMember.picture,
          mobilePhoneNumber: adminMember.mobilePhoneNumber,
          vehicleCompanyId: adminMember.vehicleCompanyId,
          usedYn: adminMember.usedYn,
        },
      });

      res.cookie(AUTH_COOKIE_NAME, authToken, {
        httpOnly: true,
        maxAge: SESSION_TIME_MS,
        path: COOKIE_PATH,
        sameSite: 'strict',
      });

      res.status(200).json({ message: 'ok' });
    }
  )(req, res, next);
});

// Google OAuth Login (Ref: https://github.com/jaredhanson/passport-google-oauth2)
router.get(
  `${SERVICE_PATH}/auth/google`,
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    // Ref: https://github.com/mstade/passport-google-oauth2/blob/master/lib/oauth2.js#L192
    prompt: 'select_account',
  })
);

router.get(
  `${SERVICE_PATH}/auth/google/callback`,
  (req: Request, res: Response, next: NextFunction) => {
    return passport.authenticate(
      'google',
      {
        failureRedirect: LOGIN_ROUTE,
      },
      (err, member: OAuthMember) => {
        if (err || !member) {
          return res.redirect(LOGIN_ROUTE);
        }

        req.member = member;
        next();
      }
    )(req, res, next);
  },
  passportOAuthHandler
);

router.get(`${SERVICE_PATH}/logout`, (req: Request, res: Response) => {
  // remove temporary property
  req.member = null;

  // expire auth cookie
  return expireAuthCookie(res).redirect(LOGIN_ROUTE);
});
*/

export default router;

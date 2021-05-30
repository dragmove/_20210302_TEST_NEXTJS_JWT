import chalk from 'chalk';
import jwt from 'jsonwebtoken';
import { Router, Request, Response, NextFunction } from 'express';
import { log } from '../../shared/common/utils';
import { ACCESS_TOKEN_NAME, ACCESS_TOKEN_SECRET } from '../../server/constants/const';
import { database } from '../../server/database';
import { destroyCookie } from 'nookies';
import { COOKIE_PATH } from '../../shared/constants/common';
import axios from 'axios';

// authorization 이 필요한 page path 정의
const pathsNeedAuthorization: RegExp[] = [
  // page path
  /^\/profile/,
];

const pageAuth = async (req, res, next: NextFunction) => {
  // TODO:
  console.log('===== pageAuth =====');
  console.log('// req.path :', req.path);
  console.log('// req.body :', req.body);
  console.log('// req.cookies :', req.cookies);

  const needAuthentication: boolean = !!pathsNeedAuthorization.find((regex: RegExp) => regex.test(req.path) === true);
  console.log('needAuthentication :', needAuthentication);
  if (!needAuthentication) {
    return next();
  }

  const accessToken: string = req.cookies[ACCESS_TOKEN_NAME];
  console.log('accessToken :', accessToken);

  accessToken 이 없다면 
  accessToken 이 있는데 expired 되었다면: redis server 에 저장된 refreshToken 을 가져와서, 이 refreshToken 으로 새로운 accessToken 을 만들어 쿠키에 심는다. refreshToken 의 유효성 판단하여 유효하지 않다면/없다면, redis 에 저장되어 있던 refreshToken 제거, accessToken 모두 만료하고 쿠키에서 삭제시켜버리고 로그아웃 시켜버리고, 로그인 페이지로 보낸다.
  accessToken 이 있는데 조작된 token 이라면, redis 에 저장되어 있던 refreshToken 제거, accessToken 모두 만료하고 쿠키에서 삭제시켜버리고 로그아웃 시켜버리고, 로그인 페이지로 보낸다.

  고민중 'ㅅ');

  /*
  if (!accessToken) {
    // TODO: access token 이 없다면, refresh token 을 통해 다시 access token 을 얻을 수 있는지 확인 필요할 듯

    // cookie 에 access token 미존재
    return res.status(401).json({
      message: 'No access token',
      // statusText: 'Unauthorized'
    });
  }

  try {
    // FIXME: 신기한 것이 jwt secret key 에 따라서, JsonWebTokenError: invalid signature 에러를 발생시킬 때가 있다. 어떤 key 값이 유효한지 조사하여 반영 필요.
    const decoded: any = jwt.verify(accessToken, ACCESS_TOKEN_SECRET.key);
    console.log('decoded :', decoded);

    // decoded data 내 member id 가 데이터베이스에 존재하는지 확인
    const matchedMember = database.tbl_member.find((obj) => obj.id === decoded?.id);
    console.log('matchedMember :', matchedMember);
    if (!matchedMember) {
      // redis에 decoded?.id와 관련된 refreshToken을 삭제하여, 기존의 refresh token을 더 이상 사용할 수 없도록 조치한다.
      try {
        await axios({
          url: `http://backend-redis:9000/refresh-token/${decoded.id}`,
          method: 'delete',
        });
      } catch (e) {
        // none. error from redis client
      }

      // cookie의 access token 제거
      destroyCookie({ res }, ACCESS_TOKEN_NAME, {
        path: COOKIE_PATH,
      });

      // client authAxios.interceptor에서 login 페이지로 이동 처리
      return res.status(401).json({
        message: 'No matched member',
        // statusText: 'Unauthorized'
      });
    }

    // next middleware 에서 member 데이터를 사용할 수 있도록 req.member 에 추가
    req.member = decoded;

    next();
  } catch (err) {
    console.log('JsonWebTokenError 가 발생');
    console.error(err);

    if (err) {
      if (err.name === 'TokenExpiredError') {
        // name: TokenExpiredError
        res.status(400).json({
          message: 'Access token expired',
          // statusText: 'Bad Request'
        });
      } else {
        // all other cases
        // name: JsonWebTokenError, message: invalid signature
        // ...
        res.status(401).json({
          message: 'Unauthorized',
        });
      }

      return;
    }
  }
  */
};

export default pageAuth;

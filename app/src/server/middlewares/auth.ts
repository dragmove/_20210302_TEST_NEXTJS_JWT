import chalk from 'chalk';
import jwt from 'jsonwebtoken';
import { Router, Request, Response, NextFunction } from 'express';
import { log } from '../../shared/common/utils';
import { ACCESS_TOKEN_EXPIRES, ACCESS_TOKEN_NAME, ACCESS_TOKEN_SECRET } from '../../server/constants/const';
import { database } from '../../server/database';
import { destroyCookie } from 'nookies';
import { COOKIE_PATH } from '../../shared/constants/common';
import axios from 'axios';
import { generateAccessToken, verifyRefreshToken } from '../../server/utils/auth';

const API_PATH: RegExp = /^\/api/;
const PAGE_PATH: RegExp = /^\/profile/; // FIXME: auth 처리 필요한 page 구분 정규식 작성 필요

// authorization 필요한 path 정의
const pathsNeedAuthorization: RegExp[] = [API_PATH, PAGE_PATH];

const auth = async (req, res, next: NextFunction) => {
  console.log('===== auth middleware =====');
  console.log('// req.path :', req.path);
  console.log('// req.body :', req.body);
  console.log('// req.cookies :', req.cookies);

  const needAuthentication: boolean = !!pathsNeedAuthorization.find(
    (regex: RegExp): boolean => regex.test(req.path) === true
  );
  console.log('needAuthentication :', needAuthentication);
  if (!needAuthentication) {
    return next();
  }

  const isApiPath: boolean = API_PATH.test(req.path);
  const isPagePath: boolean = PAGE_PATH.test(req.path);
  console.log('isApiPath :', isApiPath);
  console.log('isPagePath :', isPagePath);

  const accessToken: string = req.cookies[ACCESS_TOKEN_NAME];
  console.log('accessToken :', accessToken);

  const memberId = jwt.verify(accessToken, ACCESS_TOKEN_SECRET.key, (err, decoded) => {
    console.log('err, decoded :', err, decoded);

    if (err) {
      console.log('jwt.verify error');
    }
  });
  console.log('memberId :', memberId);

  if (isApiPath) {
    console.log('=== auth middleware - api path ===');

    // api path
    if (!accessToken) {
      // cookie 에 access token 미존재
      // FIXME: 이 경우에도 단순히 client 측으로 401 status 를 던지는 것이 아니라,
      // client 의 axios.interceptor 가 access token 받아와서 일을 하도록 만들어야 한다.

      console.log('=== server 측에서 accessToken 이 없는 상황입니다. No access token 400 메세지를 반환하겠습니다.');

      return res.status(400).json({
        message: 'No access token',
        // statusText: 'Bad Request'
      });
    }

    try {
      // FIXME: jwt secret key 에 따라서, JsonWebTokenError: invalid signature 에러를 발생시킬 때가 있다. 어떤 key 값이 유효한지 조사하여 반영 필요.
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

      return next();
    } catch (err) {
      console.error(err);
      if (err) {
        if (err.name === 'TokenExpiredError') {
          // name: TokenExpiredError
          return res.status(400).json({
            message: 'Access token expired',
            // statusText: 'Bad Request'
          });
        } else {
          // all other cases
          // name: JsonWebTokenError, message: invalid signature
          // ...
          return res.status(401).json({
            message: 'Unauthorized',
          });
        }
      }
    }
  } else if (isPagePath) {
    console.log('=== auth middleware - page path ==='); // FIXME: 현재는 /profile 페이지만 체크하게 되어 있으므로, auth 체크를 하는 페이지 추가 필요

    // page path
    if (!accessToken) {
      // accessToken 이 cookie 에 존재하지 않는다면

      try {
        const getRefreshTokenResult = await axios({
          url: `http://backend-redis:9000/refresh-token/${memberId}`,
          method: 'get',
        });

        const refreshToken: string = getRefreshTokenResult?.data?.refreshToken;
        if (!refreshToken) {
          destroyCookie({ res }, ACCESS_TOKEN_NAME, {
            path: COOKIE_PATH,
          });

          // login 페이지로 이동 처리
          return res.redirect('/login');
        }

        const decoded: any = verifyRefreshToken(refreshToken);
        const member = decoded;

        // generate access token, refresh token
        const accessToken: string = generateAccessToken({
          id: member.id,
        });

        res.cookie(ACCESS_TOKEN_NAME, accessToken, {
          httpOnly: true,
          maxAge: ACCESS_TOKEN_EXPIRES,
          path: COOKIE_PATH,
          secure: false,
          sameSite: 'strict',
        });

        req.member = member;

        return next();
      } catch (err) {
        console.error(err);
        console.log('err.name :', err.name);

        if (err.name === 'TokenExpiredError') {
          // redis server 로부터 전달 받은 refresh token 만료
          try {
            await axios({
              url: `http://backend-redis:9000/refresh-token/${memberId}`,
              method: 'delete',
            });
          } catch (e) {
            // none. error from redis client
          }

          // cookie의 access token, member id 제거
          destroyCookie({ res }, ACCESS_TOKEN_NAME, {
            path: COOKIE_PATH,
          });

          // login 페이지로 이동 처리
          return res.redirect('/login');
        } else {
          // all other cases
          // TODO: cookie 의 member id 도 삭제시켜야 한다.

          return res.redirect('/login');
        }
      }
    } else {
      // access token 존재
      const decoded: any = jwt.verify(accessToken, ACCESS_TOKEN_SECRET.key);

      const matchedMember = database.tbl_member.find((obj) => obj.id === decoded?.id);
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
        return res.redirect('/login');
      }

      // next middleware 에서 member 데이터를 사용할 수 있도록 req.member 에 추가
      req.member = decoded;

      return next();
    }

    /*
    try {
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
        // FIXME: /api path request 이슈는 해결 가능한데, page request 는 어떻게 해야 할까?
        // page request 라고 할지라도 accessToken 이 만료된 상황이거나 cookie 에 accessToken 이 담겨오지 않은 상황은 같다.
        // => 지금 로그인 상태의 사람이 발급받은 refreshToken 을 redis server 에서 받아와서,
        // 이를 통해서 /auth/refresh-access-token 을 호출하여 accessToken 을 발급 받아서 cookie 에 심고,
        // client 측에서 요청한 페이지로 이동시켜주면 된다.
        // 만일, refreshToken 이 redis 서버에 없거나 expired 되었다면, 무조건 logout 시키고 login 페이지로 redirect 시켜버려야 한다. 
        // (그런데, page request 시에는 redirect 가능할 듯 한데, api request 일 경우는 어떻게 redirect 시키지? 되는지 확인 필요)
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
  } else {
    console.log('=== other pages === ');
    next();
  }

  /*
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
      // FIXME: /api path request 이슈는 해결 가능한데, page request 는 어떻게 해야 할까?
      // page request 라고 할지라도 accessToken 이 만료된 상황이거나 cookie 에 accessToken 이 담겨오지 않은 상황은 같다.
      // => 지금 로그인 상태의 사람이 발급받은 refreshToken 을 redis server 에서 받아와서,
      // 이를 통해서 /auth/refresh-access-token 을 호출하여 accessToken 을 발급 받아서 cookie 에 심고,
      // client 측에서 요청한 페이지로 이동시켜주면 된다.
      // 만일, refreshToken 이 redis 서버에 없거나 expired 되었다면, 무조건 logout 시키고 login 페이지로 redirect 시켜버려야 한다. 
      // (그런데, page request 시에는 redirect 가능할 듯 한데, api request 일 경우는 어떻게 redirect 시키지? 되는지 확인 필요)
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

export default auth;

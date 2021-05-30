import { isBrowser } from '@shared/common/utils';
import { SERVER_DOMAIN } from '@shared/constants/common';
import axios from 'axios';
import Router from 'next/router';

// use to control access token, refresh token
export const authAxios = axios.create({
  // baseURL: 'http://example.com'
});

authAxios.interceptors.request.use(
  (requestConfig) => {
    console.log('[authAxios.interceptors.request] requestConfig :', requestConfig);
    return requestConfig;
  },
  (err) => {
    console.log('[authAxios.interceptors.request] err :', err);
    return Promise.reject(err);
  }
);

authAxios.interceptors.response.use(
  (response) => {
    console.log('[authAxios.interceptors.response] response :', response);
    return response;
  },
  async (err) => {
    console.log('[authAxios.interceptors.response] err :', err);
    console.log('err.response :', err.response);

    const originalRequest = err.config;

    const status = err?.response?.status;
    console.log('status :', status);

    switch (status) {
      case 400:
        // TODO: 서버 service 측에서 이 구분을 어떻게 할지 뭔가 구분값을 만들어줘야 한다.

        if (err?.response?.data?.message === 'Access token expired') {
          console.log('400 === client === Access token expired ===');

          if (isBrowser()) {
            // TODO: session storage 로부터의 member.id 취득이 끝난 뒤에, 이 프로세스 완료시 session storage 를 비우자.
            const memberId: string = sessionStorage.getItem('member.id');
            console.log('////// memberId :', memberId);

            try {
              const getRefreshTokenResult = await axios({
                url: `http://localhost:9000/refresh-token/${memberId}`, // TODO: client 측에서는 http://backend-redis:9000/refresh-token 로 호출이 되지 않는 것은 어째서?
                method: 'get',
              });

              const refreshToken: string = getRefreshTokenResult?.data?.refreshToken;
              if (refreshToken && !originalRequest.__retry) {
                originalRequest.__retry = true;

                // 서버측으로 갱신 요청 => 서버 측에서  cookie 설정
                const makeNewAccessTokenResult = await axios({
                  url: `${SERVER_DOMAIN}/auth/refresh-access-token/`,
                  method: 'post',
                  data: {
                    refreshToken: getRefreshTokenResult.data.refreshToken,
                  },
                });
                console.log('makeNewAccessTokenResult :', makeNewAccessTokenResult);

                // 서버 측에서 cookie 설정을 해줬으니, 이제 다시 original request 를 진행
                return axios(originalRequest);
              }
            } catch (err) {
              console.log('////// err :', err);
              // TODO: redis 에서 refreshToken 받아오다가 실패 => 로그인 다시 하게 만들자.
              // TODO: 서버측으로 access token 갱신 요청 실패 => 로그인 다시 하게 만들자.
            }
          }

          /*
          이 받아온 refreshToken 을 사용하여 
          /auth/refreshAccessToken 을 호춣하여
          서버측에서 cookie 에 access token 을 할당하게 한다.
          
          
          이 작업이 성공하면 곧바로 
          axios(originalRequest) 를 수행하여,
          원래 호출했던 api 가 정상 작동하도록 만든다.
          */
          // 이것으로 Access token 이 header 에 갱신되었고,
          // 나는 이 access token 으로 10 초 동안 다시 api 호출을 할 수 있게 되는 것이다.
        } else if (err?.response?.data?.message === 'No access token') {
          console.log('400 === client === No access token ===');

          if (isBrowser()) {
            // TODO: session storage 로부터의 member.id 취득이 끝난 뒤에, 이 프로세스 완료시 session storage 를 비우자.
            const memberId: string = sessionStorage.getItem('member.id');
            console.log('////// memberId :', memberId);

            try {
              const getRefreshTokenResult = await axios({
                url: `http://localhost:9000/refresh-token/${memberId}`, // TODO: client 측에서는 http://backend-redis:9000/refresh-token 로 호출이 되지 않는 것은 어째서?
                method: 'get',
              });

              const refreshToken: string = getRefreshTokenResult?.data?.refreshToken;
              if (refreshToken && !originalRequest.__retry) {
                originalRequest.__retry = true;

                // 서버측으로 갱신 요청 => 서버 측에서  cookie 설정
                const makeNewAccessTokenResult = await axios({
                  url: `${SERVER_DOMAIN}/auth/refresh-access-token/`,
                  method: 'post',
                  data: {
                    refreshToken: getRefreshTokenResult.data.refreshToken,
                  },
                });
                console.log('makeNewAccessTokenResult :', makeNewAccessTokenResult);

                // 서버 측에서 cookie 설정을 해줬으니, 이제 다시 original request 를 진행
                return axios(originalRequest);
              }
            } catch (err) {
              console.log('////// err :', err);
              // TODO: redis 에서 refreshToken 받아오다가 실패 => 로그인 다시 하게 만들자.
              // TODO: 서버측으로 access token 갱신 요청 실패 => 로그인 다시 하게 만들자.
            }
          }
        }

        break;

      case 401:
        // Unauthorized
        Router.push('/login', '/login'); // TODO: 혹시 location.href = '/login' 으로 실행해야 하는지 검토 필요
        break;
    }

    return Promise.reject(err);
  }
);

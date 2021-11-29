import Head from 'next/head';
import Link from 'next/link';
import { Award } from '@shared/interfaces/common';
import { profileService } from '@client/services/profile';
import axios, { AxiosResponse, AxiosError } from 'axios';
import nookies from 'nookies';
import { useStores } from '@client/stores';
import { log } from '@shared/common/utils';
import Router from 'next/router';

interface Props {}

export default function Login(props: Props) {
  console.log('Home props :', props);

  const { envStore, memberStore } = useStores();

  return (
    <div>
      <Head>
        <title>/login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>hello /login page</p>

        <button
          onClick={async (e) => {
            e.preventDefault();

            // submit
            const id: string = 'winter';
            const password: string = '8888';

            try {
              // login and get access token
              const loginResponse: AxiosResponse = await axios({
                // TODO: Set domain
                url: '/auth/local',
                method: 'post',
                data: {
                  id,
                  password,
                },
              });
              console.log('loginResponse :', loginResponse);
              console.log('loginResponse.data :', loginResponse.data);

              if (loginResponse.status === 200) {
                const data: { accessToken: string; refreshToken: string } = loginResponse?.data;
                console.log('로그인 완료. data :', data);

                /*
                일단, 로그인 후 accessToken 및 refreshToken을 클라이언트 측에서 취하는 것으로 구현 테스트 진행중.
                어떻게 redis에 refreshToken을 저장하고
                accessToken 만료시, 
                  이 refreshToken을 redis로부터 받아와서 accessToken 갱신
                  refreshToken 만료시 -> ?
                
                  */

                // FIXME: ing
                // id 를 MemberStore 에 저장한다. => 반드시 저장해야 하는가?

                // client needs to save access token somewhere.
                // save refreshToken on backend-redis
                let saveRefreshTokenApiResult;
                try {
                  saveRefreshTokenApiResult = await axios({
                    url: 'http://localhost:9000/refresh-token', // TODO: client 측에서는 http://backend-redis:9000/refresh-token 로 호출이 되지 않는 것은 어째서일까?
                    method: 'post',
                    data: {
                      memberId: id,
                      refreshToken: data.refreshToken,
                    },
                  });
                  console.log('saveRefreshTokenApiResult.data :', saveRefreshTokenApiResult.data);
                  console.log('post. set refresh-token. status :', saveRefreshTokenApiResult.status);

                  if (saveRefreshTokenApiResult.status === 200) {
                    location.href = '/profile';
                  }
                } catch (err) {
                  console.error(err);
                  window.alert('redis 에 refresh token 저장하는 과정에서 에러가 발생했습니다.');
                }
              } else {
                console.log('Login failed');

                let error: any = new Error(loginResponse.statusText);
                error.response = loginResponse;
                throw error;
              }
            } catch (err) {
              console.error(err);
              const res: AxiosResponse = err.response;
              // case: no member 경우, '등록되지 않은 아이디입니다. 담당자에게 문의해주세요.'
              // case: password mismatch 경우, '아이디 및 패스워드를 정확히 입력해주세요.'
              console.error('/auth/local :', res.data?.message);
            }
          }}
        >
          login
        </button>

        <Link href="/profile">
          <a
            style={{
              color: '#f00',
            }}
          >
            Profile
          </a>
        </Link>
      </main>
    </div>
  );
}

/*
export const getServerSideProps = async (context) => {
  let name: any;

  try {
    name = await profileService.getName();
  } catch (err) {
    // TODO: redirect or display alert message
  }

  const data: Award[] = name?.data ?? null;

  return {
    props: {
      data,
    },
  };
};
*/

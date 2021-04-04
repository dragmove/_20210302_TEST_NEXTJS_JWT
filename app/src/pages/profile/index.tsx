import Head from 'next/head';
import styles from '@styles/Home.module.css';
import { Award, Career, ApiResult } from '@shared/interfaces/common';
import { redirect } from '@shared/common/utils';
import { awardsService } from '@client/services/awards';
import { useEffect } from 'react';
import Router from 'next/router';
import nookies, { parseCookies } from 'nookies';
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { AxiosResponse } from 'axios';

export default function Profile(props: unknown) {
  console.log('Profile props :', props);

  const router = useRouter();

  // test jwt access token when call api on client-side
  useEffect(() => {
    loadDatas();
  }, []);

  async function loadDatas(): Promise<void> {
    let awards: ApiResult<Award[]>;

    try {
      const config = {
        isServer: false,
      };
      console.log('config :', config);

      awards = await awardsService.get(config);
      console.log('[Profile] awards :', awards);
    } catch (e) {
      // display alert message, and redirect to login page.
      const res: AxiosResponse = e.response;
      console.log('res :', res);
      console.error('[Profile] Error:', res.data?.message); // TODO: notify

      if (res.data?.message === 'EXPIRED_TOKEN') {
        // case: TokenExpiredError
        // FIXME: 유저가 '자동 로그인' 류의 설정을 해두었다면,
        // accessToken, refreshToken 를 server 측으로 전달하여 accessToken 을 재발급받아서
        // 다시 api 호출하여 데이터를 load 한다.
      } else {
        // case: JsonWebTokenError (invalid signature, ...)

        // Force user to login. Redirect to login page
        router.push('/', '/');
      }
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>/profile</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <p>hello profile</p>
      </main>
    </div>
  );
}

/*
export const getServerSideProps = async (context: NextPageContext) => {
  const cookies = nookies.get(context);
  console.log('// Profile.getServerSideProps. context cookies :', cookies);

  let awards: ApiResult<Award[]>;

  try {
    const config = {
      headers: {
        Authorization: cookies?.jwtAccessToken ? `Bearer ${cookies?.jwtAccessToken}` : '',
      },
      isServer: true,
    };

    awards = await awardsService.get(config);
  } catch (err) {
    // display alert message, and redirect to login page.
    // console.error('[Profile.getServerSideProps Error]', err);

    const res = err?.response;
    console.log('res.status :', res?.status);
    console.log('res.body :', res.body);
    console.log('res.data :', res.data);
    
    if (res?.status === 401) {
      // no token
      redirect('/', context); // Unauthorized
      return;
    }

    if (res?.status === 403) {
      // failed verify jwt token on server
      
    }
  }

  return {
    props: {
      awards: awards?.data ?? null,
    },
  };
};
*/

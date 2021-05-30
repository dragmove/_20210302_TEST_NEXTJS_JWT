import Head from 'next/head';
import { Award, Career, ApiResult } from '@shared/interfaces/common';
import { redirect } from '@shared/common/utils';
import { awardsService } from '@client/services/awards';
import { useEffect } from 'react';
import Router from 'next/router';
import nookies, { parseCookies } from 'nookies';
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { AxiosResponse } from 'axios';
import { useStores } from '@client/stores';

export default function Profile(props: unknown) {
  console.log('Profile props :', props);

  const { envStore, memberStore } = useStores();
  const router = useRouter();

  useEffect(() => {
    console.log('envStore.phase :', envStore.phase);
    console.log('memberStore.id :', memberStore.id);

    loadDatas();
  }, []);

  async function loadDatas(): Promise<void> {
    let awards: ApiResult<Award[]>;

    try {
      const config = {
        isServer: false,
      };
      console.log('config :', config);

      // FIXME: ing.
      // api 호출시에 server 측으로 자동으로 쿠키에 담겨 있던 access token이 전달된다.
      // refresh token은 client측에서 일단 redis-server에 저장해두었다.

      /*
      authorization 과정이 필요한 페이지의 데이터를 받아오기 위해서 awardsService.get 을 호출하였다.
      호출시에 특별한 member id 세팅은 없었다. 
      => 
      서버측에서 access token 이 만료되었다('Access token expired')고 했을 때, 
      client 측에서는 redis 에서 refresh token 을 받아와서 서버측을 통해 access token 을
      다시 받아서 awardsService.get API 를 다시 호출해야 한다.

      호출 직전에 무언가 하고
      호출 직후에 무엇을 해야 한다.
      client 측의 일시적 member id 저장소가 필요한 것이다.
      session storage 를 이용하면 될 것 같다.
      
      class 로 axios 를 감싼 다음에,
      이 class 를 어디서 생성하면서 member id 를 세팅해주면 될 것 같은데...
*/

      awards = await awardsService.get(config);
      console.log('[Profile] awards :', awards);
    } catch (e) {
      // display alert message, and redirect to login page.
      const res: AxiosResponse = e.response;
      console.log('res :', res);
      console.error('[Profile] Error:', res.data?.message); // TODO: notify

      // Force user to login. Redirect to login page
      // router.push('/', '/');
    }
  }

  return (
    <div>
      <Head>
        <title>/profile</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
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

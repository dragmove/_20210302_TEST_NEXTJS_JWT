import Head from 'next/head';
import styles from '@styles/Home.module.css';
import { Award, Career, ApiResult } from '@shared/interfaces/common';
import { redirect } from '@shared/common/utils';
import { awardsService } from '@client/services/awards';
import { useEffect } from 'react';
import Router from 'next/router';
import nookies, { parseCookies } from 'nookies';
import { NextPageContext } from 'next';

export default function Profile(props: unknown) {
  console.log('Profile props :', props);

  /*
  // test jwt access token when call api on client-side
  useEffect(() => {
    loadDatas();
  }, []);

  async function loadDatas(): Promise<void> {
    let awards: ApiResult<Award[]>;

    try {
      const cookies = parseCookies();
      const config = {
        headers: {
          Authorization: cookies?.jwtAccessToken ? `Bearer ${cookies?.jwtAccessToken}` : '',
        },
        isServer: false,
      };

      awards = await awardsService.get(config);
      console.log('awards :', awards);
    } catch (err) {
      // display alert message, and redirect to login page.
    }
  }
  */

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

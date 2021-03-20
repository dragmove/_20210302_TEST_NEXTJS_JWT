import Head from 'next/head';
import Link from 'next/link';
import styles from '@styles/Home.module.css';
import { Award } from '@shared/interfaces/common';
import { profileService } from '@client/services/profile';
import axios, { AxiosResponse } from 'axios';
import nookies from 'nookies';

export default function Home(props: unknown) {
  console.log('Home props :', props);

  return (
    <div className={styles.container}>
      <Head>
        <title>/</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <p>hello index</p>

        <button
          onClick={async (e) => {
            e.preventDefault();

            // TODO: move this to client service
            try {
              // login and get access token
              const loginApiResult = await axios({
                // TODO: Set domain
                url: '/login',
                method: 'post',
                data: {
                  id: 'winter',
                  password: '8888',
                },
              });
              console.log('loginApiResult :', loginApiResult.data);

              const data: { accessToken: string; refreshToken: string } = loginApiResult?.data;

              const accessToken: string = data.accessToken;
              console.log('accessToken :', accessToken);

              // client needs to save access token somewhere.
              // (I just save access token to 60 seconds life cookie)
              nookies.set(null, 'jwtAccessToken', accessToken, {
                // maxAge: 60,
                httpOnly: true,
                secure: true,
              });

              const refreshToken: string = data.refreshToken;
              // TODO: 어디에 이 refreshToken 을 저장해야 할까? => 서버사이드에 저장해야만 한다.
              // refreshToken 자체를 client 에게 반환하지 말고, 서버사이드 측에서 DB 에 refreshToken 을 저장해두고 이 id 의 hash 값을 client 로 반환하는게 어떨까?
            } catch (err) {
              throw err;
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

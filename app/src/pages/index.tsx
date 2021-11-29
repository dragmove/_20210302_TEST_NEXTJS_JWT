import Head from 'next/head';
import Link from 'next/link';
import { Award } from '@shared/interfaces/common';
import { profileService } from '@client/services/profile';
import axios, { AxiosResponse, AxiosError } from 'axios';
import nookies from 'nookies';
import { useStores } from '@client/stores';
import { log } from '@shared/common/utils';
import { login } from '../client/utils/auth';

interface Props {}

export default function Home(props: Props) {
  console.log('Home props :', props);

  const { envStore } = useStores();

  return (
    <div>
      <Head>
        <title>/</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>hello index</p>

        <div>
          <Link href="/login">
            <a
              style={{
                color: '#f00',
              }}
            >
              Login
            </a>
          </Link>
        </div>

        <div>
          <Link href="/profile">
            <a
              style={{
                color: '#f00',
              }}
            >
              Profile
            </a>
          </Link>
        </div>
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

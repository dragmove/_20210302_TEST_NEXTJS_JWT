import Head from 'next/head';
import styles from '@styles/Home.module.css';
import { Award, Career, ApiResult } from '@shared/interfaces/common';
import { awardsService } from '@client/services/awards';
import { careersService } from '@client/services/careers';

export default function Profile(props: unknown) {
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

export const getServerSideProps = async (context) => {
  let awards: ApiResult<Award[]>;
  let careers: ApiResult<Career[]>;

  try {
    awards = await awardsService.get();
    careers = await careersService.get();
  } catch (err) {
    // TODO: redirect or display alert message
  }

  return {
    props: {
      awards: awards?.data ?? null,
      careers: careers?.data ?? null,
    },
  };
};

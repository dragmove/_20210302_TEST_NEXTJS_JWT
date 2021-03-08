import Head from 'next/head';
import styles from '@styles/Home.module.css';
import { Award } from '@shared/interfaces/common';
import { profile } from '@client/services/profile/Profile';

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
      </main>
    </div>
  );
}

export const getServerSideProps = async (context) => {
  let _name: any;

  try {
    _name = await profile.getName();
  } catch (err) {
    // TODO: redirect or display alert message
  }

  const data: Award[] = _name?.data ?? null;

  return {
    props: {
      data,
    },
  };
};

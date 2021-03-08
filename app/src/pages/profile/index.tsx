import Head from 'next/head';
import styles from '@styles/Home.module.css';
import { Award } from '@shared/interfaces/common';
import { awards } from '@client/services/awards/Awards';

export default function Profile(props: unknown) {
  console.log('Profile props :', props);

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
  let _awards: any;

  try {
    _awards = await awards.getAwards();
  } catch (err) {
    // TODO: redirect or display alert message
  }

  const data: Award[] = _awards?.data ?? null;

  return {
    props: {
      data,
    },
  };
};

/* eslint-disable react/no-danger */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable testing-library/no-await-sync-query */
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';

import { GetStaticPaths, GetStaticProps } from 'next';

import Head from 'next/head';
import { ReactElement } from 'react';
import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactElement {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const totalWords = post.data.content.reduce((total, contentItem) => {
    const headingTime = contentItem.heading.split(/\s+/).length;
    const wordsTime = RichText.asText(contentItem.body).split(/\s+/).length;

    return total + headingTime + wordsTime;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  const updateAt = format(new Date(post.first_publication_date), 'd MMM yyyy', {
    locale: ptBR,
  });

  // TODO
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <Header />

      <section className={styles.banner}>
        <img
          src={post.data.banner.url}
          alt={post.data.title}
          className={styles.banner}
        />
      </section>

      <main className={commonStyles.container}>
        <article className={styles.mainPost}>
          <h1>{post.data.title}</h1>

          <section>
            <span>
              <FiCalendar /> {updateAt}
            </span>
            <span>
              <FiUser />
              {post.data.author}
            </span>
            <span>
              <FiClock /> {readTime} min
            </span>
          </section>

          {post.data.content.map(content => (
            <section className={styles.mainText} key={content.heading}>
              <h3>{content.heading}</h3>
              <p
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </section>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  // TODO
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
  };
};

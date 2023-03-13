/* eslint-disable testing-library/no-await-sync-query */
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { ReactElement, useState } from 'react';

import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): ReactElement {
  // TODO
  const [posts, setPosts] = useState<PostPagination>(postsPagination);

  async function fetchPagination(): Promise<PostPagination> {
    const response = await fetch(posts.next_page);

    const pagination = await response.json();

    const newResults = pagination.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.last_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    return {
      next_page: pagination.next_page,
      results: newResults,
    };
  }

  async function handleGetNextPage(): Promise<PostPagination> {
    const { next_page, results } = await fetchPagination();

    const newPosts: PostPagination = { ...posts };

    newPosts.next_page = next_page;
    newPosts.results = [...newPosts.results, ...results];

    setPosts(newPosts);

    return newPosts;
  }

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <Header />

      <main className={commonStyles.container}>
        <section className={styles.posts}>
          {posts.results.map(post => (
            <article key={post.uid}>
              <Link href={`/post/${post.uid}`}>
                <h1>{post.data.title}</h1>
                <h2>{post.data.subtitle}</h2>
              </Link>
              <div>
                <span>
                  <FiCalendar />
                  <time>
                    {format(new Date(post.first_publication_date), 'PP', {
                      locale: ptBR,
                    })}
                  </time>
                </span>
                <span>
                  <FiUser /> {post.data.author}
                </span>
              </div>
            </article>
          ))}

          {posts.next_page && (
            <button
              type="button"
              className={styles.button}
              onClick={handleGetNextPage}
            >
              Carregar mais posts
            </button>
          )}
        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // TODO
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', { pageSize: 1 });

  const posts = postsResponse.results.map<Post>(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
  };
};

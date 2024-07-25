import React, { useEffect, useState } from "react";
import LoadMore from "../components/ui/loadMore";

const PAGE_SIZE = 10;

type PostType = {
  id: number;
  title: string;
  body: string;
};

const getPosts = (offset: number = 0): Promise<PostType[]> =>
  fetch(`https://jsonplaceholder.typicode.com/posts?_start=${offset}&_limit=${PAGE_SIZE}`).then((res) => res.json());

const PostList: React.FC<{ posts?: PostType[] }> = ({ posts }) => {
  return (
    <>
      {posts?.map((post) => (
        <div key={post.id} className="border p-4 mb-4 rounded-md">
          <h2 className="text-xl font-bold">{post.title}</h2>
          <p>{post.body}</p>
        </div>
      ))}
    </>
  );
};

const Home: React.FC = () => {
  const [offset, setOffset] = useState<number>(0);
  const [posts, setPosts] = useState<PostType[]>([]);

  const fetchPosts = async (offset: number) => {
    const response = await getPosts(offset);
    return response;
  };

  const loadMorePosts = async (offset: number) => {
    const newPosts = await fetchPosts(offset);
    setPosts([...posts, ...newPosts]);
    setOffset(offset + PAGE_SIZE);
  };

  useEffect(() => {
    fetchPosts(offset).then((data) => {
      setPosts(data);
      setOffset(offset + PAGE_SIZE);
    });
  }, []);

  return (
    <main className="container mb-8 mt-32 flex min-h-screen flex-col">
      <h1 className="mb-8 text-center text-2xl font-bold text-white md:text-4xl">Infinite Scroll</h1>

      <div className="flex flex-col items-center gap-4">
        <LoadMore loadMoreAction={() => loadMorePosts(offset)} initialOffset={PAGE_SIZE}>
          <PostList posts={posts} />
        </LoadMore>
      </div>
    </main>
  );
};

export default Home;

import React, { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import { getDay } from "../common/date.jsx";
import BlogInteraction from "../components/blog-interaction.component.jsx";
import BlogPostCard from "../components/blog-post.component.jsx";
import BlogContent  from "../components/blog-content.component.jsx";

export const BlogDatastructure = {
  title: "",
  banner: "",
  des: "",
  content: [],
  // tags: [],
  author: { personal_info: {} },
  publishedAt: "",
  activity: {},
};
export const BlogContext = createContext({});
const BlogPage = () => {
  const [ islikedByUser, setLikedByUser ] = useState(false);
  const [loading, setLoading] = useState(true);
  const [similarBlogs, setsimilarBlogs] = useState(null);
  let { blog_id } = useParams();
  const [blog, setBlog] = useState(BlogDatastructure);
  let {
    title,
    content,
    des,
    banner,
    author: {
      personal_info: { fullname, username: author_username, profile_img },
    },
    // tags,
    publishedAt,
  } = blog;
  const fetchBlog = () => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-blog`, { blog_id })
      .then(({ data: { blog } }) => {
        setBlog(blog);
        axios
          .post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {
            tag: blog.tags[0],
            limit: 6,
            eliminate_blog: blog_id,
          })
          .then(({ data }) => {
            setsimilarBlogs(data.blogs);
          });

        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  const resetStates = () => {
    setBlog(BlogDatastructure);
    setsimilarBlogs(null);
    setLoading(true);
  };
  useEffect(() => {
    resetStates();
    fetchBlog();
  }, [blog_id]);

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider value={{ blog, setBlog,islikedByUser, setLikedByUser }}>
          <div className="max-w-[800px] center py-10 max-lg:px-[5vw] ">
            <img src={banner} className="aspect-video" />

            <div className="mt-12">
              <h2>{title}</h2>
              <div
                className="flex max-sm:flex-col
justify-between my-8"
              >
                <div className="flex gap-5 items-start">
                  <img src={profile_img} className="w-12 h-12 rounded-full" />
                  <p className="capitalize">
                    {fullname}
                    <br />
                    <Link to={`/user/${author_username}`} className="underline">
                      @{author_username}
                    </Link>
                  </p>
                </div>
                <p className="Dtext-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                  Published on {getDay(publishedAt)}
                </p>
              </div>
            </div>
            <BlogInteraction />
            <div
              className="my-12 font-gelasio blog-page-content"
            >
              {content[0].blocks.map((block, i) => {
                return (
                  <div
                    key={i}
                    className="my-4 md:my-8"
                  >
                    <BlogContent block={block}/>
                  </div>
                );
              })}
            </div>
            {similarBlogs != null && similarBlogs.length ? (
              <>
                <h2 className="text-2x1 mt-14 mb-10 font-medium">
                  Similar Blogs
                </h2>
                {similarBlogs.map((blog, i) => {
                  let {
                    author: { personal_info },
                  } = blog;
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.8 }}
                    >
                      <BlogPostCard content={blog} author={personal_info} />
                    </AnimationWrapper>
                  );
                })}
              </>
            ) : (
              " "
            )}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;

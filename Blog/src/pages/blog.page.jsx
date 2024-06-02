import React, { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import { getDay } from "../common/date.jsx";
import BlogInteraction from "../components/blog-interaction.component.jsx";
import BlogPostCard from "../components/blog-post.component.jsx";
import BlogContent from "../components/blog-content.component.jsx";
import CommentConatainer, { fetchComments } from "../components/comments.component.jsx";
// import Speech from 'speak-tts';

export const BlogDatastructure = {
  title: "",
  banner: "",
  des: "",
  content: [],
  author: { personal_info: {} },
  publishedAt: "",
  activity: {},
};

export const BlogContext = createContext({});

const BlogPage = () => {
  const [islikedByUser, setLikedByUser] = useState(false);
  const [commentsWrapper, setcommentsWrapper] = useState(true);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);
  const [loading, setLoading] = useState(true);
  const [similarBlogs, setsimilarBlogs] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [speechInstance, setSpeechInstance] = useState(null);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);

  let { blog_id } = useParams();
  const [blog, setBlog] = useState(BlogDatastructure);
  let {
    title,
    content,
    des,
    banner,
    activity,
    author: {
      personal_info: { fullname, username: author_username, profile_img },
    },
    publishedAt,
  } = blog;

  const fetchBlog = () => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-blog`, { blog_id })
      .then(async ({ data: { blog } }) => {
        blog.comments = await fetchComments({
          blog_id: blog._id,
          setparentComcountfun: setTotalParentCommentsLoaded,
        });
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
    setLikedByUser(false);
    setcommentsWrapper(false);
    setTotalParentCommentsLoaded(0);
    setSpeaking(false);
    setCurrentContentIndex(0);
  };

  useEffect(() => {
    resetStates();
    fetchBlog();
  }, [blog_id]);

  useEffect(() => {
    if (speaking) {
      // If speaking is true, read the content
      readBlogContent();
    } else {
      // If speaking is false, cancel the speech
      window.speechSynthesis.cancel();
    }
  }, [speaking, currentContentIndex]);

  const toggleSpeech = () => {
    if (speaking) {
      // If currently speaking, pause speech
      window.speechSynthesis.pause();
    } else {
      // If not speaking, resume or start speech
      if (speechInstance) {
        window.speechSynthesis.resume();
      } else {
        readBlogContent();
      }
    }
    // Toggle the speaking state
    setSpeaking(!speaking);
  };

  const readBlogContent = () => {
    if ('speechSynthesis' in window) {
      const blogContent = getContentToRead();
      const speech = new SpeechSynthesisUtterance(blogContent);

      speech.volume = 1;
      speech.lang = 'en-US';
      speech.rate = 1;
      speech.pitch = 1;

      // Update the speech instance and set event listeners
      setSpeechInstance(speech);
      speech.onend = () => {
        setCurrentContentIndex(currentContentIndex + 1);
      };

      // Speak the blog content
      window.speechSynthesis.speak(speech, currentContentIndex);
    } else {
      console.error('Speech synthesis not supported in this browser');
    }
  };

  const getContentToRead = () => {
    const blogContent = content && content.length > 0
      ? content[0].blocks.map((block) => {
          if (block.type === 'paragraph') {
            return block.data.text;
          } else if (block.type === 'header') {
            return block.data.text;
          }
          return '';
        }).join('\n')
      : "No content available for this blog.";
    return blogContent;
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider
          value={{
            blog,
            setBlog,
            islikedByUser,
            setLikedByUser,
            setcommentsWrapper,
            totalParentCommentsLoaded,
            commentsWrapper,
            setTotalParentCommentsLoaded,
            activity,
          }}
        >
          <CommentConatainer />
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
                  <button className="btn-dark" onClick={toggleSpeech}>
                    {speaking ? "Stop listening" : "Listen Blog"}
                  </button>
                </div>
                <p className="Dtext-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                  Published on {getDay(publishedAt)}
                </p>
              </div>
            </div>
            <BlogInteraction />
            <div className="my-12 font-gelasio blog-page-content">
              {content && content.length > 0 ? (
                content[0].blocks.map((block, i) => {
                  return (
                    <div key={i} className="my-4 md:my-8">
                      <BlogContent block={block} />
                    </div>
                  );
                })
              ) : (
                <p>No content available for this blog.</p>
              )}
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
                      transition={{ duration: 0.8, delay: i * 0.8 }}
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

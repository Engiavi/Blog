import React, { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InpageNavigation from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTab } from "../components/inpage-navigation.component";
import NoDataMEssage from "../components/nodata.component";
import FilterPaginationData from "../common/filter-pagination-data";
import LoadMoreData from "../components/load-more.component";
const HomePage = () => {
  const [blogs, setBlogs] = useState(null);
  const [trendingblogs, setTrendingBlogs] = useState(null);
  const [pageState, setPageState] = useState("home");
  let categories = [
    "test",
    "programming",
    "seo",
    "marketing",
    "hollywood",
    "film making",
    "cooking",
    "social media",
    "cybersecurity",
    "finance",
  ];
  const LoadBycategory = (e) => {
    let category = e.target.innerText.toLowerCase();

    setBlogs(null);

    if (pageState == category) {
      setPageState("home");
      return;
    }

    setPageState(category);
  };

  const fetchLatestBlog = ({page=1}) => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/latest-blogs`,{page})
      .then(async({ data }) => {
        console.log(data.blogs)
        let formateData = await FilterPaginationData({
          state : blogs,
          data: data.blogs,
          page,
          countRoute:"/all-latest-blogs-count"
        })
        console.log(formateData)
        setBlogs(formateData)
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fetchBlogsByCategory = ({page=1}) => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {
        tag: pageState,page})

      .then(async({ data }) => {
        let formateData = await FilterPaginationData({
          state : blogs,
          data: data.blogs,
          page,
          countRoute:"/search-blogs-count",
          data_to_send:{tag:pageState}
        })
        setBlogs(formateData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fetchTrendingBlog = () => {
    axios
      .get(`${import.meta.env.VITE_SERVER_DOMAIN}/trending-blogs`)
      .then(({ data }) => {
        setTrendingBlogs(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    activeTab.current.click();
    if (pageState == "home") {
      fetchLatestBlog({page : 1});
    }
    if (!trendingblogs) {
      fetchTrendingBlog();
    } else {
      fetchBlogsByCategory({page : 1});
    }
  }, [pageState]);

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InpageNavigation
            routes={[pageState, "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {
              blogs == null ? (
                <Loader/>
              ) :  blogs.results.length ? (
                blogs.results.map((blog, i) => {
                  // console.log(blogs.result)
                  return (
                    <AnimationWrapper
                      transition={{ duration: 0.8, delay: i * 0.8 }}
                      key={i}
                    >
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMEssage message="No Blogs published" />
              )}
              <LoadMoreData state={blogs} fetchData={(pageState=="home" ?fetchLatestBlog:fetchBlogsByCategory)}/>
            </>
            
            {trendingblogs == null ? (
              <Loader />
            ) : trendingblogs.length ? (
              trendingblogs.map((blog, i) => {
                return (
                  <AnimationWrapper
                    transition={{ duration: 0.8, delay: i * 0.8 }}
                    key={i}
                  >
                    <MinimalBlogPost blog={blog} index={i} />
                  </AnimationWrapper>
                );
              })
            ) : (
              <NoDataMEssage message="No trending Blogs" />
            )}
          </InpageNavigation>
        </div>

        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden ">
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="font-medium text-xl mb-8">
                Stories form all interests
              </h1>

              <div className="flex gap-3 flex-wrap">
                {categories.map((category, i) => {
                  return (
                    <button
                      onClick={LoadBycategory}
                      className={
                        "tag " +
                        (pageState == category ? "bg-black text-white" : " ")
                      }
                      key={i}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h1 className="font-medium text-xl mb-7">
                Trending <i className="fi fi-rr-arrow-trend-up"></i>
              </h1>
              {trendingblogs == null ? (
                <Loader />
              ) : trendingblogs.length ? (
                trendingblogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 0.8, delay: i * 0.8 }}
                      key={i}
                    >
                      <MinimalBlogPost blog={blog} index={i} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMEssage message="No trending Blogs" />
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;

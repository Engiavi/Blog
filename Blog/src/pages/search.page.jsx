import { useParams } from "react-router-dom";
import InpageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post.component";
import LoadMoreData from "../components/load-more.component";
import NoDataMEssage from "../components/nodata.component";
import { useEffect, useState } from "react";
import axios from "axios";
import FilterPaginationData from "../common/filter-pagination-data";
import UserCard from "../components/usercard.component";
// import {fetchLatestBlog,fetchBlogsByCategory} from "./home.page"
const SearchPage = () => {
  const [blogs, setBlogs] = useState(null);
  const [users, setUsers] = useState(null);
  let { query } = useParams();
  const searchBlogs = ({ page = 1, create_new_arr = false }) => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-blogs`, {
        page,
        query,
      })
      .then(async ({ data }) => {
        console.log(data.blogs);
        let formateData = await FilterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          data_to_send: { query },
          create_new_arr,
          countRoute: "/search-blogs-count",
        });
        console.log(formateData);
        setBlogs(formateData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fetchUser = () => {
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/search-users`, { query })
      .then(({ data: { users } }) => {
        setUsers(users);
      });
  };

  const resetState = () => {
    setBlogs(null);
    setUsers(null);
  };

  useEffect(() => {
    resetState();
    searchBlogs({ page: 1, create_new_arr: true });
    fetchUser();
  }, [query]);

  const UserCardWrapper = () => {
    return (
      <>
        {users == null ? (
          <Loader />
        ) : users.length ? (
          users.map((user, i) => {
            return (
              <AnimationWrapper key={i} transition={{duration:0.8,delay:i*0.08}}>
                <UserCard  user={user}/>
              </AnimationWrapper>
            );
          })
        ) : (
          <NoDataMEssage message="No user found" />
        )}
      </>
    );
  };
  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InpageNavigation
          routes={[`Search Results from "${query}"`, "Accounts Matched"]}
          defaultHidden={["Accounts Matched"]}
        >
          <>
            {blogs == null ? (
              <Loader />
            ) : blogs.results.length ? (
              blogs.results.map((blog, i) => {
                // console.log(blogs.result)
                return (
                  <AnimationWrapper
                    transition={{
                      duration: 1,
                      delay: i * 1,
                    }}
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
            <LoadMoreData state={blogs} fetchData={searchBlogs} />
          </>
          <UserCardWrapper />
        </InpageNavigation>
      </div>

{/*  below one is for larger screen  */}
      <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-1 border-grey pl-8 max-md:hidden">
        <h1 className="font-medium text-xl mb-8">User related to search <i className="fi fi-rr-user mt-1"></i></h1>
        <UserCardWrapper/>
      </div>
    </section>
  );
};

export default SearchPage;

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../App";
import FilterPaginationData from "../common/filter-pagination-data";
import { Toaster } from "react-hot-toast";
import InpageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import NoDataMEssage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import { ManageBlogCard, ManageDraftCard } from "../components/manage-blogcard.component";

//3.19.38
const ManageBlog = () => {
  const [blogs, setBlogs] = useState(null);
  const [drafts, setDraft] = useState(null);
  const [query, setQuery] = useState("");
  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  const getBlogs = ({ page, draft, deleteDocCount = 0 }) => {
    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/user-written-blogs`,
        {
          page,
          draft,
          query,
          deleteDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(async ({ data }) => {
        let formatedData = await FilterPaginationData({
          state: draft ? drafts : blogs,
          data: data.blogs,
          page,
          user: access_token,
          countRoute: "/user-written-blogs-count",
          data_to_send: { draft, query },
        });
        console.log(formatedData);
        if (draft) {
          setDraft(formatedData);
        } else {
          setBlogs(formatedData);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (access_token) {
      if (blogs == null) {
        getBlogs({ page: 1, draft: false });
      }

      if (drafts == null) {
        getBlogs({ page: 1, draft: true });
      }
    }
  }, [access_token, blogs, drafts, query]);

  const handleKeyDown=(e)=>{
    let searchQuery = e.target.value;
    setQuery(searchQuery);
    if(e.keyCode ==13 && searchQuery.length){
       setBlogs(null);
       setDraft(null);
    }
  }
  const handleChange=(e)=>{
    if(e.target.value.length){
      setQuery("");
      setBlogs(null);
      setDraft(null);
    }
  }
  return (
    <>
      <h1 className="max-md:hidden">Manage Blogs</h1>
      <Toaster />
      <div className="relative max-md:mt-5 md:mt-8 mb-10">
        <input
          type="search"
          className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
          placeholder="Search Blogs"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
      </div>

      <InpageNavigation routes={["Published Blogs","Drafts"]}>
        {/* publish section goes from here */}
        {
          blogs  == null ? <Loader/>: 
          blogs.results.length ?
          <>
          {
            blogs.results.map((blog,i)=>{
              return <AnimationWrapper key={i} transition={{delay:i*0.02}}>
                <ManageBlogCard blog={{...blog,index:i,setStateFun:setBlogs}}/>
              </AnimationWrapper>
            })
          }
          </> 
          :<NoDataMEssage message="No published blog"/>
        }
        {/* draft section goes from here */}
          {
          drafts  == null ? <Loader/>: 
          drafts.results.length ?
          <>
          {
            drafts.results.map((blog,i)=>{
              return <AnimationWrapper key={i} transition={{delay:i*0.02}}>
                <ManageDraftCard blog={{...blog,index:i,setStateFun:setDraft}} />
              </AnimationWrapper>
            })
          }
          </>
          :<NoDataMEssage message="No draft blog"/>
        }
      </InpageNavigation>
    </>
  );
};

export default ManageBlog;

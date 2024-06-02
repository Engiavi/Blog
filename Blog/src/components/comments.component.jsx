import React, { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import CommentField from "./comment-field.component";
import axios from "axios";
import NoDataMEssage from "./nodata.component";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./comment-card.component";
export const fetchComments = async ({
  skip = 0,
  blog_id,
  setparentComcountfun,
  comment_array = null,
}) => {
  let res;
  await axios
    .post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-blog-comments`, {
      blog_id,
      skip,
    })
    .then(({ data }) => {
      data.map((comment) => {
        comment.childrenLevel = 0;
      });
      setparentComcountfun((preVal => preVal + data.length));

      if ((comment_array == null)) {
        res = { results: data };
      } else {
        res = { results: [...comment_array, ...data] };
      }
    });
    return res;

};
const CommentConatainer = () => {
  let {
    blog,
    blog: {
      _id,
      title,
      comments:{results:commentsArr},
      activity:{
        total_parent_comments
      }
    },
    commentsWrapper,
    totalParentCommentsLoaded,
    setTotalParentCommentsLoaded,
    setcommentsWrapper,
    setBlog
  } = useContext(BlogContext);
  // console.log(blog)

  const handleMoreComments = async()=>{
    let newComment = await fetchComments(
      {
      skip:totalParentCommentsLoaded,
      blog_id: _id,
      setparentComcountfun:setTotalParentCommentsLoaded,
      comment_array : commentsArr
    })
    setBlog({...blog, comments:newComment })
  }
  return (
    <div
      className={
        "max-sm:w-full fixed " +
        (commentsWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]") +
        " duration-700 max-sm:right-0 sm: top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2x1 p-8 px-16 overflow-y-auto overflow-x-hidden"
      }
    > 
      <div className="relative">
        <h1 className="text-x1 font-medium">Comments</h1>
        <p
          className="text-lg mt-2 w-[70% ] text-dark-grey
line-clamp-1"
        >
          {title}
        </p>
        <button
          onClick={() => setcommentsWrapper((val) => !val)}
          className="absolute top- right-0 flex justify-center
items-center w-12 h-12 rounded-full Ibg-grey"
        >
          <i className="fi fi-br-cross text-2x1 mt-1"></i>
        </button>
      </div>
      <hr className=" border-grey my-8 w-[120 %] -ml-10" />
      <CommentField action="Comment" />

      {
        commentsArr && commentsArr.length ?
        commentsArr.map((com,i)=>{
          return( 
          <AnimationWrapper key={i}>
            <CommentCard index={i} leftval={com.childrenLevel * 4} commentData={com} />
          </AnimationWrapper>);
        })
         : <NoDataMEssage message="No Comments"/>
      }

      {
        total_parent_comments > totalParentCommentsLoaded
        ?
        <button
        onClick={handleMoreComments}
         className="p-2 px-3 bg-black text-white rounded-full flex items-center gap-2">
          Load More
        </button>
        :
        ""
      }
    </div>
  );
};

export default CommentConatainer;

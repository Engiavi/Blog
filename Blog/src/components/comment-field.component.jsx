import { useContext, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";

const CommentField = ({ action, index = undefined, replyingTo,setReplying }) => {
  let {
    activity,
    activity: { total_comments, total_par_comment },
    setBlog,
    blog,
    blog: {
      _id,
      comments,
      comments: { results: commentArr },
      author: { _id: blog_author }
    },
    setTotalParentCommentsLoaded,
    totalParentCommentsLoaded,
    // totalParentCommentsLoaded
  } = useContext(BlogContext);

  const [comment, setComment] = useState("");

  let {
    userAuth: { access_token, username, fullname, profile_img },
  } = useContext(UserContext);

  const handleComment = () => {
    if (!access_token) return toast.error("Login first to leave a comment");

    if (!comment.length)
      return toast.error("Write something to leave a comment");

    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/add-comment`,
        { _id, blog_author, comment,replying_to:replyingTo },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          }, 
        }
      )
      .then(({ data }) => {
        setComment("");
        data.commented_by = {
          personal_info: { username, fullname, profile_img },
        };
        let newcommentArr;

        if(replyingTo ){
          commentArr[index].children.push(data._id);
          data.childrenLevel = commentArr[index].childrenLevel +1;
          data.parentIndex = index;
          commentArr[index].isReplyLoaded = true;
          commentArr.splice(index+1,0,data)
          newcommentArr = commentArr
          setReplying(false);
        }else{
        data.childrenLevel = 0;
        newcommentArr = [data, ...commentArr];
        }
        let parentCommentIncrementval = replyingTo ?0:1;
        setBlog({
          ...blog,
          comments: { ...comments, results: newcommentArr },
          activity: {
            ...activity,
            total_comments: total_comments + 1,
            total_par_comment: parentCommentIncrementval + total_par_comment,
          },
        });
        setTotalParentCommentsLoaded(val => val + parentCommentIncrementval);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a comment..."
        className="input-box pl-5 Oplaceholder: text-dark-grey resize-none h-[150px] overflow-auto"
      ></textarea>
      <button onClick={handleComment} className="btn-dark mt-5 px-10">
        {action}
      </button>
    </>
  );
};

export default CommentField;

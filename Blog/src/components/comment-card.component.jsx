import React, { useContext, useState } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import CommentField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";

const CommentCard = ({ index, leftval, commentData }) => {
  let {
    commented_by: {
      personal_info: { profile_img, fullname, username: com_username },
    },
    commentedAt,
    comment,
    _id,
    children,
  } = commentData;
  // console.log(commentData);
  let {
    blog,
    blog: {
      activity,
      activity:{total_parent_comments},
      comments,
      comments: { results: commentArr },
      author: {
        personal_info: { username: authorName },
      },
    },setTotalParentCommentsLoaded,
    setBlog,
  } = useContext(BlogContext);

  let {
    userAuth: { access_token, username },
  } = useContext(UserContext);

  const [isReplying, setReplying] = useState(false);
  const handleReply = () => {
    if (!access_token) {
      return toast.error("Login first to leave a reply");
    }
    setReplying((preval) => !preval);
  };
  const getParentIndex = () => {
    let startingPoint = index - 1;
    try {
      while (
        commentArr[startingPoint].childrenLevel >= commentData.childrenLevel
      ) {
        startingPoint--;
      }
    } catch {
      startingPoint = undefined;
    }
    return startingPoint;
  };
  const removeCommentCard = (point, isDelete = false) => {
    if (commentArr[point]) {
      while (commentArr[point].childrenLevel > commentData.childrenLevel) {
        commentArr.splice(point, 1);
        if (!commentArr[point]) {
          break;
        }
      }
    }
    if (isDelete) {
      let parentIndex = getParentIndex();
      if (parentIndex != undefined) {
        commentArr[parentIndex].children = commentArr[parentIndex].children.filter((child) => child != _id);
        if(!commentArr[parentIndex].children.length) {
          commentArr[parentIndex].isReplyLoaded = false;
        }
      }
      commentArr.splice(index,1);

    }
    if (commentData.childrenLevel = 0 && isDelete) {
      setTotalParentCommentsLoaded(preVal => preVal-1)
      }


      setBlog({...blog, comments: { results: commentArr}, activity:
        { ... activity, total_parent_comments: total_parent_comments- (commentData.childrenLevel ==0 && isDelete ? 1:0)} })
  };
  const hideReplies = () => {
    commentData.isReplyLoaded = false;
    removeCommentCard(index + 1);
  };
  const LoadReplies = ({ skip = 0 ,currentIndex= index}) => {
    if (commentArr[currentIndex].children.length) {
      hideReplies();
      // /get-replies
      axios
        .post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-replies`, {
          _id:commentArr[currentIndex]._id,
          skip,
        })
        .then(({ data: { replies } }) => {

          commentArr[currentIndex].isReplyLoaded = true;

          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel = commentArr[currentIndex].childrenLevel + 1;
            commentArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);
          }
          setBlog({ ...blog, comments: { ...comments, results: commentArr } });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const handleDelete = (e) => {
    e.target.setAttribute("disabled", true);
    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/delete-comment`,
        { _id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        e.target.removeAttribute("disabled");
        removeCommentCard(index + 1, true).catch((err) => {
          console.log(err);
        });
      });
  };
  const LoadMoreRepliesButton =()=>{
    let parentIndex = getParentIndex();
    let button = <button onClick={()=>LoadReplies({skip:index-parentIndex,currentIndex:parentIndex})} className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"> Load more Replies</button>
    if(commentArr[index+1]){
      if(commentArr[index+1].childrenLevel <commentArr[index].childrenLevel){
        if((index- parentIndex)< commentArr[parentIndex].children.length){

          return button;
        }
      }
    }
    else{
      if(parentIndex){
        if((index- parentIndex)< commentArr[parentIndex].children.length){

          return button;
        }
      }
    }
  }
  return (
    <>
      <Toaster />
      <div className="w-full" style={{ paddingLeft: `${leftval * 10}px` }}>
        <div className="my-5 p-6 rounded-md border border-grey">
          <div className="flex gap-3 items-center mb-8">
            <img
              src={profile_img}
              className="w-6 h-6
    rounded-full"
            />
            <p className="line-clamp-1">
              {fullname} @{com_username}
            </p>
            <p className="min-w-fit">{getDay(commentedAt)}</p>
          </div>
          <p className="font-gelasio text-xl ml-3">{comment}</p>

          <div className="flex gap-5 items-center mt-5">
            {commentData.isReplyLoaded ? (
              <button
                className="text-dark-grey p-2 px-3
            ☐hover: bg-grey/30 rounded-md flex items-center
            gap-2"
                onClick={hideReplies}
              >
                <i className="fi fi-rs-comment-dots"></i>Hide Reply
              </button>
            ) : (
              <button
                className="text-dark-grey p-2 px-3
            ☐hover: bg-grey/30 rounded-md flex items-center
            gap-2"
                onClick={LoadReplies}
              >
                <i className="fi fi-rs-comment-dots"></i> {children.length}{" "}
                Reply
              </button>
            )}
            <button onClick={handleReply} className="underline">
              Reply
            </button>
            {username == com_username || username == authorName ? (
              <button
                className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/60 hover:text-red flex items-center"
                onClick={handleDelete}
              >
                <i className="fi fi-rr-trash pointer-events-none"></i>
              </button>
            ) : (
              ""
            )}
          </div>
          {isReplying ? (
            <div className="mt-8">
              <CommentField
                action="reply"
                index={index}
                replyingTo={_id}
                setReplying={setReplying}
              />
            </div>
          ) : (
            ""
          )}
        </div>
        <LoadMoreRepliesButton/>
      </div>
    </>
  );
};
// 4.15

export default CommentCard;

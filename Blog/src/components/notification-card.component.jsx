import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import Notificationfield from "./notification-comment-field.component";
import { UserContext } from "../App";
import axios from "axios";
 
const NotificationCard = ({ data, index, notificationState }) => {
    if (!data) {
        return <p>No new notification</p>;
      }
    let {
        seen,
        type,
        reply,
        createdAt, 
        comment,
        replied_on_comment,
        user,
        user: {
          personal_info: { profile_img, fullname, username },
        },
        blog = {}, // provide a default value for blog
        _id: notification_id,
      } = data;
      
      let _id, blog_id, title;
  
      if (blog) { // check if blog is not null before destructuring
        ({ _id, blog_id, title } = blog);
      }
    
      let [isReply, setReply] = useState(false);
    
      let { notifications, notifications: { results, totalDocs }, setNotifications } = notificationState;
    
      let {
        userAuth: {
          username: author_username,
          profile_img: author_profile_img,
          access_token,
        },
      } = useContext(UserContext);

  const handleReplyClick = () => {
    setReply((preval) => !preval);
  };
  const handleDeleteClick = (comment_id,type,target) => {

    target.setAttribute("disabled","true");
    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/delete-comment`,{
      _id : comment_id
    },{
      headers:{
        'Authorization' :`Bearer ${access_token}`
      }
    })
    .then(()=>{
      if(type == 'comment'){
        results.splice(index,1)
      }
      else{
        delete results[index].reply;
      }
      target.removeAttribute("disabled");
      setNotifications({...notifications,results,totalDocs:totalDocs-1,deleteDocCount:notifications.deleteDocCount+1})
    })
    .catch(err=>{
      console.log(err.message);
    })
  };

  return (
    <div className={"p-6 border-b border-grey border-l-black " + (!seen?" border-l-2":"")}>
      <div className="flex gap-5 mb-3">
        <img className="w-14 h-14 flex-none rounded-full" src={profile_img} />
        <div className="w-full">
          <h1 className="font-medium text-xl text-dark-grey">
            <span className="lg:inline-block hidden captitalize">
              {fullname}
            </span>
            <Link
              className="mx-1 text-black underline"
              to={`/user/${username}`}
            >
              @{username}
            </Link>
            <span className="font-normal">
              {type == "like"
                ? "liked your blog"
                : type == "comment"
                ? "commented on"
                : "replied on"}
            </span>
          </h1>
          {type == "reply" ? (
            <div className="p-4 mt-4 rounded-md bg-grey">
              <p>{replied_on_comment.comment}</p>
            </div>
          ) : (
            <Link
              className="font-medium text-dark-grey hover:underline line-clamp-1"
              to={`/blog/${blog_id}`}
            >{`"${title}"`}</Link>
          )}
        </div>
      </div>

      {type != "like" ? (
        <p className="ml-14 pl-5 font-gelasio text-xl my-5">
          {comment.comment}
        </p>
      ) : (
        ""
      )}
      <div className="ml-14 pl-5 mt-3 text-dark-grey flex gap-8">
        <p>{getDay(createdAt)}</p>
        {type != "like" ? (
          <>
            {
              !reply ?
              <button
              className="underline hover:text-black"
              onClick={handleReplyClick}
            >
              Reply
            </button>
              :""

            }

            <button
              className="underline hover:text-black"
              onClick={(e)=>handleDeleteClick(comment._id,"comment",e.target)}
            >
              Delete
            </button>
          </>
        ) : (
          ""
        )}
      </div>

      {isReply ? (
        <div className="mt-8">
          <Notificationfield
            _id={_id}
            blog_author={user}
            index={index}
            replyingTo={comment._id}
            setReply={setReply}
            notification_id={notification_id}
            notification_Data={notificationState}
          />
        </div>
      ) : (
        ""
      )}
      {reply ? (
        <div className="ml-20 p-5 bg-grey mt-5 rounded-md">
          <div className="flex gap-3 mb-3">
            <img src={author_profile_img} className="w-8 h-8 rounded-full" />
            <div>
              <h1 className="font-medium text-xl text-dark-grey">
                <Link
                  className="mx-1 text-black underline "
                  to={`/user/${author_username}`}
                >
                  @{author_username}
                </Link>
                <span className="font-normal">replied to </span>
                <Link
                  className="mx-1 text-black underline "
                  to={`/user/${username}`}
                >
                  @{username}
                </Link>
              </h1>
            </div>
          </div>
          <p className="ml-14 font-gelasio text-xl my-2">{reply.comment}</p>
          <button
              className="underline hover:text-black ml-10 mt-2"
              onClick={(e)=>handleDeleteClick(comment._id,"reply",e.target)}
            >Delete
            </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default NotificationCard;

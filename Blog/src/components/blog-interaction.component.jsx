import React from "react";
import { useContext,useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
const BlogInteraction = () => {
  let {
    userAuth: { username,access_token },
  } = useContext(UserContext);
  let {
    
    blog,
    blog: {
      _id,
      title,
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
    setBlog,
    islikedByUser, 
    setLikedByUser,setcommentsWrapper,totalParentCommentsLoaded,commentsWrapper,setTotalParentCommentsLoaded
  } = useContext(BlogContext);

  useEffect(()=>{
    if(access_token){
      axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/isliked-user`, {_id},{
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      .then(({ data:{result} }) =>{
        setLikedByUser(result)
      })
      .catch(err =>{
        console.log(err.message);
      })

    }
  },[])
  const updateHeart =()=>{
    if(access_token){
      setLikedByUser(val =>!val)
      !islikedByUser ? (
        total_likes++
        ) : (
          total_likes--
          );
      setBlog({ ...blog, activity: { ...activity, total_likes } })
      axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/like-blog`, {_id,islikedByUser},{
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })
      .then(({ data }) =>{
        console.log(data);
      })
      .catch(err =>{
        console.log(err.message);
      })

    }
      else{
        toast.error("please login to like this blog")
      }
  }
  return (
    <><Toaster/>
      <hr className="border-grey my-2" />
      <div className="flex gap-6 justify-between">
        <div className="flex gap-3 items-center">
          <button 
          onClick={updateHeart}
          className={"w-10 h-10 rounded-full flex items-center justify-center " +(islikedByUser ? "bg-red/20 text-red ": "bg-grey/90") }>
            <i className={"fi " + (islikedByUser ?"fi-sr-heart":"fi-rr-heart" )}></i>
          </button>
          <p className="text-x1 text-dark-grey">{total_likes}</p>
          <button
          onClick={()=>{setcommentsWrapper(val=>!val)}}
            className="w-10 h-10 rounded-full flex items-center
justify-center bg-grey/80"
          >
            <i className="fi fi-rr-comment-dots"></i>
          </button>
          <p className="text-x1 text-dark-grey">{total_comments}</p>
        </div>
        <div className="flex gap-6 items-center">
          {username == author_username ? (
            <Link
              to={`/editor/${blog_id}`}
              className="underline hover: text-purple"
            >
              Edit
            </Link>
          ) : (
            ""
          )}
          <Link
            to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}
          >
            <i className="fi fi-brands-twitter text-xl hover:text-twitter"></i>
          </Link>
        </div>
      </div>

      <hr className="border-grey my-2" />
    </>
  );
};

export default BlogInteraction;

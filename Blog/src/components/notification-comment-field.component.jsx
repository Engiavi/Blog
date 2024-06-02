import React, { useContext, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { UserContext } from '../App';
import axios from 'axios';

const Notificationfield = ({_id,blog_author,index= undefined,replyingTo,setReply,notification_id,notification_Data}) => {
    let [comment, setComment] = useState("");
    // notification_id
//  console.log(notification_id,"field");
 
    let {_id:user_id} = blog_author;

    let {userAuth:{access_token}} = useContext(UserContext);

    let {notifications, notifications:{results},setNotifications} = notification_Data
   
    const handleComment = () => {
    
        if (!comment.length)
          return toast.error("Write something to leave a comment");
    
        axios.post(
            `${import.meta.env.VITE_SERVER_DOMAIN}/add-comment`,
            { _id, blog_author:user_id, comment,replying_to:replyingTo,notification_id },
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              }, 
            }
          )
          .then(({ data }) => {
          // setReply ? setReply(false):""
          setReply(false);
          results[index].reply = {comment,_id: data._id};
          setNotifications({...notifications,results})
           
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
      placeholder="Leave a Reply..."
      className="input-box pl-5 Oplaceholder: text-dark-grey resize-none h-[150px] overflow-auto"
    ></textarea>
    <button onClick={handleComment} className="btn-dark mt-5 px-10">
      Reply
    </button>
  </>
  )
}

export default Notificationfield;
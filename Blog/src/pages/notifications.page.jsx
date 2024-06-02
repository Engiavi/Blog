import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import {UserContext} from '../App'
import FilterPaginationData from "../common/filter-pagination-data";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMEssage from "../components/nodata.component";
import NotificationCard from "../components/notification-card.component";
import LoadMoreData from "../components/load-more.component";

const NotificationsPage = () => {
    let {userAuth,setUserauth,userAuth:{access_token,new_notification_available}} = useContext(UserContext)
  const [filter, setfilter] = useState("all");
  const [notifications, setNotifications] = useState(null);
  let filters = ["all", "like", "comment", "reply"];

  const fetchNotification = ({ page, deletedDocCount = 0 }) => {
    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/notifications`, {
      page,
      filter,
      deletedDocCount
    },
      {headers:{
            'Authorization' : `Bearer ${access_token}`
        }
    })
    .then(async({ data:{notifications:responseData}})=>{
      if(new_notification_available){
        setUserauth({...userAuth,new_notification_available:false})
      }
       
        let formatedData = await FilterPaginationData({
            state : notifications,
            data: responseData,
            page,
            countRoute:"/all-notifications-count",
            data_to_send : {filter},
            user: access_token
        })
        setNotifications(formatedData);
    })
    .catch(err=>{
        console.log(err);
    })
  }

  useEffect(()=>{
    if(access_token){
    fetchNotification({ page : 1})
}
  },[access_token,filter])

  const handlefilter = (e) => {
    let btn = e.target;
    setfilter(btn.innerHTML)
    setNotifications(null);
  };
  return (
    <div>
      <h1 className="max-md:hidden">Recent Notification</h1>
      <div className="my-8 flex gap-6">
        {filters.map((filterName, i) => {
          return (
            <button
              key={i}
              className={
                "py-2 " + (filter == filterName ? " btn-dark" : " btn-light")
              }
              onClick={handlefilter}
            >
              {filterName}
            </button>
          );
        })}
      </div>
      {
        notifications == null ? <Loader/>:
       <>
       {
          notifications.results.length ?
          notifications.results.map((notification,i)=>{
            return <AnimationWrapper key={i} transition={{delay:i*0.08}}>
              <NotificationCard data={notification} index={i} notificationState={{notifications, setNotifications}}/>
            </AnimationWrapper>
          })
          : <NoDataMEssage message="Nothing available"/>
       }
       <LoadMoreData state={notifications} fetchData={fetchNotification} additionalParam={{deletedDocCount:notifications.deletedDocCount}}/>
       </>
      }
    </div>
  );
};

export default NotificationsPage;

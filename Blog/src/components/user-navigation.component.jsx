import React, { useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";

const UserNavgiationPanel = () => {
  const {
    userAuth: { username },setUserauth
  } = useContext(UserContext);
  const signoutuser = ()=>{
    removeFromSession("user");
    setUserauth({access_token:null});
  }
  return (
    <AnimationWrapper
      className="absolute right-0 z-50"
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white absolute right-0 border border-grey w-60 overflow-hidden duration-200">
        <Link to="/editor" className="flex gap-3 link md:hidden pl-8 py-4">
          <i className="fi fi-rr-file-edit"></i>
          <p>write</p>
        </Link>
        <Link to={`/user/${username}`} className="link pl-8 py-4">
          Profile
        </Link>
        {/* <Link to={"/dashboard/blogs"} className="link pl-8 py-4">
          Dashboard
        </Link> */}
        <Link to={"/settings/edit-profile"} className="link pl-8 py-4">
          Settings
        </Link>
        <span className="absolute border-t border-grey  w-[100]"></span>
        <button className="text-left p-4 hover:bg-grey w-full pl-8 py-4"
        onClick={signoutuser}>
          <h1 className="font-bold text-xl mg-1">Sign Out</h1>
          <p className="text-dark-grey">@{username}</p>
        </button>
      </div>
    </AnimationWrapper>
  );
};

export default UserNavgiationPanel;

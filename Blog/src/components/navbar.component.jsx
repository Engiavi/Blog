// import React from "react";
import { Link, Outlet } from "react-router-dom";
import logo from "../imgs/logo.png";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import UserNavgiationPanel from "./user-navigation.component";

const Navbar = () => {
  const [searchbox, setSearchbox] = useState(false);
  const [userNavPanel,setUserNavPanel] = useState(false);
  const handleusenavpalnel =()=>setUserNavPanel(current => !current);
  const {
    userAuth,
    userAuth: { access_token, profile_img },
  } = useContext(UserContext);

  const handleblur =()=>{
    setTimeout(()=>{

      setUserNavPanel(false);
    },2000)
  }
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={logo} alt="logo" className="w-full" />
        </Link>

        <div
          className={
            "absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " +
            (searchbox ? "show" : "hide")
          }
        >
          <input
            type="text"
            placeholder="search"
            className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pd-6 rounded-full placeholder:text-dark-grey caret-red md:pl-12"
          />
          <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey"></i>
        </div>
        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button
            className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
            onClick={() => setSearchbox((current) => !current)}
          >
            <i className="fi fi-rr-search text-xl"></i>
          </button>

          <Link to="/editor" className="hidden md:flex gap-2 link">
            <i className="fi fi-rr-file-edit text-xl"></i>
            <p>Write </p>
          </Link>
          {
          access_token ? (
           <>
           <Link to="/dashboard/notification">
            <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10">
             <i className="fi fi-rr-bell text-2xl block mt-1"></i>
            </button>
           </Link>

           <div className="relative"  onClick={handleusenavpalnel} onBlur={handleblur} >
            <button className="w-12 h-12 mt-1">
              <img src={profile_img}className="w-full hh-full object-cover rounded-full "></img>
            </button>
           { userNavPanel ?  <UserNavgiationPanel/>:""

           } 
           </div>
           </>
          ) : (
            <>
              <Link className="btn-dark py-2" to="/signin">
                Sign In
              </Link>
              <Link className="btn-light py-2 hidden md:block" to="/signup">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default Navbar;

// import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import logo from "../imgs/full-logo.png";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import UserNavgiationPanel from "./user-navigation.component";
import axios from "axios";

const Navbar = () => {
  const [searchbox, setSearchbox] = useState(false);
  const [userNavPanel,setUserNavPanel] = useState(false);
  const handleusenavpalnel =()=>setUserNavPanel(current => !current);
  let navigate = useNavigate();
  const {
    userAuth,
    userAuth: { access_token, profile_img, new_notification_available },
    setUserauth
  } = useContext(UserContext);

  useEffect(()=>{
    if(access_token){
      axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/new-notification`,{
        headers : {
          'Authorization' : `Bearer ${access_token}`
        }
      })
      .then(({data})=>{
        setUserauth({...userAuth,...data})
      })
      .catch(err=>{
        console.log(err)
      })
    }
  },[access_token])
  const handleblur =()=>{
    setTimeout(()=>{

      setUserNavPanel(false);
    },2000)
  }

  const handleSearch =(e)=>{
    let query = e.target.value;
    if(e.keyCode == 13 && query.length){
      navigate(`/search/${query}`);
    }
  }
  return (
    <>
      <nav className="navbar z-50">
        <Link to="/" className="flex-none w-50">
          <img src={logo} alt="logo" className="h-10  block mx-auto select-none" />
        </Link>
        {/* <p>
          {new_notification_available}
          </p> */}
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
            onKeyDown={handleSearch}
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
             {
              new_notification_available ? 
              <span className="bg-red w-3 h-3 rounded-full absolute z-10 top-2 right-2"></span> 
              :
              ""
             }
            
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

import { useContext, useEffect, useRef, useState } from "react";
import { NavLink, Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../App";

const SideNavbar = () => {
  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  let page = location.pathname.split('/')[2];
  let [pageState, setPage] = useState(page.replace('-'," "));
  let [showSideNav, setShowSideNav] =useState(false);
  let activeTabLine = useRef();
  let SideBarIcon = useRef();
  let pageStateTab = useRef();

  
  const changepageState =(e)=>
  {
    let {offsetWidth,offsetLeft} = e.target;
    activeTabLine.current.style.width = offsetWidth +"px";
    activeTabLine.current.style.left = offsetLeft +"px";

    if(e.target == SideBarIcon.current){
      setShowSideNav(true)

    }
    else{
      setShowSideNav(false)
    }
  }
  useEffect(()=>{
    setShowSideNav(false);
    if (pageStateTab.current) {
      pageStateTab.current.click();
    }
  },[pageState])

  return (
    access_token == null ?  <Navigate to="/signin" />
  : 
    <>
      <section className="relative flex gap-10 py-0 m-0 max-md:flex-col">
        <div className="sticky top-[80px] z-30">
          <div className="md:hidden bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto">
            <button ref={SideBarIcon} className="py-5 capitalize" onClick={changepageState} >
              <i className="fi fi-rr-bars-staggered pointer-events-none"></i>
            </button>

            <button ref={pageStateTab} className="p-5 capitalize" onClick={changepageState} >{pageState}</button>

            <hr ref={activeTabLine} className="absolute bottom-0 duration-500" />
          </div>

          <div className={"min-w-[200px] h-[calc(100vh-80px-60px)] md:h-cover  md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white max-md:w-[calc(100%+80px)] max-md:px-16 max-md:-ml-7 duration-500 " + (!showSideNav ? "max-md:opacity-0 max-md:pointer-events-none": "opacity-100 pointer-events-auto")}>
            <h1 className="text-xl text-dark-grey mb-3">Dashboard</h1>
            <hr className="border-grey -ml-6 mb-8 mr-6" />
            <NavLink
              to="/"
              onClick={(e) => setPage(e.target.innerText)}
              className="sidebar-link"
            >
              <i className="fi fi-rr-document"></i>
              Blogs
            </NavLink>
            {/* <NavLink
              to="/dashboard/notification"
              onClick={(e) => setPage(e.target.innerText)}
              className="sidebar-link"
            >
              <i className="fi fi-rr-bell"></i>
              Notification
            </NavLink> */}
            <NavLink
              to="/editor"
              onClick={(e) => setPage(e.target.innerText)}
              className="sidebar-link"
            >
              <i className="fi fi-rr-file-edit"></i>
              Write
            </NavLink>
            <h1 className="text-xl text-dark-grey mt-20 mb-3">Settings</h1>
            <hr className="border-grey -ml-6 mb-8 mr-6" />

            <NavLink
              to="/settings/edit-profile"
              onClick={(e) => setPage(e.target.innerText)}
              className="sidebar-link"
            >
              <i className="fi fi-rr-user"></i>
              Edit Profile
            </NavLink>
            <NavLink
              to="/settings/change-password"
              onClick={(e) => setPage(e.target.innerText)}
              className="sidebar-link"
            >
              <i className="fi fi-rr-lock"></i>
              Change Password
            </NavLink>
          </div>
        </div>
        <div className="max-md:-mt-8 mt-5 w-full">
          <Outlet />
        </div>
      </section>
    </>
  
  )
};
export default SideNavbar;

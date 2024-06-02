import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import UserProfile from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import SideNavbar from "./components/sidenavbar.component";
import ChangePassword from "./pages/change-password.page";
import EditProfile from "./pages/edit-profile.page";
import NotificationsPage from "./pages/notifications.page";
import ManageBlog from "./pages/manage-blogs.page";
export const UserContext = createContext({});

const App = () => {
  const [userAuth, setUserauth] = useState({});

  useEffect(() => {
    let userInSession = lookInSession("user");
    userInSession
      ? setUserauth(JSON.parse(userInSession))
      : setUserauth({ access_token: null }); 
  }, []);
  
  return (
    <UserContext.Provider value={{ userAuth, setUserauth }}>
      <Routes>
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:blog_id" element={<Editor />} />
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<SideNavbar/>}>

            <Route path="blogs" element={<ManageBlog/>}/>
            <Route path="notification" element={<NotificationsPage/>}/>
          </Route>
          <Route path="settings" element={<SideNavbar/>}>
            <Route path="edit-profile" element={<EditProfile/>}/>
            <Route path="change-password" element={<ChangePassword/>}/>
          </Route>
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
          <Route path="search/:query" element={<SearchPage />} />
          <Route path="user/:id" element={<UserProfile/>}/>
          <Route path="blog/:blog_id" element={<BlogPage/>}/>
          <Route path="*" element={<PageNotFound/>}/>
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;

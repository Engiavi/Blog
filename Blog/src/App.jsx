import { Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useEffect,useState } from "react";
import { lookInSession } from "./common/session";

export const UserContext = createContext({});

const App = () => {
  const [userAuth,setUserauth] = useState({});

  useEffect(()=>{
    let userInSession = lookInSession('user');
    userInSession ? setUserauth(JSON.parse(userInSession)) : setUserauth({access_token:null})
  },[])
  return (
    <UserContext.Provider value={{userAuth,setUserauth}}>
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;

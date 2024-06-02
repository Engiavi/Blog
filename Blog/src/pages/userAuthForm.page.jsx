import React, { useContext, useRef } from "react";
import InputBox from "../components/input.component";
import googleicon from "../imgs/google.png";
import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import { authWithGoogle } from "../common/firebase";
<<<<<<< HEAD

=======
 
>>>>>>> master
const UserAuthForm = ({ type }) => {
  // const authForm = useRef();
  let {
    userAuth: { access_token },
    setUserauth,
  } = useContext(UserContext);
  // console.log(access_token)
  const userAuthTHroughServer = (serverRoute, formData) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        storeInSession("user", JSON.stringify(data));
        setUserauth(data);
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };

  const handleauthgoogle = (e) => {
    e.preventDefault();
    authWithGoogle() 
      .then(user =>{
        let serverRoute ="/google-auth";
        let formData ={
          access_token: user.accessToken
        } 

        userAuthTHroughServer(serverRoute,formData)
      }) 
      .catch((err) => {
        toast.error("Trobleshoot in login through google");
        console.log(err);
      });
  };

  const handlesubmit = (e) => {
    e.preventDefault();
    let serverRoute = type == "sign-in" ? "/signin" : "/signup";

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    //formdata
    let form = new FormData(formElement);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { fullname, email, password } = formData;

    if (fullname) {
      if (fullname.length < 3)
        return toast.error("Fullname must be at least 3 letters long");
    }

    if (!email.length) return toast.error("Enter Emailid");
    if (!emailRegex.test(email)) return toast.error("Invalid EmailId");
    if (!passwordRegex.test(password))
      return toast.error(
        "Password should be 6 to 20 characters long with a numeric ,1 lowecase and 1 uppercase letters"
      );

    userAuthTHroughServer(serverRoute, formData);
  };
  return access_token ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper keyvalue={type}>
      <section className="h-cover flex items-center justify-center">
        <Toaster />
        <form id="formElement" className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type == "sign-in" ? "welcome back" : "join us today"}
          </h1>
          {type != "sign-in" ? (
            <InputBox
              name="fullname"
              type="text"
              placeholder="Full Name"
              icon="fi-rr-user"
            />
          ) : (
            ""
          )}
          <InputBox
            name="email"
            type="email"
            placeholder="Email"
            icon="fi-rr-at"
          />
          <InputBox
            name="password"
            type="password"
            placeholder="Password"
            icon="fi-rr-key"
          />
          <button
            className="btn-dark center mt-14"
            type="submit"
            onClick={handlesubmit}
          >
            {type.replace("-", " ")}
          </button>

          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-bold font-bold">
            <hr className="w-1/2 boder-black" />
            <p>or</p>
            <hr className="w-1/2 boder-black" />
          </div>
          <button
            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
            type="submit"
            onClick={handleauthgoogle}
          >
            <img src={googleicon} alt="google-logo" className="w-5" />
            continue with google
          </button>

          {type == "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't have an account ?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Join us today
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already have an account
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in here.
              </Link>
            </p>
          )}
        </form>
      </section>
    </AnimationWrapper>
  );
};

export default UserAuthForm;

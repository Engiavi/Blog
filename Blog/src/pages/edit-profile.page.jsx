import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import toast, { Toaster } from "react-hot-toast";
import Loader from "../components/loader.component";
import InputBox from "../components/input.component";
import UploadImage from "../common/aws";
import { storeInSession } from "../common/session";

const EditProfile = () => {
  let {
    userAuth,
    userAuth: { access_token },
    setUserauth,
  } = useContext(UserContext);
  let bioLimit = 150;
  const [profile, setProfile] = useState(profileDataStructure);
  const [UpdateProfileimg, setUpdateProfileimg] = useState(null);
  const [loading, setLoading] = useState(true);
  let {
    personal_info: { fullname, username: p_username, profile_img, email, bio },
    social_links,
  } = profile;
  let profileRef = useRef();
  let EditProfileForm = useRef();
  const [CharactersLeft, setCharactersLeft] = useState(bioLimit);
  const handleCharacterchange = (e) => {
    setCharactersLeft(bioLimit - e.target.value.length);
  };

  useEffect(() => {
    if (access_token) {
      axios
        .post(`${import.meta.env.VITE_SERVER_DOMAIN}/get-profile`, {
          username: userAuth.username,
        })
        .then(({ data }) => {
          setProfile(data);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [access_token]);

  const handleChangeprofile = (e) => {
    let img = e.target.files[0];
    profileRef.current.src = URL.createObjectURL(img);
    setUpdateProfileimg(img);
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (UpdateProfileimg) {
      let loadingTost = toast.loading("uploading...");
      e.target.setAttribute("disabled", true);
      UploadImage(UpdateProfileimg)
        .then((url) => {
          if (url) {
            axios
              .post(
                `${import.meta.env.VITE_SERVER_DOMAIN}/update-profile-img`,
                { url: url },
                {
                  headers: {
                    Authorization: `Bearer ${access_token}`,
                  },
                }
              )
              .then(({ data }) => {
                let newUserAuth = {
                  ...userAuth,
                  profile_img: data.profile_img,
                };
                storeInSession("user", JSON.stringify(newUserAuth));
                setUserauth(newUserAuth);
                setUpdateProfileimg(null);
                toast.dismiss(loadingTost);
                e.target.removeAttribute("disabled");
                toast.success("uploaded 👍");
              })
              .catch(({ response }) => {
                toast.dismiss(loadingTost);
                e.target.removeAttribute("disabled");
                toast.error(response.data.error);
              });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    let form = new FormData(EditProfileForm.current);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }
    let {
      username,
      bio,
      youtube,
      facebook,
      twitter,
      github,
      instagram,
      website,
    } = formData;
    if (username.length < 3) {
      return toast.error("Username should be greater than 3 letters long");
    }
    if (bio.length > bioLimit) {
      return toast.error(`Bio should not be more than ${bioLimit}`,"n");
    }

    let loadingTost = toast.loading("updating...");
    e.target.setAttribute("disabled", true);
    axios
      .post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/update-edit-profile`,
        {
          username,
          bio,
          social_links: {
            youtube,
            instagram,
            facebook,
            twitter,
            github,
            website,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        if (userAuth.username != data.username) {
          let newuserAuth = { ...userAuth, username: data.username };
          storeInSession("user", JSON.stringify(newuserAuth));
          setUserauth(newuserAuth);
        }
        toast.dismiss(loadingTost);
        e.target.removeAttribute("disabled");
        toast.success("Profile Updated");
      })
      .catch(({ response }) => {
        toast.dismiss(loadingTost);
        e.target.removeAttribute("disabled");
        toast.error(response.data.error);
      });
  };
  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form ref={EditProfileForm}>
          <Toaster />
          <h1 className="max-md:hidden">Edit Profile</h1>
          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
            <div className="max-lg:center mb-5">
              <label
                htmlFor="uploading"
                id="profileImagelabel"
                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden"
              >
                <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/50 opacity-0 hover:opacity-100 cursor-pointer">
                  Upload Image
                </div>
                <img ref={profileRef} src={profile_img} />
              </label>
              <input
                type="file"
                id="uploading"
                accept=".png, .jpg, .jpeg"
                hidden
                onChange={handleChangeprofile}
              />

              <button
                className="btn-light mt-5 max-lg:center lg:w-full px-10"
                onClick={handleUpload}
              >
                Upload
              </button>
            </div>
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <div>
                  <InputBox
                    name="fullname"
                    type="text"
                    value={fullname}
                    placeholder="Fullname"
                    disable={true}
                    icon="fi-rr-user"
                  />
                </div>
                <div>
                  <InputBox
                    name="email"
                    type="text"
                    value={email}
                    placeholder="Email"
                    disable={true}
                    icon="fi-rr-envelope"
                  />
                </div>
              </div>
              <InputBox
                name="username"
                type="text"
                value={p_username}
                placeholder="Username"
                icon="fi-rr-at"
              />

              <p className="text-dark-grey -mt-3">
                Username will use to search user and will be visible to all
                users
              </p>
              <textarea
                name="bio"
                maxLength={bioLimit}
                defaultValue={bio}
                className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                placeholder="Bio"
                onChange={handleCharacterchange}
              ></textarea>
              <p className="mt-1 text-dar-grey">
                {CharactersLeft} characters left
              </p>
              <p className="my-6 text-dark-grey">
                Add your social handles below
              </p>
              <div className="md:grid md:grid-cols-2 gap-x-6">
                {Object.keys(social_links).map((key, i) => {
                  let link = social_links[key];

                  return (
                    <InputBox
                      key={i}
                      name={key}
                      type="text"
                      value={link}
                      placeholder="https://"
                      icon={
                        "fi " +
                        (key != "website" ? "fi-brands-" + key : "fi-rr-globe")
                      }
                    />
                  );
                })}
              </div>
              <button
                className="btn-dark w-auto px-10"
                type="submit"
                onClick={handleSubmit}
              >
                {" "}
                update{" "}
              </button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditProfile;

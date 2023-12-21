import React, { useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import Tag from "./tags.component";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";

const PublishForm = () => {
  let charaterlimit = 200;
  let tagLimit = 10;
  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  let navigate = useNavigate();
  const handlekeydown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  };

  let {
    blog,
    setEditorstate,
    blog: { banner, title, tags, des, content },
    setBlog,
  } = useContext(EditorContext);
  const handleClose = () => {
    setEditorstate("editor");
  };
  const hadletitilechange = (e) => {
    let input = e.target;
    setBlog({ ...blog, title: input.value });
  };
  const handledeschange = (e) => {
    let input = e.target;
    setBlog({ ...blog, des: input.value });
  };

  const handleKeyDown = (e) => {
    if (e.keyCode == 13 || e.keyCode == 188) {
      e.preventDefault();
      let tag = e.target.value;
      if (tags.length < tagLimit) {
        if (!tags.includes(tag) && tag.length) {
          setBlog({ ...blog, tags: [...tags, tag] });
        }
      } else {
        toast.error(`You can add max ${tagLimit} tag`);
      }
      e.target.value = "";
    }
  };

  const Publishbutton = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }
    if (!title.length) {
      return toast.error("write blog title before publishing");
    }
    if (!des.length || des.length > charaterlimit) {
      return toast.error(
        `write a description about your blog with  ${charaterlimit} characters to publish`
      );
    }
    if (!tags.length) {
      return toast.error("Enter atleast 1 tag to help us rank your blog");
    }

    let loadingToast = toast.loading("Publishing...");

    e.target.classList.add("disable");

    let blogObj = {
      title,
      des,
      banner,
      content,
      tags,
      draft: false,
    };
    axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}/create-blog`, blogObj, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(() => {
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);
        toast.success("Published 👍");
        setTimeout(() => {
          navigate("/");
        }, 5000);
      })
      .catch(({ response }) => {
        console.log(access_token);
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);
        return toast.error(response.data.error);
      });
  };
  return (
    <AnimationWrapper>
      {/* <h1>hello from publish</h1> */}
      <br />
      <section className="w-screen min-h-dcreen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
        <Toaster />
        <button
          className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
          onClick={handleClose}
        >
          <i className="fi fi-br-cross"></i>
        </button>

        <div className="max-w-[550px] center">
          <p className="text-dark-grey mb-1">Preview</p>
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
            <img src={banner} />
          </div>
          <h1 className="text-4xl font-medium mt-2 leading-tight line-camp-2">
            {title}
          </h1>
          <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">
            {des}
          </p>
        </div>

        <div className="border-grey lg:border-1 lg:pl-8">
          <p className="text-dark-grey mb-2 mt-9"> Blog Title </p>
          <input
            type="text"
            placeholder="Blog title"
            defaultValue={title}
            className="input-box pl-4"
            onChange={hadletitilechange}
          />

          <p className="text-dark-grey mb-2 mt-9">
            {" "}
            Short description about your blog{" "}
          </p>
          <textarea
            maxLength={charaterlimit}
            defaultValue={des}
            className="h-40 resize-none leading-7 input-box pl-4"
            onChange={handledeschange}
            onKeyDown={handlekeydown}
          ></textarea>
          <p className="mt-1 text-dark-grey text-sm text-right">
            {charaterlimit - des.length} characters left
          </p>

          <p className="text-dark-grey mb-2 mt-9">
            Topics-(Helps is searching and ranking your blog post)
          </p>

          <div className="relative input-box pl-2 py-2 pb-4">
            <input
              type="text"
              placeholder="Topic"
              className="sticky input-box top-0 left-0 pl-4 mb-3 focus:bg-white"
              onKeyDown={handleKeyDown}
            />
            {tags.map((tag, i) => {
              return <Tag tag={tag} tagIndex={i} key={i} />;
            })}
          </div>
          <p className="mt-1 mb-4 text-dark-grey text-sm text-right">
            {tagLimit - tags.length}
          </p>
          <button className="btn-dark px-8" onClick={Publishbutton}>
            Publish
          </button>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;

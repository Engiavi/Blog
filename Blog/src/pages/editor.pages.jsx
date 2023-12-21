import React, { createContext, useContext, useState } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: [],
  author: { personal_info: {} },
};

export const EditorContext = createContext({});

const Editor = () => {
  const [blog, setBlog] = useState(blogStructure);
  const [editorstate, setEditorstate] = useState("editor");
  const [textEditor, setTextEditor] = useState({isReady:false});

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  return (
    <EditorContext.Provider value ={{blog,setBlog,editorstate,setEditorstate,textEditor,setTextEditor}}>
      {access_token === null ? (
        <Navigate to="/signin" />
      ) : editorstate == "editor" ? (
        <BlogEditor />
      ) : (
        <PublishForm />
      )}
    </EditorContext.Provider>
  );
};

export default Editor;

import React, { useEffect, useRef, useState } from "react";

export let activeTabLineRef;
export let activeTab;
const InpageNavigation = ({children, routes,defaultHidden=[], defaultActive = 0 }) => {
   activeTabLineRef = useRef();
   activeTab = useRef();
  let [inPageNav, setInpageNave] = useState(defaultActive);
  const changePageState = (btn, i) => {
    let { offsetWidth, offsetLeft } = btn;

    activeTabLineRef.current.style.width = offsetWidth + "px";
    activeTabLineRef.current.style.left = offsetLeft + "px";
    setInpageNave(i);
  };
  useEffect(() => {
    changePageState(activeTab.current, defaultActive);
  }, []);
  return (
    <>
      <div className="relative mb-8 bg-white border-grey flex flex-nowrap overflow-x-auto">
        {routes.map((route, i) => {
          return (
            <button
              ref={i == defaultActive ? activeTab : null}
              key={i}
              className={
                "p-4 px-5 capitalize " +
                (inPageNav == i ? "text-black " : "text-dark-grey ")
                +(defaultHidden.includes(route) ? "md:hidden" :" ")
              }
              onClick={(e) => {
                changePageState(e.target, i);
              }}
            >
              {route}
            </button>
          );
        })}
        <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300" />
      </div>
     {Array.isArray(children)? children[inPageNav]:children}
    </>
  );
};

export default InpageNavigation;

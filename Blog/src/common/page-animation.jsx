import React from "react";
import { AnimatePresence, motion } from "framer-motion";
const AnimationWrapper = ({
  children,
  initial = { opacity: 0 },
  animate = { opacity: 1 },
  transition = { duration: 0.8 },
  keyvalue,
  className,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={initial}
        animate={animate}
        transition={transition}
        key={keyvalue}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimationWrapper;

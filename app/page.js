"use client";
import React from "react";
import { useState } from "react";
import FaceDitection from "./components/FaceDitection";

const Home = () => {
  const [isClicked, setIsClicked] = useState(false);

  return (
    <div>
      {!isClicked ? (
        <div className="flex flex-col items-center justify-center mt-10">
          <h2 className="text-2xl mb-1">
            {" "}
            Are You Ready to Experience the Spatial Audio?{" "}
          </h2>
          <h4 className="text-xl mb-7 text-slate-500">
            Google Chrome and Headphones/Buds are recommended for the best
            experience.{" "}
          </h4>
          <button
            className=" bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl"
            onClick={() => setIsClicked(!isClicked)}
          >
            {" "}
            Start Now
          </button>{" "}
        </div>
      ) : null}
      {isClicked ? <FaceDitection /> : null}
    </div>
  );
};

export default Home;

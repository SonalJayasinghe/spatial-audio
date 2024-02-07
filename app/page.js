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
          <button
            className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
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

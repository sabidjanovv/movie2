import React from "react";
import Pagination from "@mui/material/Pagination";

import Movies from "../../components/movies/Movies";
const Search = () => {
  return (
    <div id="search" className="text-white min-h-screen ">
      <div className=" container">
        <h2 className="text-2xl text-red-500 py-4">Movies</h2>
        <h2 className="text-xl  py-4">Kinolarni nomi bo'yicha qidirish</h2>
        <form action="#">
          <input type="text" className=""  />
            
        </form>
      </div>
    </div>
  );
};

export default Search;

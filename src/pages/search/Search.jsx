import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { CiSearch } from "react-icons/ci";
import { RiDeleteBack2Line } from "react-icons/ri";
import { ReactTyped } from "react-typed";
import { request } from "../../api";
import Movies from "../../components/movies/Movies";
import { useSearchParams } from "react-router-dom";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const queryClient = useQueryClient();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["movie", searchValue],
    queryFn: () =>
      request
        .get("/search/movie", {
          params: {
            query: searchValue,
          },
        })
        .then((res) => res.data),
    enabled: !!searchValue, // Ensure the query only runs if searchValue is not empty
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      queryClient.invalidateQueries({ queryKey: ["movie", searchValue] });
      setSearchParams({ q: searchValue });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    setSearchParams({});
    queryClient.removeQueries({ queryKey: ["movie"] }); // Clear previous data
  };

  return (
    <div className="container min-h-[58vh]">
      <form
        onSubmit={handleSearch}
        className="border rounded-lg max-w-[800px] mx-auto h-10 flex border-red-500"
      >
        <button
          type="submit"
          className="rounded-l-lg  w-10 grid place-items-center text-slate-200 bg-[#111111]"
        >
          <CiSearch />
        </button>
        <ReactTyped
          strings={["Avengers", "Venom", "Avatar", "Spiderman"]}
          typeSpeed={40}
          backSpeed={50}
          attr="placeholder"
          loop
          className="flex-1"
        >
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={
              searchValue.length
                ? "h-full  text-white outline-none w-full indent-3 bg-[#111111]"
                : "h-full rounded-r-lg text-white outline-none w-full indent-3 bg-[#111111]"
            }
            type="text"
            placeholder="Search for movies..."
          />
        </ReactTyped>

        {searchValue.length > 0 && (
          <button
            type="button"
            onClick={clearSearch}
            className=" rounded-r-lg  w-10 grid place-items-center text-slate-200 bg-[#111111]"
          >
            <RiDeleteBack2Line className="" />
          </button>
        )}
      </form>

      <div>
        {isLoading && <p className="text-center py-6">Loading movies...</p>}
        {isError && (
          <p className="text-center py-6 text-red-500">
            Error fetching movies. Please try again.
          </p>
        )}
        {!isLoading && !isError && !data?.total_results && searchValue && (
          <p className="text-center py-6">Movies not found</p>
        )}
      </div>

      {data?.total_results > 0 && <Movies data={data?.results} />}
    </div>
  );
};

export default Search;

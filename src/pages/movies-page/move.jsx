import React, { useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import { useQuery } from "@tanstack/react-query";
import { request } from "../../api";
import Movies from "../../components/movies/Movies";
import Loading from "../../components/loading/Loading";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import translate from "translate";
const MyMovies = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(+searchParams.get("page") || 1);
  const [selectedGenre, setSelectedGenre] = useState(
    searchParams.get("genres")?.split("-").map(Number) || []
  );

  const { t } = useTranslation();
  translate.engine = "google";

  const handleChange = (event, value) => {
    setPage(value);
    let params = new URLSearchParams(searchParams);
    params.set("page", value.toString());
    setSearchParams(params);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["discover/movie", page, selectedGenre],
    queryFn: () =>
      request
        .get("/discover/movie", {
          params: {
            page: page,
            without_genres: "18,10749,99",
            with_genres: selectedGenre.join(","),
          },
        })
        .then((res) => res.data),
  });

  useEffect(() => {
    if (error) {
      toast.error("Film not found !");
      navigate("/");
    }
  }, [error, navigate]);

  const { data: genres } = useQuery({
    queryKey: ["/genre/movie/list"],
    queryFn: () =>
      request.get("/genre/movie/list").then((res) => res.data.genres),
  });

  if (error) {
    return alert("This film not found");
  }
  const handleGenreChange = (id) => {
    const updatedGenres = selectedGenre.includes(id)
      ? selectedGenre.filter((selectId) => selectId !== id)
      : [...selectedGenre, id];

    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    params.set("genres", updatedGenres.join("-"));
    setSearchParams(params);
    setSelectedGenre(updatedGenres);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="text-center text-2xl min-h-screen flex justify-center items-center text-red-600 ">
        {" "}
        <Loading />
      </div>
    );
  }

  const TranslateGenre = ({ genre }) => {
    const [translated, setTranslated] = useState(genre);

    useEffect(() => {
      const langCode = localStorage.getItem("lang_code") || "en";
      translate(genre, langCode).then((res) => setTranslated(res));
    }, [genre]);

    return <span>{translated}</span>;
  };

  return (
    <div id="search" className="text-white min-h-screen ">
      <div className="container mx-auto px-4">
        <h2 className="text-red-500 text-3xl text-center font-bold py-4">
          <i>{t("genres.pagenation_title")}</i>
        </h2>

        <div className="mb-6">
          <h3 className="dark:text-white text-lg font-medium mb-2 text-black">
            {t("genres.genre_title")}:
          </h3>
          <div className="genre-scrollbar flex gap-4 overflow-x-auto py-2">
            {genres?.length > 0 ? (
              [
                ...genres.filter((genre) => selectedGenre.includes(genre.id)),
                ...genres.filter((genre) => !selectedGenre.includes(genre.id)),
              ].map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreChange(genre.id)}
                  className={`py-2 px-4 rounded-md border border-red-500 transition-all duration-300 whitespace-nowrap ${
                    selectedGenre.includes(genre.id)
                      ? "dark:bg-green-500 dark:text-white bg-blue-500 border-none"
                      : "dark:bg-slate-800 dark:text-gray-300 text-black dark:hover:bg-red-500 hover:bg-red-500 hover:text-white"
                  }`}
                >
                  {<TranslateGenre genre={genre?.name} />}
                </button>
              ))
            ) : (
              <div className="text-gray-400 text-center">
                {t("genres.no_genres_available")}
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          {data?.results?.length > 0 ? (
            <Movies data={data?.results} bg={"bg-gray-800"} />
          ) : (
            <div className="text-center text-lg font-semibold text-gray-300">
              Ushbu janr bo‘yicha film topilmadi.
            </div>
          )}
        </div>

        <div className="flex justify-center py-4">
          <Pagination
            page={page}
            onChange={handleChange}
            size="large"
            count={data?.total_pages <= 500 ? data?.total_pages : 500}
            variant="outlined"
            shape="circular"
            color="primary"
            className="text-white"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#fff",
                backgroundColor: "#000",
                border: "1px solid #ff4040",
                "&:hover": {
                  backgroundColor: "#ff4040",
                  color: "#00bfff",
                },
                "&:focus": {
                  outline: "2px solid #ff7373",
                },
              },
              "& .Mui-selected": {
                backgroundColor: "#ff4040",
                color: "#fff",
                border: "1px solid #ff7373",
                "&:hover": {
                  backgroundColor: "#ff7373",
                },
              },
              "& .MuiPaginationItem-ellipsis": {
                color: "#ff7373",
              },
              "& .MuiPagination-ul": {
                gap: "8px",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MyMovies;

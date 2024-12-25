import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { IoIosStar } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { savedMovies } from "../../redux/slices/Saved";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const MovieItem = ({
  title,
  poster_path,
  vote_average,
  id,
  bg,
  data,
  original_language,
}) => {
  const navigate = useNavigate();
  const movies = useSelector((state) => state.saved.value);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleSave = (product) => {
    const isSaved = movies.some((movie) => movie.id === product.id);
    if (isSaved) {
      const updatedMovies = movies.filter((movie) => movie.id !== product.id);
      dispatch(savedMovies(updatedMovies));
    } else {
      const updatedMovies = [...movies, product];
      dispatch(savedMovies(updatedMovies));
    }
  };

  return (
    <div
      className={`rounded-lg relative overflow-hidden shadow-lg p-4 border border-red-500 flex flex-col items-center ${
        bg ? "dark:bg-black" : ""
      } hover:shadow-2xl transition-shadow duration-300`}
    >
      <button
        onClick={() => handleSave(data)}
        className="absolute top-7 right-7 text-2xl font-bold z-10"
      >
        {movies.some((movie) => movie.id === data.id) ? (
          <div className="w-11 h-11 bg-gray-900 border-red-500 border-[1px] rounded-full grid place-items-center">
            <FaBookmark className="text-red-500" />
          </div>
        ) : (
          <div className="w-11 h-11 bg-gray-900 border-red-500 border-[1px] rounded-full grid place-items-center">
            <FaRegBookmark className="text-red-500" />
          </div>
        )}
      </button>

      <img
        onClick={() => navigate(`/product/${id}`)}
        src={`${import.meta.env.VITE_IMAGE_URL}${poster_path}`}
        alt={title}
        className="w-full h-[400px] object-cover rounded-md mb-4 cursor-pointer transition-transform hover:scale-105"
      />

      <h2
        title={title}
        className={`font-medium text-[20px] text-red-500 text-center mb-2 line-clamp-1 ${
          bg && "dark:text-white"
        }`}
      >
        {title}
      </h2>

      <div className="flex flex-col items-center gap-2 text-white text-sm font-medium">
        <div className="flex items-center gap-2">
          <IoIosStar className="text-yellow-500 text-xl" />
          <span>{vote_average !== undefined ? vote_average : t("N/A")}</span>
        </div>
        <p className="text-sm text-gray-300 mt-1">
          {t("Language")}:{" "}
          {original_language ? original_language.toUpperCase() : t("Unknown")}
        </p>
      </div>
    </div>
  );
};

export default memo(MovieItem);

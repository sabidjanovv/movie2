import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { request } from "@/api";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../components/loading/Loading";
import translate from "translate";

import imdb from "../../assets/images/image.png";
import kinopoisk from "../../assets/images/kinopoisk.png";
import toast, { Toaster } from "react-hot-toast";
import Movies from "../../components/movies/Movies";

const Detail = () => {
  const [translatedCountries, setTranslatedCountries] = useState([]);
  const [translatedGenres, setTranslatedGenres] = useState([]);
  const [translatedJobs, setTranslatedJobs] = useState([]);
  const [translatedCasts, setTranslatedCasts] = useState([]);
  const [desc, setDisc] = useState("");

  translate.engine = "google";
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const { data, isLoading, error } = useQuery({
    queryKey: [`movie/${id}`],
    queryFn: () =>
      request
        .get(`movie/${id}`, { params: { without_genre: "18,99" } })
        .then((res) => res.data),
  });

  useEffect(() => {
    if (error) {
      toast.error("Film not found !");
      navigate("/");
    }
  }, [error, navigate]);
  const { data: images, isLoading: isImageLoading } = useQuery({
    queryKey: [`movie/${id}/images`],
    queryFn: () => request.get(`movie/${id}/images`).then((res) => res.data),
  });

  const { data: similar, isLoading: isSimilarLoading } = useQuery({
    queryKey: [`movie/${id}/similar`],
    queryFn: () => request.get(`movie/${id}/similar`).then((res) => res.data),
  });

  const { data: credits } = useQuery({
    queryKey: [`movie/${id}/credits`],
    queryFn: () => request.get(`movie/${id}/credits`).then((res) => res.data),
  });

  useEffect(() => {
    const translateAllData = async () => {
      try {
        if (data?.production_countries) {
          const translatedCountries = await Promise.all(
            data.production_countries.map((country) =>
              translate(country.name, "ru")
            )
          );
          setTranslatedCountries(translatedCountries);
        }

        if (data?.genres) {
          const translatedGenres = await Promise.all(
            data.genres.map((genre) => translate(genre.name, "ru"))
          );
          setTranslatedGenres(translatedGenres);
        }

        if (credits?.crew) {
          const translatedCrew = await Promise.all(
            credits.crew
              .filter((member) => member.job === "Director")
              .map((member) => translate(member.name, "ru"))
          );
          setTranslatedJobs(translatedCrew);
        }

        if (credits?.cast) {
          const translatedCasts = await Promise.all(
            credits.cast.slice(0, 5).map(async (member) => ({
              name: await translate(member.name, "ru"),
              character: await translate(member.character, "ru"),
            }))
          );
          setTranslatedCasts(translatedCasts);
        }
      } catch (error) {
        console.error("Tarjima jarayonida xatolik yuz berdi:", error);
      }
    };

    translateAllData();
  }, [data, credits]);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}ч ${remainingMinutes}м / ${minutes} минут`;
  };

  if (
    isLoading ||
    isImageLoading ||
    isSimilarLoading ||
    !translatedCountries.length
  ) {
    return (
      <div className="text-center text-2xl min-h-screen flex justify-center items-center text-red-600 ">
        {" "}
        <Loading />
      </div>
    );
  }

  const overviewS = async () => {
    const description = await translate(data?.overview, "ru");
    setDisc(description);
  };

  overviewS();

  return (
    <>
      <div className="min-h-screen dark:bg-black dark:text-white text-black">
        <div
          className="relative w-full h-[700px] bg-cover bg-center max-[850px]:h-[500px] max-[600px]:h-[400px] "
          style={{
            backgroundImage: `url(${
              import.meta.env.VITE_IMAGE_URL + data.backdrop_path
            })`,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-4xl font-bold max-[500px]:text-2xl">
                {data.title}
              </h1>
              <p className="text-gray-300 mt-2">
                Release Date: {data.release_date}
              </p>
              <p className="text-yellow-400 mt-2">
                Rating: {data.vote_average} / 10
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 flex flex-col justify-center items-center ">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="dark:text-gray-300 mb-8">{data.overview}</p>

          {images && images.backdrops.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Images</h2>
              <div className="flex flex-wrap gap-4 max-[500px]:grid grid-cols-1">
                {images.backdrops.slice(0, 10).map((image, index) => (
                  <img
                    key={index}
                    src={import.meta.env.VITE_IMAGE_URL + image.file_path}
                    alt="Movie Scene"
                    className="w-56 h-32 object-cover rounded-lg max-[500px]:w-full max-[500px]:h-full"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="detail-list w-[380px] mt-12">
            <div className="first-buttons grid grid-cols-2 max-[450px]:grid-cols-1 max-[450px]:px-4 max-[450px]:gap-2">
              <button className="bg-[#111111] text-white py-4 px-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-all">
                Билеты
              </button>
              <button className="bg-[#1D1D1D] text-primary py-4 px-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-all">
                О Фильме
              </button>
            </div>

            <div className="second-buttons grid grid-cols-2 gap-4 mt-12 max-[450px]:grid-cols-1 max-[450px]:px-4 max-[450px]:gap-2">
              <button className="flex items-center justify-around border text-white border-[#111111] px-4  rounded-xl text-xl font-[900]">
                {((data?.vote_average / 100) * 90).toFixed(1)}
                <img className="w-20 h-16" src={imdb} alt="" />
              </button>
              <button className="flex items-center text-white justify-around border border-[#111111] px-4  rounded-xl text-xl font-[900]">
                {data?.vote_average?.toFixed(1)}
                <img className="w-20 h-16" src={kinopoisk} alt="" />
              </button>
            </div>
            <div className="Detali border-b pb-8 border-[#2D2D2D] max-[450px]:px-2">
              <h3 className="mt-12 text-white text-xl text-center">Детали</h3>
              <div className="flex flex-wrap justify-between mt-6 max-[450px]:grid max-[450px]:grid-cols-1 max-[450px]:gap-2">
                <p className="text-sm max-[450px]:text-center">
                  Продолжительность
                </p>
                <p className="text-sm max-[450px]:text-center">
                  {formatTime(data?.runtime)}
                </p>
              </div>
              <div className="flex flex-wrap justify-between mt-4 max-[450px]:grid max-[450px]:grid-cols-1 max-[450px]:gap-2">
                <p className="text-sm max-[450px]:text-center">Премьера</p>
                <p className="text-sm max-[450px]:text-center">
                  {new Date(data?.release_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap justify-between mt-4 max-[450px]:grid max-[450px]:grid-cols-1 max-[450px]:gap-2">
                <p className="text-sm max-[450px]:text-center">Производство</p>
                <p className="text-sm max-[450px]:text-center">
                  {translatedCountries.join(", ")}
                </p>
              </div>
              <div className="flex flex-wrap justify-between mt-4 max-[450px]:grid max-[450px]:grid-cols-1 max-[450px]:gap-2">
                <p className="text-sm max-[450px]:text-center">Жанр</p>
                <p className="text-sm max-[450px]:text-center">
                  {translatedGenres.slice(0, 2).join(", ")}
                </p>
              </div>
              <div className="flex flex-wrap justify-between mt-4 max-[450px]:grid max-[450px]:grid-cols-1 max-[450px]:gap-2">
                <p className="text-sm max-[450px]:text-center">Режиссер</p>
                <p className="text-sm max-[450px]:text-center">
                  {translatedJobs.join(", ") || "Майк Митчелл, Стефани Стайн"}
                </p>
              </div>
            </div>

            <div className="Roli border-b pb-8 border-[#2D2D2D] max-[450px]:px-2">
              <h3 className="mt-12 text-white text-xl text-center">В ролях</h3>
              {translatedCasts.map((member, index) => (
                <div
                  key={index}
                  className="flex flex-wrap justify-between mt-6 max-[450px]:grid max-[450px]:grid-cols-1 max-[450px]:gap-2"
                >
                  <p className="text-sm max-[450px]:text-center">
                    {member.name}
                  </p>
                  <p className="text-sm max-[450px]:text-center">
                    {member.character}
                  </p>
                </div>
              ))}
            </div>

            <div className="Roli pb-6 max-[450px]:px-2">
              <h3 className="mt-12 text-white text-xl text-center">Сюжет</h3>
              <p className="mt-6 text-base max-w-[95%] mx-auto">{desc}</p>
            </div>

            <div className="mt-6 mb-10 bg-primary w-full px-4 py-3 rounded-lg text-white text-sm max-[450px]:w-[90%] mx-auto text-center ">
              <button className="text-center mx-auto ">Купить билет</button>
            </div>
          </div>
        </div>

        {similar && similar.results.length > 0 && (
          <div className=" container">
            <h2 className="text-2xl font-bold mb-4">Similar Movies</h2>
            <Movies data={similar?.results?.slice(0, 10)} bg={"bg-black"} />
          </div>
        )}
      </div>
    </>
  );
};

export default Detail;

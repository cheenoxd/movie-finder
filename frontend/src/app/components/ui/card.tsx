import React from "react";

export interface Movie {
    title: string;
    overview: string;
    posterUrl: string;
    releaseDate: string;
    genre: string;
  }
  
  interface MovieCardProps {
    movie: Movie;
  }


export default function Card({ movie }: MovieCardProps) {
  return (
    <div className="max-w-75 bg-white shadow-md rounded-lg overflow-hidden">
      
      <img
        src={movie.posterUrl}
        alt={movie.title}
        className="w-full h-60 object-cover"
      />
      {/* Movie Details */}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{movie.title}</h2>
        <p className="text-gray-600 text-sm mb-4">{movie.overview}</p>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs">{movie.releaseDate}</span>
          <span className="">{movie.genre}</span>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import type { AppProps } from 'next/app';
import Navbar from '../app/components/layout/Navbar';
import MovieCard from '@/app/components/ui/movie-card';
import '../../globals.css'
import Card from '@/app/components/ui/card';


const movies = [
  {
    id: 1,
    posterUrl: "https://image.tmdb.org/t/p/w500/mwzDApMZAGeYCEVjhegKvCzDX0W.jpg",
    title: "Cleaner",
    overview: "When a group of radical activists take over an energy company's gala...",
    releaseDate: "2025-02-19",
    genre: ["test","test2"],
  },
  {
    id: 2,
    posterUrl: "https://image.tmdb.org/t/p/w500/anotherMoviePoster.jpg",
    title: "Another Movie",
    overview: "An overview of another movie...",
    releaseDate: "2024-11-21",
    genre: ["test","test2"],
  },
 
];
function MyApp({ Component, pageProps }: AppProps) {
  return (
    
    <div className="flex flex-wrap gap-4 p-6">
      <Navbar></Navbar>
    {movies.map((movie) => (
      <Card key={movie.id} movie={movies} />
    ))}
  </div>
  );
}

export default MyApp;
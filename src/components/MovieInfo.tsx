import React from 'react';
import { Location } from '../types';
import './MovieInfo.css';

interface MovieDetails {
  Title: string;
  Year: string;
  Director: string;
  Actors: string;
  Genre: string;
  Plot: string;
  Poster: string;
  Country: string;
}

interface MovieInfoProps {
  movie: Location;
  movieDetails: MovieDetails;
}

const MovieInfo: React.FC<MovieInfoProps> = ({ movie, movieDetails }) => {
  return (
    <div className="movie-info">
      {movieDetails.Poster && movieDetails.Poster !== "N/A" ? (
        <img 
          src={movieDetails.Poster} 
          alt={movieDetails.Title} 
          className="movie-poster"
        />
      ) : (
        <div className="no-poster">Sin póster disponible</div>
      )}
      
      <h2 className="movie-title">{movieDetails.Title}</h2>
      
      <div className="movie-details">
        <p>Año: {movieDetails.Year}</p>
        {movieDetails.Director && movieDetails.Director !== "N/A" && (
          <p>Director: {movieDetails.Director}</p>
        )}
        {movieDetails.Actors && movieDetails.Actors !== "N/A" && (
          <p>Actores: {movieDetails.Actors}</p>
        )}
        {movieDetails.Genre && movieDetails.Genre !== "N/A" && (
          <p>Género: {movieDetails.Genre}</p>
        )}
        {movieDetails.Plot && movieDetails.Plot !== "N/A" && (
          <p className="movie-plot">Sinopsis: {movieDetails.Plot}</p>
        )}
        {movieDetails.Country && movieDetails.Country !== "N/A" && (
          <p>País de origen: {movieDetails.Country}</p>
        )}
      </div>
    </div>
  );
};

export default MovieInfo;

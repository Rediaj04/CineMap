import { API_CONFIG } from '../config/api';
import { Location } from '../types';

export const getAllMovieLocations = async (): Promise<Location[]> => {
  try {
    const response = await fetch(`${API_CONFIG.TMDB.BASE_URL}/movie/popular?api_key=${API_CONFIG.TMDB.API_KEY}`);
    const data = await response.json();
    return data.results.map((movie: any) => ({
      id: movie.id,
      name: movie.title,
      position: [Math.random() * 180 - 90, Math.random() * 360 - 180],
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : new Date().getFullYear(),
      description: movie.overview || '',
      posterUrl: movie.poster_path ? `${API_CONFIG.TMDB.IMAGE_BASE_URL}/w500${movie.poster_path}` : undefined,
      productionCountry: movie.production_countries?.[0]?.name || undefined,
      director: undefined,
      cast: undefined
    }));
  } catch (error) {
    console.error("Error al obtener todas las ubicaciones:", error);
    throw error;
  }
};

export const searchMovies = async (query: string): Promise<Location[]> => {
  try {
    const response = await fetch(
      `${API_CONFIG.TMDB.BASE_URL}/search/movie?api_key=${API_CONFIG.TMDB.API_KEY}&query=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    return data.results.map((movie: any) => ({
      id: movie.id,
      name: movie.title,
      position: [Math.random() * 180 - 90, Math.random() * 360 - 180],
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : new Date().getFullYear(),
      description: movie.overview || '',
      posterUrl: movie.poster_path ? `${API_CONFIG.TMDB.IMAGE_BASE_URL}/w500${movie.poster_path}` : undefined,
      productionCountry: movie.production_countries?.[0]?.name || undefined,
      director: undefined,
      cast: undefined
    }));
  } catch (error) {
    console.error("Error al buscar películas:", error);
    throw error;
  }
};

export const getMovieLocations = async (movieId: number): Promise<Location[]> => {
  try {
    const response = await fetch(
      `${API_CONFIG.TMDB.BASE_URL}/movie/${movieId}?api_key=${API_CONFIG.TMDB.API_KEY}`
    );
    const movie = await response.json();
    return [{
      id: movie.id,
      name: movie.title,
      position: [Math.random() * 180 - 90, Math.random() * 360 - 180],
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : new Date().getFullYear(),
      description: movie.overview || '',
      posterUrl: movie.poster_path ? `${API_CONFIG.TMDB.IMAGE_BASE_URL}/w500${movie.poster_path}` : undefined,
      productionCountry: movie.production_countries?.[0]?.name || undefined,
      director: undefined,
      cast: undefined
    }];
  } catch (error) {
    console.error("Error al obtener ubicaciones de la película:", error);
    throw error;
  }
};

export const getRandomMovie = async (): Promise<Location> => {
  try {
    const randomPage = Math.floor(Math.random() * 500) + 1;
    const response = await fetch(
      `${API_CONFIG.TMDB.BASE_URL}/movie/popular?api_key=${API_CONFIG.TMDB.API_KEY}&page=${randomPage}`
    );
    const data = await response.json();
    
    const randomIndex = Math.floor(Math.random() * data.results.length);
    const movie = data.results[randomIndex];
    
    return {
      id: movie.id,
      name: movie.title,
      position: [Math.random() * 180 - 90, Math.random() * 360 - 180],
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : new Date().getFullYear(),
      description: movie.overview || '',
      posterUrl: movie.poster_path ? `${API_CONFIG.TMDB.IMAGE_BASE_URL}/w500${movie.poster_path}` : undefined,
      productionCountry: movie.production_countries?.[0]?.name || undefined,
      director: undefined,
      cast: undefined
    };
  } catch (error) {
    console.error("Error al obtener película aleatoria:", error);
    throw error;
  }
}; 
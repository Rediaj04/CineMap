import axios from 'axios';
import { Location } from '../types';

// Configuración de APIs
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const OMDB_API_KEY = process.env.REACT_APP_OMDB_API_KEY;
const OMDB_BASE_URL = "https://www.omdbapi.com";

// Función para buscar películas en TMDB
export const searchMovies = async (query: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query,
        language: 'es-ES',
        page: 1
      }
    });
    return response.data.results;
  } catch (error) {
    console.error("Error al buscar películas:", error);
    throw new Error("No se pudieron cargar los resultados de búsqueda");
  }
};

// Función para obtener detalles de una película de OMDB
export const getMovieDetails = async (title: string): Promise<any> => {
  try {
    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        t: title,
        plot: 'full'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener detalles de la película:", error);
    return null;
  }
};

// Función para obtener ubicaciones de una película
export const getMovieLocations = async (movieId: number): Promise<Location[]> => {
  try {
    // Obtener detalles de la película de TMDB
    const movieResponse = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'es-ES'
      }
    });
    
    const movieData = movieResponse.data;
    const locations: Location[] = [];
    
    // Obtener la URL del póster
    const posterPath = movieData.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` 
      : undefined;

    // Obtener detalles adicionales de OMDB
    const omdbDetails = await getMovieDetails(movieData.title);
    
    // Si tenemos país de producción, usarlo como ubicación
    if (movieData.production_countries?.length > 0) {
      const country = movieData.production_countries[0];
      
      // Usar Nominatim (OpenStreetMap) para geocodificar
      const geocodeResponse = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: country.name,
            format: 'json',
            limit: 1
          },
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (geocodeResponse.data?.length > 0) {
        const location = geocodeResponse.data[0];
        locations.push({
          id: movieId,
          name: movieData.title,
          position: [parseFloat(location.lat), parseFloat(location.lon)],
          year: new Date(movieData.release_date).getFullYear(),
          description: `Filmada en ${country.name}`,
          posterUrl: posterPath
        });
      }
    }

    // Si no hay país de producción, usar el país de origen de OMDB
    if (locations.length === 0 && omdbDetails?.Country) {
      const geocodeResponse = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: omdbDetails.Country,
            format: 'json',
            limit: 1
          },
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (geocodeResponse.data?.length > 0) {
        const location = geocodeResponse.data[0];
        locations.push({
          id: movieId,
          name: movieData.title,
          position: [parseFloat(location.lat), parseFloat(location.lon)],
          year: parseInt(omdbDetails.Year),
          description: `País de origen: ${omdbDetails.Country}`,
          posterUrl: posterPath
        });
      }
    }

    return locations;
  } catch (error) {
    console.error("Error al obtener ubicaciones de la película:", error);
    throw new Error("No se pudieron cargar las ubicaciones de la película");
  }
};

// Función para obtener todas las ubicaciones de películas populares
export const getAllMovieLocations = async (): Promise<Location[]> => {
  try {
    // Obtener películas populares
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'es-ES',
        page: 1
      }
    });

    const popularMovies = response.data.results.slice(0, 10);
    const allLocations: Location[] = [];

    // Obtener ubicaciones para cada película
    for (const movie of popularMovies) {
      try {
        const movieLocations = await getMovieLocations(movie.id);
        allLocations.push(...movieLocations);
      } catch (error) {
        console.error(`Error al obtener ubicaciones para ${movie.title}:`, error);
        continue;
      }
    }

    return allLocations;
  } catch (error) {
    console.error("Error al obtener todas las ubicaciones:", error);
    throw new Error("No se pudieron cargar las ubicaciones de películas");
  }
}; 
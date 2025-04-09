import axios from 'axios';
import { Location } from '../types';
import { API_CONFIG } from '../config/api';

// Caché simple para las llamadas a la API
const cache = new Map<string, any>();

// Función para buscar películas en TMDB
export const searchMovies = async (query: string): Promise<any[]> => {
  const cacheKey = `search:${query}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const response = await axios.get(`${API_CONFIG.TMDB.BASE_URL}/search/movie`, {
      params: {
        api_key: API_CONFIG.TMDB.API_KEY,
        query: query,
        language: API_CONFIG.TMDB.DEFAULT_LANGUAGE,
        page: 1
      }
    });
    
    const results = response.data.results;
    cache.set(cacheKey, results);
    return results;
  } catch (error) {
    console.error("Error al buscar películas:", error);
    throw new Error("No se pudieron cargar los resultados de búsqueda");
  }
};

// Función para obtener detalles de una película
export const getMovieDetails = async (movieId: number): Promise<any> => {
  const cacheKey = `movie:${movieId}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    // Obtener detalles principales de TMDB
    const [tmdbResponse, creditsResponse] = await Promise.all([
      axios.get(`${API_CONFIG.TMDB.BASE_URL}/movie/${movieId}`, {
        params: {
          api_key: API_CONFIG.TMDB.API_KEY,
          language: API_CONFIG.TMDB.DEFAULT_LANGUAGE,
          append_to_response: 'release_dates'
        }
      }),
      axios.get(`${API_CONFIG.TMDB.BASE_URL}/movie/${movieId}/credits`, {
        params: {
          api_key: API_CONFIG.TMDB.API_KEY
        }
      })
    ]);

    const movieData = {
      ...tmdbResponse.data,
      credits: creditsResponse.data
    };

    cache.set(cacheKey, movieData);
    return movieData;
  } catch (error) {
    console.error("Error al obtener detalles de la película:", error);
    throw new Error("No se pudieron cargar los detalles de la película");
  }
};

// Función para obtener ubicaciones de una película
export const getMovieLocations = async (movieId: number): Promise<Location[]> => {
  try {
    const movieData = await getMovieDetails(movieId);
    const locations: Location[] = [];

    // Obtener la URL del póster
    const posterPath = movieData.poster_path 
      ? `${API_CONFIG.TMDB.IMAGE_BASE_URL}/w500${movieData.poster_path}` 
      : undefined;

    // Procesar países de producción
    if (movieData.production_countries?.length > 0) {
      for (const country of movieData.production_countries) {
        const geocodeResponse = await axios.get(API_CONFIG.GEOCODING.BASE_URL, {
          params: {
            q: country.name,
            format: 'json',
            limit: API_CONFIG.GEOCODING.DEFAULT_LIMIT
          },
          headers: {
            'Accept': 'application/json'
          }
        });

        if (geocodeResponse.data?.length > 0) {
          const location = geocodeResponse.data[0];
          locations.push({
            id: movieId,
            name: movieData.title,
            position: [parseFloat(location.lat), parseFloat(location.lon)],
            year: new Date(movieData.release_date).getFullYear(),
            description: `Filmada en ${country.name}`,
            posterUrl: posterPath,
            productionCountry: country.name,
            director: movieData.credits?.crew?.find((person: any) => person.job === 'Director')?.name,
            cast: movieData.credits?.cast?.slice(0, 3).map((actor: any) => actor.name)
          });
        }
      }
    }

    return locations;
  } catch (error) {
    console.error("Error al obtener ubicaciones de la película:", error);
    throw new Error("No se pudieron cargar las ubicaciones de la película");
  }
};

// Función para obtener todas las ubicaciones de películas
export const getAllMovieLocations = async (): Promise<Location[]> => {
  try {
    // Obtener películas populares de TMDB
    const response = await axios.get(`${API_CONFIG.TMDB.BASE_URL}/movie/popular`, {
      params: {
        api_key: API_CONFIG.TMDB.API_KEY,
        language: API_CONFIG.TMDB.DEFAULT_LANGUAGE,
        page: 1
      }
    });

    const popularMovies = response.data.results;
    const allLocations: Location[] = [];

    // Obtener ubicaciones para cada película
    for (const movie of popularMovies) {
      try {
        const locations = await getMovieLocations(movie.id);
        allLocations.push(...locations);
      } catch (error) {
        console.error(`Error al obtener ubicaciones para la película ${movie.title}:`, error);
      }
    }

    return allLocations;
  } catch (error) {
    console.error("Error al obtener todas las ubicaciones:", error);
    throw new Error("No se pudieron cargar las ubicaciones de películas");
  }
}; 
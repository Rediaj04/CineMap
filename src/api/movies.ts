import { API_CONFIG } from '../config/api';
import { Location } from '../types';

export const getAllMovieLocations = async (): Promise<Location[]> => {
  try {
    const response = await fetch(`${API_CONFIG.TMDB.BASE_URL}/movie/popular?api_key=${API_CONFIG.TMDB.API_KEY}`);
    const data = await response.json();
    
    const locations: Location[] = [];
    for (const movie of data.results) {
      try {
        // Obtener detalles adicionales de OMDB
        const omdbResponse = await fetch(
          `${API_CONFIG.OMDB.BASE_URL}/?apikey=${API_CONFIG.OMDB.API_KEY}&t=${encodeURIComponent(movie.title)}&y=${movie.release_date.substring(0,4)}`
        );
        const omdbData = await omdbResponse.json();

        let position: [number, number] = [0, 0];
        let description = movie.overview || '';
        
        if (omdbData.Country) {
          const geocodeResponse = await fetch(
            `${API_CONFIG.GEOCODING.BASE_URL}?q=${encodeURIComponent(omdbData.Country)}&format=json&limit=1`
          );
          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData && geocodeData.length > 0) {
            position = [parseFloat(geocodeData[0].lat), parseFloat(geocodeData[0].lon)];
            description = `Filmada en ${omdbData.Country}\n${description}`;
          }
        } else if (movie.production_countries && movie.production_countries.length > 0) {
          const country = movie.production_countries[0].name;
          const geocodeResponse = await fetch(
            `${API_CONFIG.GEOCODING.BASE_URL}?q=${encodeURIComponent(country)}&format=json&limit=1`
          );
          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData && geocodeData.length > 0) {
            position = [parseFloat(geocodeData[0].lat), parseFloat(geocodeData[0].lon)];
            description = `Filmada en ${country}\n${description}`;
          }
        }

        locations.push({
          id: movie.id,
          name: movie.title,
          position: position,
          year: movie.release_date ? new Date(movie.release_date).getFullYear() : new Date().getFullYear(),
          description: description,
          posterUrl: movie.poster_path ? `${API_CONFIG.TMDB.IMAGE_BASE_URL}/w500${movie.poster_path}` : undefined,
          productionCountry: movie.production_countries?.[0]?.name || undefined,
          director: undefined,
          cast: undefined
        });
      } catch (error) {
        console.error(`Error al obtener detalles de la película ${movie.title}:`, error);
      }
    }
    return locations;
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
    
    const locations: Location[] = [];
    for (const movie of data.results) {
      try {
        // Obtener detalles adicionales de OMDB
        const omdbResponse = await fetch(
          `${API_CONFIG.OMDB.BASE_URL}/?apikey=${API_CONFIG.OMDB.API_KEY}&t=${encodeURIComponent(movie.title)}&y=${movie.release_date?.substring(0,4)}`
        );
        const omdbData = await omdbResponse.json();

        let position: [number, number] = [0, 0];
        let description = movie.overview || '';
        
        if (omdbData.Country) {
          const geocodeResponse = await fetch(
            `${API_CONFIG.GEOCODING.BASE_URL}?q=${encodeURIComponent(omdbData.Country)}&format=json&limit=1`
          );
          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData && geocodeData.length > 0) {
            position = [parseFloat(geocodeData[0].lat), parseFloat(geocodeData[0].lon)];
            description = `Filmada en ${omdbData.Country}\n${description}`;
          }
        } else if (movie.production_countries && movie.production_countries.length > 0) {
          const country = movie.production_countries[0].name;
          const geocodeResponse = await fetch(
            `${API_CONFIG.GEOCODING.BASE_URL}?q=${encodeURIComponent(country)}&format=json&limit=1`
          );
          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData && geocodeData.length > 0) {
            position = [parseFloat(geocodeData[0].lat), parseFloat(geocodeData[0].lon)];
            description = `Filmada en ${country}\n${description}`;
          }
        }

        // Solo agregar la película si tenemos una ubicación válida
        if (position[0] !== 0 || position[1] !== 0) {
          locations.push({
            id: movie.id,
            name: movie.title,
            position: position,
            year: movie.release_date ? new Date(movie.release_date).getFullYear() : new Date().getFullYear(),
            description: description,
            posterUrl: movie.poster_path ? `${API_CONFIG.TMDB.IMAGE_BASE_URL}/w500${movie.poster_path}` : undefined,
            productionCountry: movie.production_countries?.[0]?.name || undefined,
            director: undefined,
            cast: undefined
          });
        }
      } catch (error) {
        console.error(`Error al obtener detalles de la película ${movie.title}:`, error);
      }
    }
    return locations;
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

    // Obtener detalles adicionales de OMDB
    const omdbResponse = await fetch(
      `${API_CONFIG.OMDB.BASE_URL}/?apikey=${API_CONFIG.OMDB.API_KEY}&t=${encodeURIComponent(movie.title)}&y=${movie.release_date.substring(0,4)}`
    );
    const omdbData = await omdbResponse.json();

    let position: [number, number] = [0, 0];
    let description = movie.overview || '';
    
    if (omdbData.Country) {
      const geocodeResponse = await fetch(
        `${API_CONFIG.GEOCODING.BASE_URL}?q=${encodeURIComponent(omdbData.Country)}&format=json&limit=1`
      );
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData && geocodeData.length > 0) {
        position = [parseFloat(geocodeData[0].lat), parseFloat(geocodeData[0].lon)];
        description = `Filmada en ${omdbData.Country}\n${description}`;
      }
    } else if (movie.production_countries && movie.production_countries.length > 0) {
      const country = movie.production_countries[0].name;
      const geocodeResponse = await fetch(
        `${API_CONFIG.GEOCODING.BASE_URL}?q=${encodeURIComponent(country)}&format=json&limit=1`
      );
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData && geocodeData.length > 0) {
        position = [parseFloat(geocodeData[0].lat), parseFloat(geocodeData[0].lon)];
        description = `Filmada en ${country}\n${description}`;
      }
    }

    return [{
      id: movie.id,
      name: movie.title,
      position: position,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : new Date().getFullYear(),
      description: description,
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

    // Obtener detalles adicionales de OMDB
    const omdbResponse = await fetch(
      `${API_CONFIG.OMDB.BASE_URL}/?apikey=${API_CONFIG.OMDB.API_KEY}&t=${encodeURIComponent(movie.title)}&y=${movie.release_date.substring(0,4)}`
    );
    const omdbData = await omdbResponse.json();

    // Si tenemos ubicación real, usarla, si no, usar el país de producción
    let position: [number, number] = [0, 0];
    let description = movie.overview || '';
    
    if (omdbData.Country) {
      // Buscar coordenadas del país usando Nominatim
      const geocodeResponse = await fetch(
        `${API_CONFIG.GEOCODING.BASE_URL}?q=${encodeURIComponent(omdbData.Country)}&format=json&limit=1`
      );
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData && geocodeData.length > 0) {
        position = [parseFloat(geocodeData[0].lat), parseFloat(geocodeData[0].lon)];
        description = `Filmada en ${omdbData.Country}\n${description}`;
      }
    } else if (movie.production_countries && movie.production_countries.length > 0) {
      const country = movie.production_countries[0].name;
      const geocodeResponse = await fetch(
        `${API_CONFIG.GEOCODING.BASE_URL}?q=${encodeURIComponent(country)}&format=json&limit=1`
      );
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData && geocodeData.length > 0) {
        position = [parseFloat(geocodeData[0].lat), parseFloat(geocodeData[0].lon)];
        description = `Filmada en ${country}\n${description}`;
      }
    }
    
    return {
      id: movie.id,
      name: movie.title,
      position: position,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : new Date().getFullYear(),
      description: description,
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
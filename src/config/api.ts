export const API_CONFIG = {
  TMDB: {
    BASE_URL: "https://api.themoviedb.org/3",
    API_KEY: process.env.REACT_APP_TMDB_API_KEY,
    IMAGE_BASE_URL: "https://image.tmdb.org/t/p",
    DEFAULT_LANGUAGE: 'es-ES'
  },
  OMDB: {
    BASE_URL: "https://www.omdbapi.com",
    API_KEY: process.env.REACT_APP_OMDB_API_KEY
  },
  GEOCODING: {
    BASE_URL: "https://nominatim.openstreetmap.org/search",
    DEFAULT_LIMIT: 1
  }
}; 
import React, { useState } from "react";
import Map from "./components/Map";
import { Location } from "./types";
import { getAllMovieLocations, searchMovies, getMovieLocations, getRandomMovie } from "./api/movies";
import { APP_CONSTANTS, ViewMode } from "./config/constants";
import "./App.css";

const App: React.FC = () => {
  // Estados base
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para búsqueda
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  
  // Estados para películas cercanas
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearbyMovies, setNearbyMovies] = useState<Location[]>([]);
  
  // Estados para película aleatoria
  const [randomMovie, setRandomMovie] = useState<Location | null>(null);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  
  // Estados compartidos
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(APP_CONSTANTS.VIEW_MODES.ALL);

  // Cargar todas las ubicaciones de películas
  const loadAllLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const movieLocations = await getAllMovieLocations();
      const uniqueLocations = movieLocations.filter((location, index, self) =>
        index === self.findIndex((l) => 
          l.position[0] === location.position[0] && 
          l.position[1] === location.position[1]
        )
      );
      setAllLocations(uniqueLocations);
    } catch (err) {
      console.error("Error al cargar ubicaciones:", err);
      setError(APP_CONSTANTS.ERROR_MESSAGES.LOADING_LOCATIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomMovie = async () => {
    // Limpiar TODOS los estados relacionados con otras funcionalidades
    setSearchResults([]);
    setSearchTerm("");
    setSearching(false);
    setNearbyMovies([]);
    setUserLocation(null);
    setSelectedLocation(null);
    setViewMode(APP_CONSTANTS.VIEW_MODES.RANDOM);
    
    try {
      setLoading(true);
      setError(APP_CONSTANTS.LOADING_MESSAGES.GETTING_MOVIE_DETAILS);
      const randomMovie = await getRandomMovie();
      
      if (randomMovie.position[0] === 0 && randomMovie.position[1] === 0) {
        setError(APP_CONSTANTS.ERROR_MESSAGES.NO_COUNTRY_FOUND);
      } else {
        setRandomMovie(randomMovie);
        setSelectedLocation(randomMovie);
        setError(null);
      }
    } catch (error) {
      console.error("Error al obtener película aleatoria:", error);
      setError(APP_CONSTANTS.ERROR_MESSAGES.API_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleNearbyMovies = async () => {
    // Limpiar TODOS los estados relacionados con otras funcionalidades
    setSearchResults([]);
    setSearchTerm("");
    setSearching(false);
    setNearbyMovies([]);
    setUserLocation(null);
    setSelectedLocation(null);
    setRandomMovie(null);
    setViewMode(APP_CONSTANTS.VIEW_MODES.NEARBY);
    
    if (allLocations.length === 0) {
      await loadAllLocations();
    }

    if (navigator.geolocation) {
      setLoading(true);
      setError(APP_CONSTANTS.LOADING_MESSAGES.GETTING_LOCATION);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation([userLat, userLng]);
          setError(APP_CONSTANTS.LOADING_MESSAGES.CALCULATING_DISTANCES);
          
          // Optimización: Calcular distancias solo para las primeras 50 ubicaciones
          const moviesWithDistance = allLocations
            .slice(0, 50)
            .map(location => ({
              ...location,
              distance: calculateDistance(
                userLat, 
                userLng, 
                location.position[0], 
                location.position[1]
              )
            }));
          
          // Ordenar y tomar las 5 más cercanas
          const closestMovies = moviesWithDistance
            .sort((a, b) => (a.distance || 0) - (b.distance || 0))
            .slice(0, 5);
          
          setNearbyMovies(closestMovies);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error("Error al obtener la ubicación:", error);
          setError(APP_CONSTANTS.ERROR_MESSAGES.LOCATION_ACCESS);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setError(APP_CONSTANTS.ERROR_MESSAGES.GEOLOCATION_NOT_SUPPORTED);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return value * Math.PI / 180;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Limpiar estados de otras funcionalidades
    setRandomMovie(null);
    setNearbyMovies([]);
    setUserLocation(null);
    setSelectedLocation(null);
    setViewMode(APP_CONSTANTS.VIEW_MODES.SEARCH);

    try {
      setSearching(true);
      setError(APP_CONSTANTS.LOADING_MESSAGES.SEARCHING);
      const results = await searchMovies(searchTerm);
      
      if (results.length === 0) {
        setError(APP_CONSTANTS.ERROR_MESSAGES.NO_VALID_LOCATIONS);
      } else {
        setSearchResults(results);
        setError(null);
      }
    } catch (err) {
      console.error("Error al buscar películas:", err);
      setError(APP_CONSTANTS.ERROR_MESSAGES.SEARCH_RESULTS);
    } finally {
      setSearching(false);
    }
  };

  const handleMovieSelect = async (movieId: number) => {
    try {
      setLoading(true);
      setError(null);
      const locations = await getMovieLocations(movieId);
      
      if (locations.length > 0) {
        setSelectedLocation(locations[0]);
        setViewMode(APP_CONSTANTS.VIEW_MODES.SEARCH);
        setError(null);
      } else {
        setError(APP_CONSTANTS.ERROR_MESSAGES.NO_LOCATIONS_FOUND);
      }
    } catch (err) {
      console.error("Error al obtener ubicaciones de la película:", err);
      setError(APP_CONSTANTS.ERROR_MESSAGES.MOVIE_LOCATIONS);
    } finally {
      setLoading(false);
    }
  };

  // Determinar qué ubicaciones mostrar en el mapa
  const getLocationsToShow = () => {
    switch (viewMode) {
      case APP_CONSTANTS.VIEW_MODES.RANDOM:
        return randomMovie ? [randomMovie] : [];
      case APP_CONSTANTS.VIEW_MODES.NEARBY:
        return nearbyMovies;
      case APP_CONSTANTS.VIEW_MODES.SEARCH:
        return selectedLocation ? [selectedLocation] : [];
      case APP_CONSTANTS.VIEW_MODES.ALL:
      default:
        return allLocations;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>CineMap</h1>
        <div className="header-controls">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar película..."
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={searching}>
              {searching ? "Buscando..." : "Buscar"}
            </button>
          </form>
          <div className="action-buttons">
            <button 
              onClick={handleRandomMovie} 
              className="random-button"
              disabled={loading}
            >
              Película Aleatoria
            </button>
            <button 
              onClick={handleNearbyMovies} 
              className="nearby-button"
              disabled={loading}
            >
              Películas Cerca de Mí
            </button>
          </div>
        </div>
      </header>
      
      <div className="main-content">
        <div className="map-container">
          {loading ? (
            <div className="loading-container">
              <p>{APP_CONSTANTS.LOADING_MESSAGES.LOADING_LOCATIONS}</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
            </div>
          ) : (
            <Map 
              locations={getLocationsToShow()} 
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
              userLocation={userLocation}
              zoomToSelected={true}
              zoomLevel={15}
            />
          )}
        </div>
        
        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>Resultados de búsqueda:</h3>
            <ul className="results-list">
              {searchResults.map((movie) => (
                <li 
                  key={movie.id} 
                  className="result-item"
                  onClick={() => handleMovieSelect(movie.id)}
                >
                  {movie.posterUrl ? (
                    <img 
                      src={movie.posterUrl} 
                      alt={movie.name} 
                      className="result-poster"
                    />
                  ) : (
                    <div className="no-poster">Sin póster</div>
                  )}
                  <div className="result-info">
                    <h4>{movie.name}</h4>
                    <p>{movie.year}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {nearbyMovies.length > 0 && (
          <div className="nearby-results">
            <h3>Películas cerca de ti:</h3>
            <ul className="results-list">
              {nearbyMovies.map((movie, index) => (
                <li 
                  key={index} 
                  className="result-item"
                  onClick={() => {
                    setSelectedLocation(movie);
                    setViewMode(APP_CONSTANTS.VIEW_MODES.SEARCH);
                  }}
                >
                  {movie.posterUrl ? (
                    <img 
                      src={movie.posterUrl} 
                      alt={movie.name} 
                      className="result-poster"
                    />
                  ) : (
                    <div className="no-poster">Sin póster</div>
                  )}
                  <div className="result-info">
                    <h4>{movie.name}</h4>
                    <p>{movie.year}</p>
                    <p className="distance">
                      {movie.distance ? `${Math.round(movie.distance)} km de distancia` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {randomMovie && (
          <div className="nearby-results">
            <h3>Película Aleatoria:</h3>
            <ul className="results-list">
              <li 
                className="result-item"
                onClick={() => setSelectedLocation(randomMovie)}
              >
                {randomMovie.posterUrl ? (
                  <img 
                    src={randomMovie.posterUrl} 
                    alt={randomMovie.name} 
                    className="result-poster"
                  />
                ) : (
                  <div className="no-poster">Sin póster</div>
                )}
                <div className="result-info">
                  <h4>{randomMovie.name}</h4>
                  <p>{randomMovie.year}</p>
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

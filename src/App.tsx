import React, { useState } from "react";
import Map from "./components/Map";
import { Location } from "./types";
import { getAllMovieLocations, searchMovies, getMovieLocations } from "./api/movieLocationsAPI";
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
  const [randomMovieHistory, setRandomMovieHistory] = useState<number[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  
  // Estados compartidos
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'random' | 'nearby' | 'search'>('all');

  // Cargar todas las ubicaciones de películas
  const loadAllLocations = async () => {
    try {
      setLoading(true);
      const movieLocations = await getAllMovieLocations();
      const uniqueLocations = movieLocations.filter((location, index, self) =>
        index === self.findIndex((l) => 
          l.position[0] === location.position[0] && 
          l.position[1] === location.position[1]
        )
      );
      setAllLocations(uniqueLocations);
      setError(null);
    } catch (err) {
      console.error("Error al cargar ubicaciones:", err);
      setError("No se pudieron cargar las ubicaciones de películas. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleRandomMovie = async () => {
    // Limpiar TODOS los estados relacionados con otras funcionalidades
    setSearchResults([]);
    setSearchTerm("");
    setNearbyMovies([]);
    setUserLocation(null);
    setSelectedLocation(null);
    setViewMode('random');
    
    if (allLocations.length === 0) {
      await loadAllLocations();
    }
    
    if (allLocations.length > 0) {
      const availableMovies = allLocations.filter(movie => !randomMovieHistory.includes(movie.id));
      
      if (availableMovies.length === 0) {
        setRandomMovieHistory([]);
        const randomIndex = Math.floor(Math.random() * allLocations.length);
        const randomLocation = allLocations[randomIndex];
        if (randomLocation && randomLocation.position) {
          setRandomMovie(randomLocation);
          setRandomMovieHistory([randomLocation.id]);
          setSelectedLocation(randomLocation);
        }
      } else {
        const randomIndex = Math.floor(Math.random() * availableMovies.length);
        const randomLocation = availableMovies[randomIndex];
        if (randomLocation && randomLocation.position) {
          setRandomMovie(randomLocation);
          setRandomMovieHistory(prev => [...prev, randomLocation.id]);
          setSelectedLocation(randomLocation);
        }
      }
    }
  };

  const handleNearbyMovies = async () => {
    // Limpiar TODOS los estados relacionados con otras funcionalidades
    setSearchResults([]);
    setSearchTerm("");
    setNearbyMovies([]);
    setUserLocation(null);
    setSelectedLocation(null);
    setRandomMovie(null);
    setRandomMovieHistory([]);
    setViewMode('nearby');
    
    if (allLocations.length === 0) {
      await loadAllLocations();
    }

    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation([userLat, userLng]);
          
          const moviesWithDistance = allLocations.map(location => ({
            ...location,
            distance: calculateDistance(
              userLat, 
              userLng, 
              location.position[0], 
              location.position[1]
            )
          }));
          
          const closestMovies = moviesWithDistance
            .sort((a, b) => (a.distance || 0) - (b.distance || 0))
            .slice(0, 5);
          
          setNearbyMovies(closestMovies);
          setLoading(false);
        },
        (error) => {
          console.error("Error al obtener la ubicación:", error);
          setError("No se pudo obtener tu ubicación. Por favor, permite el acceso a la ubicación.");
          setLoading(false);
        }
      );
    } else {
      setError("Tu navegador no soporta geolocalización.");
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
    
    // Limpiar TODOS los estados relacionados con otras funcionalidades
    setRandomMovie(null);
    setRandomMovieHistory([]);
    setNearbyMovies([]);
    setUserLocation(null);
    setSelectedLocation(null);
    setViewMode('search');
    
    try {
      setSearching(true);
      const results = await searchMovies(searchTerm);
      setSearchResults(results);
    } catch (err) {
      console.error("Error al buscar películas:", err);
      setError("Error al buscar películas. Por favor, inténtalo de nuevo.");
    } finally {
      setSearching(false);
    }
  };

  const handleMovieSelect = async (movieId: number) => {
    try {
      setLoading(true);
      // Limpiar TODOS los estados relacionados con otras funcionalidades
      setRandomMovie(null);
      setRandomMovieHistory([]);
      setNearbyMovies([]);
      setUserLocation(null);
      setViewMode('search');
      
      const movieLocations = await getMovieLocations(movieId);
      
      if (movieLocations.length > 0) {
        const uniqueLocations = movieLocations.filter((location, index, self) =>
          index === self.findIndex((l) => 
            l.position && 
            l.position[0] === location.position[0] && 
            l.position[1] === location.position[1]
          )
        );
        
        if (uniqueLocations.length > 0) {
          const selectedMovie = uniqueLocations[0];
          setSelectedLocation(selectedMovie);
          setError(null);
        } else {
          setError("No se encontraron ubicaciones válidas para esta película.");
        }
      } else {
        setError("No se encontraron ubicaciones para esta película.");
      }
    } catch (err) {
      console.error("Error al obtener ubicaciones de la película:", err);
      setError("Error al obtener ubicaciones de la película.");
    } finally {
      setLoading(false);
    }
  };

  // Determinar qué ubicaciones mostrar en el mapa
  const getLocationsToShow = () => {
    switch (viewMode) {
      case 'random':
        return randomMovie ? [randomMovie] : [];
      case 'nearby':
        return nearbyMovies;
      case 'search':
        return selectedLocation ? [selectedLocation] : [];
      case 'all':
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
              <p>Cargando ubicaciones de películas...</p>
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
                  {movie.poster_path ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                      alt={movie.title} 
                      className="result-poster"
                    />
                  ) : (
                    <div className="no-poster">Sin póster</div>
                  )}
                  <div className="result-info">
                    <h4>{movie.title}</h4>
                    <p>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'Año no disponible'}</p>
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
                    setViewMode('search');
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

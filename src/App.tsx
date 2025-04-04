import React, { useState, useEffect } from "react";
import Map from "./components/Map";
import { Location } from "./types";
import { getAllMovieLocations, searchMovies, getMovieLocations, getMovieDetails } from "./api/movieLocationsAPI";
import "./App.css";

const App: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearbyMovies, setNearbyMovies] = useState<Location[]>([]);
  const [showNearbyMovies, setShowNearbyMovies] = useState<boolean>(false);
  const [randomMovie, setRandomMovie] = useState<Location | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'random' | 'nearby' | 'search'>('all');
  const [randomMovieHistory, setRandomMovieHistory] = useState<number[]>([]);
  const [movieDetails, setMovieDetails] = useState<any>(null);

  useEffect(() => {
    const fetchMovieDetails = async (title: string) => {
      try {
        const details = await getMovieDetails(title);
        if (details && details.Response !== "False") {
          setMovieDetails(details);
        }
      } catch (error) {
        console.error("Error al obtener detalles de la película:", error);
      }
    };

    if (selectedLocation) {
      fetchMovieDetails(selectedLocation.name);
    }
  }, [selectedLocation]);

  // Cargar ubicaciones de películas solo cuando sea necesario
  const loadLocations = async () => {
    try {
      setLoading(true);
      const movieLocations = await getAllMovieLocations();
      // Eliminar ubicaciones duplicadas basadas en coordenadas
      const uniqueLocations = movieLocations.filter((location, index, self) =>
        index === self.findIndex((l) => 
          l.position[0] === location.position[0] && 
          l.position[1] === location.position[1]
        )
      );
      setLocations(uniqueLocations);
      setError(null);
    } catch (err) {
      console.error("Error al cargar ubicaciones:", err);
      setError("No se pudieron cargar las ubicaciones de películas. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleRandomMovie = async () => {
    // Limpiar estados anteriores
    setShowNearbyMovies(false);
    setSearchResults([]);
    setUserLocation(null);
    setNearbyMovies([]);
    setSelectedLocation(null);
    setViewMode('random');
    
    if (locations.length === 0) {
      await loadLocations();
    }
    
    if (locations.length > 0) {
      // Filtrar películas que no están en el historial
      const availableMovies = locations.filter(movie => !randomMovieHistory.includes(movie.id));
      
      if (availableMovies.length === 0) {
        // Si todas las películas han sido mostradas, reiniciar el historial
        setRandomMovieHistory([]);
        const randomIndex = Math.floor(Math.random() * locations.length);
        const randomLocation = locations[randomIndex];
        if (randomLocation && randomLocation.position) {
          setRandomMovie(randomLocation);
          setRandomMovieHistory([randomLocation.id]);
          setSelectedLocation(randomLocation);
        }
      } else {
        // Seleccionar una película aleatoria de las disponibles
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
    // Limpiar estados anteriores
    setRandomMovie(null);
    setSearchResults([]);
    setSelectedLocation(null);
    setViewMode('nearby');
    
    if (locations.length === 0) {
      await loadLocations();
    }

    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation([userLat, userLng]);
          
          // Calcular la distancia entre el usuario y cada película
          const moviesWithDistance = locations.map(location => {
            const distance = calculateDistance(
              userLat, 
              userLng, 
              location.position[0], 
              location.position[1]
            );
            return { ...location, distance };
          });
          
          // Ordenar por distancia y tomar solo las 5 más cercanas
          const closestMovies = moviesWithDistance
            .sort((a, b) => (a.distance || 0) - (b.distance || 0))
            .slice(0, 5);
          
          // Asegurarnos de que las películas cercanas sean diferentes a la aleatoria
          const filteredMovies = closestMovies.filter(movie => 
            !randomMovieHistory.includes(movie.id)
          );
          
          setNearbyMovies(filteredMovies);
          setShowNearbyMovies(true);
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
    
    // Limpiar estados anteriores
    setRandomMovie(null);
    setShowNearbyMovies(false);
    setUserLocation(null);
    setNearbyMovies([]);
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
      console.log('handleMovieSelect - Iniciando selección de película:', movieId);
      
      const movieLocations = await getMovieLocations(movieId);
      console.log('handleMovieSelect - Ubicaciones obtenidas:', movieLocations);
      
      if (movieLocations.length > 0) {
        // Eliminar ubicaciones duplicadas
        const uniqueLocations = movieLocations.filter((location, index, self) =>
          index === self.findIndex((l) => 
            l.position && 
            l.position[0] === location.position[0] && 
            l.position[1] === location.position[1]
          )
        );
        
        if (uniqueLocations.length > 0) {
          const selectedMovie = uniqueLocations[0];
          console.log('handleMovieSelect - Película seleccionada:', selectedMovie);
          
          // Primero establecer el modo de vista
          setViewMode('search');
          
          // Luego establecer la ubicación seleccionada
          setSelectedLocation(selectedMovie);
          
          // Finalmente actualizar las ubicaciones
          setLocations(uniqueLocations);
          
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
      default:
        return locations;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mapas Cinematográficos</h1>
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

        {showNearbyMovies && nearbyMovies.length > 0 && (
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
                    setLocations([movie]);
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

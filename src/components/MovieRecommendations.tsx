import React, { useEffect, useState } from "react";
import axios from "axios";

interface MovieRecommendationsProps {
  movieId: string;
}

interface Recommendation {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

const MovieRecommendations: React.FC<MovieRecommendationsProps> = ({ movieId }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        // Usar la API de TMDB para obtener recomendaciones
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/recommendations`, {
          params: {
            api_key: "2567c7cdf0e7f5c75d01d02d84721482",
            language: 'es-ES',
            page: 1
          }
        });
        
        if (response.data && response.data.results) {
          setRecommendations(response.data.results);
          setError(null);
        } else {
          setError("No se encontraron recomendaciones para esta película.");
        }
      } catch (err) {
        console.error("Error al obtener recomendaciones:", err);
        setError("Error al cargar las recomendaciones.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [movieId]);

  if (loading) {
    return (
      <div className="recommendations-container">
        <h3>Recomendaciones:</h3>
        <p>Cargando recomendaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-container">
        <h3>Recomendaciones:</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="recommendations-container">
        <h3>Recomendaciones:</h3>
        <p>No hay recomendaciones disponibles para esta película.</p>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <h3>Recomendaciones:</h3>
      <div className="recommendations-list">
        {recommendations.slice(0, 5).map((movie) => (
          <div key={movie.id} className="recommendation-item">
            {movie.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                alt={movie.title} 
                className="recommendation-poster"
              />
            ) : (
              <div className="no-poster">Sin póster</div>
            )}
            <div className="recommendation-info">
              <a 
                href={`https://www.themoviedb.org/movie/${movie.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="recommendation-title"
              >
                {movie.title}
              </a>
              <div className="recommendation-details">
                <span>{new Date(movie.release_date).getFullYear()}</span>
                <span>★ {movie.vote_average.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieRecommendations;

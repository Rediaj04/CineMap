export const tmdbAPI = (movieId: string) => {
    const apiKey = "2567c7cdf0e7f5c75d01d02d84721482";
    return `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${apiKey}&language=en-US&page=1`;
  };
  
export const omdbAPI = (movieName: string) => {
    const apiKey = "f21edee7";
    return `https://www.omdbapi.com/?t=${movieName}&apikey=${apiKey}`;
  };
  
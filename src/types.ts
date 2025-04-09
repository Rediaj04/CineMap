export interface Location {
    id: number;
    name: string;
    position: [number, number];
    year: number;
    description: string;
    posterUrl?: string;
    productionCountry?: string;
    director?: string;
    cast?: string[];
    distance?: number;
  }
  
  export interface MovieDetails {
    Title: string;
    Year: string;
    Plot: string;
    Poster: string;
    imdbID: string;
    Director: string;
    Actors: string;
    Genre: string;
  }
  
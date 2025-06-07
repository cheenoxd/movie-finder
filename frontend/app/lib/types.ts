export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  overview?: string;
  genre_ids?: number[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  created_at: string;
} 
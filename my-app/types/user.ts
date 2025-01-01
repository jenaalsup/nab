export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  bio?: string;
  location?: string;
  interests?: string[];
  createdAt: number;
  photoURL?: string;
}
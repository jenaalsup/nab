export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  bio?: string;
  location?: string;
  interests?: string[];
  communities?: string[];
  createdAt?: number;
  updatedAt: number;
  photoURL: string | null;  // Changed from string | undefined to string | null
}
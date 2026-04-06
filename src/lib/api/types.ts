// ─── Pagination ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

// ─── Books ──────────────────────────────────────────────────────────────────

export interface Book {
  id: number;
  title: string;
  description: string;
  cover_url: string;
  isbn: string;
  year: number;
  total_pages: number;
  language: string;
  avg_rating: number;
  ratings_count: number;
  author_id: number;
  genre_id: number;
  author?: Author;
  genre?: Genre;
  file?: BookFile;
  created_at: string;
}

export interface BookFile {
  id: number;
  book_id: number;
  format: string;
  file_url: string;
  size_bytes: number;
}

// ─── Authors ────────────────────────────────────────────────────────────────

export interface Author {
  id: number;
  name: string;
  bio: string;
  birth_date?: string;
  death_date?: string;
  photo_url: string;
}

// ─── Genres ─────────────────────────────────────────────────────────────────

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

// ─── Libraries ──────────────────────────────────────────────────────────────

export interface Library {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
}

export interface LibraryBook {
  id: number;
  library_id: number;
  book_id: number;
  total_copies: number;
  available_copies: number;
  library?: Library;
  book?: Book;
}

// ─── Events ─────────────────────────────────────────────────────────────────

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
  cover_url: string;
  created_at: string;
}

// ─── Reviews ────────────────────────────────────────────────────────────────

export interface Review {
  id: number;
  user_id: string;
  book_id: number;
  rating: number;
  body: string;
  created_at: string;
  user?: { name: string; surname: string; avatar_url?: string };
}

// ─── Reservations ───────────────────────────────────────────────────────────

export interface Reservation {
  id: number;
  user_id: string;
  library_book_id: number;
  status: "pending" | "active" | "returned" | "cancelled" | "overdue";
  reserved_at: string;
  due_date: string;
  returned_at?: string;
  library_book?: LibraryBook;
}

// ─── Wishlist ───────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: number;
  book_id: number;
  book?: Book;
  created_at: string;
}

// ─── Reading Sessions ───────────────────────────────────────────────────────

export interface ReadingSession {
  id: string;
  user_id?: string;
  book_id?: number;
  current_page: number;
  status: string;
  updated_at?: string;
  finished_at?: string;
  book?: {
    id: string;
    title: string;
    cover_url?: string;
    total_pages: number;
    author_name?: string;
  };
}

// ─── Notes ──────────────────────────────────────────────────────────────────

export interface ReadingNote {
  id: number;
  user_id: string;
  book_id: number;
  page: number;
  content: string;
  created_at: string;
}

// ─── Notifications ──────────────────────────────────────────────────────────

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// ─── User Stats ─────────────────────────────────────────────────────────────

export interface UserStats {
  books_read: number;
  pages_read: number;
  reading_time_hours: number;
  reviews_count: number;
}

// ─── AI ─────────────────────────────────────────────────────────────────────

export interface AiConversation {
  id: number;
  title: string;
  created_at: string;
}

export interface AiMessage {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

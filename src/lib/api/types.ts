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
  has_password: boolean;
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
  id: string;
  name: string;
  bio: string;
  birth_date?: string;
  death_date?: string;
  photo_url: string;
}

// ─── Genres ─────────────────────────────────────────────────────────────────

export interface Genre {
  id: string;
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
  image_url: string;
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
  id: string;
  user_id: string;
  book_id: string;
  book_title?: string;
  rating: number;
  body: string;
  created_at: string;
  user_name?: string;
  user_surname?: string;
  user_avatar_url?: string;
}

// ─── Reservations ───────────────────────────────────────────────────────────

export interface Reservation {
  id: string;
  status: "pending" | "active" | "completed" | "cancelled";
  reserved_at: string;
  due_date: string;
  returned_at?: string;
  extended_count: number;
  library_book_id: string;
  book: { id: string; title: string; cover_url?: string };
  library: { id: string; name: string; address?: string };
}

// ─── Wishlist ───────────────────────────────────────────────────────────────

export type ShelfStatus = "want_to_read" | "reading" | "finished";

export interface WishlistItem {
  id: string;
  status: ShelfStatus;
  added_at: string;
  book: {
    id: string;
    title: string;
    isbn?: string;
    cover_url: string;
    description?: string;
    language?: string;
    year?: number;
    total_pages?: number;
    avg_rating: number;
    author: { id: string; name: string };
    genre: { id: string; name: string; slug?: string };
  };
}

// ─── Reading Sessions ───────────────────────────────────────────────────────

export interface ReadingSession {
  id: string;
  user_id?: string;
  book_id?: string;
  progress: number;
  cfi_position?: string;
  status: string;
  updated_at?: string;
  finished_at?: string;
  book?: {
    id: string;
    title: string;
    cover_url?: string;
    author_name?: string;
  };
}

// ─── Notes ──────────────────────────────────────────────────────────────────

export interface ReadingNote {
  id: string;
  user_id: string;
  book_id: string;
  position: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// ─── Notifications ──────────────────────────────────────────────────────────

export type NotificationType =
  | "reservation_success"
  | "pickup_success"
  | "reservation_deadline"
  | "return_deadline"
  | "reservation_expired"
  | "return_overdue"
  | "event_reminder"
  | "general";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
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

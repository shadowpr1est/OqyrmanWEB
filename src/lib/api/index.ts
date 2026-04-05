// Core
export { apiFetch, apiUpload, tokenStorage, ApiException } from "./client";
export type { ApiError } from "./client";

// Types
export type * from "./types";

// API modules
export { authApi } from "./auth";
export { userApi } from "./user";
export { booksApi } from "./books";
export type { BooksParams } from "./books";
export { authorsApi } from "./authors";
export { genresApi } from "./genres";
export { librariesApi, libraryBooksApi } from "./libraries";
export { eventsApi } from "./events";
export { reviewsApi } from "./reviews";
export { wishlistApi } from "./wishlist";
export { reservationsApi } from "./reservations";
export { notificationsApi } from "./notifications";
export { readingSessionsApi } from "./reading-sessions";
export { notesApi } from "./notes";
export { aiApi } from "./ai";

/**
 * Template literal types for REST collection and resource paths.
 * Used by `API_ENDPOINTS` in `@utils/constants` for compile-time path safety.
 */
export type UsersCollectionPath = '/users';
export type PostsCollectionPath = '/posts';
export type UserByIdPath = `/users/${number}`;
export type PostByIdPath = `/posts/${number}`;

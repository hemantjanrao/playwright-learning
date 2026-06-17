/** Template literal types — compile-time safety for REST paths. */
export type UsersCollectionPath = '/users';
export type PostsCollectionPath = '/posts';
export type UserByIdPath = `/users/${number}`;
export type PostByIdPath = `/posts/${number}`;

export type ApiCollectionPath = UsersCollectionPath | PostsCollectionPath;
export type ApiResourcePath = UserByIdPath | PostByIdPath;
export type ApiPath = ApiCollectionPath | ApiResourcePath;

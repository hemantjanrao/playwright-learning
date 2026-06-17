export interface ApiUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: { lat: string; lng: string };
  };
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

export interface ApiPost {
  userId: number;
  id?: number;
  title: string;
  body: string;
}

export interface ApiErrorResponse {
  message?: string;
  statusCode?: number;
}

export interface ApiClientOptions {
  baseUrl: string;
  extraHeaders?: Record<string, string>;
}

/** Recursively make all properties optional — useful for partial test payloads. */
export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

/** Create payloads — omit server-generated fields. */
export type CreatePayload<T, K extends keyof T> = Omit<T, K>;

/** Nullable wrapper for optional API fields in assertions. */
export type Nullable<T> = T | null;

/** Extract keys whose values extend a given type. */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

export type WithField<K extends string, V> = Readonly<{ [_ in K]: V }>
export type WithAdditionalField<T, K extends string, V> = T extends WithField<K, any> ? never : T & WithField<K, V>

export type MapFunction<I, O> = (i: I) => O
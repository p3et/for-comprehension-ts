export type MonadType = string

/**
 * representation of a monad that is compatible with our for-comprehension
 * @param M monad type
 * @param T value type
 */
export type Monad<MT extends MonadType, TA extends unknown[]> = {
    type: MonadType,

    map<O>(fun: (t: TA[0]) => O): Monad<MT, ReplaceFirst<TA, O>>

    flatMap<O>(fun: (t: TA[0]) => Monad<MT, ReplaceFirst<TA, O>>): Monad<MT, ReplaceFirst<TA, O>>

    flatMapAsync<O>(fun: (t: TA[0]) => Monad<MT, ReplaceFirst<TA, O>> | Promise<Monad<MT, ReplaceFirst<TA, O>>>): Promise<Monad<MT, ReplaceFirst<TA, O>>>
}

export type ReplaceFirst<A extends unknown[], T> = [T, ...TupleSplit<A, 1>[1]]

type TupleSplit<T, N extends number, O extends readonly any[] = readonly []> =
    O['length'] extends N ? [O, T] : T extends readonly [infer F, ...infer R] ?
        TupleSplit<readonly [...R], N, readonly [...O, F]> : [O, T]
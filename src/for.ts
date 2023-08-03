declare function init<K extends string, V>(key: K, value: V): Program<{ [_ in K]: V }>

declare function flatMap<I, K extends string, V>(input: Program<I>, key: I extends { [_ in K]: V } ? never : K, value: V): Program<I & { [_ in K]: V }>

type Program<I extends Record<string, any>> = {
    flatmap<K extends string, V>(key: K, fun : (i: I) => V) : Program<I & { [_ in K]: V }>;
}

const x = init("foo", 1).flatmap("bar", (i) => "true");


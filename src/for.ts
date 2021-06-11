import {FlatMapFunction, MapFunction, MonadType, Monad} from "./monad";

type Operation = { key: string, fun: (any) | ((c: any) => any) };

/**
 * Representation of for-comprehension steps, execution and constructors.
 */
export class For<M extends MonadType, E, C> {

    private constructor(private readonly monad: Monad<M, E, any>, private readonly key: string, private readonly operations: Operation[] = []) {
    }

    /**
     * Slim syntax constructor.
     * @param monad contains the initial wrapped value
     * @param key refers to the initial wrapped value within the context
     */
    public static _<M extends MonadType, K extends string, E, A>(key: K, monad: Monad<M, E, A>): For<M, E, { [T in K]: A }> {
        return new For(monad, key, []);
    }

    /**
     * Explicit syntax constructor.
     * @param monad contains the initial wrapped value
     * @param key refers to the initial wrapped value within the context
     */
    public static init<M extends MonadType, K extends string, E, A>(key: K, monad: Monad<M, E, A>): For<M, E, { [T in K]: A }> {
        return new For(monad, key, []);
    }

    /**
     * Slim syntax map or flatMap operator.
     * @param fun will be applied to the context
     * @param key refers to the resulting wrapped value within the context
     */
    public _<K extends string, B>(key: K, fun: FlatMapFunction<[c: C], M, E, B> | MapFunction<[c: C], B>): For<M, E, C & { [T in K]: B }> {
        const step: Operation = {key: key, fun: fun};
        return new For(this.monad, this.key, this.operations.concat(step));
    }

    /**
     * Explicit syntax map operator.
     * @param fun will be applied to the context
     * @param key refers to the resulting wrapped value within the context
     */
    public map<K extends string, B>(key: K, fun: MapFunction<[c: C], B>): For<M, E, C & { [T in K]: B }> {
        return this._(key, fun);
    }

    /**
     * Explicit syntax flatMap operator.
     * @param fun will be applied to the context
     * @param key refers to the resulting wrapped value within the context
     */
    public flatMap<K extends string, B>(key: K, fun: FlatMapFunction<[c: C], M, E, B>): For<M, E, C & { [T in K]: B }> {
        return this._(key, fun);
    }

    /**
     * Trigger execution and yield a resulting value.
     * @param fun maps the context to the resulting value.
     */
    public async yield<B>(fun: MapFunction<[c: C], B>): Promise<Monad<M, E, B>> {
        const context: any = {};

        let monad: Monad<M, E, any> = this.monad;
        let value: any = monad.unwrap();

        context[this.key] = value;

        for (const {key, fun} of this.operations) {
            monad = await monad._(() => fun(context));
            value = monad.unwrap();

            context[key] = value;
        }

        return monad._(() => fun(context));
    }
}

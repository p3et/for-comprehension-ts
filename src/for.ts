import {MonadType, Monad, FlatMapFunction, MapFunction} from "./monad";

type Operation = { key: string, fun: (any) | ((c: any) => any) };

export class For<M extends MonadType, C> {

    private constructor(private readonly monad: Monad<M, any>, private readonly key: string, private readonly operations: Operation[]  = []) {
    }

    public static _<M extends MonadType, K extends string, A>(key: K, monad: Monad<M, A>): For<M, { [T in K]: A }> {
        return new For(monad, key, []);
    }

    public _<K extends string, B>(key: K, fun: FlatMapFunction<[c: C], M, B> | MapFunction<[c: C], B>): For<M, C & { [T in K]: B }> {
        const step: Operation = {key: key, fun: fun};
        return new For(this.monad, this.key, this.operations.concat(step));
    }

    public async yield<B>(fun: (c: C) => B): Promise<Monad<M, B>> {
        const context: any = {};

        let monad: Monad<M, any> = this.monad;
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

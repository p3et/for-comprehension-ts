import {MonadType} from "../monad/common";
import {none, some} from "../monad/option";
import {Monad} from "../../dist/monad/common";


type OptimizableFlatMap<MT extends MonadType, M extends Monad<MT, V>, I, IK extends keyof I, V> = (i: Pick<I, IK>) => Monad<MT, V> | Promise<Monad<MT, V>>
type RegularFlatMap<MT extends MonadType, M extends Monad<MT, V>, I, V> = OptimizableFlatMap<MT, M, I, keyof I, V>
type AsyncFlatMap<MT extends MonadType> = OptimizableFlatMap<MT, Monad<MT, any>, any, any, any>

type Step<MT extends MonadType> = {
    key: string,
    fun: AsyncFlatMap<MT>
}

type Program<MT extends MonadType, M extends Monad<MT, any>, I extends Record<string, any>> = {
    steps: Step<MT>[]
    _<OK extends string, OV>(
        outputKey: I extends { [_ in OK]: OV } ? never : OK,
        fun: RegularFlatMap<MT, M, I, OV>
    ): Program<MT, M, I & { [_ in OK]: OV }>
    __<OK extends string, IK extends (keyof I)[], OV>(
        outputKey: I extends { [_ in OK]: OV } ? never : OK,
        inputKeys: IK,
        fun: OptimizableFlatMap<MT, M, I, typeof inputKeys[number], OV>
    ): Program<MT, M, I & { [_ in OK]: OV }>
    yield<YM extends Monad<MT, V>, V>(fun: (i: I) => V): Promise<Monad<MT, V> & YM>
}

function program<MT extends MonadType, M extends Monad<MonadType, any>, I>(steps: Step<MT>[]): Program<MT, M, I> {
    return {
        steps: steps,
        _<OK extends string, OV>(
            outputKey: I extends { [_ in OK]: OV } ? never : OK,
            flatMapFunction: RegularFlatMap<MT, M, I, OV>
        ): Program<MT, M, I & { [_ in OK]: OV }> {
            return flatMap(this, outputKey, [], flatMapFunction);
        },
        __<OK extends string, IK extends (keyof I)[], OV>(
            outputKey: I extends { [_ in OK]: OV } ? never : OK,
            inputKeys: IK,
            flatMapFunction: OptimizableFlatMap<MT, M, I, typeof inputKeys[number], OV>
        ): Program<MT, M, I & { [_ in OK]: OV }> {
            return flatMap(this, outputKey, inputKeys, flatMapFunction);
        },
        yield<YM extends Monad<MT, V>, V>(fun: (i: I) => V): Promise<Monad<MT, V> & YM> {
            return evaluate(this, fun);
        }
    }
}

function init<MT extends MonadType, M extends Monad<MT, V>, K extends string, V>(
    key: K,
    flatMapFunction: () => Monad<MT, V> | Promise<Monad<MT, V>>
): Program<MT, M, { [_ in K]: V }> {
    return program([{key: key, fun: flatMapFunction}])
}

function flatMap<MT extends MonadType, M extends Monad<MT, OV>, I, K extends string, IK extends (keyof I)[], OV>(
    oldProgram: Program<MT, M, I>,
    outputKey: I extends { [_ in K]: OV } ? never : K,
    inputKeys: IK,
    flatMapFunction: OptimizableFlatMap<MT, M, I, typeof inputKeys[number], OV>
): Program<MT, M, I & { [_ in K]: OV }> {
    return program(oldProgram.steps.concat({key: outputKey, fun: flatMapFunction}))
}

async function evaluate<MT extends MonadType, M extends Monad<MT, V>, I, V>(
    program: Program<MT, Monad<MT, any>, I>,
    mapFunction: (i: I) => V
): Promise<M> {
    const head = program.steps[0]

    const headMonad = await head.fun({})
    let input = headMonad.map((value) => ({[head.key]: value}))

    const tail = program.steps.slice(1)

    for (const step of tail) {
        const result = await input.flatMapAsync((i) => step.fun(i))
        input = input.flatMap((i) => result.map((v) => ({...i, ...{[step.key]: v}})))
    }

    // @ts-ignore
    return input.map(mapFunction);
}

export namespace AsyncFor {
    export function _<MT extends MonadType, M extends Monad<MonadType, V>, K extends string, V>(
        key: K,
        flatMapFunction: () => Monad<MT, V> | Promise<Monad<MT, V>>
    ): Program<MT, M, { [_ in K]: V }> {
        return init(key, flatMapFunction)
    }
}
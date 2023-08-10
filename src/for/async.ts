import {Result} from "../monad/result";

export type AsyncFlatMap<I, O, E> = (a: I) => Result<O, E> | Promise<Result<O, E>>

type PartialAsyncFlatMap<I, IK extends keyof I, O, E> = AsyncFlatMap<Pick<I, IK>, O, E>

export type AsyncStep = {
    key: string,
    fun: AsyncFlatMap<any, any, any>
}

export type AsyncProgram<I extends Record<string, any>, E> = {
    steps: AsyncStep[]
    fm<OK extends string, OT>(
        outputKey: I extends { [_ in OK]: OT } ? never : OK,
        fun: AsyncFlatMap<I, OT, E>
    ): AsyncProgram<I & { [_ in OK]: OT }, E>
    fmp<OK extends string, IK extends (keyof I)[], OT>(
        outputKey: I extends { [_ in OK]: OT } ? never : OK,
        inputKeys: IK,
        fun: PartialAsyncFlatMap<I, typeof inputKeys[number], OT, E>
    ): AsyncProgram<I & { [_ in OK]: OT }, E>
    yield<T>(fun: (i: I) => T): Promise<Result<T, E>>
}

export function asyncProgram<I, E>(steps: AsyncStep[]): AsyncProgram<I, E> {
    return {
        steps: steps,
        fm<OK extends string, OT>(
            outputKey: I extends { [_ in OK]: OT } ? never : OK,
            fun: AsyncFlatMap<I, OT, E>
        ): AsyncProgram<I & { [_ in OK]: OT }, E> {
            return asyncProgram(steps.concat({key: outputKey, fun: fun}))
        },
        fmp<OK extends string, IK extends (keyof I)[], OT>(
            outputKey: I extends { [_ in OK]: OT } ? never : OK,
            inputKeys: IK,
            fun: PartialAsyncFlatMap<I, typeof inputKeys[number], OT, E>
        ): AsyncProgram<I & { [_ in OK]: OT }, E> {
            return asyncProgram(steps.concat({key: outputKey, fun: fun}))
        },
        yield<T>(fun: (i: I) => T): Promise<Result<T, E>> {
            return evaluateAsync(this, fun);
        }
    }
}
async function evaluateAsync<I, T, E>(
    program: AsyncProgram<I, E>,
    mapFunction: (i: I) => T
): Promise<Result<T, E>> {
    const head = program.steps[0]

    const headMonad = await head.fun({})
    let input = headMonad.map((value) => ({[head.key]: value}))

    const tail = program.steps.slice(1)

    for (const step of tail) {
        const result = await input.flatMapAsync((i) => step.fun(i))
        input = input.flatMap((i) => result.map((v) => ({...i, ...{[step.key]: v}})))
    }

    return input.map(mapFunction);
}

export namespace AsyncFor {
    export function _<K extends string, T, E>(
        key: K,
        flatMapFunction: AsyncFlatMap<Record<never, never>, T, E>
    ): AsyncProgram<{ [_ in K]: T }, E> {
        return asyncProgram([{key: key, fun: flatMapFunction}])
    }
}
import {Result} from "../monad/result"

export type AsyncFlatMap<I, O, E> = (a: I) => Result<O, E> | Promise<Result<O, E>>

type PartialAsyncFlatMap<I, IK extends keyof I, O, E> = AsyncFlatMap<Pick<I, IK>, O, E>

type FullInputAsyncStep = {
    outputKey: string,
    fun: AsyncFlatMap<any, any, any>
}

type PartialInputAsyncStep = FullInputAsyncStep & { inputKeys: string[] }

export type AsyncStep = FullInputAsyncStep | PartialInputAsyncStep

export type AsyncProgram<I extends Record<string, any>, E> = {
    steps: AsyncStep[]
    fm<OK extends string, O>(
        outputKey: I extends { [_ in OK]: O } ? never : OK,
        fun: AsyncFlatMap<I, O, E>
    ): AsyncProgram<I & { [_ in OK]: O }, E>
    fmp<OK extends string, IK extends (keyof I)[] & string[], O>(
        outputKey: I extends { [_ in OK]: O } ? never : OK,
        inputKeys: IK,
        fun: PartialAsyncFlatMap<I, typeof inputKeys[number], O, E>
    ): AsyncProgram<I & { [_ in OK]: O }, E>
    yield<T>(fun: (i: I) => T): Promise<Result<T, E>>
}

export function asyncProgram<I, E>(steps: AsyncStep[]): AsyncProgram<I, E> {
    return {
        steps: steps,
        fm<OK extends string, O>(
            outputKey: I extends { [_ in OK]: O } ? never : OK,
            fun: AsyncFlatMap<I, O, E>
        ): AsyncProgram<I & { [_ in OK]: O }, E> {
            return asyncProgram(steps.concat({outputKey: outputKey, fun: fun}))
        },
        fmp<OK extends string, IK extends (keyof I)[] & string[], O>(
            outputKey: I extends { [_ in OK]: O } ? never : OK,
            inputKeys: IK,
            fun: PartialAsyncFlatMap<I, typeof inputKeys[number], O, E>
        ): AsyncProgram<I & { [_ in OK]: O }, E> {
            return asyncProgram(steps.concat({inputKeys: inputKeys, outputKey: outputKey, fun: fun}))
        },
        yield<T>(fun: (i: I) => T): Promise<Result<T, E>> {
            return yieldAsync(this, fun)
        }
    }
}
async function yieldAsync<I, T, E>(
    program: AsyncProgram<I, E>,
    fun: (i: I) => T
): Promise<Result<T, E>> {
    const head = program.steps[0]

    const headMonad = await head.fun({})
    let input = headMonad.map((value) => ({[head.outputKey]: value}))

    const tail = program.steps.slice(1)

    for (const step of tail) {
        const result = await input.flatMapAsync((i) => step.fun(i))
        input = input.flatMap((i) => result.map((v) => ({...i, ...{[step.outputKey]: v}})))
    }

    return input.map(fun)
}
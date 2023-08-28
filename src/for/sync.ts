import {Result} from "../monad/result"

export type SyncFlatMap<I, O, E> = (a: I) => Result<O, E>

type SyncStep = {
    key: string,
    fun: SyncFlatMap<any, any, any>
}

export type SyncProgram<I extends Record<string, any>, E> = {
    steps: SyncStep[]
    fm<OK extends string, O>(
        outputKey: I extends { [_ in OK]: O } ? never : OK,
        fun: SyncFlatMap<I, O, E>
    ): SyncProgram<I & { [_ in OK]: O }, E>,
    yield<T>(fun: (i: I) => T): Result<T, E>
}

export function syncProgram<I, E>(steps: SyncStep[]): SyncProgram<I, E> {
    return {
        steps: steps,
        fm<OK extends string, O>(
            outputKey: I extends { [_ in OK]: O } ? never : OK,
            fun: SyncFlatMap<I, O, E>
        ): SyncProgram<I & { [_ in OK]: O }, E> {
            return syncProgram(steps.concat({key: outputKey, fun: fun}))
        },
        yield<T>(fun: (i: I) => T): Result<T, E> {
            return yieldSync(this, fun)
        }
    }
}

function yieldSync<I, T, E>(
    program: SyncProgram<I, E>,
    fun: (i: I) => T
): Result<T, E> {
    const head = program.steps[0]

    const headMonad = head.fun({})
    let input = headMonad.map((value) => ({[head.key]: value}))

    const tail = program.steps.slice(1)

    for (const step of tail) {
        const result = input.flatMap((i) => step.fun(i))
        input = input.flatMap((i) => result.map((v) => ({...i, ...{[step.key]: v}})))
    }

    return input.map(fun)
}
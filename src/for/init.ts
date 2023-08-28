import {SyncFlatMap, SyncProgram, syncProgram} from "./sync"
import {AsyncFlatMap, AsyncProgram, asyncProgram} from "./async"

export namespace For {
    export function result<E>() {
        return {
            sync<K extends string, T>(
                key: K,
                supplier: SyncFlatMap<Record<never, never>, T, E>
            ): SyncProgram<{ [_ in K]: T }, E> {
                return syncProgram([{key: key, fun: supplier}])
            },
            async<K extends string, T>(
                key: K,
                supplier: AsyncFlatMap<Record<never, never>, T, E>
            ): AsyncProgram<{ [_ in K]: T }, E> {
                return asyncProgram([{outputKey: key, fun: supplier}])
            }
        }
    }


}
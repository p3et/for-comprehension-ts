import {failure, isFailure, isSuccess, Result, success} from "./result"
import {For} from "../for/common";

test('should concat sync and async strings', async () => {
    const result = await For
        .result<string>()
        .async("a", () => success("foo"))
        .fm("b", async () => success("bar"))
        .fm("c", () => success("baz"))
        .yield(({a, b, c}) => a + b + c)

    if (isSuccess(result)) expect(result.value).toBe("foobarbaz")
    else fail()
})

test('should be failure and skip subsequent code', async () => {
    let executed: boolean = false

    const result: Result<string, string> = await For
        .result<string>()
        .async("a", () => success("foo"))
        .fm("b", async () => failure("Oops!"))
        .fm("c", () => {
            executed = true
            return success("baz")
        })
        .yield(({a, b}) => a + b)

    if (isFailure(result)) {
        expect(executed).toBe(false)
        expect(result.error).toBe("Oops!")
    } else fail()
})

test('should allow for intermediate combinations', async () => {
    const result = await For
        .result<string>()
        .async("a", () => success("foo"))
        .fm("b", async ({a}) => success([a, "bar"]))
        .fm("c", () => success("baz"))
        .yield(({b, c}) => b.concat(c))

    if (isSuccess(result)) expect(result.value).toEqual(["foo", "bar", "baz"])
    else fail()
})
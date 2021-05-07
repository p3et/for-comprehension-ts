import {For} from "./for";
import {failure, isFailure, isSuccess, success} from "./result";

test('should be success 7', async done =>
    For._("a", success<string, number>(1))
       ._("b", () => success("two"))
       ._("c", () => Promise.resolve(3))
       ._("d", ({a, c}) => Promise.resolve(success([c, a])))
       .yield(({a, b, c, d}) => (a + b.length + c) * d.sort()[0])
       .then(result => {
           if (isSuccess(result)) expect(result.value).toBe(7);
           else fail();
       })
       .then(() => done())
)

test('should be failure', async done =>
    For._("a", success<string, number>(1))
       ._("b", () => failure<string, string>("Ooops!"))
       ._("c", () => Promise.resolve(3))
       ._("d", ({a, c}) => Promise.resolve(success([c, a])))
        // @ts-ignore
       .yield(({a, b, c, d}) => (a + b.length + c) * d.sort()[0])
       .then(result => {
           if (isFailure(result)) expect(result.error).toBe("Ooops!");
           else fail();
       })
       .then(() => done())
)

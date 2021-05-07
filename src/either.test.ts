import {For} from "./for";
import {isLeft, isRight, Left, Right, unwrapError} from "./either";

test('should be some 7', async done =>
    For._("a", Right.of<string, number>(1))
       ._("b", () => Right.of("two"))
       ._("c", () => Promise.resolve(3))
       ._("d", ({a, c}) => Promise.resolve(Right.of([c, a])))
       .yield(({a, b, c, d}) => (a + b.length + c) * d.sort()[0])
       .then(either => {
           expect(isRight(either)).toBe(true);
           expect(either.unwrap()).toBe(7);
       })
       .then(() => done())
)

test('should be none', async done =>
    For._("a", Right.of<string, number>(1))
       ._("b", () => Left.of<string, string>("Ooops!"))
       ._("c", () => Promise.resolve(3))
       ._("d", ({a, c}) => Promise.resolve(Right.of([c, a])))
       .yield(({a, b, c, d}) => (a + b.length + c) * d.sort()[0])
       .then(either => {
           expect(isLeft(either)).toBe(true);
           expect(unwrapError(either)).toBe("Ooops!");
       })
       .then(() => done())
)

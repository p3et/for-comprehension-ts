import {Monad, ReplaceFirst} from "./common";
import {Result, success} from "./result";

test('paramter should be replaced ', async () => {

    const m  = success<string, number>("foo").map((x) => x == "");

    let n: [boolean, number];

    let npivot : ReplaceFirst<typeof n, string>;






})
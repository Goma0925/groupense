import { renderRecoilValues } from "./utils/helpers"

describe("Utilility test", ()=>{
    test(renderRecoilValues.name+" should render the passed values of all data types from getValueHook.", async()=>{
        const obj = {name: "obj1", value: "value1"};
        const arr = ["item1", "item2", 1, true];
        const [str, num, bool] = ["string", 1, true];
        const undefinedVal = undefined;
        const nullVal = null;

        const expectedResults = [obj, arr, str, num, bool, undefinedVal, nullVal];
        const renderedResults = await renderRecoilValues(()=>{
            return [obj, arr, str, num, bool, undefinedVal, nullVal];
        })
        expectedResults.map((expectedVal, i)=>{
            expect(renderedResults[i]).toEqual(expectedVal);
        })
    })
})
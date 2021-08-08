import { renderRecoilValues } from "./utils/helpers"

describe("Utilility test", ()=>{
    test(renderRecoilValues.name+" should render the passed values", async()=>{
        const obj = {name: "obj1", value: "value1"};
        const arr = ["item1", "item2"];
        const string = "string";
        const [renderedObj, renderedArr, renderedString] = await renderRecoilValues(()=>{
            return [obj, arr, string];
        })
        expect(renderedObj).toEqual(obj);
        expect(renderedArr).toEqual(arr);
        console.log("string:", renderedString)
        expect(renderedString).toEqual(string);
    })
})
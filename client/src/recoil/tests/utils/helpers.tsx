import { act, render, RenderResult, cleanup } from "@testing-library/react";
import { ReactNode } from "react";
import { RecoilRoot, RecoilState, RecoilValue, useRecoilValue } from "recoil";
import EntryService from "../../modules/EntryService";

async function renderWithAwait(targetJSX: ReactNode){
    let renderResult: RenderResult | undefined;
    await act(async()=>{
        cleanup();
        renderResult = render(<>{targetJSX}</>);
    })
    if (!renderResult) {throw new Error("render() failed to render the component.");}
    return renderResult;
}

export async function renderRecoilValues<T, ReadOnlyArray extends readonly T[]>(getValueHook: ()=>ReadOnlyArray)
    :Promise<ReadOnlyArray> {
    // Run the getValueHook in RecoilRoot
    let valueCount=0;
    const TestComponent = ()=>{
        const values = getValueHook();
        valueCount = values.length;
        return (<>
                {values.map((value, i)=>{
                    return <div title={i.toString()} key={i}>{JSON.stringify(value)}</div>
                })}
                </>);
    }
    // Retrieve the resulting values from the rendered component.
    const {getByTitle} = await renderWithAwait(<RecoilRoot><TestComponent/></RecoilRoot>);
    const items = [...Array(valueCount)].map((_, i) => {
        const JSONContent = getByTitle(i).textContent;
        const obj = JSON.parse(JSONContent? JSONContent: '{"error": "No value found"}');
        return obj;
    });
    // Return the array of RecoilValues 
    return items as unknown as ReadOnlyArray;
}

export async function getByTitleAsJson<ReturnObjType>(title: string, targetJSX: ReactNode): Promise<ReturnObjType> {
    // A helper to render the targetJSX and extract the content of the specified tag by its title.
    // The resulting text content is converted to JSON before returning..
    const {getByTitle} = await renderWithAwait(targetJSX);
    const JSONContent = getByTitle(title).textContent;
    const parsedObj = JSON.parse(JSONContent? JSONContent: "") as ReturnObjType;
    return parsedObj;
}

export async function getByTitlesAsJson<ReturnArrayType extends Array<any>>(titles: string[], targetJSX: ReactNode): Promise<ReturnArrayType> {
    // A helper to render the targetJSX and extract the content of the specified tag by its title.
    // Return all the items specified by the titles as JSON.
    // e.g:
    // const [nameObj, ageObj] = await getByTitlesAsJson<[{name: string}, {age: number}]>(["name", "age"], 
    // <>
    //     <div title="name">{{name: "name1"}}</div>
    //     <div title="age">{{age: 1}}</div>
    // </>)
    const {getByTitle} = await renderWithAwait(targetJSX);
    const items = titles.map(title => {
        const JSONContent = getByTitle(title).textContent;
        return JSON.parse(JSONContent? JSONContent: "");
    });
    return items as ReturnArrayType;
}


export async function getByTitle(title: string, targetJSX: ReactNode): Promise<string | null> {
    const {getByTitle} = await renderWithAwait(targetJSX);
    return getByTitle(title).textContent;
}
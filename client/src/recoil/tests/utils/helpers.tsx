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
    // Run the getValueHook in RecoilRoot-wrapped component.
    let valueCount=0;
    const TestComponent = ()=>{
        const values = getValueHook();
        valueCount = values.length;
        // Strigify objects as json, otherwise, convert to a string to parse it later.
        const stringifiedVals = values.map((val)=>{
            if (val === undefined){return "undefined"}
            else if (val === null){return "null"}
            else{return JSON.stringify(val)};
        })
        return (<>
                {stringifiedVals.map((val, i)=>{
                    return <div title={i.toString()} key={i}>{val}</div>
                })}
                </>);
    }
    // Retrieve the resulting values from the rendered component.
    const {getByTitle} = await renderWithAwait(<RecoilRoot><TestComponent/></RecoilRoot>);
    const items = [...Array(valueCount)].map((_, i) => {
        const JSONContent = getByTitle(i).textContent;
        if (JSONContent == null){throw "Error occured while rendering Recoil values."};
        if (JSONContent == "undefined"){return undefined}
        else if (JSONContent == "null"){return null}
        else{return JSON.parse(JSONContent)};
    });
    // Return the array of RecoilValues 
    return items as unknown as ReadOnlyArray;
}

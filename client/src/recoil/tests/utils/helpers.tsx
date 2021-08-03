import { act, render, RenderResult, cleanup } from "@testing-library/react";
import { ReactNode } from "react";
import { RecoilRoot } from "recoil";


export async function getByTitleAsJson<ReturnObjType>(title: string, targetJSX: ReactNode): Promise<ReturnObjType> {
    // A helper to render the targetJSX and extract the content of the specified tag by its title.
    // The resulting text content is converted to JSON before returning..
    let renderResult: RenderResult | undefined;
    await act(async()=>{
        cleanup();
        renderResult = render(<>{targetJSX}</>);
    })
    if (!renderResult) {throw new Error("render() failed to render the component.");}
    const {getByTitle} = renderResult;
    const JSONContent = getByTitle(title).textContent;
    const parsedObj = JSON.parse(JSONContent? JSONContent: "") as ReturnObjType;
    return parsedObj;
}

export async function getByTitle(title: string, targetJSX: ReactNode): Promise<string | null> {
    let renderResult: RenderResult | undefined;
    await act(async()=>{
        cleanup();
        renderResult = render(<>{targetJSX}</>);
    })
    if (!renderResult) {throw new Error("render() failed to render the component.");}
    const {getByTitle} = renderResult;
    console.log("get:", getByTitle(title))
    return getByTitle(title).textContent;
}
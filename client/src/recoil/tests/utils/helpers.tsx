import { act, render, RenderResult, cleanup } from "@testing-library/react";
import { ReactNode } from "react";
import { RecoilRoot } from "recoil";


export async function getByTitleAsJson<ReturnObjType>(title: string, targetJSX: ReactNode): Promise<ReturnObjType> {
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
import { atom, RecoilState, RecoilValueReadOnly, selector } from "recoil";

const textState:RecoilState<string> = atom({
    key: "textState",
    default: "",
});
export default textState;

export const charCounterState: RecoilValueReadOnly<number> = selector({
    key: "charCounterState",
    get: ({get}) => {
        const text = get(textState);
        return text.length;
    }
})


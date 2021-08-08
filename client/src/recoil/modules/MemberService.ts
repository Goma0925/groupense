import { atom, atomFamily, RecoilState, RecoilValueReadOnly, selector } from "recoil";
import { Member } from "../models";

const states = {
    membersById: atomFamily({
        key: "membersById",
        default: {} as Member
    }),
    memberIds: atom({
        key: "memberIds",
        default: [] as string[]
    })
}

const hooks = {

} 

export default {
    states: states,
    hooks: hooks,
}
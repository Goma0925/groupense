import axios, { AxiosResponse } from "axios";
import { atom, atomFamily, RecoilState, RecoilValueReadOnly, selector, selectorFamily, useRecoilCallback } from "recoil";
import { Transaction } from "../models";

const states = {
    transactionsByCompoundId: atomFamily({
        key: "transactionByIds",
        default: (keys: {memberId: string, entryId: string}) => {return {} as Transaction}
    }),

    transactionCompoundIds: atom({
        key: "transactionCompoundIds",
        default: [] as {memberId: string, entryId: string}[]
    })
}

const hooks = {
    useFetchTransactions: ()=>{
        const fetchTransactions = useRecoilCallback(
            ({snapshot, gotoSnapshot})=>(
                boardId: string,
                entryId: string
            )=>{
                axios.get("/boards/"+boardId+"/entries/"+entryId+"/transactions")
                    .then(((res:AxiosResponse<Transaction>)=>{
                        const transactionCompoundIds = snapshot.getLoadable(states.transactionCompoundIds).getValue();
                        const newSnapshot = snapshot.map(({set})=>{
                            const compoundId = {
                                memberId: res.data.member_id,
                                entryId: res.data.entry_id,
                            };
                            set(states.transactionsByCompoundId(compoundId), res.data);
                            set(states.transactionCompoundIds, [...transactionCompoundIds, ...[compoundId]]);
                        })
                        gotoSnapshot(newSnapshot);
                    })).catch((err)=>{throw err});
            });
        return fetchTransactions
    }
} 

export default {
    states: states,
    hooks: hooks,
}
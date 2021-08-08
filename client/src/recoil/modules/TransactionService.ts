import axios, { AxiosResponse } from "axios";
import { atom, atomFamily, RecoilState, RecoilValueReadOnly, selector, selectorFamily, useRecoilCallback } from "recoil";
import { Transaction } from "../models";

type TransactionCompoundKey = {memberId: string, entryId: string};
const states = {
    transactionsByKey: atomFamily({
        key: "transactionByIds",
        default: (keys: TransactionCompoundKey) => {return {} as Transaction}
    }),

    transactionKeys: atom({
        key: "transactionCompoundIds",
        default: [] as TransactionCompoundKey[]
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
                        const transactionKeys = snapshot.getLoadable(states.transactionKeys).getValue();
                        const newSnapshot = snapshot.map(({set})=>{
                            const compoundKey = {
                                memberId: res.data.member_id,
                                entryId: res.data.entry_id,
                            };
                            set(states.transactionsByKey(compoundKey), res.data);
                            set(states.transactionKeys, [...transactionKeys, ...[compoundKey]]);
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
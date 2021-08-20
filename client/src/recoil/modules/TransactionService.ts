import axios, { AxiosResponse } from "axios";
import { atom, atomFamily, RecoilState, RecoilValueReadOnly, selector, selectorFamily, useRecoilCallback } from "recoil";
import { Transaction } from "../models";

type TransactionCompoundKey = {memberId: string, entryId: string};
const states = {
    transactionsByKey: atomFamily({
        key: "transactionByIds",
        default: (key: TransactionCompoundKey) => {return {} as Transaction}
    }),

    transactionKeys: atom({
        key: "transactionKeys",
        default: [] as TransactionCompoundKey[]
    })
}

const hooks = {
    useFetchTransactions: ()=>{
        const fetchTransactions = useRecoilCallback(
            ({set})=>(
                boardId: string,
                entryId: string
            )=>{
                axios.get("/boards/"+boardId+"/entries/"+entryId+"/transactions")
                    .then(((res:AxiosResponse<Transaction[]>)=>{
                        const keys: TransactionCompoundKey[] = [];
                        res.data.map((transaction)=>{
                            const compoundKey = {
                                memberId: transaction.member_id,
                                entryId: transaction.entry_id,
                            };
                            set(states.transactionsByKey(compoundKey), transaction);
                            keys.push(compoundKey);
                        })
                        set(states.transactionKeys, (prevKeys)=>[...prevKeys, ...keys]);
                    })).catch((err)=>{throw err});
            });
        return fetchTransactions
    },

    useUpdateTransaction: ()=>{
        const updateTransaction = useRecoilCallback(
            ({set})=>(
                boardId: string,
                entryId: string, memberId: string, 
                payload: Omit<Transaction, "id"|"entry_id"|"member_id">
            )=>{
                axios.put(`/boards/${boardId}/entries/${entryId}/members/${memberId}/transactions`, payload)
                    .then(((res:AxiosResponse<Transaction>)=>{
                        const compoundKey = {
                            memberId: memberId,
                            entryId: entryId,
                        };
                        console.log("updated res:", res.data);
                        set(states.transactionsByKey(compoundKey), res.data);
                    })).catch((err)=>{throw err});
            }
        )
        return updateTransaction;
    },
} 

export default {
    states: states,
    hooks: hooks,
}
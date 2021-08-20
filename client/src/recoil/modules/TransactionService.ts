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

    useCreateTransaction: ()=>{
        const createTransaction = useRecoilCallback(
            ({set}) => (
                boardId: string,
                payload: Omit<Transaction, "id">
            )=>{
                axios.post("/boards/"+boardId+"/entries/"+payload.entry_id+"/transactions", payload)
                    .then(((res:AxiosResponse<Transaction>)=>{
                        const compoundKey = {
                            memberId: payload.member_id,
                            entryId: payload.entry_id,
                        };
                        set(states.transactionsByKey(compoundKey), res.data);
                        set(states.transactionKeys, (prevKeys)=>[...prevKeys, compoundKey]);
                    })).catch((err)=>{throw err});
            }   
        )
        return createTransaction;
    },

    useUpdateTransaction: ()=>{
        const updateTransaction = useRecoilCallback(
            ({set})=>(
                transactionId: string,
                boardId: string, entryId: string, 
                payload: Omit<Transaction, "id"|"entry_id"|"member_id">
            )=>{
                axios.put("/boards/"+boardId+"/entries/"+entryId+"/transactions/"+transactionId, payload)
                    .then(((res:AxiosResponse<Transaction>)=>{
                        const compoundKey = {
                            memberId: res.data.member_id,
                            entryId: res.data.entry_id,
                        };
                        set(states.transactionsByKey(compoundKey), res.data);
                    })).catch((err)=>{throw err});
            }
        )
        return updateTransaction;
    },

    useDeleteTransaction: ()=>{
        const deleteTransaction = useRecoilCallback(
            ({set, reset})=>(
                transactionId: string,
                boardId: string, entryId: string, 
            )=>{
                axios.put("")
            }
        )
        return deleteTransaction;
    }
} 

export default {
    states: states,
    hooks: hooks,
}
import { useEffect, useState } from "react";
import { Transaction } from "../models";
import BoardService from "../modules/BoardService";
import { RecoilRoot,useRecoilState,useRecoilValue } from "recoil";
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { renderRecoilValues } from "./utils/helpers";
import TransactionService from "../modules/TransactionService";

let mockTransactions: Transaction[];
let mockAPI: MockAdapter;


beforeAll(() => {
    mockTransactions = [
        {id: "1", entry_id:"1", member_id: "1", amount: 10},
        {id: "3", entry_id:"1", member_id: "2", amount: 10},
        {id: "2", entry_id:"1", member_id: "3", amount: 10},
    ]
    mockAPI = new MockAdapter(axios);
});

beforeEach(()=>{
    mockAPI.reset();
})

describe("TransactionService hook tests", ()=>{
    test(TransactionService.hooks.useFetchTransactions.name+" should fetch transactions into atoms",
        async()=>{
            const [boardId, entryId] = ["1", "1"];
            mockAPI.onGet(`boards/${boardId}/entries/${entryId}/transactions`).reply(200, mockTransactions);
            const [transactions, transactionKeys] = await renderRecoilValues(()=>{
                const fetchTransactions = TransactionService.hooks.useFetchTransactions();
                const transactionKeys = useRecoilValue(TransactionService.states.transactionKeys);
                const transactions = mockTransactions.map((transaction)=>{
                    return useRecoilValue(TransactionService.states.transactionsByKey({
                        entryId: transaction.entry_id,
                        memberId: transaction.member_id
                    }))
                });
                useEffect(()=>{
                    fetchTransactions("1", "1");
                }, []);
                return [transactions, transactionKeys];
            })
            expect(transactions.length).toBe(3);
            expect(transactionKeys).toEqual(mockTransactions.map(transaction=>{
                return {
                    entryId: transaction.entry_id,
                    memberId: transaction.member_id
                }
            }));
        }
    );
})

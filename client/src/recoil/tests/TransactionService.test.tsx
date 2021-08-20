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

    test(TransactionService.hooks.useUpdateTransaction.name+" should update transaction data in atoms.",
        async()=>{
            const boardId = "1";
            const originalTransaction: Transaction = {
                id: "1",
                entry_id: "1",
                member_id: "1",
                amount: 1000
            }
            const updatedTransaction: Transaction = {
                "id": "1",
                "entry_id": "1",
                "member_id": "1",
                "amount": 500
            }
            mockAPI.onPut(`/boards/${boardId}/entries/${originalTransaction.entry_id}/members/${originalTransaction.member_id}/transactions`)
                    .reply(200, updatedTransaction);
            const [transaction, transactionKeys] = await renderRecoilValues(()=>{
                const updateTransaction = TransactionService.hooks.useUpdateTransaction();
                const [transactionKeys, setTransactionKeys] = useRecoilState(TransactionService.states.transactionKeys);
                const [transaction, setTransaction] = 
                    useRecoilState(TransactionService.states.transactionsByKey({
                        entryId: originalTransaction.entry_id,
                        memberId: originalTransaction.member_id
                    }))
                const [doneSetup, setDoneSetup] = useState(false);
                useEffect(()=>{
                    // Setup atoms before testing updateTransaction()
                    setTransaction(originalTransaction);
                    setTransactionKeys([{
                        memberId: originalTransaction.member_id, 
                        entryId: originalTransaction.entry_id
                    }]);
                    setDoneSetup(true);
                }, [])
                useEffect(()=>{
                    if (doneSetup){
                        updateTransaction(
                            boardId,
                            originalTransaction.entry_id,
                            originalTransaction.member_id,
                            {amount: 500}
                        )
                    }
                }, [doneSetup])
                return [transaction, transactionKeys];
            });
            expect(transaction).toEqual(updatedTransaction);
            expect(transactionKeys).toEqual([{
                entryId: updatedTransaction.entry_id,
                memberId: updatedTransaction.member_id
            }]);
        }
    )
})

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
    test.todo(TransactionService.hooks.useFetchTransactions.name+" should fetch transactions into atoms");
})

import { useEffect } from "react";
import { Board } from "../models";
import BoardService from "../modules/BoardService";
import { RecoilRoot,useRecoilValue } from "recoil";
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getByTitleAsJson } from "./utils/helpers";
import { renderRecoilHook } from "react-recoil-hooks-testing-library";

let boards: Board[];
let mockAPI: MockAdapter

beforeAll(() => {
    boards = [
        {id: "1", name: "Board 1"},
        {id: "3", name: "Board 3"},
        {id: "2", name: "Board 2"},
    ]
    mockAPI = new MockAdapter(axios);
})

beforeEach(() => {
})

describe("BoardService hook tests",()=>{
    test(BoardService.hooks.useFetchAllBoards.name + ' hook should fetch all boards into ' + BoardService.states.allBoardsById.key
        + " and " + BoardService.states.sortedBoards.key, async () => {
        
        mockAPI.onGet("/boards").reply(200, boards);

        function TestComponent(){
            const sortedBoards = useRecoilValue(BoardService.states.sortedBoards);
            const allBoardsById = useRecoilValue(BoardService.states.allBoardsById);
            const fetchAllBoards = BoardService.hooks.useFetchAllBoards();

            useEffect(() => {
                fetchAllBoards();
            }, []);
            return (
            // Render the data from allBoardsByIdState and sortedBoardState
            <div>
                <div title="allBoardsByIdJSON">{JSON.stringify(allBoardsById)}</div>
                <div title="sortedBoardsByJSON">{JSON.stringify(sortedBoards)}</div>
            </div>);
        }

        // Check if allBoardsById state is updated.
        const allBoardsById = await getByTitleAsJson<{[id: string]: Board}>("allBoardsByIdJSON", <RecoilRoot><TestComponent/></RecoilRoot>)
        boards.map((originalBoard) => {
            // Make sure all the original board retrieved from API is stored in allBoardsById state.
            expect(allBoardsById[originalBoard.id]).toEqual(originalBoard);
        });

        // Check if sortedBoards state is properly working.
        const expectedSortedBoards = [...boards].sort((a, b)=>{
            return a.id.localeCompare(b.id);
        })
        // Check if the sortedBoards were rendered in the correct order (ascending by ID))
        const renderedSortedBoards = await getByTitleAsJson<Board[]>("sortedBoardsByJSON", <RecoilRoot><TestComponent/></RecoilRoot>)
        expect(expectedSortedBoards).toEqual(renderedSortedBoards);
    });

    test(BoardService.hooks.useUpdateBoard.name + " hook should update the board specified by ID", async ()=>{
        const targetBoardId = "1";
        const updatePayload: Omit<Board, "id"> = {name: "New name"};
        const expectedBoardAfterUpdate: Board = {id: targetBoardId, ...updatePayload};

        // Mock update endpoint response.
        mockAPI.onPut("/boards/"+targetBoardId).reply(200, expectedBoardAfterUpdate);

        function TestComponent(){
            const updateBoard = BoardService.hooks.useUpdateBoard();
            const allBoardsById = useRecoilValue(BoardService.states.allBoardsById);
            const targetBoard = allBoardsById[targetBoardId];
            useEffect(()=>{
                updateBoard(targetBoardId, updatePayload);
            }, []);
            
            // Render each attribute of Board to see if it is updated properly.
            const targetBoardJSON = JSON.stringify(targetBoard);
            return (
                <div title="updatedBoard">{targetBoardJSON}</div>
            )
        }

        // Check if the target board is updated.
        const updatedBoard = await getByTitleAsJson<Board>("updatedBoard", <RecoilRoot><TestComponent/></RecoilRoot>)
        expect(updatedBoard).toEqual(expectedBoardAfterUpdate);
    });
})
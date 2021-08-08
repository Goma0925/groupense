import { useEffect, useState } from "react";
import { Board } from "../models";
import BoardService from "../modules/BoardService";
import { RecoilRoot,useRecoilState,useRecoilValue } from "recoil";
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getByTitleAsJson, renderRecoilValues } from "./utils/helpers";

let mockBoards: Board[];
let mockAPI: MockAdapter

beforeAll(() => {
    mockBoards = [
        {id: "1", name: "Board 1"},
        {id: "3", name: "Board 3"},
        {id: "2", name: "Board 2"},
    ]
    mockAPI = new MockAdapter(axios);
});

beforeEach(()=>{
    mockAPI.reset();
})

describe("BoardService hook tests",()=>{
    test(BoardService.hooks.useFetchAllBoards.name + ' hook should fetch all boards into ' + BoardService.states.boardsById.key
        + " and " + BoardService.states.sortedBoards.key + ".", async () => {
        
        mockAPI.onGet("/boards").reply(200, mockBoards);

        const [boardsById, sortedBoards, boardPreviewReady] = await renderRecoilValues(()=>{
            const sortedBoards = useRecoilValue(BoardService.states.sortedBoards);
            const boardsById = useRecoilValue(BoardService.states.boardsById);
            const boardPreviewReady = useRecoilValue(BoardService.states.boardPreviewReady);
            const fetchAllBoards = BoardService.hooks.useFetchAllBoards();

            useEffect(() => {
                fetchAllBoards();
            }, []);

            return [boardsById, sortedBoards, boardPreviewReady];
        });

        // Check if boardsById state is updated.
        mockBoards.map((expectedBoard) => {
            // Make sure all the original board retrieved from API is stored in boardsById state.
            expect(boardsById[expectedBoard.id]).toEqual(expectedBoard);
        });

        // Sort the mock board data to check if sortedBoards state is properly working.
        const expectedSortedBoards = [...mockBoards].sort((a, b)=>{
            return a.id.localeCompare(b.id);
        })
        // Check if the sortedBoards were rendered in the correct order (ascending by ID))
        expect(sortedBoards).toEqual(expectedSortedBoards);
        // Check if the boardPreviewReady state is true after all the board info is loaded.
        expect(boardPreviewReady).toBe(true);
    });

    test(BoardService.hooks.useCreateboard.name + ' hook should create a new board and store it in '
        + BoardService.states.boardsById.key + ".", async () => {
        const newBoard1: Board = {id: "1", name: "Board 1"};
        const newBoard2: Board = {id: "2", name: "Board 2"};

        mockAPI.onPost("/boards").reply(200, newBoard1)
                .onPost("/boards").reply(200, newBoard2);

        const [renderedBoard1, renderedBoard2] = await renderRecoilValues(()=>{
            const createBoard = BoardService.hooks.useCreateboard();
            const boardsById = useRecoilValue(BoardService.states.boardsById);
            const board1 = boardsById[newBoard1.id]??{msg: "No board of ID '"+newBoard1.id+"' found."}; //Convert undefined to {}
            const board2 =  boardsById[newBoard2.id]??{msg: "No board of ID '"+newBoard2.id+"' found."}; //Convert undefined to {}
            useEffect(()=>{
                createBoard({name: newBoard1.name});
            }, [])
            return [board1, board2];
        });
        // Check if the board was created.
        expect(renderedBoard1).toEqual(newBoard1);
        expect(renderedBoard2).toEqual(newBoard2);
    })

    test(BoardService.hooks.useUpdateBoard.name + " hook should update the board specified by ID and reflect in "
        + BoardService.states.boardsById.key + ".", async ()=>{
        const targetBoardId = "1";
        const updatePayload: Omit<Board, "id"> = {name: "New name"};
        const expectedBoardAfterUpdate: Board = {id: targetBoardId, ...updatePayload};

        // Mock update endpoint response.
        mockAPI.onPut("/boards/"+targetBoardId).reply(200, expectedBoardAfterUpdate);

        function TestComponent(){
            const updateBoard = BoardService.hooks.useUpdateBoard();
            const boardsById = useRecoilValue(BoardService.states.boardsById);
            const targetBoard = boardsById[targetBoardId];
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

    test(BoardService.hooks.useDeleteBoard.name + " hook should delete the board specified by ID and reflect in "
        + BoardService.states.boardsById.key + ".", async ()=>{
        // Create mock data
        const boardToDelete: Board = {id: "1", name: "Board to delete"};
        const boardToKeep: Board = {id: "2", name: "Board to keep"};
        mockAPI.onDelete("/boards/"+boardToDelete.id).reply(200);

        function TestComponent(){
            const [boardsById, setboardsById] = useRecoilState(BoardService.states.boardsById);
            const [testBoardReady, setTestBoardReady] = useState(false);
            const deleteBoard = BoardService.hooks.useDeleteBoard();
            
            useEffect(()=>{
                // Create two test boards in boardsById state.
                const newboardsById: {[boardId: string]: Board} = {
                    [boardToDelete.id]: boardToDelete,
                    [boardToKeep.id]: boardToKeep
                };
                setboardsById(newboardsById);
                setTestBoardReady(true);
            }, []);

            useEffect(()=>{
                if (testBoardReady){
                    // Now test the hook: Delete only one test board.
                    deleteBoard(boardToDelete.id);
                }
            }, [testBoardReady]);

            return (
                <div title="boardsById">{JSON.stringify(boardsById)}</div>
            )
        }

        // Check if the first test board was deleted.
        const boardsById = await getByTitleAsJson<{[boardId: string]: Board}>("boardsById", <RecoilRoot><TestComponent/></RecoilRoot>);
        expect(boardsById).toEqual({
            [boardToKeep.id]: boardToKeep
        });
        expect(boardsById[boardToDelete.id]).toBeUndefined();
    })

})
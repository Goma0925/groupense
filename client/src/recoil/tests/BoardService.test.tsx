import { useEffect, useState } from "react";
import { Board } from "../models";
import BoardService from "../modules/BoardService";
import { RecoilRoot,useRecoilState,useRecoilValue } from "recoil";
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { renderRecoilValues } from "./utils/helpers";

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
    test(BoardService.hooks.useFetchAllBoards.name + ' hook should fetch all boards into ' + BoardService.states.boardsById.name
        + " and " + BoardService.states.boardIds.key + ".", async () => {
        
        mockAPI.onGet("/boards").reply(200, mockBoards);

        const [boards, boardIds, boardPreviewReady] = await renderRecoilValues(()=>{
            const boardIds = useRecoilValue(BoardService.states.boardIds);
            const boards = mockBoards.map((mockBoard)=>{
                return useRecoilValue(BoardService.states.boardsById(mockBoard.id));
            })
            const boardPreviewReady = useRecoilValue(BoardService.states.boardPreviewReady);
            const fetchAllBoards = BoardService.hooks.useFetchAllBoards();
            useEffect(() => {
                fetchAllBoards();
            }, []);
            return [boards, boardIds, boardPreviewReady];
        });

        // Check if boardsById state is updated.
        expect(boards).toEqual(mockBoards);
        // Sort the mock board data to check if sortedBoards state is properly working.
        expect(boardIds).toEqual(mockBoards.map(board=>board.id));
        // Check if the boardPreviewReady state is true after all the board info is loaded.
        expect(boardPreviewReady).toBe(true);
    });

    test(BoardService.hooks.useCreateboard.name + ' hook should create a new board and store it in '
        + BoardService.states.boardsById.name + ".", async () => {
        const newBoard1: Board = {id: "1", name: "Board 1"};
        const newBoard2: Board = {id: "2", name: "Board 2"};
        const newBoards = [newBoard1, newBoard2];

        mockAPI.onPost("/boards").replyOnce(200, newBoard1)
                .onPost("/boards").replyOnce(200, newBoard2);

        const [boards, boardIds] = await renderRecoilValues(()=>{
            const createBoard = BoardService.hooks.useCreateboard();
            const boardIds = useRecoilValue(BoardService.states.boardIds);
            const boards = newBoards.map((board)=>{
                return useRecoilValue(BoardService.states.boardsById(board.id));
            })
            useEffect(()=>{
                createBoard({name: newBoard1.name});
                createBoard({name: newBoard2.name});
            }, [])
            return [boards, boardIds];
        });
        // Check if the board was created.
        expect(boards).toEqual(newBoards);
        expect(boardIds).toEqual(newBoards.map(board=>board.id));
    })

    test(BoardService.hooks.useUpdateBoard.name + " hook should update the board specified by ID and reflect in "
        + BoardService.states.boardsById.name + ".", async ()=>{
        const targetBoardId = "1";
        const updatePayload: Omit<Board, "id"> = {name: "New name"};
        const expectedBoardAfterUpdate: Board = {id: targetBoardId, ...updatePayload};

        // Mock update endpoint response.
        mockAPI.onPut("/boards/"+targetBoardId).replyOnce(200, expectedBoardAfterUpdate);

        const [updatedBoard] = await renderRecoilValues(()=>{
            const updateBoard = BoardService.hooks.useUpdateBoard();
            const targetBoard = useRecoilValue(BoardService.states.boardsById(targetBoardId));
            useEffect(()=>{
                updateBoard(targetBoardId, updatePayload);
            }, []);
                        return [targetBoard]
        });
        // Check if the target board is updated.
        expect(updatedBoard).toEqual(expectedBoardAfterUpdate);
    });

    test(BoardService.hooks.useDeleteBoard.name + " hook should delete the board specified by ID and reflect in "
        + BoardService.states.boardsById.name + ".", async ()=>{
        // Create mock data
        const boardToDelete: Board = {id: "1", name: "Board to delete"};
        const boardToKeep: Board = {id: "2", name: "Board to keep"};
        mockAPI.onDelete("/boards/"+boardToDelete.id).replyOnce(200);

        const [renderedBoardToDelete, renderedBoardToKeep, renderedBoardIds] =
            await renderRecoilValues(()=>{
            const [_boardToDelete, _setBoardToDelete] = useRecoilState(BoardService.states.boardsById(boardToDelete.id));
            const [_boardToKeep, _setBoardToKeep] = useRecoilState(BoardService.states.boardsById(boardToKeep.id));
            const [_boardIds, _setBoardIds] = useRecoilState(BoardService.states.boardIds);
            const [_doneSetup, _setDoneSetup] = useState(false);
            const deleteBoard = BoardService.hooks.useDeleteBoard();
            
            useEffect(()=>{
                // Create two test boards in atomFamily as setup before deletion test.
                _setBoardToDelete(boardToDelete);
                _setBoardToKeep(boardToKeep);
                _setBoardIds(([boardToDelete.id, boardToKeep.id]));
                _setDoneSetup(true);
            }, []);

            useEffect(()=>{
                if (_doneSetup){
                    deleteBoard(boardToDelete.id);
                }
            }, [_doneSetup]);
            return [_boardToDelete, _boardToKeep, _boardIds];
        });

        // Check if the first test board was deleted.
        expect(renderedBoardToDelete).toEqual({});// Check if the deleted atom is set to default.
        expect(renderedBoardToKeep).toEqual(boardToKeep);
        expect(renderedBoardIds).toEqual([boardToKeep.id]);
    });
})
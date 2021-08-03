import { atom, selector, snapshot_UNSTABLE, useRecoilCallback, useSetRecoilState } from "recoil";
import axios, { AxiosResponse } from "axios";
import { Board } from "../models";
import { useCallback } from "react";

const states = {
    boardsById: atom<{[id: string]: Board}>({
        key: "boardsByIdState",
        default: {},
    }),

    // Selector to get an array of all boards in a stable order (Sorted by Board ID / Ascending). 
    sortedBoards: selector({
        key: "sortedBoardState",
        get: ({get})=> {
            const boardById = get(states.boardsById);
            const sortedBoards: Board[] = [];
            for (let id in boardById){
                sortedBoards.push(boardById[id]);
            };
            // Sort the boards by ID number in an ascending order.
            sortedBoards.sort((a, b)=> {
                if (a.id > b.id) {return 1}
                else if (a.id == b.id){return 0}
                else {return 0};
            })
            return sortedBoards;
        }
    }),

    // Signifies that all the boards have been loaded (excluding their content data).
    boardPreviewReady: atom<boolean>({
        key: "boardLoadingState",
        default: false,
    }),

    // State for the currently selected board.
    boardSelection: atom<string | null>({
        key: "boardSelectionState",
        default : null,
    })
}

const hooks = {
    useFetchAllBoards: () => {
        const fetchAllBoards = useRecoilCallback(({set}) => ()=> {
            axios.get("/boards")
            .then((res: AxiosResponse<Board[]>) => {
                const boards = res.data;
                const boardById: {[id: string]: Board} = {};
                boards.map(board => {
                    boardById[board.id] = board;
                })                
                set(states.boardsById, boardById);
                set(states.boardPreviewReady, true);
            }).catch((err)=>{throw err});
        }, []);
        return fetchAllBoards;
    },

    useCreateboard: ()=>{
        const createBoard = useRecoilCallback(
            ({snapshot, set})=>(
                payload: Omit<Board, "id">
            )=>{
                return axios.post("/boards", payload)
                .then((res: AxiosResponse<Board>) => {
                    const createdBoard = res.data;
                    const boardsById: {[id: string]: Board} = snapshot.getLoadable(states.boardsById).contents;
                    const newBoardsById = Object.assign({
                        [createdBoard.id]: createdBoard
                    }, boardsById);
                    set(states.boardsById, newBoardsById);
                }).catch(err=>{throw err});
        })
        return createBoard;
    },

    useUpdateBoard: ()=>{
        const updateBoard = useRecoilCallback(
            ({snapshot, set})=>(
                boardId: string,
                payload: Omit<Board, "id">
            )=> {
                axios.put("boards/"+boardId, payload)
                    .then(async (res: AxiosResponse<Board>) => {
                        // Get the current board state
                        const boardById = snapshot.getLoadable(states.boardsById).contents;
                        const newBoardById = Object.assign({}, boardById);
                        newBoardById[boardId] = res.data;
                        set(states.boardsById, newBoardById);
                    }).catch((err)=>{throw err});
        }, []);
        return updateBoard;
    },

    useDeleteBoard: ()=>{
        const deleteBoard = useRecoilCallback(
            ({snapshot, set})=>(
                boardId: string
            )=>{
                axios.delete("boards/"+boardId)
                    .then(async (res: AxiosResponse<Board>) => {
                        const boardById = snapshot.getLoadable(states.boardsById).contents;
                        const newBoardsById = Object.assign({}, boardById);
                        delete newBoardsById[boardId];
                        set(states.boardsById, newBoardsById);
                    }).catch((err)=>{throw err});
            }
        )
        return deleteBoard;
    }
}

export default {
    states: states,
    hooks: hooks,
}

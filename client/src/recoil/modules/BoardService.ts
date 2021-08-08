import { atom, atomFamily, selector, snapshot_UNSTABLE, useRecoilCallback, useSetRecoilState } from "recoil";
import axios, { AxiosResponse } from "axios";
import { Board } from "../models";
import { useCallback } from "react";

const states = {
    boardsById: atomFamily<Board, string>({
        key: "boardsByIdState",
        default: {} as Board,
    }),

    // Selector to get an array of all boards in a stable order (Sorted by Board ID / Ascending). 
    boardIds: atom<string[]>({
        key: "boardIds",
        default: [],
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
            return axios.get("/boards")
                .then((res: AxiosResponse<Board[]>) => {
                    const boards = res.data;
                    const boardIds: string[] = [];
                    // Set board atom to atomFamily
                    boards.map(board => {
                        set(states.boardsById(board.id), board);
                        boardIds.push(board.id);
                    })
                    set(states.boardIds, boardIds);
                    set(states.boardPreviewReady, true);
                }).catch((err)=>{throw err});
        }, []);
        return fetchAllBoards;
    },

    useCreateboard: ()=>{
        const createBoard = useRecoilCallback(
            ({set})=>(
                payload: Omit<Board, "id">
            )=>{
                return axios.post("/boards", payload)
                    .then((res: AxiosResponse<Board>) => {
                        set(states.boardsById(res.data.id), res.data);
                        set(states.boardIds, (prevBoardIds)=>prevBoardIds.concat([res.data.id]));
                    }).catch(err=>{throw err});
        }, [])
        return createBoard;
    },

    useUpdateBoard: ()=>{
        const updateBoard = useRecoilCallback(
            ({snapshot, set})=>(
                boardId: string,
                payload: Omit<Board, "id">
            )=> {
                return axios.put("/boards/"+boardId, payload)
                    .then((res: AxiosResponse<Board>) => {
                        set(states.boardsById(res.data.id), res.data);
                    }).catch((err)=>{throw err});
        }, []);
        return updateBoard;
    },

    useDeleteBoard: ()=>{
        const deleteBoard = useRecoilCallback(
            ({set, reset})=>(
                boardId: string
            )=>{
                return axios.delete("boards/"+boardId)
                    .then(() => {
                        set(states.boardIds, (prevBoardIds)=>prevBoardIds.filter(id=>id!==boardId));
                        reset(states.boardsById(boardId));
                    }).catch((err)=>{throw err});
        },[])
        return deleteBoard;
    }
}

export default {
    states: states,
    hooks: hooks,
}

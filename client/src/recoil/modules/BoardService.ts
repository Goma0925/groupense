import { atom, selector, snapshot_UNSTABLE, useRecoilCallback, useSetRecoilState } from "recoil";
import axios, { AxiosResponse } from "axios";
import { Board } from "../models";
import { useCallback } from "react";

const states = {
    allBoardsById: atom<{[id: string]: Board}>({
        key: "allBoardsByIdState",
        default: {},
    }),

    // Selector to get an array of all boards in a stable order (Sorted by Board ID / Ascending). 
    sortedBoards: selector({
        key: "sortedBoardState",
        get: ({get})=> {
            const boardById = get(states.allBoardsById);
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

    isBoardFetched: atom<boolean>({
        key: "boardLoadingState",
        default: false,
    }),

    // State for the currently selected board.
    boardSelection: atom<string | null>({
        key: "boardSelectionState",
        default : null,
    })
}

axios.defaults.baseURL = "http://127.0.0.1:8000/api";
const hooks = {
    useFetchAllBoards: () => {
        const fetchAllBoards = useRecoilCallback(({set}) => ()=> {
            // const releaseSnapshot = snapshot.retain();
            axios.get("/boards")
            .then((res: AxiosResponse<Board[]>) => {
                console.log("Fetched:", res.data);
                
                const boards = res.data;
                const boardById: {[id: string]: Board} = {};
                boards.map(board => {
                    boardById[board.id] = board;
                })
                console.log("boardById:", boardById);
                
                set(states.allBoardsById, boardById);
                set(states.isBoardFetched, true);
                // setTimeout(() => {}, 10000);
                // console.log("After update:", snapshot.getLoadable(allBoardsByIdState).valueOrThrow());
                // releaseSnapshot();
            }).catch((err)=>{
                throw err;
            })
        }, []);
        return fetchAllBoards;
    },

    useUpdateBoard: ()=>{
        const setAllBoardByIdState = useSetRecoilState(states.allBoardsById);
        const updateBoard = useRecoilCallback(
            ({snapshot})=>(
                boardId: string,
                payload: Omit<Board, "id">
            )=> {
                axios.put("boards/"+boardId, payload)
                    .then(async (res: AxiosResponse<Board>) => {
                        // Get the current board state
                        const boardById = snapshot.getLoadable(states.allBoardsById).contents;
                        const newBoardById = Object.assign({}, boardById);
                        newBoardById[boardId] = res.data;
                        setAllBoardByIdState(newBoardById);
                    }).catch((err)=>{
                        throw err;
                    })
        }, [setAllBoardByIdState]);
        return updateBoard;
    }
}

export default {
    states: states,
    hooks: hooks,
}

import axios, { AxiosResponse } from "axios";
import { atom, atomFamily, useRecoilCallback } from "recoil";
import { Entry } from "../models";

const states = {
    entriesById: atomFamily({
        key: "entriesById",
        default: {} as Entry,
    }),
    entryIds: atom({
        key: "entryIds",
        default: [] as string[],
    })
}

const hooks = {
    useFetchAllEntries: ()=>{
        const fetchAllEntriesByBoardId = useRecoilCallback(
            ({snapshot, gotoSnapshot}) => (boardId: string) => {
                return axios.get("/boards/"+boardId+"/entries")
                    .then((res: AxiosResponse<Entry[]>) => {
                        const newSnapshot = snapshot.map(({set})=>{
                            const entryIds = [] as string[];
                            res.data.map((entry)=>{
                                set(states.entriesById(entry.id), entry);
                                entryIds.push(entry.id);
                            });
                            set(states.entryIds, entryIds);
                        })
                        gotoSnapshot(newSnapshot);
                    }).catch(err => {throw err});
            }
        ,[]);
        return fetchAllEntriesByBoardId;
    },

    useCreateEntry: ()=>{
        const createEntry = useRecoilCallback(
            ({set}) => (
                entry: Omit<Entry, "id">
            ) => {
                return axios.post("/boards/"+entry.board_id+"/entries", entry)
                    .then((res: AxiosResponse<Entry>) => {
                        // Do not use snapshot update here, because it will cause
                        // inconsistency in the array of entryIds 
                        // when running multiple create operations at once.
                        set(states.entriesById(res.data.id), res.data);
                        set(states.entryIds, (prevEntryIds)=>prevEntryIds.concat([res.data.id]));
                    }).catch(err => {throw err});
            })
        return createEntry;
    },

    useUpdateEntry: ()=>{
        const updateEntryById = useRecoilCallback(
            ({set, snapshot})=>(
                entryId: string,
                payload: Omit<Entry, "id"|"board_id">
            )=>{
                const boardId = snapshot.getLoadable(states.entriesById(entryId)).getValue().board_id;
                if (boardId === undefined){throw new Error(`Entry with ID ${entryId} not found.`)};
                return axios.post("/boards/"+boardId+"/entries/"+entryId, payload)
                    .then((res: AxiosResponse<Entry>)=>{
                        set(states.entriesById(res.data.id), res.data);
                    }).catch((err)=>{throw err});
            }, []);
        return updateEntryById;
    },

    useDeleteEntry: ()=>{
        return useRecoilCallback(
            ({set, reset, snapshot})=>(
                entryId: string
            )=>{
                const boardId = snapshot.getLoadable(states.entriesById(entryId)).getValue().board_id;
                if (boardId === undefined){throw new Error(`Entry with ID ${entryId} not found.`)};
                return axios.delete("/boards/"+boardId+"/entries/"+entryId)
                    .then(()=>{
                        set(states.entryIds, (prevEntryIds)=>prevEntryIds.filter((id)=>id !== entryId));
                        reset(states.entriesById(entryId));
                    }).catch((err)=>{throw err});
            }
        ,[]);
    }
} 

export default {
    states: states,
    hooks: hooks,
}


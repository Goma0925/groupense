import { useEffect, useState } from "react";
import { Entry } from "../models";
import BoardService from "../modules/BoardService";
import { RecoilRoot,RecoilState,useRecoilState,useRecoilValue } from "recoil";
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getByTitleAsJson, getByTitlesAsJson, renderRecoilValues } from "./utils/helpers";
import EntryService from "../modules/EntryService";

let mockEntries: Entry[];
let mockAPI: MockAdapter

beforeAll(() => {
    mockEntries = [
        {id: "1", board_id:"1", name: "Entry 1"},
        {id: "3", board_id:"1", name: "Entry 3"},
        {id: "2", board_id:"1", name: "Entry 2"},
    ]
    mockAPI = new MockAdapter(axios);
});

beforeEach(()=>{
    mockAPI.reset();
})

describe("EntryService hook tests", ()=>{
    test(EntryService.hooks.useFetchAllEntries.name+" should fetch all entries of the board ID and store them in atoms.",
        async()=>{
            const boardId = "1";
            mockAPI.onGet("/boards/"+boardId+"/entries").reply(200, mockEntries);

            const [renderedEntries, renderedEntryIds] = await renderRecoilValues(()=>{
                const fetchAllEntriesByBoardId = EntryService.hooks.useFetchAllEntries();
                const entries = mockEntries.map(entry=>{
                    return useRecoilValue(EntryService.states.entriesById(entry.id));
                });
                const entryIds = useRecoilValue(EntryService.states.entryIds);
                useEffect(()=>{
                    fetchAllEntriesByBoardId(boardId);
                }, [])
                return [entries, entryIds]
            })

            const mockEntryIds = mockEntries.map((mockEntry)=>mockEntry.id);
            expect(renderedEntries).toEqual(mockEntries);
            expect(renderedEntryIds).toEqual(mockEntryIds);
        }
    );

    test(EntryService.hooks.useCreateEntry.name+" should create a new entry and store it in atoms.",
        async()=>{
            const boardId = "1";
            const newEntry1 = {id: "1", board_id: boardId, name: "Entry 1"}
            const newEntry2 = {id: "2", board_id: boardId, name: "Entry 2"}
            const newEntries = [newEntry1, newEntry2];
            mockAPI
                .onPost("/boards/"+boardId+"/entries").replyOnce(200, newEntry1)
                .onPost("/boards/"+boardId+"/entries").replyOnce(200, newEntry2)

            const [renderedEntries, renderedEntryIds] = await renderRecoilValues(()=>{
                const createEntry = EntryService.hooks.useCreateEntry();
                const entryIds = useRecoilValue(EntryService.states.entryIds);   
                const entries = newEntries.map(entryId=>{
                    return useRecoilValue(EntryService.states.entriesById(entryId.id));
                })
                useEffect(()=>{
                    createEntry({board_id: newEntry1.board_id, name: newEntry1.name});
                    createEntry({board_id: newEntry2.board_id, name: newEntry2.name})
                }, [])
                console.log("In component:", JSON.stringify(entries), "\n", entryIds);
                return [entries, entryIds]
            })
            expect(renderedEntries).toEqual([newEntry1, newEntry2]);
            expect(renderedEntryIds).toEqual([newEntry1.id, newEntry2.id]);
        }
    )

    test(EntryService.hooks.useUpdateEntry.name+" should update a entry by ID and reflect the change in atoms",
        async()=>{
            const targetEntryId = "1";
            const originalEntry:Entry = {id: targetEntryId, board_id: "1", name: "Origianl name"}
            const updatePayload: Omit<Entry, "id"|"board_id"> = {name: "New name"}
            const entryAfterUpdate: Entry = {id: targetEntryId, board_id: originalEntry.board_id,
                                     name: updatePayload.name};
            mockAPI.onPost("/boards/"+originalEntry.board_id + "/entries/"+targetEntryId)
                    .replyOnce(200, entryAfterUpdate);

            // When calling updateEntry with ID that does not exist in Recoil, throw an error.
            try{
                await renderRecoilValues(()=>{
                    const updateEntry = EntryService.hooks.useUpdateEntry();
                    useEffect(()=>{
                        updateEntry("Invalid ID", updatePayload);
                    }, [])
                    return [];
                })
                throw new Error("Expected an error to be thrown when updating an entry that does not exist.")
            } catch(e){
                expect(e).toThrow(Error);
            }
         }
    )

    test.todo(EntryService.hooks.useUpdateEntry.name+" should update a entry by ID and reflect the change in atoms")

    test.todo(EntryService.hooks.useDeleteEntry.name+" should delete a entry by ID and reflect the change in atoms")
})
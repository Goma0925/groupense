import axios, { AxiosResponse } from "axios";
import MockAdapter from 'axios-mock-adapter';
import { useEffect, useState } from "react";
import { atom, atomFamily, useRecoilCallback, useRecoilState, useRecoilValue } from "recoil";
import { Member } from "../models";
import MemberService from "../modules/MemberService";
import { renderRecoilValues } from "./utils/helpers";

let mockMembers: Member[];
let mockAPI: MockAdapter

beforeAll(() => {
    mockMembers = [
        {id: "1", board_id:"1", name: "Member 1"},
        {id: "3", board_id:"1", name: "Member 3"},
        {id: "2", board_id:"1", name: "Member 2"},
    ]
    mockAPI = new MockAdapter(axios);
});

beforeEach(()=>{
    mockAPI.reset();
})

describe("MemberService hook tests", ()=>{
    test(MemberService.hooks.useFetchAllMembers.name+" should fetch all members of the board ID and store them in atoms.",
        async()=>{
            const boardId = "1";
            mockAPI.onGet("/boards/"+boardId+"/members").reply(200, mockMembers);

            const [renderedMembers, renderedMemberIds] = await renderRecoilValues(()=>{
                const fetchAllEntriesByBoardId = MemberService.hooks.useFetchAllMembers();
                const members = mockMembers.map(Member=>{
                    return useRecoilValue(MemberService.states.membersById(Member.id));
                });
                const memberIds = useRecoilValue(MemberService.states.memberIds);
                useEffect(()=>{
                    fetchAllEntriesByBoardId(boardId);
                }, [])
                return [members, memberIds]
            })

            const mockMemberIds = mockMembers.map((mockMember)=>mockMember.id);
            expect(renderedMembers).toEqual(mockMembers);
            expect(renderedMemberIds).toEqual(mockMemberIds);
        }
    );

    test(MemberService.hooks.useCreateMember.name+" should create a new Member and store it in atoms.",
        async()=>{
            const boardId = "1";
            const newMember1 = {id: "1", board_id: boardId, name: "Member 1"}
            const newMember2 = {id: "2", board_id: boardId, name: "Member 2"}
            const newMembers = [newMember1, newMember2];
            mockAPI
                .onPost("/boards/"+boardId+"/members").replyOnce(200, newMember1)
                .onPost("/boards/"+boardId+"/members").replyOnce(200, newMember2)

            const [renderedMembers, renderedMemberIds] = await renderRecoilValues(()=>{
                const createMember = MemberService.hooks.useCreateMember();
                const _memberIds = useRecoilValue(MemberService.states.memberIds);   
                const _members = newMembers.map(memberId=>{
                    return useRecoilValue(MemberService.states.membersById(memberId.id));
                })
                useEffect(()=>{
                    createMember({board_id: newMember1.board_id, name: newMember1.name});
                    createMember({board_id: newMember2.board_id, name: newMember2.name})
                }, [])
                return [_members, _memberIds]
            })
            expect(renderedMembers).toEqual([newMember1, newMember2]);
            expect(renderedMemberIds).toEqual([newMember1.id, newMember2.id]);
        }
    )

    test(MemberService.hooks.useUpdateMember.name+" should update a Member by ID and reflect the change in atoms",
        async()=>{
            const targetMemberId = "1";
            const originalMember:Member = {id: targetMemberId, board_id: "1", name: "Origianl name"}
            const updatePayload: Omit<Member, "id"|"board_id"> = {name: "New name"}
            const memberAfterUpdate: Member = {id: targetMemberId, board_id: originalMember.board_id,
                                     name: updatePayload.name};
            mockAPI.onPost("/boards/"+originalMember.board_id + "/members/"+targetMemberId)
                    .replyOnce(200, memberAfterUpdate);

            // When calling updateMember with ID that does not exist in Recoil, throw an error.
            const [Member] = await renderRecoilValues(()=>{
                const updateMember = MemberService.hooks.useUpdateMember();
                const [member, setMember] = useRecoilState(MemberService.states.membersById(targetMemberId));
                const [setupDone, setSetupDone] = useState(false);

                useEffect(()=>{
                    // Setup the atoms so that the target Member is in the atoms.
                    setMember(originalMember);
                    setSetupDone(true);
                }, []);
                useEffect(()=>{
                    if (setupDone){
                        updateMember(originalMember.id, updatePayload);
                    }
                }, [setupDone])
                return [member];
            });
            expect(Member).toEqual(memberAfterUpdate);
         }
    )

    test(MemberService.hooks.useDeleteMember.name+" should delete a Member by ID and reflect the change in atoms",
        async()=>{
            const memberToDelete:Member = {id: "1", board_id:"1", name: "MemberToDelete"}
            const memberToKeep:Member = {id: "2", board_id:"1", name: "MemberToKeep"}
            mockAPI.onDelete("/boards/"+memberToDelete.board_id+"/members/"+memberToDelete.id)
                    .replyOnce(200);

            const [renderedMemberToDelete, renderedMemberToKeep, renderedMemberIds] = await renderRecoilValues(()=>{
                const deleteMember = MemberService.hooks.useDeleteMember();
                const [_memberToDelete, _setMemberToDelete] = useRecoilState(MemberService.states.membersById(memberToDelete.id));
                const [_memberToKeep, _setMemberToKeep] = useRecoilState(MemberService.states.membersById(memberToKeep.id));
                const [_memberIds, _setMemberIds] = useRecoilState(MemberService.states.memberIds);
                const [_doneSetup, _setDoneSetup] = useState(false);
                useEffect(()=>{
                    // Setup the atoms so that the target Member is in the atoms.
                    _setMemberToDelete(memberToDelete);
                    _setMemberToKeep(memberToKeep);
                    _setMemberIds([memberToDelete.id, memberToKeep.id]);
                    _setDoneSetup(true);
                }, []);
                useEffect(()=>{
                    if (_doneSetup){
                        deleteMember(memberToDelete.id);
                    }
                }, [_doneSetup]);
                return [_memberToDelete, _memberToKeep, _memberIds];
            });
            expect(renderedMemberToDelete).toEqual({});
            expect(renderedMemberToKeep).toEqual(memberToKeep);
            expect(renderedMemberIds).toEqual([memberToKeep.id]);
        }
    )

    test.todo(MemberService.hooks.useUpdateMember.name+" should raise an error when getting an invalid Member ID")
    test.todo(MemberService.hooks.useDeleteMember.name+" should raise an error when getting an invalid Member ID")
})
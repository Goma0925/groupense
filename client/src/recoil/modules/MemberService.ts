import axios, { AxiosResponse } from "axios";
import { atom, atomFamily, RecoilState, RecoilValueReadOnly, selector, useRecoilCallback } from "recoil";
import { Member } from "../models";
import BoardService from "./BoardService";

const states = {
    membersById: atomFamily({
        key: "membersById",
        default: {} as Member
    }),
    memberIds: atom({
        key: "memberIds",
        default: [] as string[]
    })
}


const hooks = {
    useFetchAllMembers: ()=>{
        const fetchAllMembersByBoardId = useRecoilCallback(
            ({snapshot, gotoSnapshot}) => (boardId: string) => {
                return axios.get("/boards/"+boardId+"/members")
                    .then((res: AxiosResponse<Member[]>) => {
                        const newSnapshot = snapshot.map(({set})=>{
                            const memberIds = [] as string[];
                            res.data.map((member)=>{
                                set(states.membersById(member.id), member);
                                memberIds.push(member.id);
                            });
                            set(states.memberIds, memberIds);
                        })
                        gotoSnapshot(newSnapshot);
                    }).catch(err => {throw err});
            }
        ,[]);
        return fetchAllMembersByBoardId;
    },

    useCreateMember: ()=>{
        const createMember = useRecoilCallback(
            ({set, snapshot}) => (
                payload: Omit<Member, "id">
            ) => {
                return axios.post("/boards/"+payload.board_id+"/members", payload)
                    .then((res: AxiosResponse<Member>) => {
                        // Do not use snapshot update here, because it will cause
                        // inconsistency in the array of memberIds 
                        // when running multiple create operations at once.
                        set(states.membersById(res.data.id), res.data);
                        set(states.memberIds, (prevMemberIds)=>prevMemberIds.concat([res.data.id]));
                    }).catch(err => {throw err});
            })
        return createMember;
    },

    useUpdateMember: ()=>{
        const updateMemberById = useRecoilCallback(
            ({set, snapshot})=>(
                memberId: string,
                payload: Omit<Member, "id"|"board_id">
            )=>{
                const boardId = snapshot.getLoadable(states.membersById(memberId)).getValue().board_id;
                if (boardId === undefined){throw new Error(`Member with ID ${memberId} not found.`)};
                return axios.post("/boards/"+boardId+"/members/"+memberId, payload)
                    .then((res: AxiosResponse<Member>)=>{
                        set(states.membersById(res.data.id), res.data);
                    }).catch((err)=>{throw err});
            }, []);
        return updateMemberById;
    },

    useDeleteMember: ()=>{
        return useRecoilCallback(
            ({set, reset, snapshot})=>(
                memberId: string
            )=>{
                const boardId = snapshot.getLoadable(states.membersById(memberId)).getValue().board_id;
                if (boardId === undefined){throw new Error(`Member with ID ${memberId} not found.`)};
                return axios.delete("/boards/"+boardId+"/members/"+memberId)
                    .then(()=>{
                        set(states.memberIds, (prevmemberIds)=>prevmemberIds.filter((id)=>id !== memberId));
                        reset(states.membersById(memberId));
                    }).catch((err)=>{throw err});
            }
        ,[]);
    }
} 


export default {
    states: states,
    hooks: hooks,
}
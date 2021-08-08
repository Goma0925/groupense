
export type User = {
    name: string;
    id: string;
}

export type Member = {
    id: string;
    name: string;
    board_id: string;
}

export type Entry = {
    name: string;
    id: string;
    board_id: string;
}

export type Board = {
    name: string,
    id: string,
}

export type Transaction = {
    id: string;
    entry_id: string
    member_id: string;
    amount: number;
}
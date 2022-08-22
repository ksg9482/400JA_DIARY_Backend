export interface IDiary {
    _id: string;
    userId: string;
    subject: string
    content: string;
    year: number;
    month: number;
    day: number;
};

export interface IdiaryContent {
    subject: string;
    content: string;
}

export interface IfindByDateDTO {
    year: number;
    month: number;
    day: number;
}
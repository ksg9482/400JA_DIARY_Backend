export interface IDiary {
    _id:string;
    userId:string;
    content:string;
    year:number;
    month:number;
    day:number;
};

export interface IdiaryContent {
    content:string;
}
export interface IDiary {
    _id:string;
    userId:string;
    content:string; //IDiaryContent[]??
};

export interface IdiaryContent {
    content:string;
}
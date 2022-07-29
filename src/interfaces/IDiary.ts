export interface IDiary {
    _id:string;
    userId:string;
    content:string; //IDiaryContent[]??
};

// export interface IDiaryContent {
//     content:string;
// };
// {
//  userId:'123456',
//  contents: {
//      content:'오늘의 일기',
//      createAt: 2022-01-01      
//  }
// }
// 형식으로 저장해야 할지도?
export interface DiaryContent {
    subject: string;
    content: string;
};

export interface DiaryDate {
    year: number;
    month: number;
    day: number;
}
type DiaryAndDate = DiaryContent & DiaryDate;

export interface Diary extends DiaryAndDate {
    id?: string;
    userId: string;
};



export interface DiaryOutputForm extends DiaryContent {
    id: string;
    date: string;
};

export interface DiaryListWithEnd {
    end: boolean;
    list: DiaryOutputForm[];
};


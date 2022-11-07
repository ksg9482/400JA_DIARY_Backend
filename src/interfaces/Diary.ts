export interface Diary {
    id: string;
    userId: string;
    subject: string;
    content: string;
    year: number;
    month: number;
    day: number;
};

export interface DiaryContent extends Pick<Diary, 'subject' | 'content'> {};

export interface DiaryDate extends Pick<Diary, 'year' | 'month' | 'day'> {}

export interface DiaryOutputForm extends Pick<Diary, 'id' | 'subject' | 'content'> {
    date: string;
};

export interface DiaryListWithEnd {
    end: boolean;
    list: DiaryOutputForm[];
};


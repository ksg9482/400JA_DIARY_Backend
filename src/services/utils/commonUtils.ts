export default class CommonUtils {
    public createRandomId() {
        const randomNum = Math.round(Math.random() * 100000000);
        return '사용자' + randomNum;
    };
};

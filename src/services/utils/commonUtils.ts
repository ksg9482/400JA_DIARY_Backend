interface IError {
    name: string;
    message: string;
}
export default class CommonUtils {
    public createRandomId() {
        const randomNum = Math.round(Math.random() * 100000000)
        return '사용자' + randomNum
    }

    // public throwError(errorObj:IError) {
    //     let err = new Error();
    //     err.name = errorObj.name;
    //     err.message = errorObj.message;
    //     throw err;
    // }
    
};

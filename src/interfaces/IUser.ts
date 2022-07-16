export interface IUser {
    _id:string,
    email:string,
    password:string,
    role?:string
};

export interface IUserInputDTO {
    email:string,
    password:string
};
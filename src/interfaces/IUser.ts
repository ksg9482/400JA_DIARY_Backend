export interface IUser {
    _id:string,
    email:string,
    password:string,
    salt:string
};

export interface IUserInputDTO {
    email:string,
    password:string
};
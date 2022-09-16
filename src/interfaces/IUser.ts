export interface IUser {
  _id: string;
  email: string;
  password: string;
  role?: string;
  type?: string;
}

export interface IUserDocument extends IUser {
  findOneOrCreate:(condition:any, doc:any) => Promise<any>
}
export interface IUserInputDTO {
  email: string;
  password: string;
  role?: string;
  type?: string;
}

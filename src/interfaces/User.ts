

export interface User {
  id: string;
  email: string;
  password: string;
  role: string;
  type: string;
};

export interface UserInputDTO extends Pick<User, "email" | "password"> {}

export interface UserOutputDTO extends Pick<User, "id" | "email" | "role" | "type"> {}

export interface UserReturnForm extends Pick<User, "id" | "email" | "type"> {}

export interface UserWithToken {
  user:UserReturnForm;
  token:string;
}


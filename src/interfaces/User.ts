export interface UserBase {
  email: string;
  password?: string;
};

export interface User extends UserBase {
  id: string;
  role?: string;
  type: string;
};

export interface UserWithToken {
  user:User;
  token:string;
}


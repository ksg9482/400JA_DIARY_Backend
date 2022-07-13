import { Router } from "express";

const route = Router();

export default (app:Router) => {
    app.use('/auth', route)
    //signup
    //login
    //logout
    //signout? userdelete?
}
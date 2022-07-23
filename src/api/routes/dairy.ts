import { Router } from "express";
import attachCurrentUser from "../middlewares/attachCurrentUser";

const route = Router();

export default (app:Router) => {
    app.use('/diary', route)
    app.use(attachCurrentUser)
}
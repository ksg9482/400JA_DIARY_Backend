import { Router } from "express"
import user from "./routes/user";

export default () => {
    const app = Router();
    //auth
    user(app);

    return app;
};
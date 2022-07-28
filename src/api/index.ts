import { Router } from "express"
import auth from "./routes/auth";
import dairy from "./routes/dairy";
import user from "./routes/user";

export default () => {
    const app = Router();
    auth(app);
    user(app);
    dairy(app);

    return app;
};
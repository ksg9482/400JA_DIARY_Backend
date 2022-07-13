import { Request, Response, Router } from "express";

const route = Router();

export default (app: Router) => {
    app.use('/users', route);

    route.get('/me', (req:Request, res:Response) => {
        res.status(200).json('me data');
    });
};
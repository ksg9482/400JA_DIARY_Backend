import mongoose, { Connection } from 'mongoose';

export let jwtToken: string;

export const tokenData = (res: any) => {
    const token: string = res.headers["set-cookie"][0].split(';')[0];
    jwtToken = token;
    return token ? token : 'search error';
};

describe('user e2e test', () => {
    let db: Connection
    //let app = app;
    beforeAll(async () => {
      });
    afterAll(async () => {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
    })
    describe('connection check', () => {
        it('연결 확인', async () => {
          
          //const apptest = supertest(http.createServer(app))
            //const nodeEnv = process.env.NODE_ENV
      
            // const resp: any = await request(app).get('/status');
            // expect(resp.status).toEqual(200);
            // expect(resp.text).toEqual('get 응답');
          });
    })
})


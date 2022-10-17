import mongoose, { Connection } from 'mongoose';

export let jwtToken: string;

//서버시작이 함수 내부에 있다보니 app.address is not a function이 발생. 
//이 프로젝트는 참고한 구조를 최대한 따르려다 보니 지금으로썬 통합테스트 구현이 힘들다 판단.
//module.exports 실패
//supertest로 서버생성 실패

export const tokenData = (res: any) => {
    //console.log(res)
    const token: string = res.headers["set-cookie"][0].split(';')[0];
    //console.log(token)
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


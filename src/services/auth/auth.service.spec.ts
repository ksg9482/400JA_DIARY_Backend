import AuthService from "./auth.service";
import User from '../../models/user'
import logger from "../../loaders/logger";
const mockRepository = () => (
    {
        save:jest.fn(),
        findone:jest.fn()
    }
);

const mockJwtService = () => ({
    sign: jest.fn(() => 'signed-token'),
    verify: jest.fn()
});
//jest.mock('@/models/user')
//jest.mock('@/loaders/logger')
//jest.mock('./auth.service')
describe('AuthService',()=>{
    let service: AuthService;
    //let jwtService: JwtService;

    beforeEach(() => {
        service = new AuthService(User, logger)
    })
    describe('signup',() => {
        const signupArg = {
            email: 'mock',
            password: 'mock',
            //role: 'user'
        };

        it('email 또는 password가 없다면 No user data를 반환해야 한다.', async () => {
            try {
                const result = await service.Signup({ email: '',password: 'mock'});
            } catch (error) {
                expect(error).toEqual(new Error('No user parametor'))
            }
            
            
        })
    })
})
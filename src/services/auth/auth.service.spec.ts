import AuthService from "./auth.service";

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


describe('AuthService',()=>{
    let service:AuthService;
    //let jwtService: JwtService;
    describe('signup',() => {
        const signupArg = {
            email: '',
            password: '',
            //role: 'user'
        };

        it('should faild if user exists', async () => {
            const result = await service.Signup(signupArg)
            expect(result).toMatchObject({error: 'Email already'})
        })
    })
})
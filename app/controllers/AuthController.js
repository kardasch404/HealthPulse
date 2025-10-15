import BaseController from '../abstractions/BaseController.js';
import AuthValidator from '../validators/AuthValidator.js';
import AuthService  from '../services/AuthService.js';
import JWTUtil from '../utils/jwt.js';
import Logger from '../logs/Logger.js';




class AuthController extends BaseController 
{
    /** @type {AuthService} */
    #authService;

    /**
     * @param {AuthService} authService
     */
    constructor (authService)
    {
        super();
        this.#authService = authService ;
    }

    async register (req, res)
    {
        try
        {
            const { valid, errors } = AuthValidator.validateRegister(req.body);
            if (!valid)
            {
                return this.handleError(res, { message: 'Validation Error' });
            }


            const user = await this.#authService.register(req.body);
            return this.handleSuccess(res, {
                 message: 'User registered',
                 data: {
                    id: user._id,
                    fname: user.fname,
                    lname: user.lname,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                 }
                });
        }
        catch (error)
        {
            Logger.error('Error registering user', error);
            return this.handleError(res, { 
                message: 'Internal Server Error' 
            });
        }
    }

    async login (req, res)
    {
        try{
            const { valid, errors } = AuthValidator.validateLogin(req.body);
            if (!valid)
            {
                return this.handleError(res, { message: 'Validation Error' });
            }

            const result = await this.#authService.login(req.body);
            return this.handleSuccess(res, {
                 message: 'User logged in',
                 data: result
                });

        }catch (error){
            Logger.error('Error logging in user', error);
            return this.handleError(res, { 
                message: 'Internal Server Error' 
            });
        }
    }

    async refreshToken (req, res)
    {
        try{
            const { refreshToken } = req.body;
            if (!refreshToken)
            {
                return this.handleError(res, { message: 'Refresh token required' });
            }

            const result = await this.#authService.refreshToken(refreshToken);
            return this.handleSuccess(res, {
                 message: 'Token refreshed',
                 data: result
                });

        }catch (error){
            Logger.error('Error refreshing token', error);
            return this.handleError(res, { 
                message: 'Internal Server Error' 
            });
        }
    }

    async logout (req, res)
    {
        try{
            // Get userId from authenticated user (set by auth middleware)
            const userId = req.user?.userId;
            if (!userId)
            {
                return this.handleError(res, { message: 'Unauthorized' });
            }

            await this.#authService.logout(userId);
            return this.handleSuccess(res, {
                 message: 'User logged out'
                });

        }catch (error){
            Logger.error('Error logging out user', error);
            return this.handleError(res, { 
                message: 'Internal Server Error' 
            });
        }
    }
}

export default AuthController;
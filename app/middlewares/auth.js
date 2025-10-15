import JWTUtil from '../utils/jwt.js';
import Logger from '../logs/Logger.js';


export const authenticate = (req, res , next ) => {
    try{

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
           Logger.warn('No token provided');
           return res.status(401).json({
            status: 'error',
            message: 'Unauthorized' 
            });
        }
        const token = authHeader.split(' ')[1];
        const decoded = JWTUtil.verifyAccessToken(token);
        req.user = decoded;
        next();

    }catch (error)
    {
        Logger.error('Auth middleware error', error);
        return res.status(401).json({ 
            status: 'error',
            message: 'Unauthorized' 
        });
    }
}
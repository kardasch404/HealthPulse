import jwt from 'jsonwebtoken';

class JWTUtil 
{
    static generateAccessToken(userId, role) 
    {
        return jwt.sign(
            { userId, role },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRY }
        );
    }

    static generateRefreshToken(userId)
    {
        return jwt.sign(
            { userId },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRY }
        );
    }

    static verifyAccessToken(token)
    {
        try{
            return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            
        }catch(e){
            throw new Error("expired access token");
        }
    }

    static verifyRefreshToken(token)
    {
        try{
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET)

        }catch(e){
            throw new Error("expired refresh token");
        }
    }

    static decodeToken(token)
    {
        return jwt.decode(token);
    }

    

}

export default JWTUtil;

import { schemas } from '../validators/ValidationSchema.js';
import Logger from '../logs/Logger.js';
import { LOG_ACTIONS } from '../logs/logLevels.js';

class AuthValidator 
{

 static validateRegister(data)
 {
    const {error} = schemas.register.validate(data, { abortEarly: false });
    if (error)
    {
        Logger.error(LOG_ACTIONS.VALIDATION_ERROR, error.details);
        return { valid: false, errors: error.details };
    }
    return { valid: true , errors: []};
 }


 static validateLogin(data)
 {
    const {error} = schemas.login.validate(data, { abortEarly: false });
    if (error)
    {
        Logger.error(LOG_ACTIONS.VALIDATION_ERROR, error.details);
        return { valid: false, errors: error.details };
    }
    return { valid: true , errors: []};
 }
}

export default AuthValidator;

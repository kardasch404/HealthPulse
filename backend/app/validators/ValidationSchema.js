import Joi from 'joi';

const schemas = 
{
    register : Joi.object
    ({
        fname : Joi.string().min(2).max(30).required(),
        lname : Joi.string().min(2).max(30).required(),
        email : Joi.string().email().required(),
        password : Joi.string().min(6).required(), 
        passwordConfirm : Joi.string()
        .valid(Joi.ref('password'))
        .required()
        
    }),

    login : Joi.object
    ({
        email : Joi.string().email().required(),
        password : Joi.string().min(6).required(), 
    })
};

export default schemas;
export { schemas };
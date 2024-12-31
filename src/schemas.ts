import Joi from "joi"

//validator for user
const createUserSchema = Joi.object({
    lastName: Joi.string().min(2).max(30).required().messages({
        'string.empty': 'Last name is required.',
        'string.min': 'Last name must be at least 2 characters.',
        'string.max': 'Last name must not exceed 30 characters.',
    }),
    firstName: Joi.string().min(2).max(30).required().messages({
        'string.empty': 'First name is required.',
        'string.min': 'First name must be at least 2 characters.',
        'string.max': 'First name must not exceed 30 characters.',
    }),
  
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required.',
        'string.email': 'Email must be a valid email address.',
    }),
    password: Joi.string().min(8).max(128).required().messages({
        'string.empty': 'Password is required.',
        'string.min': 'Password must be at least 8 characters.',
        'string.max': 'Password must not exceed 128 characters.',
    }),
   
});

export {
    createUserSchema
}
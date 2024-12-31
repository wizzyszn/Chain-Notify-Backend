import {Document} from 'mongoose'
// clean password before returning response
const cleanPassword = <T extends Document>(object : T) : Omit<T, 'password'> =>{
    const copy = object.toObject();
    if('password' in object){
       delete (copy as any).password;
    };
    return copy as Omit<T,'password'>
} 

export {
    cleanPassword
}
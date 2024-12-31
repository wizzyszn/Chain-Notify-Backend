import { Context } from "joi";
interface WalletInt{
    address : string,
    balance : number,
    network : string,
    tokens : Array<{
        tokenName : string,
        tokenSymbol : string,
        amount : number
    }>,
    transactions : {
        hash : string,
        type : "sent" | "received",
        amount : number,
        token : string,
        date : Date,
        read  : boolean,
        message : string,
        from : string
    }[]
};
interface UserInt extends Document {
    firstName : string,
    lastName : string,
    email : string,
    avi : string,
    createdAt : string,
    updatedAt : string,
    password : string,
    otp?: string;
  otpExpiresAt?: Date;
  isVerified: boolean;
    wallet : WalletInt
    notificationPreferences: {
        email : boolean
        push: boolean
        sms :boolean
    }
};
interface GeneralReturnInt <Data>{
    statusCode : number,
    success : boolean,
    message : string,
    data : Data,
    timestamp?: string
 
}
type ErrorInt = {
        message : string
        field?: string
        context? : {
            limit: number,
            value: number,
            label: string,
            key: string
        } | Context,
        path? : (string | number)[]
      
}[]
interface GeneralErrorInt {
    errors ?: ErrorInt,
    statusCode : number ,
    message : string,
    success : boolean,
    timestamp?: string,
}
enum typeOfResponse {
    blob  = 'blob',
    text  = 'text',
    json = 'json',
    html = "html"
}
export {
    UserInt,
    GeneralErrorInt,
    GeneralReturnInt,
    typeOfResponse,
    ErrorInt,
    WalletInt
}
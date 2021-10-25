class customErrorHandler extends Error {
    constructor(status, message){
        super();
        this.status = status;
        this.message = message;
    }
    static alreadyExist (message='Data Already Exist'){
        return new customErrorHandler(409,message);
    }
    static wrongCredentials (message='Wrong Credentials'){
        return new customErrorHandler(403,message);
    }
    static serverError (message='Somthing Went Wrong Server Error') {
        return new customErrorHandler(401, message);
    }
    static emptyData(message='List is Empty!') {
        return new customErrorHandler(201, message);
    }
}  
export default customErrorHandler;
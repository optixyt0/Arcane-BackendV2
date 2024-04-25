class ErrorClass {

    createError(errorCode, errorMessage, messageVars, numericErrorCode, error, statusCode, res) {
        if (res.set) {
            res.set({
                'X-Epic-Error-Name': errorCode,
                'X-Epic-Error-Code': numericErrorCode
            });
        }
    
        if (res.status && res.json) {
            res.status(statusCode).json({
                errorCode: errorCode,
                errorMessage: errorMessage,
                messageVars: messageVars,
                numericErrorCode: numericErrorCode,
                originatingService: "any",
                intent: "prod",
                error_description: errorMessage,
                error: error
            });
        }
    }
}

const error = new ErrorClass();
export default error;

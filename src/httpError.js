class HttpError extends Error {
    constructor(status = 500, message = 'Internal server error') {
        super(message);
        this.status = status;
    }
}

module.exports = HttpError;
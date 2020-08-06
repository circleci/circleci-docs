const Responses = {
    _DefineResponse(statusCode = 502, data = {}) {
        return {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Methods': '*',
                'Access-Control-Allow-Origin': '*',
            },
            statusCode,
            body: JSON.stringify(data),
        };
    },

    _200(data = {}) {
        return this._DefineResponse(200, data);
    },
    _204(data = {}) {
        return this._DefineResponse(204, data);
    },

    _400(data = {}) {
        return this._DefineResponse(400, data);
    },
    _404(data = {}) {
        return this._DefineResponse(404, data);
    },
};

module.exports = Responses;

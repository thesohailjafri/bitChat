const { AuthenticationError } = require('apollo-server');

const jwt = require('jsonwebtoken');
const { SECRET_key } = require('../config');

module.exports = (context) => {
    //context = {...header}
    const authHeader = context.req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split('Bearer ')[1];
        if (token) {
            try {
                const user = jwt.verify(token, SECRET_key);
                return user;
            } catch {
                throw new AuthenticationError('Invalid/Expired Token');
            }
        }
        throw new Error('Authentication token must be Bearer [token]');
    }
    throw new Error('Authorization header must be provided');
};
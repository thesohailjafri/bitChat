const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const User = require('../../models/User'); //user model schema
const { SECRET_key } = require('../../config'); //user model schema
const { validateUserRegistration, validateUserLogin } = require('../../util/validator');

const generateToken = (user) => {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username,
    }, SECRET_key, { expiresIn: '24h' });
};

module.exports = {
    Mutation: {
        async login(_,
            {
                loginInput: { email, password }
            },
            context,
            info) {
            const { errors, valid } = validateUserLogin(
                email, password
            );
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }
            const _email = await User.findOne({ email });
            if (!_email) {
                errors.general = 'email do not exist';
                throw new UserInputError('email do not exist', { errors });
            }
            const match = await bcrypt.compare(password, _email.password);
            if (!match) {
                errors.general = 'password do not match';
                throw new UserInputError('password do not match', { errors });
            }
            const token = generateToken(_email);
            return {
                ..._email._doc,
                id: _email._id,
                token
            };
        },

        async register(_,
            {
                registerInput: { username, email, password, confirmPassword }
            },
            context,
            info) {
            //make sure user data is valid
            const { errors, valid } = validateUserRegistration(
                username, email, password, confirmPassword
            );
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }
            //make sure username is unqiue 
            const _user = await User.findOne({ username });
            if (_user) {
                throw new UserInputError('username is taken', {
                    errors: {
                        username: 'this username is taken'
                    }
                });
            }
            //hash password n create token
            password = await bcrypt.hash(password, 12);
            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });
            const user = await newUser.save();
            const token = generateToken(user);
            return {
                ...user._doc,
                id: user._id,
                token
            };
        }
    }
};
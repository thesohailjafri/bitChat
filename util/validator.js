module.exports.validateUserRegistration = (
    username,
    email,
    password,
    confirmPassword,
) => {
    const errors = {};
    if (username.trim() === '') {
        errors.username = 'username must not be empty';
    }
    if (email.trim() === '') {
        errors.email = 'email must not be empty';
    }
    else {
        const regEx = /^[^@]+@[^@]+\.[^@]+$/;
        if (!email.match(regEx)) {
            errors.email = 'invalid email address';
        }
    }
    if (password === '') {
        errors.password = 'password must not be empty';
    }
    else if (password != confirmPassword) {
        errors.password = 'confirm password do not match';
    }
    return {
        errors,
        valid: Object.keys(errors) < 1
    };
};

module.exports.validateUserLogin = (
    username,
    password) => {
    const errors = {};
    if (username.trim() === '') {
        errors.username = 'username must not be empty';
    }
    if (password === '') {
        errors.password = 'password must not be empty';
    }
    return {
        errors,
        valid: Object.keys(errors) < 1
    };
};
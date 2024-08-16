const authentValidatSchema = {
    username: {
        isLength: {
            options: {
                min: 3,
                max: 32,
            },
            errorMessage: 'Username must be at least 3 characters with a maximum of 32 characters.'
        },
        notEmpty: {
            errorMessage: "Username cannot be empty."
        },
        isString: {
            errorMessage: "Username must be a string."
        }
    },
    password: {
        notEmpty: {
            errorMessage: "Password cannot be empty."
        },
        isLength: {
            options: {
                min: 3,
                max: 32,
            },
            errorMessage: 'Password must be at least 5 characters with a maximum of 32 characters.'
        },
        isString: {
            errorMessage: "Password must be a string."
        }
    }
}

module.exports = authentValidatSchema;
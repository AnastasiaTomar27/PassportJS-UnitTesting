const createUserValidationSchema = {
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
        isLength: {
            options: {
                min: 7,
                max: 32,
            },
            errorMessage: 'Password must be at least 7 characters with a maximum of 32 characters.'
        },
        notEmpty: {
            errorMessage: "Password cannot be empty."
        }
    },
    displayName: {
        notEmpty: true
    }
}



module.exports = createUserValidationSchema;


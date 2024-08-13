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
    displayName: {
        notEmpty: true
    }
}



module.exports = createUserValidationSchema;



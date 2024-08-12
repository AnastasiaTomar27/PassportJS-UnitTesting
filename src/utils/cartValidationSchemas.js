const createCartValidationSchema = {
    name: {
        isLength: {
            options: {
                min: 3,
                max: 32,
            },
            errorMessage: 'Name of the product must be at least 3 characters with a maximum of 32 characters.'
        },
        notEmpty: {
            errorMessage: "Name of the product cannot be empty."
        },
        isString: {
            errorMessage: "Name of the product must be a string."
        }
    },
    price: {
        notEmpty: {
            errorMessage: "Name of the product cannot be empty."
        },
        isNumeric: {
            errorMessage: "Name of the product must be a number."
        }
    }
}



module.exports = createCartValidationSchema;
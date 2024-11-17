const isAuthenticated = (request, response, next) => {
    if (!request.user) {
        return response.status(401).send({message: "Not Authenticated"});
    } else {
        next()
    }
}
module.exports = isAuthenticated;
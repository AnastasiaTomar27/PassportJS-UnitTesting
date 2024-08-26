const isAuthenticated = (request, response, next) => {
    if (!request.user) {
        return response.status(401).send({message: "Not Authenticated"});
    } else {
        next()
    }
    
    // console.log(`cokiesssssssssss ${request.session.id}`)
    // if (!request.session.user && request.session.id) {
    //     return response.status(401).send({message: "Not Authenticated"});
    // } else {
    //     next()
    // }
}

module.exports = isAuthenticated;
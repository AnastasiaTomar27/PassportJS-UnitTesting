const app = require('./app')
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Running on Port ${port}`);
});

app.get("/", (request, response) => {
    console.log(request.session);
    console.log(request.session.id);
    request.session.visited = true;
    response.cookie("hello", "world", {maxAge: 60000 * 60 * 2, signed: true });
    response.status(201).send({msg: "Hello"});
});

module.exports = app;


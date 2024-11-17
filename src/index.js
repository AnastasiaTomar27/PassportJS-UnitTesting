const app = require('./app')
const port = process.env.PORT || 3000;

// app.listen(port, () => {
//     console.log(`Running on Port ${port}`);
// });

// Express application server (app.listen()) does not start when I'm running tests
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => console.log("Server is running on port " + port));
}

module.exports = app;


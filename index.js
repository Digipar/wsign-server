const app = require('./app');
// open webserver port 3000
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
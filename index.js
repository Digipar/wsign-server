const PORT = process.env.PORT || 3000; 
const app = require('./app');
// open webserver port 3000
app.listen(PORT, () => {
    console.log('Server started on port '+PORT);
});
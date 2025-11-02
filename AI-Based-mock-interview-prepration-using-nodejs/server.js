
const connectDB = require('./src/config/dbConfig');
const app = require('./src/app');
require('dotenv').config();

const cors = require('cors');

const PORT = process.env.PORT || 3000;




app.use(cors());
connectDB();
// Example for Express server (dashboard server)
app.get('/end-session', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            return res.send('Error ending session');
        }
        // Redirect to login server
        res.redirect('http://localhost:3000/login'); // login server URL
    });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

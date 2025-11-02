const connectDB = require('./src/config/dbConfig');
const app = require('./src/app'); // this is already your express app
require('dotenv').config();
const cors = require('cors');

const PORT = process.env.PORT || 3000;

// ✅ Fix for Render/Proxy trust issue
app.set('trust proxy', 1);

// Enable CORS
app.use(cors());

// Connect MongoDB
connectDB();

// Example route for ending session
app.get('/end-session', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
      return res.send('Error ending session');
    }
    // Redirect to login server
    res.redirect('http://localhost:3000/login'); // Update to your actual login URL
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

require('dotenv').config(); // Load environment variables
const app = require('./src/app');

const PORT = process.env.PORT || 4500;

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});

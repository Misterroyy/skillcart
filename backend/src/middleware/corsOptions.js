const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:4500','http://localhost:5173','http://localhost:5174','https://news.monsterweb.in','http://199.192.23.70:4500','https://newsserver.monsterweb.in']; // Adjusted to remove trailing slash
    
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',  
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true // Allow credentials (cookies)
};

module.exports = corsOptions;
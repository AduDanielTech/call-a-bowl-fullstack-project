const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

// Configure middleware

app.use(cors());
app.use(bodyParser.json());


const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });











// JWT Secret (Use environment variables in production)
const jwtSecret = process.env.JWT_SECRET; 

// Registration Route




app.use('/', (res,req) => {
  res.send("server is running")
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

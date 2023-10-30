const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

// Configure middleware













app.use('/', (res,req) => {
  res.send("server is running")
})

// Start the server
app.listen(5000, () => {
  console.log(`Server is running on port ${port}`);
});

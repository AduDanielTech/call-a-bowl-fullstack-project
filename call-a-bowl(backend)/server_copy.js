const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const tinify = require('tinify');
const fs = require('fs');
require('dotenv').config();




const productsRepo = require('./repositories/products')
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






app.post('/api/register', async (req, res) => {
  const { username, password, code } = req.body;

  try {
    // Check if the code is correct

    if (code !== 'CREATENEWBOWL') {
      console.log('invalid code');
      return res.status(401).json({ error: 'Invalid code' });
    }

    let all = await productsRepo.getAll();

    // Ensure that all.users is initialized as an array
    if (!all.USERS) {
      all.USERS = [];
    }

    // Check if the username already exists
    const isDuplicate = await all.USERS.some((user) => user.username === username);

    if (isDuplicate) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = {
      username,
      password: hashedPassword,
    };

    all.USERS.push(newUser);

    // Save the updated products
    await productsRepo.writeAll(all);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error registering user' });
  }
});



const products = require('./repositories/products');
const internal = require('stream');






app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    let all = await productsRepo.getAll()
    const users = all.USERS
    
    // Find the user by username
    const user = users.find(user => user.username === username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare the provided password with the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log('invalid password');
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Create and send a JSON Web Token (JWT)
    const token = jwt.sign({ username }, jwtSecret); // Use the secret
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});







app.get('/api/login', async (req, res) => {
  try {
    
    res.send('hi');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ error: 'Access denied, token not provided' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};



// Protected route (Example)
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});


app.get('/api/products', async (req, res) => {
  const products = await productsRepo.getAll()
  res.status(201).json({ message: 'Item added successfully', newItem:  products});
});


tinify.key = process.env.TINIFY_API_KEY;

app.post('/api/product/new', upload.single('IMAGE'), async (req, res) => {
  try {
    let imageBuffer = '';

    // Check if an image was uploaded
    if (req.file) {
      const firstCompressedBuffer = await tinify.fromBuffer(req.file.buffer).toBuffer();
  
      // Second compression
      const doublyCompressedBuffer = await tinify.fromBuffer(firstCompressedBuffer).toBuffer();
      
      imageBuffer = doublyCompressedBuffer;
    }

    // Access the other form data
    const newItemDetails = {
      MENU: req.body.MENU,
      PRICE: req.body.PRICE,
      CATEGORY: req.body.CATEGORY,
      IMAGE: imageBuffer.toString('base64'),
    };

    // Load the existing products
    const products = await productsRepo.getAll();

    // Check if MENU and CATEGORY combination already exists in products.MENU
    const isDuplicate = products.MENU.some((item) => (
      item.MENU === newItemDetails.MENU && item.CATEGORY === newItemDetails.CATEGORY
    ));

    if (isDuplicate) {
      return res.status(400).json({ error: 'Item with the same MENU and CATEGORY already exists' });
    }

    // If not a duplicate, unshift (add to the beginning) the new item
    products.MENU.unshift(newItemDetails);

    // Save the updated products
    await productsRepo.writeAll(products);

    res.status(201).json({ message: 'Item added successfully', newItem: newItemDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});









app.post('/api/product/delete', async (req, res) => {
  try {
    const { itemName,CATEGORY } = req.body;

    productsRepo.deleteProduct(itemName,CATEGORY)
    const newproducts = await productsRepo.getAll()
    
    res.status(201).json({ message: `Item ${itemName} deleted successfully hii`, newItem: req.body.CATEGORY });
  } catch (error) {
    console.error(error);
    console.log('internal');
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/api/product/edit', upload.single('IMAGE'), async (req, res) => {
  try {
    let imageBuffer = '';
    
    if (req.file) {
      // Use Tinify to compress the uploaded image
      const firstCompressedBuffer = await tinify.fromBuffer(req.file.buffer).toBuffer();
  
  // Second compression
  const doublyCompressedBuffer = await tinify.fromBuffer(firstCompressedBuffer).toBuffer();
  
  imageBuffer = doublyCompressedBuffer;
    }
    if(!req.file){
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { prevMENU, prevCATEGORY, MENU, CATEGORY, PRICE } = req.body;
    const newItemDetails = {
      MENU,
      PRICE,
      CATEGORY,
      IMAGE: imageBuffer.toString('base64'), // Convert to base64
    };

    productsRepo.updateProduct(prevMENU, prevCATEGORY, newItemDetails);

    const newproducts = await productsRepo.getAll();

    res.status(201).json({ message: `Item ${MENU} edited successfully`, newItem: req.body.CATEGORY });
  } catch (error) {
    console.error(error);
    console.log('internal');
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/api/special/new', upload.single('IMAGE'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let imageBuffer = '';

    // Use Tinify to compress the uploaded image
    const compressedBuffer = await tinify.fromBuffer(req.file.buffer).toBuffer();
    imageBuffer = compressedBuffer;

    // Access the other form data
    const newItemDetails = {
      MENU: req.body.MENU,
      PRICE: req.body.PRICE,
      CATEGORY: req.body.CATEGORY,
      IMAGE: imageBuffer.toString('base64'),
    };

    // Load the existing products
    const products = await productsRepo.getAll();

    // Check if MENU and CATEGORY combination already exists in products.Landing_Page.SPECIAL_ORDER
    const isDuplicate = products.Landing_Page.SPECIAL_ORDER.some((item) => (
      item.MENU === newItemDetails.MENU && item.CATEGORY === newItemDetails.CATEGORY
    ));

    if (isDuplicate) {
      return res.status(400).json({ error: 'Item with the same MENU and CATEGORY already exists' });
    }

    // If not a duplicate, push the new item to Landing_Page.SPECIAL_ORDER
    products.Landing_Page.SPECIAL_ORDER.push(newItemDetails);

    // Save the updated products
    await productsRepo.writeAll(products);

    res.status(201).json({ message: 'Item added successfully', newItem: newItemDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});









app.post('/api/special/delete', async (req, res) => {
  try {
    const { itemName,CATEGORY } = req.body;

    productsRepo.deleteSpecial(itemName,CATEGORY)
    const newproducts = await productsRepo.getAll()
    
    res.status(201).json({ message: `Item ${itemName} deleted successfully hii`, newItem: req.body.CATEGORY });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/api/special/edit', upload.single('IMAGE'), async (req, res) => {
  try {
    let imageBuffer = '';
    
    if (req.file) {
      // Use Tinify to compress the uploaded image
      const compressedBuffer = await tinify.fromBuffer(req.file.buffer).toBuffer();
      imageBuffer = compressedBuffer;
    }
    if(!req.file){
      console.log('missing');
    }
    
    const { prevMENU, prevCATEGORY, MENU, CATEGORY, PRICE } = req.body;
    const newItemDetails = {
      MENU,
      PRICE,
      CATEGORY,
      IMAGE: imageBuffer.toString('base64'), 
    };

    productsRepo.updateSpecial(prevMENU, prevCATEGORY, newItemDetails);
    console.log(newItemDetails);

    const newproducts = await productsRepo.getAll();

    res.status(201).json({ message: `Item ${MENU} edited successfully`, newItem: req.body.CATEGORY });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/logout', (req, res) => {
  // You can add logic here to invalidate the token or perform any necessary cleanup
  res.json({ message: 'Logged out successfully' });
});








// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

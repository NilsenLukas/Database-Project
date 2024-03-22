const mongoose = require('mongoose');

// MongoDB URI - replace <username>, <password>, and <your-database> with your actual credentials
const uri = "mongodb+srv://lagt123456:rxOtJH3fuh6uSyAx@faithnfabrics.7cui0e8.mongodb.net/?retryWrites=true&w=majority&appName=FaithNFabrics";

// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connection established successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define a User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    fName: { type: String, required: true },
    lName: { type: String, required: true },
    address: { type: String, required: false },
    aptNum: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    zip: { type: String, required: false },
    status: { type: String, required: true }
});
// Create a User Model
const User = mongoose.model('User', userSchema);

//Define Item Schema
const itemSchema = new mongoose.Schema({
    productID: { type: String, required: true, unique: true },
    color: { type: String, required: true }, 
    price: { type: String, required: true },
    size: { type: String, required: true },
    stock: { type: String, required: true },
    description: { type: String, required: false }
});
// Create a User Model
const Item = mongoose.model('Item', itemSchema);

//Define Order Schema
const orderSchema = new mongoose.Schema({
    productID: { type: String, required: true },
    email: { type: String, required: true }, 
    date: { type: String, required: true },
    quantity: { type: String, required: true },
    shipAddress: { type: String, required: true },
    shipAptNum: { type: String, required: true },
    shipCity: { type: String, required: true },
    shipState: { type: String, required: true },
    shipZip: { type: String, required: true }
});
// Create a User Model
const Order = mongoose.model('Order', orderSchema);

// Function to add a new user
async function addNewUser(email, password, fName,lName, address, aptNum, city, state, zip, status) {
  // Ideally, hash the password here with bcrypt or a similar library before saving
    const newUser = new User({ email, password, fName, lName, address, aptNum, city, state, zip, status });
    try {
    const savedUser = await newUser.save();
    console.log('User created successfully:', savedUser);
    } catch (error) {
    console.error('Error creating user:', error);
    }
}

// Example usage
addNewUser('Admin', 'Admin1', 'Lukas', 'Nilsen', '408 N Minerva Ave', '', 'Royal Oak', 'Michigan', '48067', 'Admin');

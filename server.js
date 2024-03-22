const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const { User, addNewUser, removeUser, Item, addNewItem, removeItem, Order, addNewOrder, removeOrder } = require('./DBSchema');


const app = express();
const port = 5500;
const mongoURI = "mongodb+srv://lagt123456:rxOtJH3fuh6uSyAx@faithnfabrics.7cui0e8.mongodb.net/mydatabase?retryWrites=true&w=majority";

// Establish MongoDB Connection
mongoose.connect(mongoURI, {})
  .then(() => console.log('MongoDB connection established successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure session middleware with connect-mongo
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: mongoURI }), 
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 } 
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/create-account', async (req, res) => {
    const { email, password, fName, lName } = req.body;
    try {
        await addNewUser(email, password, fName, lName, '', '', '', '', '', 'User');
        res.json({ message: 'Account created successfully'});
    } catch (error) {
        res.status(500).json({ message: 'Failed to create account', error: error.message });
    }
});

app.post('/login', async (req, res) => { 
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password });
        if (user) {
            req.session.userId = user._id;
            req.session.status = user.status;
            res.json({ message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

app.get('/session-info', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, isAdmin: req.session.status === 'Admin' });
    } else {
        res.json({ loggedIn: false, isAdmin: false });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

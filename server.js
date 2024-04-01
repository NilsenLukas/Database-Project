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
            return res.status(500).send('Could not log out.');
        }
        res.clearCookie('connect.sid'); // This assumes you're using the default session cookie name.
        return res.redirect('/login.html'); // Redirect to login page after logout
    });
});



app.get('/api/clothes', async (req, res) => {
    try {
        const items = await Item.find({});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/api/user-info', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Not logged in' });
    }

    User.findById(req.session.userId, 'email fName lName address aptNum city state zip -_id')
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ message: 'Server error', error: err.message });
        });
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



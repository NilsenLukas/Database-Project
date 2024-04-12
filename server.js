const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const { User, addNewUser, removeUser, Item, addNewItem, removeItem, Order, addNewOrder, removeOrder, OrderItem } = require('./DBSchema');


const app = express();
const port = 5500;
const mongoURI = "mongodb+srv://lagt123456:rxOtJH3fuh6uSyAx@faithnfabrics.7cui0e8.mongodb.net/mydatabase?retryWrites=true&w=majority";

// MongoDB Connection
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
        res.clearCookie('connect.sid'); 
        return res.redirect('/login.html'); 
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

// Function to find or create a cart (an incomplete order)
async function findOrCreateCart(userId) {
    let order = await Order.findOne({ email: userId, isComplete: false });
    if (!order) {
        order = new Order({ email: userId, productIDList: [], isComplete: false });
        await order.save();
    }
    return order;
}

app.post('/api/add-to-cart', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('User not logged in');
    }

    const { productId, quantity } = req.body;
    if (!productId || quantity <= 0) {
        return res.status(400).send('Invalid product ID or quantity');
    }

    try {
        // Find an existing cart for the user (an order that's not complete)
        let cart = await Order.findOne({ email: req.session.userId, isComplete: false });
        if (!cart) {
            // If no existing cart, find the next orderID and create a new cart
            const nextOrderID = await getNextOrderID();
            cart = new Order({
                email: req.session.userId,
                orderID: nextOrderID, // Set the new orderID
                productIDList: [],
                isComplete: false
            });
            await cart.save();
        }

        // Find the item by its productID
        const item = await Item.findOne({ productID: productId });
        if (!item) {
            return res.status(404).send('Item not found');
        }

        // Check if the item is already in the cart; if so, update its quantity
        let orderItem = await OrderItem.findOne({ order: cart._id, productID: item._id });
        if (orderItem) {
            orderItem.quantity += quantity;
            await orderItem.save();
        } else {
            // Otherwise, create a new OrderItem and add it to the cart
            orderItem = new OrderItem({
                order: cart._id,
                productID: item._id,
                quantity
            });
            await orderItem.save();
            cart.productIDList.push(orderItem._id);
            await cart.save();
        }

        res.json({ message: 'Item added to cart successfully' });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).send('Error adding item to cart');
    }
});

app.delete('/api/remove-from-cart/:orderItemId', async (req, res) => {
    const { orderItemId } = req.params;
    if (!req.session.userId) {
        return res.status(401).send('User not logged in');
    }

    try {
        // Remove the specified OrderItem document
        await OrderItem.findByIdAndDelete(orderItemId);

        // Find the user's current cart and remove the item from the productIDList
        await Order.updateOne(
            { email: req.session.userId, isComplete: false },
            { $pull: { productIDList: orderItemId } }
        );

        res.status(200).send('Item removed from cart');
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).send('Error removing item from cart');
    }
});



// Function to get the next orderID
async function getNextOrderID() {
    const lastOrder = await Order.findOne().sort({ orderID: -1 }).limit(1);
    if (lastOrder) {
        return lastOrder.orderID + 1;
    } else {
        // Return 1 if there are no orders yet
        return 1;
    }
}

app.post('/api/start-new-order', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('User not logged in');
    }

    try {
        // Get the next orderID
        const nextOrderID = await getNextOrderID();
        const newOrder = new Order({
            orderID: nextOrderID,
            email: req.session.userId,
            productIDList: [],
            isComplete: false,
        });

        await newOrder.save();

        res.json({ message: 'New order started', orderID: nextOrderID });
    } catch (error) {
        console.error('Error starting new order:', error);
        res.status(500).send('Error starting new order');
    }
});


// Endpoint to get the current cart for the logged-in user
app.get('/api/current-cart', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('User not logged in');
    }

    try {
        const cart = await Order.findOne({ email: req.session.userId, isComplete: false })
                                .populate({
                                    path: 'productIDList',
                                    populate: { path: 'productID', model: 'Item' }
                                });

        if (!cart) {
            return res.status(404).send('Cart not found');
        }

        res.json(cart.productIDList);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving cart');
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

// Endpoint to update user information
app.post('/api/update-user-info', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('User not logged in');
    }

    const { fName, lName, address, aptNum, city, state, zip, password } = req.body;
    try {
        const updateData = { fName, lName, address, aptNum, city, state, zip };

        // Optionally update password if provided and not empty
        if (password && password.trim() !== '') {
            // Here you should ideally hash the password before storing
            updateData.password = password;  // Consider using bcrypt to hash the password
        }

        await User.findByIdAndUpdate(req.session.userId, updateData, { new: true });
        res.json({ message: 'User information updated successfully' });
    } catch (error) {
        console.error('Error updating user information:', error);
        res.status(500).send('Error updating user information');
    }
});

app.post('/api/checkout', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('User not logged in');
    }

    const { shipAddress, shipAptNum, shipCity, shipState, shipZip } = req.body;

    try {
        const updatedOrder = await Order.findOneAndUpdate(
            { email: req.session.userId, isComplete: false },
            {
                shipAddress,
                shipAptNum,
                shipCity,
                shipState,
                shipZip,
                isComplete: true 
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).send('No active cart found');
        }

        res.json({ message: 'Checkout successful', order: updatedOrder });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).send('Error during checkout');
    }
});





app.get('/api/order-history', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('User not logged in');
    }

    try {
        let query = { email: req.session.userId }; // Adjusted for user-specific orders
        const orders = await Order.find(query)
            .populate({
                path: 'productIDList',
                populate: { path: 'productID', model: 'Item' }
            })
            .sort({ date: -1 });

        const formattedOrders = orders.map(order => ({
            orderID: order.orderID,
            date: order.date,
            shipAddress: order.shipAddress,
            shipAptNum: order.shipAptNum,
            shipCity: order.shipCity,
            shipState: order.shipState,
            shipZip: order.shipZip,
            isComplete: order.isComplete ? 'Finished' : 'Active',
            items: order.productIDList.map(item => `${item.productID.name} (x${item.quantity})`)
        }));

        res.json(formattedOrders);
    } catch (error) {
        console.error('Error retrieving order history:', error);
        res.status(500).send('Error retrieving order history');
    }
});


app.post('/create-account', async (req, res) => {
    const { email, password, fName, lName } = req.body;
    try {
        const newUser = await addNewUser(email, password, fName, lName, '', '', '', '', '', 'User');
        req.session.userId = newUser._id;
        req.session.status = newUser.status; 
        res.json({ message: 'Account created successfully', loggedIn: true });
    } catch (error) {
        if (error.code === 11000) {
            res.status(409).json({ message: 'Email already exists' });
        } else {
            res.status(500).json({ message: 'Failed to create account', error: error.message });
        }
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



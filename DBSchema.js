const mongoose = require('mongoose');

// Define a User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    fName: { type: String, required: false },
    lName: { type: String, required: false },
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
    name: { type: String, required: true },
    color: { type: String, required: true }, 
    price: { type: Number, required: true },
    size: { type: String, required: true },
    stock: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }
});
// Create a item Model
const Item = mongoose.model('Item', itemSchema);

//define Order Schema
const orderSchema = new mongoose.Schema({
    orderID: { type: Number, required: true, unique: true },
    productIDList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }],
    email: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    date: { type: Date, default: Date.now },
    shipAddress: { type: String, required: false },
    shipAptNum: { type: String, required: false },
    shipCity: { type: String, required: false },
    shipState: { type: String, required: false },
    shipZip: { type: String, required: false },
    isComplete: { type: Boolean, required: true, default: false },
});
//Create a order Model
const Order = mongoose.model('Order', orderSchema);

//productIDList Schema
const orderItemSchema = new mongoose.Schema({
    productID: { type: String, required: true },
    quantity: { type: Number, required: true }
})
const OrderItem = mongoose.model('OrderItem', orderItemSchema);

// Function to add a new user
async function addNewUser(email, password, fName, lName, address, aptNum, city, state, zip, status) {
    const newUser = new User({ email, password, fName, lName, address, aptNum, city, state, zip, status });
    try {
        const savedUser = await newUser.save();
        console.log('User created successfully:', savedUser);
        return savedUser;  
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;  
    }
}


// Function to remove a user given user email
async function removeUser(email){
    const result = await User.deleteOne({ email: email });
    try{
        if (result === 0){
            console.log("No user found with that email");
        }
        else{
            console.log("User deleted");
        }
    }
    catch{
        console.error("Error deleting user", error);
    }
}

// Function to add a new item
async function addNewItem(productID, name, color, price, size, stock, description, image) {
    const newItem = new Item({ productID, name, color, price, size, stock, description, image });
    try {
    const savedItem = await newItem.save();
    console.log('Item created successfully:', savedItem);
    } catch (error) {
        if (error.code === 11000){
            console.log("Item already exists");
        }
        else{
            console.error('Error creating item:', error);
        }
    }
}

// Function to remove a item given user productID
async function removeItem(productID){
    const result = await Item.deleteOne({ productID: productID });
    try{
        if (result === 0){
            console.log("No item found with that product ID");
        }
        else{
            console.log("item deleted");
        }
    }
    catch{
        console.error("Error deleting item", error);
    }
}

// Function to add a new order
async function addNewOrder(orderID, productID, email, date, quantity, shipAddress, shipAptNum, shipCity, shipState, shipZip) {
    const newOrder = new Order({ orderID, productID, email, date, quantity, shipAddress, shipAptNum, shipCity, shipState, shipZip});
    try {
    const savedOrder = await newOrder.save();
    console.log('Order created successfully:', savedOrder);
    } catch (error) {
        console.error('Error creating item:', error);
        
    }
}

// Function to remove a order given orderID
async function removeOrder(orderID){
    const result = await Order.deleteOne({ orderID: orderID });
    try{
        if (result === 0){
            console.log("No order found with that order ID");
        }
        else{
            console.log("order deleted");
        }
    }
    catch{
        console.error("Error deleting order", error);
    }
}

// Example usage
//addNewUser('Admin2', 'Admin1', '', '', '', '', '', '', '', 'Admin');
//addNewUser('Admin2', 'Admin1', '', '', '', '', '', '', '', 'Admin');

//removeUser('Admin2');
//removeUser('Admin2');

// removeItem('1');
// removeItem('2');
// removeItem('3');
// removeItem('4');

//addNewItem('1', 'BlackT', 'black', '10', 'M', '10', 'black shirt', 'BlackTshirtTemplate.jpeg');
// addNewItem('2', 'Cargo Pants', 'tan', '15', 'L', '5', 'Cargo pants', 'CargoPantsTemplate.jpeg');
// addNewItem('3', 'Jeans','blue', '20', 'S', '3', 'Jeans', 'JeansTemplate.jpeg');
//addNewItem('4', 'WhiteT', 'white', '10', 'M', '10', 'white shirt', 'whiteTtemplate.jpeg');
// addNewItem('1', 'Yellow Shirt', 'Yellow', '10', 'M', '10', 'Yellow T-shirt', 'Yellow_T.png');
// addNewItem('2', 'Blue Shirt', 'Blue', '15', 'M', '10', 'Blue long sleeve shirt', 'Blue_Shirt.png');
// addNewItem('3', 'Pink Flannel', 'Pink', '35', 'M', '10', 'Pink and white plaid flannel', 'Pink_Flannel.png');
// addNewItem('4', 'Grey Hoodie', 'Grey', '45', 'M', '10', 'Thick grey shirt with a hood and pocket', 'Grey_Hoodie.png');
// addNewItem('5', 'Red Sweatshirt', 'Red', '40', 'M', '10', 'Thick red shirt', 'Red_Hoodie.png');
// addNewItem('6', 'Blue Jacket', 'Blue', '50', 'M', '10', 'Blue jacket with collar, buttons, and pockets', 'Blue_jacket.png');
// addNewItem('7', 'Tan Jacket', 'Tan', '50', 'M', '10', 'Tan V-neck with buttons', 'Tan_Jacket.png');
// addNewItem('8', 'Brown Jacket', 'Brown', '60', 'M', '10', 'Heavy jacket with hood and buttons', 'Brown_Jacket.png');
// addNewItem('9', 'Jeans', 'Blue', '35', 'M', '10', 'Blue Jeans with cuffed bottoms', 'Blue_Jeans.png');
//addNewItem('10', 'Blue Shirt', 'Blue', '15', 'M', '10', 'Blue long sleeve shirt', 'Blue_Shirt.png');


//addNewOrder('1', '1', 'Admin', '2021-01-01', '1', '1234 Main St', 'Apt 1', 'City', 'State', '12345');
//addNewOrder('2', '2', 'Admin', '2021-01-01', '2', '1234 Main St', 'Apt 1', 'City', 'State', '12345');



//removeOrder('2');

// mydatabase.Item.updateMany(
//     { "stock": { $type: "string" } },
//     [{ $set: { "stock": { $toInt: "$stock" } } }]
// );

module.exports = {
    User, 
    Item,
    Order,
    OrderItem,
    addNewUser,
    removeUser,
    addNewItem,
    removeItem,
    addNewOrder,
    removeOrder
};
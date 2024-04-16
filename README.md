# Database-Project

Project made by Andrew, Lukas, Jared, Bilal.

The domain that we are going to use is the online apparel retail space, for the brand "FaithNFabrics." This will include different aspects of an e-commerce platform dedicated to selling clothing items.
The aspects of "FaithNFabrics" that we will be modeling will include 5 different aspects with relationships. The five are Customers, Suppliers, Administrators, Order, and Inventory. The admin can manage the inventory and the supplier supplies the inventory and then the inventory has an order where the customers can purchase and make that order from the inventory.
The Customers will have a shipping address, password, email, phone number last name and a first name. The Supplier will have a first name, last name, and an email. The Administrators will have a first name, last name, password, address, and an email. The Inventory will have color, price, ProductID, size, stock, and description of the product. The order will have an OrderID, date, and quantity.
The project will include each functional dependency that relates and applicable to each table and then provide a brief description of each. This list of tables will be obtained after normalization till each table reaches BCNF where the primary keys, forging keys will also be included.
This project will use databases to store all the necessary data. For user account and login management, and inventory management, relational databases will be used to maintain the data's relationships. The application will be developed using a combination of software, including web development for the frontend and backend, with MongoDB for database management.
We do not think the need for any special software or hardware beyond standard web development and database management tools. The primary focus will be on creating a user-friendly website that effectively shows the "FaithNFabrics" brand and makes it easy for customers to browse and purchase clothing items online.

There are two different ways to run the website.

1. By using server.js to run a local host at a certian port. You can download the zip file on vscode and inside the vscode terminal you must run "node server.js" where that will run the server and you can go to the localhost and port that it gives you. If you do not have node you must downlaod it to run on your vscode.

   • To be able to run the local server on your vs code, you must have node.js, mongoose.js, and express.js installed.

   • You must also be a member of the mongodb database and have your ip varrified.

2. A simple website link will also be added that will take you directly to the website.

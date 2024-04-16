document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminPageRequested = urlParams.get('admin') === 'true';
    // Fetch session info to adjust UI accordingly
    fetch('/session-info')
    .then(response => response.json())
    .then(data => {
        // Setup the dynamic options based on user session info
        const accountOptionsPanel = document.querySelector('.account-options-panel');
        accountOptionsPanel.innerHTML = `
            <button data-section="accountInfo" class="account-option">Account Info</button>
            <button data-section="cart" class="account-option" id="cart-button">Cart 🛒</button>
            <button data-section="orderHistory" class="account-option">Order History</button>
            ${data.isAdmin ? '<button data-section="adminPage" class="account-option">Admin Page</button>' : ''}
            <button id="logout-btn">Logout</button>
        `;

        // Set click event listeners for dynamic options
        document.querySelectorAll('.account-option').forEach(btn => {
            btn.addEventListener('click', () => {
                // When any option is clicked, show the corresponding section
                showSection(btn.dataset.section);
            });
        });

        // Logout functionality
        document.querySelector('#logout-btn').addEventListener('click', handleLogout);

        /*if (data.isAdmin) {
            document.querySelector('.admin-page-section').style.display = 'block';
            document.getElementById('searchUserBtn').addEventListener('click', searchUser);
            document.getElementById('addItemBtn').addEventListener('click', addItem);
            document.getElementById('searchItemBtn').addEventListener('click', searchItem);
        }*/

        if (data.isAdmin) {
            displayAdminPage();  // Ensure admin sections are displayed if the user is an admin
            if (isAdminPageRequested) {
                showSection('adminPage');  // Directly show the admin page if requested
            } else {
                showSection('accountInfo');  // Default section to show
            }
        }

        // Initially show the account info section
        //showSection('accountInfo');
    })
    .catch(error => console.error('Error fetching session info:', error));

    // Function to handle logout
    function handleLogout(e) {
        e.preventDefault();
        fetch('/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => {
            if (response.ok) window.location.href = '/login.html';
        })
        .catch(error => console.error('Error:', error));
    }

    // Function to display the appropriate section
    function showSection(activeSection) {
        const sections = {
            accountInfo: document.querySelector('.account-info-section'),
            cart: document.querySelector('.cart-section'),
            orderHistory: document.querySelector('.order-history-section'),
            adminPage: document.querySelector('.admin-page-section')
        };

        // Hide all sections
        Object.values(sections).forEach(section => section.style.display = 'none');

        // Show the active section
        if (sections[activeSection]) {
            sections[activeSection].style.display = 'block';
            if (activeSection === 'cart') {
                // If cart section is active, fetch and display the cart items
                displayCart();
            }
            else if (activeSection === 'orderHistory') {
                // If order history section is active, fetch and display the order history
                displayOrderHistory();
            }
            else if (activeSection === 'adminPage') {
                // If admin page section is active, fetch and display the admin page
                displayAdminPage();
            }
        }
    }

    function displayAdminPage() {
        const adminSection = document.querySelector('.admin-page-section');
        if (adminSection) {
            // Ensure that the admin section itself is shown
            adminSection.style.display = 'block';
            // Explicitly display subsections within the admin section
            document.querySelectorAll('.admin-section').forEach(section => {
                section.style.display = 'block';
            });
        }
    }
    

    // Function to fetch and display cart contents (remains unchanged)
    const displayCart = () => {
        const cartItemsContainer = document.querySelector('.cart-items-container');
        fetch('/api/current-cart')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch cart');
            }
            return response.json();
        })
        .then(cartItems => {
            // Make sure cartItemsContainer is correctly defined here
            const cartItemsContainer = document.querySelector('.cart-items-container');
            if (!cartItemsContainer) {
                console.error('Cart items container not found');
                return; // Exit if the container does not exist
            }
    
            cartItemsContainer.innerHTML = ''; // Clear existing items
    
            if (cartItems.length === 0 || cartItems.error) {
                cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            } else {
                let total = 0;
                cartItems.forEach(item => {
                    const itemHtml = `
                        <div class="cart-item">
                            <span class="remove-item-btn" data-order-item-id="${item._id}">X</span>
                            <p>${item.productID.name} - $${item.productID.price} x ${item.quantity}</p>
                        </div>
                    `;
                    cartItemsContainer.innerHTML += itemHtml;
                    total += item.productID.price * item.quantity;
                });
    
                // Update total price
                document.querySelector('.cart-section .price b').textContent = `$${total.toFixed(2)}`;
    
                // Attach event listeners to the "X" buttons after items have been added
                document.querySelectorAll('.remove-item-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const orderItemId = e.target.getAttribute('data-order-item-id');
                        if (orderItemId) {
                            fetch(`/api/remove-from-cart/${orderItemId}`, {
                                method: 'DELETE'
                            })
                            .then(response => {
                                if (response.ok) {
                                    displayCart(); // Re-fetch and display the updated cart
                                } else {
                                    console.error('Failed to remove item from cart');
                                }
                            })
                            .catch(error => console.error('Error removing item from cart:', error));
                        }
                    });
                });
            }
        })
        .catch(error => {
            console.error('Error fetching cart:', error);
            // Make sure to check if cartItemsContainer exists before attempting to update its innerHTML
            if (cartItemsContainer) {
                cartItemsContainer.innerHTML = '<p>Error fetching cart. Please try again later.</p>';
            }
        });
    };
    
    
    



    // Fetch and display user info for the account info section
fetch('/api/user-info')
.then(response => response.json())
.then(userInfo => {
    document.getElementById('email').value = userInfo.email;
    document.getElementById('fName').value = userInfo.fName;
    document.getElementById('lName').value = userInfo.lName;
    document.getElementById('address').value = userInfo.address;
    document.getElementById('aptNum').value = userInfo.aptNum;
    document.getElementById('city').value = userInfo.city;
    document.getElementById('state').value = userInfo.state;
    document.getElementById('zip').value = userInfo.zip;
    
    // Set up listeners to detect changes
    ['fName', 'lName', 'address', 'aptNum', 'city', 'state', 'zip', 'password'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            document.getElementById('update-info-btn').style.display = 'block';
        });
    });

    // Setup the update information button click event
    document.getElementById('update-info-btn').addEventListener('click', updateUserInfo);
    /*document.getElementById('update-info-btn').addEventListener('click', () => {
        const updates = {
            fName: document.getElementById('fName').value.trim(),
        lName: document.getElementById('lName').value.trim(),
        address: document.getElementById('address').value.trim(),
        aptNum: document.getElementById('aptNum').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zip: document.getElementById('zip').value.trim(),
        password: document.getElementById('password').value
        };
    
        // Send the update request
        fetch('/api/users/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: updates.email, updates })
        }).then(response => response.json())
          .then(data => {
              console.log(data.message);
              alert('User updated successfully!');
          }).catch(error => {
              console.error('Failed to update user:', error);
              alert('Failed to update user information.');
          });
    });*/
    
})
.catch(error => console.error('Error fetching user info:', error));

// Function to update user info
function updateUserInfo() {
    const userInfo = {
        fName: document.getElementById('fName').value.trim(),
        lName: document.getElementById('lName').value.trim(),
        address: document.getElementById('address').value.trim(),
        aptNum: document.getElementById('aptNum').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zip: document.getElementById('zip').value.trim(),
        password: document.getElementById('password').value
    };

    // Remove empty fields to prevent unnecessary updates, especially if passwords are involved
    Object.keys(userInfo).forEach(key => {
        if (!userInfo[key]) delete userInfo[key];
    });

    fetch('/api/update-user-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userInfo)
    })
    .then(response => response.json()) // Ensure the response is parsed as JSON first
    .then(data => {
        // Check if the operation was successful, not by throwing errors
        if (data.success) {
            showMessage('Information updated successfully', 'success');
            document.getElementById('update-info-btn').style.display = 'none'; // Optionally hide the update button after successful update
        } else {
            // Properly handle the server response when it's not successful
            showMessage(data.message || 'Failed to update information', 'error');
        }
    })
    .catch(error => {
        // Handle actual errors that occur during fetch or due to network issues
        console.error('Error updating user info:', error);
        showMessage('Error updating user information: ' + error.message, 'error');
    });
}


function showMessage(message, type) {
    const messageContainer = document.getElementById('message-container');
    if (!messageContainer) {
        console.error('Message container not found');
        return; 
    }
    messageContainer.textContent = message; 
    messageContainer.className = type === 'success' ? 'success' : 'error';
    messageContainer.style.display = 'block'; 
}



document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();  

    var formData = {
        shipAddress: document.querySelector('[name="shipAddress"]').value,
        shipAptNum: document.querySelector('[name="shipAptNum"]').value,
        shipCity: document.querySelector('[name="shipCity"]').value,
        shipState: document.querySelector('[name="shipState"]').value,
        shipZip: document.querySelector('[name="shipZip"]').value
    };

    fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message.startsWith("Not enough stock for items")) {
            alert(data.message);  // Alert the user which items are out of stock
        } else {
            alert('Checkout successful!');
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Error during checkout:', error);
        alert('Checkout failed. Please try again.');
    });
});

function displayOrderHistory() {
    fetch('/api/order-history', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch order history');
        }
        return response.json();
    })
    .then(orders => {
        const orderHistoryList = document.getElementById('order-history-list');
        orderHistoryList.innerHTML = '';
        if (orders.length === 0) {
            orderHistoryList.innerHTML = '<p>This user has no order history.</p>';
        } else {
            orders.forEach(order => {
                const orderEntry = document.createElement('div');
                orderEntry.className = "order-entry";
                orderEntry.innerHTML = `
                    <h3>Order ID: ${order.orderID} <!--- ${order.isComplete ? 'Finished' : 'Active'}--></h3>
                    <p>User: ${order.userName} (${order.userEmail})</p>
                    <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                    <p>Address: ${order.shipAddress}, ${order.shipAptNum}, ${order.shipCity}, ${order.shipState}, ${order.shipZip}</p>
                    <p>Items: ${order.items.join(', ')}</p>
                `;

                orderHistoryList.appendChild(orderEntry);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching order history:', error);
        orderHistoryList.innerHTML = '<p>Error fetching order history. Please try again later.</p>';
    });
}

function showSection(activeSection) {
    const sections = {
        accountInfo: document.querySelector('.account-info-section'),
        cart: document.querySelector('.cart-section'),
        orderHistory: document.querySelector('.order-history-section'),
        adminPage: document.querySelector('.admin-page-section')
    };

    // Hide all sections
    Object.values(sections).forEach(section => section.style.display = 'none');

    // Show the active section
    if (sections[activeSection]) {
        sections[activeSection].style.display = 'block';
        if (activeSection === 'cart') {
            displayCart();  // Refresh the cart contents
        } else if (activeSection === 'orderHistory') {
            displayOrderHistory();  // Load and display the order history
        }
        else if (activeSection === 'adminPage') {
            displayAdminPage();  // Load and display the admin page
        }
    }
}

document.getElementById('searchUserBtn').addEventListener('click', () => {
    const email = document.getElementById('searchEmail').value;
    fetch(`/api/users?email=${email}`)
        .then(response => response.json())
        .then(user => {
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userFName').value = user.fName;
            document.getElementById('userLName').value = user.lName;
            document.getElementById('userPassword').value = user.password;
            document.getElementById('userStatus').value = user.status;
            document.getElementById('userDetails').style.display = 'block';
        })
        .catch(error => console.error('Error fetching user:', error));
});

document.getElementById('addItemBtn').addEventListener('click', () => {
    const productID = document.getElementById('newItemProductID').value;
    const name = document.getElementById('newItemName').value;
    const color = document.getElementById('newItemColor').value;
    const price = document.getElementById('newItemPrice').value;
    const size = document.getElementById('newItemSize').value;
    const stock = document.getElementById('newItemStock').value;
    const description = document.getElementById('newItemDescription').value;
    const image = document.getElementById('newItemImage').value;

    const item = { productID, name, color, price, size, stock, description, image };
    fetch('/api/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    })
        .then(response => response.json())
        .then(data => alert('Item added successfully'))
        .catch(error => console.error('Error adding item:', error));
});


document.getElementById('searchItemBtn').addEventListener('click', () => {
    const productID = document.getElementById('searchItemID').value;
    fetch(`/api/items?productID=${productID}`)
        .then(response => response.json())
        .then(item => {
            document.getElementById('updateItemName').value = item.name;
            document.getElementById('updateItemColor').value = item.color;
            document.getElementById('updateItemPrice').value = item.price;
            document.getElementById('updateItemSize').value = item.size;
            document.getElementById('updateItemStock').value = item.stock;
            document.getElementById('updateItemDescription').value = item.description;
            document.getElementById('updateItemImage').value = item.image;
            document.getElementById('itemDetails').style.display = 'block';
        })
        .catch(error => console.error('Error fetching item:', error));
});

// Event listener for updating user information
document.getElementById('adminUpdateUserBtn').addEventListener('click', function() {
    const userEmail = document.getElementById('userEmail').value;
    const userUpdates = {
        fName: document.getElementById('userFName').value,
        lName: document.getElementById('userLName').value,
        password: document.getElementById('userPassword').value, // Handle with care
        status: document.getElementById('userStatus').value
    };

    fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, updates: userUpdates })
    })
    .then(response => response.json())
    .then(data => {
        alert('User updated successfully!');
        console.log(data);
    })
    .catch(error => {
        console.error('Error updating user:', error);
        alert('Failed to update user information.');
    });
});

// Event listener for updating item information
document.getElementById('adminUpdateItemBtn').addEventListener('click', function() {
    const productID = document.getElementById('searchItemID').value;
    const itemUpdates = {
        name: document.getElementById('updateItemName').value,
        color: document.getElementById('updateItemColor').value,
        price: parseFloat(document.getElementById('updateItemPrice').value),
        size: document.getElementById('updateItemSize').value,
        stock: parseInt(document.getElementById('updateItemStock').value, 10),
        description: document.getElementById('updateItemDescription').value,
        image: document.getElementById('updateItemImage').value
    };

    fetch('/api/items/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productID: productID, updates: itemUpdates })
    })
    .then(response => response.json())
    .then(data => {
        alert('Item updated successfully!');
        console.log(data);
    })
    .catch(error => {
        console.error('Error updating item:', error);
        alert('Failed to update item information.');
    });
});

document.getElementById('deleteUserBtn').addEventListener('click', function() {
    const email = document.getElementById('deleteUserEmail').value;
    fetch(`/api/users/delete?email=${email}`, { method: 'DELETE' })
      .then(response => {
        if (response.ok) {
          alert('User deleted successfully');
        } else {
          alert('Failed to delete user');
        }
      })
      .catch(error => alert('Error deleting user: ' + error));
  });
  
  document.getElementById('deleteItemBtn').addEventListener('click', function() {
    const productID = document.getElementById('deleteItemProductID').value;
    fetch(`/api/items/delete?productID=${productID}`, { method: 'DELETE' })
      .then(response => {
        if (response.ok) {
          alert('Item deleted successfully');
        } else {
          alert('Failed to delete item');
        }
      })
      .catch(error => alert('Error deleting item: ' + error));
  });



});

document.addEventListener('DOMContentLoaded', () => {
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

        // Initially show the account info section
        showSection('accountInfo');
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
        }
    }

    // Function to fetch and display cart contents (remains unchanged)
    const displayCart = () => {
        fetch('/api/current-cart')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch cart');
            }
            return response.json();
        })
        .then(cartItems => {
            const cartItemsContainer = document.querySelector('.cart-items-container');
            cartItemsContainer.innerHTML = ''; // Clear existing items
            let total = 0;
            cartItems.forEach(item => {
                // Ensure each item includes a populated productID with name and price
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
                    // Prevent the event from bubbling to higher-level elements
                    e.stopPropagation();
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
        })
        .catch(error => {
            console.error('Error fetching cart:', error);
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
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    })
    .then(data => {
        // Display a success message
        showMessage('Information updated successfully', 'success');
        document.getElementById('update-info-btn').style.display = 'none'; // Hide the update button after successful update
    })
    .catch(error => {
        console.error('Error updating user info:', error);
        // Display an error message
        showMessage('Failed to update information', 'error');
    });
}

function showMessage(message, type) {
    const messageContainer = document.querySelector('.message-container');
    if (!messageContainer) {
        console.error('Message container not found');
        return;
    }
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = `alert alert-${type}`; // Assuming Bootstrap or similar for styling
    messageContainer.innerHTML = ''; // Clear previous messages
    messageContainer.appendChild(messageElement);

    // Automatically remove the message after 4 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 4000);
}

document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();  // Prevent the default form submission

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
    .then(response => {
        if (!response.ok) throw new Error('Checkout failed');
        return response.json();
    })
    .then(data => {
        alert('Checkout successful!');
        window.location.reload();
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
        console.log("Received orders: ", orders);
        const orderHistoryList = document.getElementById('order-history-list');
        orderHistoryList.innerHTML = '';
        orders.forEach(order => {
            const orderEntry = document.createElement('div');
            orderEntry.className = "order-entry";
            orderEntry.innerHTML = `
                <h3>Order ID: ${order.orderID} - ${order.isComplete ? 'Finished' : 'Active'}</h3>
                <p>User: ${order.userName} (${order.userEmail})</p>
                <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                <p>Address: ${order.shipAddress}, ${order.shipAptNum}, ${order.shipCity}, ${order.shipState}, ${order.shipZip}</p>
                <p>Items: ${order.items.join(', ')}</p>
            `;

            orderHistoryList.appendChild(orderEntry);
        });
    })
    
    .catch(error => {
        console.error('Error fetching order history:', error);
        alert('Error fetching order history: ' + error.message);
    });
}



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
        orderHistoryList.innerHTML = ''; // Clear previous entries

        orders.forEach(order => {
            const orderEntry = document.createElement('div');
            orderEntry.className = "order-entry";
            orderEntry.innerHTML = `
                <h3>Order ID: ${order.orderID} - ${order.isComplete ? 'Finished' : 'Active'}</h3>
                <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                <p>Address: ${order.shipAddress}, ${order.shipAptNum}, ${order.shipCity}, ${order.shipState}, ${order.shipZip}</p>
                <p>Items: ${order.items.join(', ')}</p>
            `;
            orderHistoryList.appendChild(orderEntry);
        });
    })
    .catch(error => {
        console.error('Error fetching order history:', error);
        alert('Error fetching order history: ' + error.message);
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
    }
}



});

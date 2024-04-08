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
        displayUserInfo(userInfo);
    })
    .catch(error => console.error('Error fetching user info:', error));

    // Function to display user info in the account info section
    function displayUserInfo(userInfo) {
        const accountInfoSection = document.querySelector('.account-info-section');
        if (accountInfoSection) {
            accountInfoSection.innerHTML = `
                <h2>Account Information</h2>
                <p><strong>Email:</strong> ${userInfo.email}</p>
                <p><strong>First Name:</strong> ${userInfo.fName}</p>
                <p><strong>Last Name:</strong> ${userInfo.lName}</p>
                <p><strong>Address:</strong> ${userInfo.address}</p>
                <p><strong>Apartment Number:</strong> ${userInfo.aptNum}</p>
                <p><strong>City:</strong> ${userInfo.city}</p>
                <p><strong>State:</strong> ${userInfo.state}</p>
                <p><strong>Zip Code:</strong> ${userInfo.zip}</p>
            `;
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const accountOptionsPanel = document.querySelector('.account-options-panel');
    const sections = {
        accountInfo: document.querySelector('.account-info-section'),
        orderHistory: document.querySelector('.order-history-section'),
        adminPage: document.querySelector('.admin-page-section')
    };

    // This function hides all sections and then shows the one that's needed.
    function showSection(activeSection) {
        Object.values(sections).forEach(section => section.style.display = 'none'); // Hide all sections
        if (sections[activeSection]) {
            sections[activeSection].style.display = 'block'; // Show the active section
        }

        // Highlight the active button
        document.querySelectorAll('.account-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === activeSection) {
                btn.classList.add('active');
            }
        });
    }

    // Dynamically generate the options based on user status
    fetch('/session-info')
        .then(response => response.json())
        .then(data => {
            accountOptionsPanel.innerHTML = `
                <button data-section="accountInfo" class="account-option">Account Info</button>
                <button data-section="orderHistory" class="account-option">Order History</button>
                ${data.isAdmin ? '<button data-section="adminPage" class="account-option">Admin Page</button>' : ''}
            `;

            // Add logout button separately
            const logoutBtnHtml = `<button id="logout-btn">Logout</button>`;
            accountOptionsPanel.insertAdjacentHTML('beforeend', logoutBtnHtml);

            const logoutBtn = document.querySelector('#logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    fetch('/logout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    })
                    .then(response => {
                        if (response.ok) window.location.href = '/login.html';
                    })
                    .catch(error => console.error('Error:', error));
                });
            }

            // Set up click event for each button to show the corresponding section
            document.querySelectorAll('.account-option').forEach(btn => {
                btn.addEventListener('click', () => showSection(btn.dataset.section));
            });

            // Initially show the account info section or based on user's preference
            showSection('accountInfo');
        })
        .catch(error => console.error('Error fetching session info:', error));
});


        // Fetch user info and display in account info section
        fetch('/api/user-info')
        .then(response => response.json())
        .then(userInfo => {
            const accountInfoSection = document.querySelector('.account-info-section');
            if (accountInfoSection) {
                accountInfoSection.innerHTML = `
                    <div class="user-info">
                        <h2>Account Information</h2>
                        <p><strong>Email:</strong> ${userInfo.email}</p>
                        <p><strong>First Name:</strong> ${userInfo.fName}</p>
                        <p><strong>Last Name:</strong> ${userInfo.lName}</p>
                        <p><strong>Address:</strong> ${userInfo.address}</p>
                        <p><strong>Apartment Number:</strong> ${userInfo.aptNum}</p>
                        <p><strong>City:</strong> ${userInfo.city}</p>
                        <p><strong>State:</strong> ${userInfo.state}</p>
                        <p><strong>Zip Code:</strong> ${userInfo.zip}</p>
                    </div>
                `;
            }
        })
        .catch(error => console.error('Error fetching user info:', error));


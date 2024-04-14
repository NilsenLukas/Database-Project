document.addEventListener('DOMContentLoaded', () => {
    fetch('/session-info')
        .then(response => response.json())
        .then(data => {
            const navbar = document.querySelector('.navbar'); 

            let linksHtml = `
                <a href="Cloths.html">Clothes</a>
                <a href="AboutUs.html">About</a>
                <a href="ContactUs.html">Contact Us</a>
            `;

            if (data.loggedIn) {
                // If logged in, add Account and Logout links
                linksHtml += `<a href="Account.html">Account</a>`;
            } else {
                // If not logged in, show Login/Signup link
                linksHtml += `<a href="login.html">Login / Signup</a>`;
            }

            navbar.innerHTML = linksHtml;

            // Attach event handler to logout link if it exists
            const logoutLink = document.getElementById('logout-link');
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    fetch('/logout', { method: 'POST' })
                        .then(response => {
                            if (response.ok) {
                                window.location.href = 'login.html';
                            } else {
                                throw new Error('Logout failed');
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                });
            }
        })
        .catch(error => {
            console.error('Error fetching session info:', error);
        });
});

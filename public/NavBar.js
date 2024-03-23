

document.addEventListener('DOMContentLoaded', () => {
    fetch('/session-info')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn){
                const accountText = "Account" + (data.isAdmin ? " A" : " ✓");
                document.getElementById("account-nav").textContent = accountText;
            }
        })
        .catch(error => console.error('Error fetching session info:', error));

    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            try {
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                
                if (response.ok) {
                    // Logout successful, redirect to login page or homepage
                    window.location.href = '/login.html'; // Adjust the URL as needed
                    const accountText = "Account";
                    document.getElementById("account-nav").textContent = accountText;
                } else {
                    // Handle logout failure (e.g., show an error message)
                    console.error('Logout failed:', data.message);
                }
            } catch (error) {
                console.error('Error making fetch request:', error);
            }
        });
    }
});


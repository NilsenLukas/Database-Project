

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
});
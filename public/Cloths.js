document.addEventListener('DOMContentLoaded', () => {
    const clothesContainer = document.querySelector('.clothes-container');

    fetch('/api/clothes')
        .then(response => response.json())
        .then(clothes => {
            clothes.forEach(cloth => {
                const clothElement = document.createElement('div');
                clothElement.classList.add('clothes-item');
                clothElement.innerHTML = `
                    <img src="/TemplateImages/${cloth.image}" alt="${cloth.name}">
                    <h3>${cloth.name}</h3>
                    <div class="expanded-info">
                        <span class="close-btn">X</span>
                        <div class="info">
                            <p>${cloth.name}</p>
                            <p>Price: $${cloth.price}</p>
                            <p>${cloth.description}</p>
                            <p>Color: ${cloth.color}</p>
                            <p>Size: ${cloth.size}</p>
                            <p>Stock left: ${cloth.stock}</p>
                        </div>

                        <button class="add-to-cart" data-product-id="${cloth.productID}">Add to Cart</button>
                    </div>
                `;

                clothElement.addEventListener('click', () => {
                    clothElement.querySelector('.expanded-info').style.display = 'block';
                });

                clothElement.querySelector('.close-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    clothElement.querySelector('.expanded-info').style.display = 'none';
                });

                clothesContainer.appendChild(clothElement);
            });

            fetch('/session-info')
                .then(response => response.json())
                .then(data => {
                    if (data.isAdmin) {
                        const addToListBox = document.createElement('div');
                        addToListBox.classList.add('clothes-item', 'add-to-list');
                        addToListBox.innerHTML = `<h3>Add to List</h3>`;

                        addToListBox.addEventListener('click', () => {
                            window.location.href = 'Account.html?admin=true';
                        });

                        clothesContainer.appendChild(addToListBox);
                    }
                });
        });

        clothesContainer.addEventListener('click', function(event) {
            // Check if the clicked element has the "add-to-cart" class
            if (event.target && event.target.classList.contains('add-to-cart')) {
                const productId = event.target.getAttribute('data-product-id');
                console.log("Add to Cart button clicked for product ID:", productId);
    
                // Proceed with the fetch request to add the item to the cart
                fetch('/api/add-to-cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productId, quantity: 1 }) // quantity is 1 for now (plan to fix later)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to add item to cart');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data.message); // server sends back a confirmation message
                    alert('Item added to cart');
                    // Optionally update the cart display here
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error adding item to cart');
                });
            }
        });
});

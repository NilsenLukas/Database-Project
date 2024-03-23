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
                        </div>

                        <button class="add-to-cart">Add to Cart</button> <!-- Placeholder -->
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
                            window.location.href = 'addCloths.html';
                        });

                        clothesContainer.appendChild(addToListBox);
                    }
                });
        });
});

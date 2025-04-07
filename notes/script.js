let currentPage = 1;
const productsPerPage = 10;
let allProducts = [];  // Store all products
let filteredProducts = [];  // Store products after search filtering

// Fetch products from the API
async function getProducts(page) {
    const response = await fetch(`https://dummyjson.com/products?limit=${productsPerPage}&skip=${(page - 1) * productsPerPage}`);
    if (!response.ok) {
        console.error('Error fetching data');
        return;
    }
    const data = await response.json();
    allProducts = data.products;  // Store all products in case of search filtering
    filteredProducts = allProducts;  // Initially show all products
    displayProducts(data.products);
    setupPagination(data.total);
}

// Display products on the page
function displayProducts(products) {
    const container = document.getElementById('product-container');
    container.innerHTML = ''; // Clear previous products
  
    products.forEach((product) => {
        const productElement = document.createElement('div');
        productElement.classList.add('product');
        productElement.innerHTML = `
          <h2>${product.title}</h2>
          <p><strong>Price:</strong> $${product.price}</p>
          <img src="${product.thumbnail}" alt="${product.title}">
          <button class="delete-btn">  <i class="fa fa-trash"></i> Delete</button>
          <button class="edit-btn"><i class="fa fa-edit"></i> Edit</button>

        `;
      
        // ✅ FIX: Select the buttons after rendering innerHTML
        const deleteButton = productElement.querySelector(".delete-btn");
        const editButton = productElement.querySelector(".edit-btn");

        // Handle delete button click
        deleteButton.addEventListener("click", () => {
            fetch(`https://dummyjson.com/products/${product.id}`, {
                method: 'DELETE'
            })
            .then((res) => {
                if (!res.ok) {
                    console.error("Failed to delete from backend");
                    return;
                }

                filteredProducts = filteredProducts.filter(p => p.id !== product.id);
                displayProducts(filteredProducts);
                setupPagination(filteredProducts.length);
            })
            .catch((error) => {
                console.error("Delete error:", error);
            });
        });

        // Handle edit button click
        editButton.addEventListener("click", () => {
            // Toggle edit mode (add the 'editing' class)
            productElement.classList.toggle('editing');
            
            const titleEl = productElement.querySelector("h2");
            const priceEl = productElement.querySelector("p");
          
            // Create input fields
            const titleInput = document.createElement("input");
            titleInput.value = product.title;
          
            const priceInput = document.createElement("input");
            priceInput.type = "number";
            priceInput.value = product.price;
          
            // Replace elements with inputs
            titleEl.replaceWith(titleInput);
            priceEl.replaceWith(priceInput);
          
            // Change Edit button to Save
            editButton.textContent = "Save";
          
            // Handle Save button click
            editButton.onclick = () => {
                const updatedTitle = titleInput.value;
                const updatedPrice = parseFloat(priceInput.value);
          
                fetch(`https://dummyjson.com/products/${product.id}`, {
                    method: "PATCH",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: updatedTitle,
                        price: updatedPrice,
                    }),
                })
                .then((res) => res.json())
                .then((updatedProduct) => {
                    // Update the UI
                    titleInput.replaceWith(document.createElement("h2"));
                    priceInput.replaceWith(document.createElement("p"));
          
                    product.title = updatedProduct.title;
                    product.price = updatedProduct.price;
          
                    productElement.querySelector("h2").textContent = updatedProduct.title;
                    productElement.querySelector("p").innerHTML = `<strong>Price:</strong> $${updatedProduct.price}`;
                    
                    editButton.textContent = "Edit"; // Back to Edit
                    productElement.classList.remove('editing');  // Exit edit mode
                });
            };
        });
      
        container.appendChild(productElement);
    });
}

// Set up pagination controls
function setupPagination(totalProducts) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    document.getElementById('page-number').textContent = currentPage;

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

// Change the page when next/prev buttons are clicked
function changePage(direction) {
    if (direction === 'next') {
        currentPage++;
    } else if (direction === 'prev') {
        currentPage--;
    }
    getProducts(currentPage);
}

// Add event listener to the search input
document.getElementById('search-input').addEventListener('input', searchProducts);

function searchProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    filteredProducts = allProducts.filter((product) => product.title.toLowerCase().includes(searchTerm));
    currentPage = 1;  // Reset to the first page when performing a new search
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    displayProducts(filteredProducts.slice(start, end));
    setupPagination(filteredProducts.length);
}

// Initialize the first page
getProducts(currentPage);

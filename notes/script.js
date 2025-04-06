let currentPage = 1;
        const productsPerPage = 10;
        let allProducts = [];  // Store all products
        let filteredProducts = [];  // Store products after search filtering

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
        <button class="delete-btn">Delete</button>
      `;
  
      // ✅ Add delete functionality INSIDE the loop
      const deleteButton = productElement.querySelector(".delete-btn");
      deleteButton.addEventListener("click", () => {
        productElement.remove(); // Just removes it from the UI
      });
  
      container.appendChild(productElement);
    });
  }
  

function setupPagination(totalProducts) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    document.getElementById('page-number').textContent = currentPage;

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

function changePage(direction) {
    if (direction === 'next') {
        currentPage++;
    } else if (direction === 'prev') {
        currentPage--;
    }
    getProducts(currentPage);
}



   // Search functionality
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
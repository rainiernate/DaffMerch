// Product data
const productData = {
    "products": [
        {
            "id": 1,
            "name": "Daffodil Garden Starter Kit",
            "description": "Everything you need to start your own daffodil garden. Includes 20 premium bulbs, soil mix, and planting guide.",
            "price": 29.99,
            "image": "https://images.unsplash.com/photo-1457530378978-8bac673b8062?auto=format&fit=crop&w=600&q=80",
            "category": "gardening"
        },
        {
            "id": 2,
            "name": "Hope Blooms T-Shirt",
            "description": "100% organic cotton t-shirt featuring our signature daffodil design. Available in sizes S-XXL.",
            "price": 24.99,
            "image": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80",
            "category": "apparel"
        },
        {
            "id": 3,
            "name": "Daffodil Print Canvas",
            "description": "Beautiful 16x20 gallery-wrapped canvas featuring original daffodil artwork by local artists.",
            "price": 49.99,
            "image": "https://images.unsplash.com/photo-1552152974-19b9caf99137?auto=format&fit=crop&w=600&q=80",
            "category": "art"
        },
        {
            "id": 4,
            "name": "Foundation Coffee Mug",
            "description": "11oz ceramic mug with our inspirational message and daffodil design. Dishwasher and microwave safe.",
            "price": 15.99,
            "image": "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=600&q=80",
            "category": "accessories"
        },
        {
            "id": 5,
            "name": "Annual Membership",
            "description": "One year membership including quarterly newsletter, event invites, and 10% off all purchases.",
            "price": 75.00,
            "image": "https://images.unsplash.com/photo-1584448097639-99cf648e8def?auto=format&fit=crop&w=600&q=80",
            "category": "membership"
        },
        {
            "id": 6,
            "name": "Daffodil Note Cards Set",
            "description": "Set of 12 handcrafted note cards with envelopes, featuring different daffodil varieties.",
            "price": 18.99,
            "image": "https://images.unsplash.com/photo-1579208575657-c595a05383b7?auto=format&fit=crop&w=600&q=80",
            "category": "stationery"
        },
        {
            "id": 7,
            "name": "Garden Tool Set",
            "description": "Professional-grade 3-piece garden tool set with ergonomic handles and carrying case.",
            "price": 34.99,
            "image": "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=600&q=80",
            "category": "gardening"
        },
        {
            "id": 8,
            "name": "Daffodil Seeds Collection",
            "description": "Collection of 5 different daffodil varieties, perfect for creating a diverse garden display.",
            "price": 19.99,
            "image": "https://images.unsplash.com/photo-1462530260150-162092dbf011?auto=format&fit=crop&w=600&q=80",
            "category": "gardening"
        },
        {
            "id": 9,
            "name": "Foundation Tote Bag",
            "description": "Eco-friendly canvas tote bag with hand-drawn daffodil design. Perfect for shopping or beach trips.",
            "price": 22.99,
            "image": "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&q=80",
            "category": "accessories"
        },
        {
            "id": 10,
            "name": "Children's Gardening Kit",
            "description": "Kid-sized gardening tools, gloves, and educational materials to inspire young gardeners.",
            "price": 27.99,
            "image": "https://images.unsplash.com/photo-1464454709131-ffd692591ee5?auto=format&fit=crop&w=600&q=80",
            "category": "gardening"
        }
    ]
};

// Cart state
let cart = [];
let products = [];

// Initialize products
function loadProducts() {
    try {
        products = productData.products;
        renderProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        productsContainer.innerHTML = '<p>Error loading products. Please try again later.</p>';
    }
}

// Filter products by category
function filterProducts(category) {
    const filteredProducts = category === 'all' 
        ? products 
        : products.filter(product => product.category === category);
    renderProducts(filteredProducts);
}

// Salesforce configuration
const sfConfig = {
    loginUrl: 'https://login.salesforce.com',
    // You'll need to set these values from your Salesforce connected app
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    redirectUri: 'YOUR_CALLBACK_URL'
};

// Initialize Salesforce connection
let sfConn;
function initializeSalesforce() {
    sfConn = new jsforce.Connection({
        oauth2: sfConfig,
        loginUrl: sfConfig.loginUrl
    });
}

// Create Salesforce Contact
function createSalesforceContact(customerData) {
    try {
        const contact = sfConn.sobject('Contact').create({
            FirstName: customerData.name.split(' ')[0],
            LastName: customerData.name.split(' ').slice(1).join(' ') || customerData.name.split(' ')[0],
            Email: customerData.email
        });
        return contact.id;
    } catch (error) {
        console.error('Error creating contact:', error);
        throw error;
    }
}

// Create Salesforce Opportunity
function createSalesforceOpportunity(contactId, cartData) {
    try {
        const opportunity = sfConn.sobject('Opportunity').create({
            Name: `Online Purchase - ${new Date().toISOString()}`,
            StageName: 'Closed Won',
            CloseDate: new Date(),
            Amount: cartData.total,
            ContactId: contactId,
            Description: cartData.items.map(item => 
                `${item.name} x ${item.quantity} @ $${item.price}`
            ).join('\n')
        });
        return opportunity.id;
    } catch (error) {
        console.error('Error creating opportunity:', error);
        throw error;
    }
}

// DOM Elements
const productsContainer = document.getElementById('products-container');
const cartButton = document.getElementById('cart-button');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const totalAmount = document.getElementById('total-amount');
const checkoutButton = document.getElementById('checkout-button');
const categoryFilter = document.getElementById('category-filter');

// Initialize the shop
function initializeShop() {
    setupEventListeners();
}

// Render all products
function renderProducts(productsToRender) {
    productsContainer.innerHTML = productsToRender.map(product => `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-category">${product.category}</div>
            <h3 class="product-title">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <div class="quantity-selector">
                <button class="decrease-quantity">-</button>
                <input type="number" value="1" min="1" max="99" class="quantity-input">
                <button class="increase-quantity">+</button>
            </div>
            <button class="button add-to-cart">Add to Cart</button>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Product card events
    productsContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (!card) return;

        if (e.target.classList.contains('add-to-cart')) {
            const productId = parseInt(card.dataset.id);
            const quantity = parseInt(card.querySelector('.quantity-input').value);
            addToCart(productId, quantity);
        } else if (e.target.classList.contains('increase-quantity')) {
            const input = card.querySelector('.quantity-input');
            input.value = Math.min(parseInt(input.value) + 1, 99);
        } else if (e.target.classList.contains('decrease-quantity')) {
            const input = card.querySelector('.quantity-input');
            input.value = Math.max(parseInt(input.value) - 1, 1);
        }
    });

    // Cart modal events
    cartButton.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);
    checkoutButton.addEventListener('click', proceedToCheckout);

    // Category filter events
    categoryFilter.addEventListener('change', (e) => {
        filterProducts(e.target.value);
    });
}

// Add item to cart
function addToCart(productId, quantity) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity
        });
    }

    updateCartUI();
}

// Update cart UI
function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name} x ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    // Update total amount
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmount.textContent = total.toFixed(2);
}

// Toggle cart modal
function toggleCart() {
    cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
}

// Proceed to checkout
function proceedToCheckout() {
    const customerName = document.getElementById('customer-name').value;
    const customerEmail = document.getElementById('customer-email').value;

    if (!customerName || !customerEmail) {
        alert('Please fill in your contact information');
        return;
    }

    try {
        // Create contact in Salesforce
        const contactId = createSalesforceContact({
            name: customerName,
            email: customerEmail
        });

        // Create opportunity in Salesforce
        const cartData = {
            total: parseFloat(totalAmount.textContent),
            items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }))
        };

        createSalesforceOpportunity(contactId, cartData);

        // Proceed with PayPal checkout
        // TODO: Implement PayPal checkout integration
        alert('Order recorded in Salesforce! PayPal integration coming soon.');
        
        // Clear cart after successful checkout
        cart = [];
        updateCartUI();
        toggleCart();
    } catch (error) {
        console.error('Checkout error:', error);
        alert('There was an error processing your order. Please try again.');
    }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeSalesforce();
    loadProducts();
    initializeShop();
});

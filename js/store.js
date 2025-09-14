// E-commerce Store Functionality for Robotics & Control Ltd
class RCStore {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('rcltd_cart')) || [];
        this.products = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.init();
    }

    init() {
        this.updateCartDisplay();
        this.bindEvents();
        this.loadProducts();
    }

    bindEvents() {
        // Cart sidebar elements (for pages that have cart sidebar)
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        const cartClose = document.getElementById('cart-close');

        // Note: cart-toggle is no longer used - cart icon now links to cart.html
        // But we still need cart sidebar functionality for "Add to Cart" actions

        if (cartClose) {
            cartClose.addEventListener('click', () => this.closeCart());
        }

        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => this.closeCart());
        }

        // Search functionality
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchProducts(e.target.value));
        }

        // Filter functionality
        const categoryFilter = document.getElementById('category-filter');
        const sortFilter = document.getElementById('sort-filter');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterProducts());
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', () => this.sortProducts());
        }

        // Load more products
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreProducts());
        }

        // Billing address toggle
        const sameAsShipping = document.getElementById('same-as-shipping');
        const billingFields = document.getElementById('billing-fields');

        if (sameAsShipping && billingFields) {
            sameAsShipping.addEventListener('change', function() {
                billingFields.style.display = this.checked ? 'none' : 'block';
            });
        }

        // Payment method toggle
        const paymentMethods = document.querySelectorAll('input[name="payment"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', () => this.togglePaymentFields());
        });
    }

    // Cart Management
    addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity
            });
        }

        this.saveCart();
        this.updateCartDisplay();
        this.showCartNotification('Product added to cart!');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
        this.renderCartItems();
    }

    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartDisplay();
                this.renderCartItems();
            }
        }
    }

    saveCart() {
        localStorage.setItem('rcltd_cart', JSON.stringify(this.cart));
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const cartTotal = document.getElementById('cart-total');
        
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        if (cartTotal) {
            cartTotal.textContent = `€${totalAmount.toFixed(2)}`;
        }

        // Update cart sidebar
        this.renderCartItems();
    }

    renderCartItems() {
        const cartItems = document.getElementById('cart-items');
        const cartItemsList = document.getElementById('cart-items-list');
        
        if (!cartItems && !cartItemsList) return;

        const container = cartItems || cartItemsList;
        
        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="cart-empty">
                    <p>Your cart is empty</p>
                    <p class="cart-empty-subtitle">Add some products to get started</p>
                </div>
            `;
            return;
        }

        const itemsHtml = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image || 'images/placeholder-product.png'}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">€${item.price.toFixed(2)}</p>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="qty-btn minus" onclick="store.updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="qty-btn plus" onclick="store.updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                        <button class="remove-btn" onclick="store.removeFromCart('${item.id}')">Remove</button>
                    </div>
                </div>
                <div class="cart-item-total">
                    €${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `).join('');

        container.innerHTML = itemsHtml;
        this.updateCartTotals();
    }

    updateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 500 ? 0 : 25; // Free shipping over €500
        const vat = (subtotal + shipping) * 0.23; // 23% VAT
        const total = subtotal + shipping + vat;

        // Update all total displays
        const elements = {
            'cart-subtotal': subtotal,
            'cart-shipping': shipping,
            'cart-vat': vat,
            'cart-total-amount': total,
            'checkout-subtotal': subtotal,
            'checkout-shipping': shipping,
            'checkout-vat': vat,
            'checkout-total': total
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = `€${value.toFixed(2)}`;
            }
        });
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.toggle('active');
            cartOverlay.classList.toggle('active');
            document.body.classList.toggle('cart-open');
        }
    }

    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
            document.body.classList.remove('cart-open');
        }
    }

    showCartNotification(message) {
        // Show cart sidebar when items are added
        this.toggleCart();
        
        // Create and show a toast notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    // Product Management
    loadProducts() {
        // This will be populated when products are loaded from external source
        // For now, we'll show the empty state
        this.renderProducts();
    }

    renderProducts() {
        const container = document.getElementById('products-container');
        if (!container) return;

        if (this.products.length === 0) {
            container.innerHTML = `
                <div class="store-empty-state">
                    <div class="empty-icon">📦</div>
                    <h3>Store Catalog Coming Soon</h3>
                    <p>Our equipment catalog is being prepared. Check back soon for professional automation and control components.</p>
                    <a href="contact.html" class="btn-primary">Contact Us for Product Inquiries</a>
                </div>
            `;
            return;
        }

        // Render products when available
        const productsHtml = this.products.map(product => this.renderProductCard(product)).join('');
        container.innerHTML = productsHtml;
    }

    renderProductCard(product) {
        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-specs">
                        ${product.specs ? product.specs.map(spec => `<span class="spec-tag">${spec}</span>`).join('') : ''}
                    </div>
                    <div class="product-footer">
                        <div class="product-price">
                            ${product.originalPrice ? `<span class="original-price">€${product.originalPrice.toFixed(2)}</span>` : ''}
                            <span class="current-price">€${product.price.toFixed(2)}</span>
                        </div>
                        <button class="btn-primary add-to-cart" onclick="store.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    searchProducts(query) {
        // Implement product search functionality
        console.log('Searching for:', query);
    }

    filterProducts() {
        // Implement product filtering
        const category = document.getElementById('category-filter').value;
        console.log('Filtering by category:', category);
    }

    sortProducts() {
        // Implement product sorting
        const sortBy = document.getElementById('sort-filter').value;
        console.log('Sorting by:', sortBy);
    }

    loadMoreProducts() {
        // Implement pagination
        this.currentPage++;
        console.log('Loading page:', this.currentPage);
    }

    // Payment Methods
    togglePaymentFields() {
        const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
        const cardFields = document.getElementById('card-fields');
        const bankFields = document.getElementById('bank-fields');
        const quoteFields = document.getElementById('quote-fields');

        // Hide all payment fields
        if (cardFields) cardFields.style.display = 'none';
        if (bankFields) bankFields.style.display = 'none';
        if (quoteFields) quoteFields.style.display = 'none';

        // Show selected payment fields
        switch (selectedPayment) {
            case 'card':
                if (cardFields) cardFields.style.display = 'block';
                break;
            case 'bank':
                if (bankFields) bankFields.style.display = 'block';
                break;
            case 'quote':
                if (quoteFields) quoteFields.style.display = 'block';
                break;
        }
    }

    // Product Management Methods (for future use)
    addProduct(product) {
        // Apply 40% markup as requested
        const markedUpPrice = product.originalPrice * 1.4;
        
        const processedProduct = {
            ...product,
            price: markedUpPrice,
            originalPrice: product.originalPrice
        };

        this.products.push(processedProduct);
        this.renderProducts();
    }

    loadProductsFromSource(products) {
        // Process products with 40% markup
        this.products = products.map(product => ({
            ...product,
            price: product.originalPrice * 1.4,
            originalPrice: product.originalPrice
        }));
        
        this.renderProducts();
    }
}

// Initialize store when DOM is loaded
let store;
document.addEventListener('DOMContentLoaded', () => {
    store = new RCStore();
});
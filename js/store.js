// E-commerce Store Functionality for Robotics & Control Ltd
function RCStore() {
        this.cart = JSON.parse(localStorage.getItem('rcltd_cart')) || [];
        this.products = [];
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.init();
}

RCStore.prototype.init = function() {
        this.updateCartDisplay();
        this.bindEvents();
        this.loadProducts();
};

RCStore.prototype.bindEvents = function() {
        // Cart sidebar elements (for pages that have cart sidebar)
        var cartSidebar = document.getElementById('cart-sidebar');
        var cartOverlay = document.getElementById('cart-overlay');
        var cartClose = document.getElementById('cart-close');
        var self = this;

        // Note: cart-toggle is no longer used - cart icon now links to cart.html
        // But we still need cart sidebar functionality for "Add to Cart" actions

        if (cartClose) {
            cartClose.addEventListener('click', function() { self.closeCart(); });
        }

        if (cartOverlay) {
            cartOverlay.addEventListener('click', function() { self.closeCart(); });
        }

        // Search functionality
        var searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) { self.searchProducts(e.target.value); });
        }

        // Filter functionality
        var categoryFilter = document.getElementById('category-filter');
        var sortFilter = document.getElementById('sort-filter');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', function() { self.filterProducts(); });
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', function() { self.sortProducts(); });
        }

        // Load more products
        var loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() { self.loadMoreProducts(); });
        }

        // Billing address toggle
        var sameAsShipping = document.getElementById('same-as-shipping');
        var billingFields = document.getElementById('billing-fields');

        if (sameAsShipping && billingFields) {
            sameAsShipping.addEventListener('change', function() {
                billingFields.style.display = this.checked ? 'none' : 'block';
            });
        }

        // Payment method toggle
        var paymentMethods = document.querySelectorAll('input[name="payment"]');
        for (var i = 0; i < paymentMethods.length; i++) {
            paymentMethods[i].addEventListener('change', function() { self.togglePaymentFields(); });
        }
};

// Cart Management
RCStore.prototype.addToCart = function(product, quantity) {
        quantity = quantity || 1;
        var existingItem = this.cart.find(function(item) { return item.id === product.id; });
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            var newItem = Object.assign({}, product);
            newItem.quantity = quantity;
            this.cart.push(newItem);
        }

        this.saveCart();
        this.updateCartDisplay();
        this.showCartNotification('Product added to cart!');
};

RCStore.prototype.removeFromCart = function(productId) {
        this.cart = this.cart.filter(function(item) { return item.id !== productId; });
        this.saveCart();
        this.updateCartDisplay();
        this.renderCartItems();
};

RCStore.prototype.updateCartQuantity = function(productId, quantity) {
        var item = this.cart.find(function(item) { return item.id === productId; });
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

RCStore.prototype.saveCart = function() {
        localStorage.setItem('rcltd_cart', JSON.stringify(this.cart));
    }

RCStore.prototype.updateCartDisplay = function() {
        var cartCount = document.getElementById('cart-count');
        var cartTotal = document.getElementById('cart-total');
        
        var totalItems = this.cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
        var totalAmount = this.cart.reduce(function(sum, item) { return sum + (item.price * item.quantity); }, 0);

        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        if (cartTotal) {
            cartTotal.textContent = '€' + totalAmount.toFixed(2);
        }

        // Update cart sidebar
        this.renderCartItems();
    }

RCStore.prototype.renderCartItems = function() {
        var cartItems = document.getElementById('cart-items');
        var cartItemsList = document.getElementById('cart-items-list');
        
        if (!cartItems && !cartItemsList) return;

        var container = cartItems || cartItemsList;
        
        if (this.cart.length === 0) {
            container.innerHTML = `
                <div class="cart-empty">
                    <p>Your cart is empty</p>
                    <p class="cart-empty-subtitle">Add some products to get started</p>
                </div>
            `;
            return;
        }

        var itemsHtml = this.cart.map(item => `
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
        var subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        var shipping = subtotal > 500 ? 0 : 25; // Free shipping over €500
        var vat = (subtotal + shipping) * 0.23; // 23% VAT
        var total = subtotal + shipping + vat;

        // Update all total displays
        var elements = {
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
            var element = document.getElementById(id);
            if (element) {
                element.textContent = `€${value.toFixed(2)}`;
            }
        });
    }

    toggleCart() {
        var cartSidebar = document.getElementById('cart-sidebar');
        var cartOverlay = document.getElementById('cart-overlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.toggle('active');
            cartOverlay.classList.toggle('active');
            document.body.classList.toggle('cart-open');
        }
    }

    closeCart() {
        var cartSidebar = document.getElementById('cart-sidebar');
        var cartOverlay = document.getElementById('cart-overlay');
        
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
        var notification = document.createElement('div');
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
        var container = document.getElementById('products-container');
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
        var productsHtml = this.products.map(product => this.renderProductCard(product)).join('');
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
    }

    filterProducts() {
        // Implement product filtering
        var category = document.getElementById('category-filter').value;
    }

    sortProducts() {
        // Implement product sorting
        var sortBy = document.getElementById('sort-filter').value;
    }

    loadMoreProducts() {
        // Implement pagination
        this.currentPage++;
    }

    // Payment Methods
    togglePaymentFields() {
        var selectedPayment = document.querySelector('input[name="payment"]:checked').value;
        var cardFields = document.getElementById('card-fields');
        var bankFields = document.getElementById('bank-fields');
        var quoteFields = document.getElementById('quote-fields');

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
        var markedUpPrice = product.originalPrice * 1.4;
        
        var processedProduct = {
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
var store;
document.addEventListener('DOMContentLoaded', function() {
    store = new RCStore();
});
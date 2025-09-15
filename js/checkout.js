// Checkout Process for Robotics & Control Ltd Store
class CheckoutManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('rcltd_cart')) || [];
        this.init();
    }

    init() {
        this.renderCheckoutItems();
        this.updateCheckoutTotals();
        this.bindEvents();
        this.initFormValidation();
    }

    bindEvents() {
        // Checkout form submission
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => this.handleCheckoutSubmit(e));
        }

        // Payment method changes
        const paymentMethods = document.querySelectorAll('input[name="payment"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', () => this.togglePaymentFields());
        });

        // Billing address toggle
        const sameAsShipping = document.getElementById('same-as-shipping');
        if (sameAsShipping) {
            sameAsShipping.addEventListener('change', () => this.toggleBillingFields());
        }

        // Card number formatting
        const cardNumber = document.getElementById('card-number');
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => this.formatCardNumber(e));
        }

        // Expiry date formatting
        const expiry = document.getElementById('expiry');
        if (expiry) {
            expiry.addEventListener('input', (e) => this.formatExpiry(e));
        }

        // CVV validation
        const cvv = document.getElementById('cvv');
        if (cvv) {
            cvv.addEventListener('input', (e) => this.formatCVV(e));
        }
    }

    renderCheckoutItems() {
        const container = document.getElementById('checkout-items');
        if (!container) return;

        // Clear container safely
        container.replaceChildren();

        if (this.cart.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'checkout-empty';
            
            const p = document.createElement('p');
            p.textContent = 'No items in cart';
            
            const a = document.createElement('a');
            a.href = 'store.html';
            a.className = 'btn-primary';
            a.textContent = 'Continue Shopping';
            
            emptyDiv.appendChild(p);
            emptyDiv.appendChild(a);
            container.appendChild(emptyDiv);
            return;
        }

        // Create checkout items safely using DOM methods
        this.cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'checkout-item';

            const imageDiv = document.createElement('div');
            imageDiv.className = 'item-image';
            
            const img = document.createElement('img');
            img.src = item.image || 'images/placeholder-product.png';
            img.alt = item.name || '';
            
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'item-details';
            
            const h4 = document.createElement('h4');
            h4.textContent = item.name || '';
            
            const qtyP = document.createElement('p');
            qtyP.className = 'item-qty';
            qtyP.textContent = `Qty: ${item.quantity || 0}`;
            
            const priceP = document.createElement('p');
            priceP.className = 'item-price';
            priceP.textContent = `€${((item.price || 0) * (item.quantity || 0)).toFixed(2)}`;

            imageDiv.appendChild(img);
            detailsDiv.appendChild(h4);
            detailsDiv.appendChild(qtyP);
            detailsDiv.appendChild(priceP);
            itemDiv.appendChild(imageDiv);
            itemDiv.appendChild(detailsDiv);
            container.appendChild(itemDiv);
        });
    }

    updateCheckoutTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 500 ? 0 : 25; // Free shipping over €500
        const vat = (subtotal + shipping) * 0.23; // 23% VAT
        const total = subtotal + shipping + vat;

        const elements = {
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

    togglePaymentFields() {
        const selectedPayment = document.querySelector('input[name="payment"]:checked')?.value;
        const cardFields = document.getElementById('card-fields');
        const bankFields = document.getElementById('bank-fields');
        const quoteFields = document.getElementById('quote-fields');

        // Hide all payment fields
        [cardFields, bankFields, quoteFields].forEach(field => {
            if (field) field.style.display = 'none';
        });

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

    toggleBillingFields() {
        const sameAsShipping = document.getElementById('same-as-shipping');
        const billingFields = document.getElementById('billing-fields');
        
        if (sameAsShipping && billingFields) {
            billingFields.style.display = sameAsShipping.checked ? 'none' : 'block';
        }
    }

    formatCardNumber(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        
        if (formattedValue.length > 19) {
            formattedValue = formattedValue.substr(0, 19);
        }
        
        e.target.value = formattedValue;
    }

    formatExpiry(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        
        e.target.value = value;
    }

    formatCVV(e) {
        let value = e.target.value.replace(/\D/g, '');
        e.target.value = value.substring(0, 4);
    }

    initFormValidation() {
        const form = document.getElementById('checkout-form');
        if (!form) return;

        // Add custom validation styles
        const inputs = form.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const isValid = field.checkValidity();
        
        field.classList.toggle('invalid', !isValid);
        field.classList.toggle('valid', isValid);
        
        return isValid;
    }

    clearFieldError(field) {
        field.classList.remove('invalid');
    }

    validateForm() {
        const form = document.getElementById('checkout-form');
        if (!form) return false;

        let isValid = true;
        const requiredFields = form.querySelectorAll('input[required], select[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Validate payment method specific fields
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
        
        if (paymentMethod === 'card') {
            const cardFields = ['card-number', 'expiry', 'cvv', 'card-name'];
            cardFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && !this.validateField(field)) {
                    isValid = false;
                }
            });
        }

        // Validate terms agreement
        const termsAgree = document.getElementById('terms-agree');
        if (termsAgree && !termsAgree.checked) {
            this.showError('Please agree to the terms and conditions.');
            isValid = false;
        }

        return isValid;
    }

    async handleCheckoutSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            this.showError('Please fix the errors above and try again.');
            return;
        }

        if (this.cart.length === 0) {
            this.showError('Your cart is empty. Please add items before checkout.');
            return;
        }

        const formData = new FormData(e.target);
        const orderData = this.collectOrderData(formData);

        try {
            await this.processOrder(orderData);
        } catch (error) {
            console.error('Checkout error:', error);
            this.showError('There was an error processing your order. Please try again.');
        }
    }

    collectOrderData(formData) {
        const data = Object.fromEntries(formData);
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;
        
        return {
            customer: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                company: data.company
            },
            shipping: {
                address: data.address,
                city: data.city,
                county: data.county,
                postalCode: data.postalCode,
                country: data.country
            },
            billing: data['same-as-shipping'] ? null : {
                address: data.billingAddress,
                city: data.billingCity,
                county: data.billingCounty,
                postalCode: data.billingPostalCode,
                country: data.billingCountry
            },
            payment: {
                method: paymentMethod,
                ...(paymentMethod === 'card' && {
                    cardNumber: data.cardNumber,
                    expiry: data.expiry,
                    cvv: data.cvv,
                    cardName: data.cardName
                }),
                ...(paymentMethod === 'quote' && {
                    notes: data.quoteNotes
                })
            },
            items: this.cart,
            totals: this.calculateTotals(),
            orderNotes: data.orderNotes,
            timestamp: new Date().toISOString()
        };
    }

    calculateTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 500 ? 0 : 25;
        const vat = (subtotal + shipping) * 0.23;
        const total = subtotal + shipping + vat;

        return { subtotal, shipping, vat, total };
    }

    async processOrder(orderData) {
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            // Simulate order processing
            await this.simulateOrderProcessing(orderData);
            
            // Clear cart and redirect to confirmation
            localStorage.removeItem('rcltd_cart');
            localStorage.setItem('rcltd_last_order', JSON.stringify(orderData));
            
            window.location.href = 'order-confirmation.html';
            
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    async simulateOrderProcessing(orderData) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Log order for development
        console.log('Order processed:', orderData);
        
        // Here you would integrate with real payment processing
        // and order management systems
    }

    showError(message) {
        // Create error notification safely using DOM methods
        const notification = document.createElement('div');
        notification.className = 'checkout-error';
        
        const errorContent = document.createElement('div');
        errorContent.className = 'error-content';
        
        const errorIcon = document.createElement('span');
        errorIcon.className = 'error-icon';
        errorIcon.textContent = '⚠️';
        
        const errorMessage = document.createElement('span');
        errorMessage.className = 'error-message';
        errorMessage.textContent = message; // Safe: uses textContent instead of innerHTML
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'error-close';
        closeBtn.innerHTML = '&times;'; // Safe: static content
        
        errorContent.appendChild(errorIcon);
        errorContent.appendChild(errorMessage);
        errorContent.appendChild(closeBtn);
        notification.appendChild(errorContent);

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Handle close button
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        });

        // Auto hide after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => document.body.removeChild(notification), 300);
            }
        }, 5000);
    }

    showSuccess(message) {
        // Create success notification safely using DOM methods
        const notification = document.createElement('div');
        notification.className = 'checkout-success';
        
        const successContent = document.createElement('div');
        successContent.className = 'success-content';
        
        const successIcon = document.createElement('span');
        successIcon.className = 'success-icon';
        successIcon.textContent = '✅';
        
        const successMessage = document.createElement('span');
        successMessage.className = 'success-message';
        successMessage.textContent = message; // Safe: uses textContent instead of innerHTML
        
        successContent.appendChild(successIcon);
        successContent.appendChild(successMessage);
        notification.appendChild(successContent);

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}

// Initialize checkout when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('checkout-form')) {
        new CheckoutManager();
    }
});
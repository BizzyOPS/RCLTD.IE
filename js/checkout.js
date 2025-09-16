// Checkout Process for Robotics & Control Ltd Store
function CheckoutManager() {
        this.cart = JSON.parse(localStorage.getItem('rcltd_cart')) || [];
        this.init();
}

CheckoutManager.prototype.init = function() {
        this.renderCheckoutItems();
        this.updateCheckoutTotals();
        this.bindEvents();
        this.initFormValidation();
};

CheckoutManager.prototype.bindEvents = function() {
        // Checkout form submission
        var checkoutForm = document.getElementById('checkout-form');
        var self = this;
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', function(e) { self.handleCheckoutSubmit(e); });
        }

        // Payment method changes
        var paymentMethods = document.querySelectorAll('input[name="payment"]');
        for (var i = 0; i < paymentMethods.length; i++) {
            paymentMethods[i].addEventListener('change', function() { self.togglePaymentFields(); });
        }

        // Billing address toggle
        var sameAsShipping = document.getElementById('same-as-shipping');
        if (sameAsShipping) {
            sameAsShipping.addEventListener('change', function() { self.toggleBillingFields(); });
        }

        // Card number formatting
        var cardNumber = document.getElementById('card-number');
        if (cardNumber) {
            cardNumber.addEventListener('input', function(e) { self.formatCardNumber(e); });
        }

        // Expiry date formatting
        var expiry = document.getElementById('expiry');
        if (expiry) {
            expiry.addEventListener('input', function(e) { self.formatExpiry(e); });
        }

        // CVV validation
        var cvv = document.getElementById('cvv');
        if (cvv) {
            cvv.addEventListener('input', function(e) { self.formatCVV(e); });
        }
    }

    renderCheckoutItems() {
        var container = document.getElementById('checkout-items');
        if (!container) return;

        // Clear container safely
        container.replaceChildren();

        if (this.cart.length === 0) {
            var emptyDiv = document.createElement('div');
            emptyDiv.className = 'checkout-empty';
            
            var p = document.createElement('p');
            p.textContent = 'No items in cart';
            
            var a = document.createElement('a');
            a.href = 'store.html';
            a.className = 'btn-primary';
            a.textContent = 'Continue Shopping';
            
            emptyDiv.appendChild(p);
            emptyDiv.appendChild(a);
            container.appendChild(emptyDiv);
            return;
        }

        // Create checkout items safely using DOM methods
        for (var i = 0; i < this.cart.length; i++) {
            var item = this.cart[i];
            var itemDiv = document.createElement('div');
            itemDiv.className = 'checkout-item';

            var imageDiv = document.createElement('div');
            imageDiv.className = 'item-image';
            
            var img = document.createElement('img');
            img.src = item.image || 'images/placeholder-product.png';
            img.alt = item.name || '';
            
            var detailsDiv = document.createElement('div');
            detailsDiv.className = 'item-details';
            
            var h4 = document.createElement('h4');
            h4.textContent = item.name || '';
            
            var qtyP = document.createElement('p');
            qtyP.className = 'item-qty';
            qtyP.textContent = 'Qty: ' + (item.quantity || 0);
            
            var priceP = document.createElement('p');
            priceP.className = 'item-price';
            priceP.textContent = '€' + ((item.price || 0) * (item.quantity || 0)).toFixed(2);

            imageDiv.appendChild(img);
            detailsDiv.appendChild(h4);
            detailsDiv.appendChild(qtyP);
            detailsDiv.appendChild(priceP);
            itemDiv.appendChild(imageDiv);
            itemDiv.appendChild(detailsDiv);
            container.appendChild(itemDiv);
        }
    }

    updateCheckoutTotals() {
        var subtotal = this.cart.reduce(function(sum, item) { return sum + (item.price * item.quantity); }, 0);
        var shipping = subtotal > 500 ? 0 : 25; // Free shipping over €500
        var vat = (subtotal + shipping) * 0.23; // 23% VAT
        var total = subtotal + shipping + vat;

        var elements = {
            'checkout-subtotal': subtotal,
            'checkout-shipping': shipping,
            'checkout-vat': vat,
            'checkout-total': total
        };

        for (var id in elements) {
            var element = document.getElementById(id);
            if (element) {
                element.textContent = '€' + elements[id].toFixed(2);
            }
        }
    }

    togglePaymentFields() {
        var selectedPaymentEl = document.querySelector('input[name="payment"]:checked');
        var selectedPayment = selectedPaymentEl ? selectedPaymentEl.value : null;
        var cardFields = document.getElementById('card-fields');
        var bankFields = document.getElementById('bank-fields');
        var quoteFields = document.getElementById('quote-fields');

        // Hide all payment fields
        var fields = [cardFields, bankFields, quoteFields];
        for (var i = 0; i < fields.length; i++) {
            if (fields[i]) fields[i].style.display = 'none';
        }

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
        var sameAsShipping = document.getElementById('same-as-shipping');
        var billingFields = document.getElementById('billing-fields');
        
        if (sameAsShipping && billingFields) {
            billingFields.style.display = sameAsShipping.checked ? 'none' : 'block';
        }
    }

    formatCardNumber(e) {
        var value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        var matches = value.match(/.{1,4}/g);
        var formattedValue = matches ? matches.join(' ') : value;
        
        if (formattedValue.length > 19) {
            formattedValue = formattedValue.substr(0, 19);
        }
        
        e.target.value = formattedValue;
    }

    formatExpiry(e) {
        var value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        
        e.target.value = value;
    }

    formatCVV(e) {
        var value = e.target.value.replace(/\D/g, '');
        e.target.value = value.substring(0, 4);
    }

    initFormValidation() {
        var form = document.getElementById('checkout-form');
        if (!form) return;

        // Add custom validation styles
        var inputs = form.querySelectorAll('input[required], select[required]');
        var self = this;
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            input.addEventListener('blur', function() { self.validateField(this); });
            input.addEventListener('input', function() { self.clearFieldError(this); });
        }
    }

    validateField(field) {
        var isValid = field.checkValidity();
        
        field.classList.toggle('invalid', !isValid);
        field.classList.toggle('valid', isValid);
        
        return isValid;
    }

    clearFieldError(field) {
        field.classList.remove('invalid');
    }

    validateForm() {
        var form = document.getElementById('checkout-form');
        if (!form) return false;

        var isValid = true;
        var requiredFields = form.querySelectorAll('input[required], select[required]');
        
        for (var i = 0; i < requiredFields.length; i++) {
            if (!this.validateField(requiredFields[i])) {
                isValid = false;
            }
        }

        // Validate payment method specific fields
        var paymentMethodEl = document.querySelector('input[name="payment"]:checked');
        var paymentMethod = paymentMethodEl ? paymentMethodEl.value : null;
        
        if (paymentMethod === 'card') {
            var cardFields = ['card-number', 'expiry', 'cvv', 'card-name'];
            for (var i = 0; i < cardFields.length; i++) {
                var field = document.getElementById(cardFields[i]);
                if (field && !this.validateField(field)) {
                    isValid = false;
                }
            }
        }

        // Validate terms agreement
        var termsAgree = document.getElementById('terms-agree');
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

        var formData = new FormData(e.target);
        var orderData = this.collectOrderData(formData);

        try {
            await this.processOrder(orderData);
        } catch (error) {
            this.showError('There was an error processing your order. Please try again.');
        }
    }

    collectOrderData(formData) {
        var data = {};
        for (var pair of formData.entries()) {
            data[pair[0]] = pair[1];
        }
        var paymentMethodEl = document.querySelector('input[name="payment"]:checked');
        var paymentMethod = paymentMethodEl ? paymentMethodEl.value : null;
        
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
        var subtotal = this.cart.reduce(function(sum, item) { return sum + (item.price * item.quantity); }, 0);
        var shipping = subtotal > 500 ? 0 : 25;
        var vat = (subtotal + shipping) * 0.23;
        var total = subtotal + shipping + vat;

        return { subtotal: subtotal, shipping: shipping, vat: vat, total: total };
    }

    processOrder(orderData) {
        var self = this;
        var submitBtn = document.querySelector('button[type="submit"]');
        var originalText = submitBtn.textContent;
        
        return new Promise(function(resolve, reject) {
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            // Simulate order processing
            self.simulateOrderProcessing(orderData).then(function() {
            
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
        
        // Here you would integrate with real payment processing
        // and order management systems
    }

    showError(message) {
        // Create error notification safely using DOM methods
        var notification = document.createElement('div');
        notification.className = 'checkout-error';
        
        var errorContent = document.createElement('div');
        errorContent.className = 'error-content';
        
        var errorIcon = document.createElement('span');
        errorIcon.className = 'error-icon';
        errorIcon.textContent = '⚠️';
        
        var errorMessage = document.createElement('span');
        errorMessage.className = 'error-message';
        errorMessage.textContent = message; // Safe: uses textContent instead of innerHTML
        
        var closeBtn = document.createElement('button');
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
        var notification = document.createElement('div');
        notification.className = 'checkout-success';
        
        var successContent = document.createElement('div');
        successContent.className = 'success-content';
        
        var successIcon = document.createElement('span');
        successIcon.className = 'success-icon';
        successIcon.textContent = '✅';
        
        var successMessage = document.createElement('span');
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
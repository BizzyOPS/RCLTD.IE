// Professional Tooltip System for Robotics & Control Ltd
function ProTooltip() {
    this.tooltips = {}; // IE11 doesn't support Map, use object instead
    this.activeTooltip = null;
    this.init();
}

ProTooltip.prototype.init = function() {
    this.createTooltipContainer();
    this.bindEvents();
    this.scanForTooltips();
};

ProTooltip.prototype.createTooltipContainer = function() {
    // Create tooltip container if it doesn't exist
    if (!document.getElementById('pro-tooltip')) {
        var tooltipContainer = document.createElement('div');
        tooltipContainer.id = 'pro-tooltip';
        tooltipContainer.className = 'pro-tooltip';
        document.body.appendChild(tooltipContainer);
    }
};

ProTooltip.prototype.scanForTooltips = function() {
    // Find all elements with tooltip attributes
    var tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    for (var i = 0; i < tooltipElements.length; i++) {
        this.addTooltip(tooltipElements[i]);
    }
};

ProTooltip.prototype.addTooltip = function(element) {
    var tooltipText = element.getAttribute('data-tooltip');
    var tooltipPosition = element.getAttribute('data-tooltip-position') || 'top';
    var tooltipDelay = parseInt(element.getAttribute('data-tooltip-delay')) || 500;
    var tooltipType = element.getAttribute('data-tooltip-type') || 'default';
    var self = this;

    if (!tooltipText) return;

    // Store tooltip configuration - IE11 compatible object storage
    var elementKey = 'tooltip_' + Math.random().toString(36).substr(2, 9);
    element.setAttribute('data-tooltip-key', elementKey);
    
    this.tooltips[elementKey] = {
        element: element,
        text: tooltipText,
        position: tooltipPosition,
        delay: tooltipDelay,
        type: tooltipType,
        timeoutId: null
    };

    // Add event listeners
    element.addEventListener('mouseenter', function(e) { self.showTooltip(e, element); });
    element.addEventListener('mouseleave', function(e) { self.hideTooltip(e, element); });
    element.addEventListener('mousemove', function(e) { self.updateTooltipPosition(e, element); });
    
    // Touch support for mobile
    element.addEventListener('touchstart', function(e) { self.handleTouch(e, element); });
    element.addEventListener('touchend', function(e) { self.handleTouchEnd(e, element); });
};

ProTooltip.prototype.showTooltip = function(event, element) {
    var elementKey = element.getAttribute('data-tooltip-key');
    var config = this.tooltips[elementKey];
    var self = this;
    
    if (!config) return;

    // Clear any existing timeout
    if (config.timeoutId) {
        clearTimeout(config.timeoutId);
    }

    // Set delay before showing tooltip
    config.timeoutId = setTimeout(function() {
        self.displayTooltip(element, config, event);
    }, config.delay);
};

ProTooltip.prototype.displayTooltip = function(element, config, event) {
    var tooltip = document.getElementById('pro-tooltip');
    
    // Set tooltip content and type
    tooltip.innerHTML = this.formatTooltipContent(config.text, config.type);
    tooltip.className = 'pro-tooltip pro-tooltip-' + config.type + ' pro-tooltip-' + config.position;
    
    // Show tooltip
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'visible';
    tooltip.style.display = 'block';

    // Position tooltip
    this.positionTooltip(tooltip, element, config.position, event);

    // Animate in - IE11 compatible
    var self = this;
    if (window.requestAnimationFrame) {
        requestAnimationFrame(function() {
            tooltip.style.opacity = '1';
            tooltip.style.transform += ' scale(1)';
        });
    } else {
        setTimeout(function() {
            tooltip.style.opacity = '1';
            tooltip.style.transform += ' scale(1)';
        }, 16);
    }

    this.activeTooltip = { element: element, tooltip: tooltip, config: config };
};

ProTooltip.prototype.hideTooltip = function(event, element) {
    var elementKey = element.getAttribute('data-tooltip-key');
    var config = this.tooltips[elementKey];
    
    if (!config) return;

    // Clear timeout
    if (config.timeoutId) {
        clearTimeout(config.timeoutId);
        config.timeoutId = null;
    }

    // Hide active tooltip
    if (this.activeTooltip && this.activeTooltip.element === element) {
        var tooltip = this.activeTooltip.tooltip;
        
        tooltip.style.opacity = '0';
        tooltip.style.transform = tooltip.style.transform.replace('scale(1)', 'scale(0.95)');
        
        setTimeout(function() {
            tooltip.style.visibility = 'hidden';
            tooltip.style.display = 'none';
        }, 200);

        this.activeTooltip = null;
    }
};

ProTooltip.prototype.updateTooltipPosition = function(event, element) {
    if (this.activeTooltip && this.activeTooltip.element === element) {
        var tooltip = this.activeTooltip.tooltip;
        var config = this.activeTooltip.config;
        this.positionTooltip(tooltip, element, config.position, event);
    }
};

ProTooltip.prototype.positionTooltip = function(tooltip, element, position, event) {
    var rect = element.getBoundingClientRect();
    var tooltipRect = tooltip.getBoundingClientRect();
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    var x, y;

        switch (position) {
            case 'top':
                x = rect.left + scrollLeft + (rect.width / 2) - (tooltipRect.width / 2);
                y = rect.top + scrollTop - tooltipRect.height - 10;
                break;
            case 'bottom':
                x = rect.left + scrollLeft + (rect.width / 2) - (tooltipRect.width / 2);
                y = rect.bottom + scrollTop + 10;
                break;
            case 'left':
                x = rect.left + scrollLeft - tooltipRect.width - 10;
                y = rect.top + scrollTop + (rect.height / 2) - (tooltipRect.height / 2);
                break;
            case 'right':
                x = rect.right + scrollLeft + 10;
                y = rect.top + scrollTop + (rect.height / 2) - (tooltipRect.height / 2);
                break;
            case 'follow':
                x = event.pageX + 15;
                y = event.pageY - tooltipRect.height - 15;
                break;
            default:
                x = rect.left + scrollLeft + (rect.width / 2) - (tooltipRect.width / 2);
                y = rect.top + scrollTop - tooltipRect.height - 10;
        }

        // Keep tooltip within viewport
        var margin = 10;
        var maxX = window.innerWidth + scrollLeft - tooltipRect.width - margin;
        var maxY = window.innerHeight + scrollTop - tooltipRect.height - margin;

        x = Math.max(margin + scrollLeft, Math.min(x, maxX));
        y = Math.max(margin + scrollTop, Math.min(y, maxY));

        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
        tooltip.style.transform = 'scale(0.95)';
    }

ProTooltip.prototype.escapeHtml = function(text) {
    if (typeof text !== 'string') return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

ProTooltip.prototype.formatTooltipContent = function(text, type) {
    switch (type) {
        case 'success':
            return '<div class="tooltip-icon">✓</div><div class="tooltip-text">' + this.escapeHtml(text) + '</div>';
        case 'warning':
            return '<div class="tooltip-icon">⚠</div><div class="tooltip-text">' + this.escapeHtml(text) + '</div>';
        case 'error':
            return '<div class="tooltip-icon">✕</div><div class="tooltip-text">' + this.escapeHtml(text) + '</div>';
        case 'info':
            return '<div class="tooltip-icon">ℹ</div><div class="tooltip-text">' + this.escapeHtml(text) + '</div>';
        case 'help':
            return '<div class="tooltip-icon">?</div><div class="tooltip-text">' + this.escapeHtml(text) + '</div>';
        default:
            return '<div class="tooltip-text">' + this.escapeHtml(text) + '</div>';
    }
};

ProTooltip.prototype.handleTouch = function(event, element) {
    // Prevent default touch behavior
    event.preventDefault();
    this.showTooltip(event, element);
};

ProTooltip.prototype.handleTouchEnd = function(event, element) {
    var self = this;
    // Hide tooltip after a delay on touch devices
    setTimeout(function() {
        self.hideTooltip(event, element);
    }, 2000);
};

ProTooltip.prototype.bindEvents = function() {
    var self = this;
    
    // Hide tooltips when scrolling
    window.addEventListener('scroll', function() {
        if (self.activeTooltip) {
            self.hideTooltip(null, self.activeTooltip.element);
        }
    });

    // Hide tooltips when resizing
    window.addEventListener('resize', function() {
        if (self.activeTooltip) {
            self.hideTooltip(null, self.activeTooltip.element);
        }
    });

    // Hide tooltips when clicking elsewhere
    document.addEventListener('click', function(event) {
        if (self.activeTooltip && !self.activeTooltip.element.contains(event.target)) {
            self.hideTooltip(null, self.activeTooltip.element);
        }
    });
};

// Public methods for dynamic tooltip management
ProTooltip.prototype.addDynamicTooltip = function(element, text, options) {
    options = options || {};
    element.setAttribute('data-tooltip', text);
    element.setAttribute('data-tooltip-position', options.position || 'top');
    element.setAttribute('data-tooltip-delay', options.delay || 500);
    element.setAttribute('data-tooltip-type', options.type || 'default');
    
    this.addTooltip(element);
};

ProTooltip.prototype.removeDynamicTooltip = function(element) {
    var elementKey = element.getAttribute('data-tooltip-key');
    element.removeAttribute('data-tooltip');
    element.removeAttribute('data-tooltip-position');
    element.removeAttribute('data-tooltip-delay');
    element.removeAttribute('data-tooltip-type');
    element.removeAttribute('data-tooltip-key');
    
    if (elementKey && this.tooltips[elementKey]) {
        delete this.tooltips[elementKey];
    }
};

ProTooltip.prototype.updateTooltipText = function(element, newText) {
    var elementKey = element.getAttribute('data-tooltip-key');
    element.setAttribute('data-tooltip', newText);
    if (elementKey && this.tooltips[elementKey]) {
        this.tooltips[elementKey].text = newText;
    }
};

// Initialize tooltips when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.proTooltip = new ProTooltip();
});
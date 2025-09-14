// Professional Tooltip System for Robotics & Control Ltd
class ProTooltip {
    constructor() {
        this.tooltips = new Map();
        this.activeTooltip = null;
        this.init();
    }

    init() {
        this.createTooltipContainer();
        this.bindEvents();
        this.scanForTooltips();
    }

    createTooltipContainer() {
        // Create tooltip container if it doesn't exist
        if (!document.getElementById('pro-tooltip')) {
            const tooltipContainer = document.createElement('div');
            tooltipContainer.id = 'pro-tooltip';
            tooltipContainer.className = 'pro-tooltip';
            document.body.appendChild(tooltipContainer);
        }
    }

    scanForTooltips() {
        // Find all elements with tooltip attributes
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            this.addTooltip(element);
        });
    }

    addTooltip(element) {
        const tooltipText = element.getAttribute('data-tooltip');
        const tooltipPosition = element.getAttribute('data-tooltip-position') || 'top';
        const tooltipDelay = parseInt(element.getAttribute('data-tooltip-delay')) || 500;
        const tooltipType = element.getAttribute('data-tooltip-type') || 'default';

        if (!tooltipText) return;

        // Store tooltip configuration
        this.tooltips.set(element, {
            text: tooltipText,
            position: tooltipPosition,
            delay: tooltipDelay,
            type: tooltipType,
            timeoutId: null
        });

        // Add event listeners
        element.addEventListener('mouseenter', (e) => this.showTooltip(e, element));
        element.addEventListener('mouseleave', (e) => this.hideTooltip(e, element));
        element.addEventListener('mousemove', (e) => this.updateTooltipPosition(e, element));
        
        // Touch support for mobile
        element.addEventListener('touchstart', (e) => this.handleTouch(e, element));
        element.addEventListener('touchend', (e) => this.handleTouchEnd(e, element));
    }

    showTooltip(event, element) {
        const config = this.tooltips.get(element);
        if (!config) return;

        // Clear any existing timeout
        if (config.timeoutId) {
            clearTimeout(config.timeoutId);
        }

        // Set delay before showing tooltip
        config.timeoutId = setTimeout(() => {
            this.displayTooltip(element, config, event);
        }, config.delay);
    }

    displayTooltip(element, config, event) {
        const tooltip = document.getElementById('pro-tooltip');
        
        // Set tooltip content and type
        tooltip.innerHTML = this.formatTooltipContent(config.text, config.type);
        tooltip.className = `pro-tooltip pro-tooltip-${config.type} pro-tooltip-${config.position}`;
        
        // Show tooltip
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'visible';
        tooltip.style.display = 'block';

        // Position tooltip
        this.positionTooltip(tooltip, element, config.position, event);

        // Animate in
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform += ' scale(1)';
        });

        this.activeTooltip = { element, tooltip, config };
    }

    hideTooltip(event, element) {
        const config = this.tooltips.get(element);
        if (!config) return;

        // Clear timeout
        if (config.timeoutId) {
            clearTimeout(config.timeoutId);
            config.timeoutId = null;
        }

        // Hide active tooltip
        if (this.activeTooltip && this.activeTooltip.element === element) {
            const tooltip = this.activeTooltip.tooltip;
            
            tooltip.style.opacity = '0';
            tooltip.style.transform = tooltip.style.transform.replace('scale(1)', 'scale(0.95)');
            
            setTimeout(() => {
                tooltip.style.visibility = 'hidden';
                tooltip.style.display = 'none';
            }, 200);

            this.activeTooltip = null;
        }
    }

    updateTooltipPosition(event, element) {
        if (this.activeTooltip && this.activeTooltip.element === element) {
            const tooltip = this.activeTooltip.tooltip;
            const config = this.activeTooltip.config;
            this.positionTooltip(tooltip, element, config.position, event);
        }
    }

    positionTooltip(tooltip, element, position, event) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        let x, y;

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
        const margin = 10;
        const maxX = window.innerWidth + scrollLeft - tooltipRect.width - margin;
        const maxY = window.innerHeight + scrollTop - tooltipRect.height - margin;

        x = Math.max(margin + scrollLeft, Math.min(x, maxX));
        y = Math.max(margin + scrollTop, Math.min(y, maxY));

        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
        tooltip.style.transform = 'scale(0.95)';
    }

    formatTooltipContent(text, type) {
        switch (type) {
            case 'success':
                return `<div class="tooltip-icon">✓</div><div class="tooltip-text">${text}</div>`;
            case 'warning':
                return `<div class="tooltip-icon">⚠</div><div class="tooltip-text">${text}</div>`;
            case 'error':
                return `<div class="tooltip-icon">✕</div><div class="tooltip-text">${text}</div>`;
            case 'info':
                return `<div class="tooltip-icon">ℹ</div><div class="tooltip-text">${text}</div>`;
            case 'help':
                return `<div class="tooltip-icon">?</div><div class="tooltip-text">${text}</div>`;
            default:
                return `<div class="tooltip-text">${text}</div>`;
        }
    }

    handleTouch(event, element) {
        // Prevent default touch behavior
        event.preventDefault();
        this.showTooltip(event, element);
    }

    handleTouchEnd(event, element) {
        // Hide tooltip after a delay on touch devices
        setTimeout(() => {
            this.hideTooltip(event, element);
        }, 2000);
    }

    bindEvents() {
        // Hide tooltips when scrolling
        window.addEventListener('scroll', () => {
            if (this.activeTooltip) {
                this.hideTooltip(null, this.activeTooltip.element);
            }
        });

        // Hide tooltips when resizing
        window.addEventListener('resize', () => {
            if (this.activeTooltip) {
                this.hideTooltip(null, this.activeTooltip.element);
            }
        });

        // Hide tooltips when clicking elsewhere
        document.addEventListener('click', (event) => {
            if (this.activeTooltip && !this.activeTooltip.element.contains(event.target)) {
                this.hideTooltip(null, this.activeTooltip.element);
            }
        });
    }

    // Public methods for dynamic tooltip management
    addDynamicTooltip(element, text, options = {}) {
        element.setAttribute('data-tooltip', text);
        element.setAttribute('data-tooltip-position', options.position || 'top');
        element.setAttribute('data-tooltip-delay', options.delay || 500);
        element.setAttribute('data-tooltip-type', options.type || 'default');
        
        this.addTooltip(element);
    }

    removeDynamicTooltip(element) {
        element.removeAttribute('data-tooltip');
        element.removeAttribute('data-tooltip-position');
        element.removeAttribute('data-tooltip-delay');
        element.removeAttribute('data-tooltip-type');
        
        this.tooltips.delete(element);
    }

    updateTooltipText(element, newText) {
        element.setAttribute('data-tooltip', newText);
        if (this.tooltips.has(element)) {
            this.tooltips.get(element).text = newText;
        }
    }
}

// Initialize tooltips when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.proTooltip = new ProTooltip();
});
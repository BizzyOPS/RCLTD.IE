// Popup Tooltip System for Robotics & Control Ltd Homepage
class PopupTooltips {
    constructor() {
        this.tooltips = new Map();
        this.shownTooltips = new Set();
        this.popupContainer = null;
        this.init();
    }

    init() {
        this.createPopupContainer();
        this.setupTooltipContent();
        this.bindEvents();
        
        // Show tooltips after page loads with a delay
        setTimeout(() => {
            this.showInitialTooltips();
        }, 2000);
    }

    createPopupContainer() {
        this.popupContainer = document.createElement('div');
        this.popupContainer.id = 'popup-tooltips-container';
        document.body.appendChild(this.popupContainer);
    }

    setupTooltipContent() {
        this.tooltips.set('safety-info', {
            title: '🛡️ Machine Safety Excellence',
            content: 'CE marking compliance, risk assessments, and safety system validation for pharmaceutical and industrial environments.',
            position: 'top-left',
            priority: 1
        });

        this.tooltips.set('electrical-info', {
            title: '⚡ Advanced Electrical Design',
            content: 'CAD design, PLC programming, and electrical system optimization using the latest industry tools and methodologies.',
            position: 'top-right',
            priority: 2
        });

        this.tooltips.set('panel-info', {
            title: '🔧 Custom Panel Building',
            content: 'From design to manufacturing - electrical panels built to your exact specifications and industry standards.',
            position: 'bottom-left',
            priority: 3
        });

        this.tooltips.set('automation-info', {
            title: '🤖 Smart Automation Solutions',
            content: 'Robotic systems, factory automation, and process control solutions that boost productivity by up to 40%.',
            position: 'bottom-right',
            priority: 4
        });

        this.tooltips.set('training-info', {
            title: '📚 Interactive Safety Training',
            content: 'Comprehensive safety courses with 90% pass requirement and real-world scenarios for industrial environments.',
            position: 'right',
            priority: 5
        });

        this.tooltips.set('expertise-info', {
            title: '🏆 50+ Years Combined Experience',
            content: 'Our team brings decades of expertise across pharmaceutical, automotive, food & beverage, and industrial sectors.',
            position: 'left',
            priority: 6
        });
    }

    showInitialTooltips() {
        // Show tooltips in order of priority with delays
        const sortedTooltips = Array.from(this.tooltips.entries())
            .sort((a, b) => a[1].priority - b[1].priority);

        sortedTooltips.forEach(([id, config], index) => {
            const element = document.querySelector(`[data-popup-tooltip="${id}"]`);
            if (element && this.isElementVisible(element)) {
                setTimeout(() => {
                    this.showTooltip(id, element, config);
                }, index * 800); // Stagger the appearance
            }
        });
    }

    showTooltip(id, element, config) {
        if (this.shownTooltips.has(id)) return;

        const tooltip = this.createTooltipElement(id, config);
        const position = this.calculatePosition(element, config.position);
        
        tooltip.style.left = position.x + 'px';
        tooltip.style.top = position.y + 'px';
        
        this.popupContainer.appendChild(tooltip);
        this.shownTooltips.add(id);

        // Animate in
        setTimeout(() => {
            tooltip.classList.add('popup-tooltip-show');
        }, 50);

        // Auto-dismiss after 8 seconds if not manually dismissed
        setTimeout(() => {
            this.hideTooltip(id);
        }, 8000);
    }

    createTooltipElement(id, config) {
        const tooltip = document.createElement('div');
        tooltip.className = 'popup-tooltip';
        tooltip.dataset.tooltipId = id;
        
        tooltip.innerHTML = `
            <div class="popup-tooltip-header">
                <h4 class="popup-tooltip-title">${config.title}</h4>
                <button class="popup-tooltip-close" data-tooltip-id="${id}" aria-label="Dismiss tooltip">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            <div class="popup-tooltip-content">
                <p>${config.content}</p>
            </div>
            <div class="popup-tooltip-arrow ${config.position}"></div>
        `;

        return tooltip;
    }

    calculatePosition(element, preferredPosition) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        const tooltipWidth = 300;
        const tooltipHeight = 120;
        const offset = 20;

        let x, y;

        switch (preferredPosition) {
            case 'top-left':
                x = rect.left + scrollLeft - tooltipWidth + 50;
                y = rect.top + scrollTop - tooltipHeight - offset;
                break;
            case 'top-right':
                x = rect.right + scrollLeft - 50;
                y = rect.top + scrollTop - tooltipHeight - offset;
                break;
            case 'bottom-left':
                x = rect.left + scrollLeft - tooltipWidth + 50;
                y = rect.bottom + scrollTop + offset;
                break;
            case 'bottom-right':
                x = rect.right + scrollLeft - 50;
                y = rect.bottom + scrollTop + offset;
                break;
            case 'left':
                x = rect.left + scrollLeft - tooltipWidth - offset;
                y = rect.top + scrollTop + (rect.height - tooltipHeight) / 2;
                break;
            case 'right':
                x = rect.right + scrollLeft + offset;
                y = rect.top + scrollTop + (rect.height - tooltipHeight) / 2;
                break;
            default:
                x = rect.left + scrollLeft + (rect.width - tooltipWidth) / 2;
                y = rect.top + scrollTop - tooltipHeight - offset;
        }

        // Keep tooltip within viewport
        x = Math.max(10, Math.min(x, window.innerWidth - tooltipWidth - 10));
        y = Math.max(10, y);

        return { x, y };
    }

    hideTooltip(id) {
        const tooltip = document.querySelector(`[data-tooltip-id="${id}"]`);
        if (tooltip) {
            tooltip.classList.remove('popup-tooltip-show');
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 300);
        }
    }

    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    bindEvents() {
        // Handle close button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('popup-tooltip-close') || 
                e.target.closest('.popup-tooltip-close')) {
                const button = e.target.closest('.popup-tooltip-close');
                const tooltipId = button.dataset.tooltipId;
                this.hideTooltip(tooltipId);
            }
        });

        // Hide tooltips on scroll to avoid cluttering
        let scrollTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                this.hideAllTooltips();
            }, 100);
        });

        // Hide tooltips when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.popup-tooltip') && 
                !e.target.closest('[data-popup-tooltip]')) {
                this.hideAllTooltips();
            }
        });

        // Show tooltip on hover for elements that haven't been shown yet
        document.addEventListener('mouseenter', (e) => {
            const tooltipId = e.target && e.target.dataset ? e.target.dataset.popupTooltip : null;
            if (tooltipId && !this.shownTooltips.has(tooltipId)) {
                const config = this.tooltips.get(tooltipId);
                if (config) {
                    this.showTooltip(tooltipId, e.target, config);
                }
            }
        }, true);
    }

    hideAllTooltips() {
        const allTooltips = document.querySelectorAll('.popup-tooltip');
        allTooltips.forEach(tooltip => {
            const tooltipId = tooltip.dataset.tooltipId;
            this.hideTooltip(tooltipId);
        });
    }

    // Public method to manually show a tooltip
    showTooltipById(id) {
        const element = document.querySelector(`[data-popup-tooltip="${id}"]`);
        const config = this.tooltips.get(id);
        if (element && config) {
            this.showTooltip(id, element, config);
        }
    }

    // Public method to reset shown tooltips
    resetTooltips() {
        this.shownTooltips.clear();
        this.hideAllTooltips();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.popupTooltips = new PopupTooltips();
});
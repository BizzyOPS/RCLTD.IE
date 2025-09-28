/* ============================================================================
   POPUP TOOLTIP SYSTEM - ROBOTICS & CONTROL LTD
   
   Interactive popup tooltip system that displays contextual information and
   service highlights on the homepage. Provides engaging user experience with
   timed reveals and smart positioning.
   
   Features:
   - Automatic tooltip timing and display management
   - Smart positioning (top-left, top-right, bottom-left, bottom-right)
   - Service-specific content with engaging copy
   - Cross-browser compatibility with fallbacks
   - Non-intrusive user experience with dismiss functionality
   - Priority-based tooltip sequencing
   
   Usage: Automatically initializes on homepage load
   Dependencies: None (vanilla JavaScript)
   Browser Support: Modern browsers (Chrome 60+, Firefox 55+, Safari 12+)
   ============================================================================ */

/**
 * PopupTooltips Class
 * 
 * Main popup tooltip system that manages display timing, positioning,
 * and content for homepage service highlights.
 * 
 * @constructor
 * @class PopupTooltips
 */
function PopupTooltips() {
    this.tooltips = {}; // IE-compatible object storage for tooltip configs
    this.shownTooltips = {}; // IE-compatible object for tracking shown tooltips  
    this.popupContainer = null; // DOM container for all tooltips
    this.init(); // Initialize the system
}

PopupTooltips.prototype.init = function() {
    var self = this;
    this.createPopupContainer();
    this.setupTooltipContent();
    this.bindEvents();
    
    // Show tooltips after page loads with a delay
    setTimeout(function() {
        self.showInitialTooltips();
    }, 2000);
};

PopupTooltips.prototype.createPopupContainer = function() {
    this.popupContainer = document.createElement('div');
    this.popupContainer.id = 'popup-tooltips-container';
    document.body.appendChild(this.popupContainer);
};

PopupTooltips.prototype.setupTooltipContent = function() {
    this.tooltips['safety-info'] = {
        title: '🛡️ Machine Safety Excellence',
        content: 'CE marking compliance, risk assessments, and safety system validation for pharmaceutical and industrial environments.',
        position: 'top-left',
        priority: 1
    };

    this.tooltips['electrical-info'] = {
        title: '⚡ Advanced Electrical Design',
        content: 'CAD design, PLC programming, and electrical system optimization using the latest industry tools and methodologies.',
        position: 'top-right',
        priority: 2
    };

    this.tooltips['panel-info'] = {
        title: '🔧 Custom Panel Building',
        content: 'From design to manufacturing - electrical panels built to your exact specifications and industry standards.',
        position: 'bottom-left',
        priority: 3
    };

    this.tooltips['automation-info'] = {
        title: '🤖 Smart Automation Solutions',
        content: 'Robotic systems, factory automation, and process control solutions that boost productivity by up to 40%.',
        position: 'bottom-right',
        priority: 4
    };

    this.tooltips['training-info'] = {
        title: '📚 Interactive Safety Training',
        content: 'Comprehensive safety courses with 90% pass requirement and real-world scenarios for industrial environments.',
        position: 'right',
        priority: 5
    };

    this.tooltips['expertise-info'] = {
        title: '🏆 50+ Years Combined Experience',
        content: 'Our team brings decades of expertise across pharmaceutical, automotive, food & beverage, and industrial sectors.',
        position: 'left',
        priority: 6
    };
};

PopupTooltips.prototype.showInitialTooltips = function() {
    var self = this;
    // Show tooltips in order of priority with delays - IE11 compatible
    var sortedTooltips = [];
    
    // Convert object to array and sort by priority
    for (var key in this.tooltips) {
        if (this.tooltips.hasOwnProperty(key)) {
            sortedTooltips.push([key, this.tooltips[key]]);
        }
    }
    
    sortedTooltips.sort(function(a, b) {
        return a[1].priority - b[1].priority;
    });

    for (var i = 0; i < sortedTooltips.length; i++) {
        (function(id, config, index) {
            var element = document.querySelector('[data-popup-tooltip="' + id + '"]');
            if (element && self.isElementVisible(element)) {
                setTimeout(function() {
                    self.showTooltip(id, element, config);
                }, index * 800); // Stagger the appearance
            }
        })(sortedTooltips[i][0], sortedTooltips[i][1], i);
    }
};

PopupTooltips.prototype.showTooltip = function(id, element, config) {
    var self = this;
    if (this.shownTooltips[id]) return;

    var tooltip = this.createTooltipElement(id, config);
    var position = this.calculatePosition(element, config.position);
    
    tooltip.style.left = position.x + 'px';
    tooltip.style.top = position.y + 'px';
    
    this.popupContainer.appendChild(tooltip);
    this.shownTooltips[id] = true; // Use object instead of Set

    // Animate in
    setTimeout(function() {
        tooltip.classList.add('popup-tooltip-show');
    }, 50);

    // Auto-dismiss after 8 seconds if not manually dismissed
    setTimeout(function() {
        self.hideTooltip(id);
    }, 8000);
};

PopupTooltips.prototype.createTooltipElement = function(id, config) {
    var tooltip = document.createElement('div');
    tooltip.className = 'popup-tooltip';
    tooltip.dataset.tooltipId = id;
    
    // IE11 compatible string concatenation instead of template literals
    tooltip.innerHTML = '<div class="popup-tooltip-header">' +
        '<h4 class="popup-tooltip-title">' + config.title + '</h4>' +
        '<button class="popup-tooltip-close" data-tooltip-id="' + id + '" aria-label="Dismiss tooltip">' +
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none">' +
        '<path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
        '</svg>' +
        '</button>' +
        '</div>' +
        '<div class="popup-tooltip-content">' +
        '<p>' + config.content + '</p>' +
        '</div>' +
        '<div class="popup-tooltip-arrow ' + config.position + '"></div>';

    return tooltip;
};

PopupTooltips.prototype.calculatePosition = function(element, preferredPosition) {
    var rect = element.getBoundingClientRect();
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        var tooltipWidth = 300;
        var tooltipHeight = 120;
        var offset = 20;

        var x, y;

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

        return { x: x, y: y };
    };

PopupTooltips.prototype.hideTooltip = function(id) {
    var tooltip = document.querySelector('[data-tooltip-id="' + id + '"]');
    if (tooltip) {
        tooltip.classList.remove('popup-tooltip-show');
        setTimeout(function() {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 300);
    }
};

PopupTooltips.prototype.isElementVisible = function(element) {
    var rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
};

PopupTooltips.prototype.bindEvents = function() {
    var self = this;
    var scrollTimer;
    
    // Handle close button clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('popup-tooltip-close') || 
            e.target.closest('.popup-tooltip-close')) {
            var button = e.target.closest('.popup-tooltip-close');
            var tooltipId = button && button.dataset ? button.dataset.tooltipId : null;
            if (tooltipId) {
                self.hideTooltip(tooltipId);
            }
        }
    });

    // Hide tooltips on scroll to avoid cluttering
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function() {
            self.hideAllTooltips();
        }, 100);
    });

    // Hide tooltips when clicking elsewhere
    document.addEventListener('click', function(e) {
        if (e.target && 
            !e.target.closest('.popup-tooltip') && 
            !e.target.closest('[data-popup-tooltip]')) {
            self.hideAllTooltips();
        }
    });

    // Show tooltip on hover for elements that haven't been shown yet
    document.addEventListener('mouseenter', function(e) {
        try {
            var tooltipId = e.target && e.target.dataset ? e.target.dataset.popupTooltip : null;
            if (tooltipId && !self.shownTooltips[tooltipId]) {
                var config = self.tooltips[tooltipId];
                if (config) {
                    self.showTooltip(tooltipId, e.target, config);
                }
            }
        } catch (error) {
            // Silently handle tooltip errors to prevent blocking other scripts
            console.debug('Tooltip error:', error);
        }
    }, true);
};

PopupTooltips.prototype.hideAllTooltips = function() {
    var self = this;
    var allTooltips = document.querySelectorAll('.popup-tooltip');
    for (var i = 0; i < allTooltips.length; i++) {
        var tooltip = allTooltips[i];
        var tooltipId = tooltip && tooltip.dataset ? tooltip.dataset.tooltipId : null;
        if (tooltipId) {
            self.hideTooltip(tooltipId);
        }
    }
};

// Public method to manually show a tooltip
PopupTooltips.prototype.showTooltipById = function(id) {
    var element = document.querySelector('[data-popup-tooltip="' + id + '"]');
    var config = this.tooltips[id];
    if (element && config) {
        this.showTooltip(id, element, config);
    }
};

// Public method to reset shown tooltips
PopupTooltips.prototype.resetTooltips = function() {
    this.shownTooltips = {}; // Reset object instead of using .clear()
    this.hideAllTooltips();
};

// Initialize when DOM is ready - only on desktop
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize tooltips on desktop to prevent mobile interference
    if (window.innerWidth > 768) {
        try {
            window.popupTooltips = new PopupTooltips();
        } catch (error) {
            console.debug('Tooltip initialization failed:', error);
        }
    }
});
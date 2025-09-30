/* ============================================================================
   CONTROLLER BOT - AI CHATBOT FOR ROBOTICS & CONTROL LTD
   
   Professional chatbot interface providing customer support and lead generation 
   for automation services. Features service-specific content and intelligent
   navigation to help users find relevant information and contact options.
   
   Features:
   - Professional service information and navigation interface
   - Lead qualification and contact form integration  
   - Responsive design for all devices
   - Accessibility-compliant interface
   - Real-time typing indicators for user experience
   - Service-specific content and recommendations
   
   Dependencies: None (standalone vanilla JavaScript system)
   Browser Support: Modern browsers (Chrome 60+, Firefox 55+, Safari 12+)
   Note: Demonstration chatbot interface for customer engagement
   ============================================================================ */

/**
 * ControllerBot Class
 * 
 * Main chatbot constructor that initializes the chat interface and handles
 * all user interactions with the AI assistant.
 * 
 * @constructor
 * @class ControllerBot
 */
function ControllerBot() {
    this.isOpen = false; // Track chat window state
    this.messages = []; // Store conversation history
    this.isTyping = false; // Track bot typing state
    this.conversationState = {}; // Track conversation context and user needs
    this.init(); // Initialize the chatbot
}

// Helper function to build contact links with proper URL encoding
ControllerBot.prototype.buildContactLink = function(params) {
    var queryParams = [];
    if (params.dept) queryParams.push('dept=' + encodeURIComponent(params.dept));
    if (params.service) queryParams.push('service=' + encodeURIComponent(params.service));
    if (params.industry) queryParams.push('industry=' + encodeURIComponent(params.industry));
    if (params.type) queryParams.push('type=' + encodeURIComponent(params.type));
    
    return 'contact.html' + (queryParams.length > 0 ? '?' + queryParams.join('&') : '');
};

ControllerBot.prototype.init = function() {
    this.createChatInterface();
    this.bindEvents();
    this.addWelcomeMessage();
};

ControllerBot.prototype.createChatInterface = function() {
    // Create chatbot HTML structure - ES5 compatible string concatenation
    var chatbotHTML = [
        '            <!-- Chatbot Toggle Button -->',
        '            <div id="chatbot-toggle" class="chatbot-toggle" title="Chat with Controller Bot">',
        '                <img src="images/roundlogo.png" alt="Controller Bot" class="chatbot-icon">',
        '                <div class="chatbot-pulse"></div>',
        '            </div>',
        '',
        '            <!-- Chatbot Container -->',
        '            <div id="chatbot-container" class="chatbot-container" role="dialog" aria-labelledby="chatbot-title" aria-modal="true">',
        '                <div class="chatbot-header">',
        '                    <div class="chatbot-header-info">',
        '                        <img src="images/roundlogo.png" alt="Controller Bot" class="chatbot-avatar">',
        '                        <div class="chatbot-header-text">',
        '                            <h3 id="chatbot-title">Controller Bot</h3>',
        '                            <span class="chatbot-status">Online • Ready to help</span>',
        '                        </div>',
        '                    </div>',
        '                    <button id="chatbot-close" class="chatbot-close" aria-label="Close chat">',
        '                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">',
        '                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>',
        '                        </svg>',
        '                    </button>',
        '                </div>',
        '                ',
        '                <div class="chatbot-messages" id="chatbot-messages" role="log" aria-live="polite" aria-relevant="additions" aria-label="Chat conversation">',
        '                    <!-- Messages will be added here dynamically -->',
        '                </div>',
        '                ',
        '                <div class="chatbot-input-container">',
        '                    <div class="chatbot-input-wrapper">',
        '                        <input ',
        '                            type="text" ',
        '                            id="chatbot-input" ',
        '                            class="chatbot-input" ',
        '                            placeholder="Ask me about services, training, or products..."',
        '                            maxlength="500"',
        '                        >',
        '                        <button id="chatbot-send" class="chatbot-send-btn" aria-label="Send message">',
        '                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">',
        '                                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>',
        '                            </svg>',
        '                        </button>',
        '                    </div>',
        '                    <div class="chatbot-quick-actions">',
        '                        <button class="quick-action-btn" data-message="Tell me about automation services">',
        '                            🔧 Automation',
        '                        </button>',
        '                        <button class="quick-action-btn" data-message="What safety services do you provide?">',
        '                            🛡️ Safety',
        '                        </button>',
        '                        <button class="quick-action-btn" data-message="Tell me about electrical design">',
        '                            ⚡ Electrical Design',
        '                        </button>',
        '                        <button class="quick-action-btn" data-message="What about panel building?">',
        '                            🏗️ Panel Building',
        '                        </button>',
        '                        <button class="quick-action-btn" data-message="Tell me about on-site safety training">',
        '                            📚 On-Site Training',
        '                        </button>',
        '                        <button class="quick-action-btn" data-message="How can I get a quote?">',
        '                            💬 Get Quote',
        '                        </button>',
        '                    </div>',
        '                </div>',
        '            </div>'
    ].join('\n');

    // Add chatbot to the page
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
};

ControllerBot.prototype.bindEvents = function() {
    var self = this;
    var toggle = document.getElementById('chatbot-toggle');
    var close = document.getElementById('chatbot-close');
    var sendBtn = document.getElementById('chatbot-send');
    var input = document.getElementById('chatbot-input');
    var quickActions = document.querySelectorAll('.quick-action-btn');

    toggle.addEventListener('click', function() { self.toggleChat(); });
    close.addEventListener('click', function() { self.closeChat(); });
    sendBtn.addEventListener('click', function() { self.sendMessage(); });
        
    input.addEventListener('keypress', function(e) {
        var key = e.key || e.keyCode;
        if ((key === 'Enter' || key === 13) && !e.shiftKey) {
            e.preventDefault();
            self.sendMessage();
        }
    });

    // Quick action buttons
    for (var i = 0; i < quickActions.length; i++) {
        var btn = quickActions[i];
        btn.addEventListener('click', function() {
            var message = this.dataset.message;
            self.sendQuickMessage(message);
        });
    }

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        var key = e.key || e.keyCode;
        if ((key === 'Escape' || key === 27) && self.isOpen) {
            self.closeChat();
        }
    });
};

ControllerBot.prototype.toggleChat = function() {
    if (this.isOpen) {
        this.closeChat();
    } else {
        this.openChat();
    }
};

ControllerBot.prototype.openChat = function() {
    var container = document.getElementById('chatbot-container');
    var toggle = document.getElementById('chatbot-toggle');
    
    container.classList.add('open');
    toggle.classList.add('hidden');
    this.isOpen = true;

    // Store the currently focused element for restoration later
    this.previousFocus = document.activeElement;

    // Add body scroll lock on mobile devices with position preservation
    if (window.innerWidth <= 768) {
        this.scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = '-' + this.scrollY + 'px';
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
    }

    // Make background inert for better modal semantics
    var mainContent = document.querySelector('main') || document.body;
    if (mainContent && mainContent !== document.body) {
        mainContent.setAttribute('aria-hidden', 'true');
        this.backgroundInert = mainContent;
    }

    // Focus input after animation and ensure it stays within the chatbot
    var self = this;
    setTimeout(function() {
        var input = document.getElementById('chatbot-input');
        input.focus();
        self.trapFocusInChat();
    }, 300);
};

ControllerBot.prototype.closeChat = function() {
    var container = document.getElementById('chatbot-container');
    var toggle = document.getElementById('chatbot-toggle');
    
    container.classList.remove('open');
    toggle.classList.remove('hidden');
    this.isOpen = false;

    // Remove body scroll lock and restore scroll position
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    
    if (typeof this.scrollY === 'number') {
        window.scrollTo(0, this.scrollY);
        this.scrollY = null;
    }

    // Restore background interactivity
    if (this.backgroundInert) {
        this.backgroundInert.removeAttribute('aria-hidden');
        this.backgroundInert = null;
    }

    // Return focus to the toggle button or previously focused element
    if (this.previousFocus && this.previousFocus.focus) {
        this.previousFocus.focus();
    } else {
        toggle.focus();
    }

    // Remove focus trap
    this.removeFocusTrap();
};

// Focus trap functionality for accessibility
ControllerBot.prototype.trapFocusInChat = function() {
    var container = document.getElementById('chatbot-container');
    var focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    var firstFocusable = focusableElements[0];
    var lastFocusable = focusableElements[focusableElements.length - 1];
    
    this.focusTrapHandler = function(e) {
        var key = e.key || e.keyCode;
        var isTabPressed = (key === 'Tab' || key === 9);
        
        if (!isTabPressed) return;
        
        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    };
    
    document.addEventListener('keydown', this.focusTrapHandler);
};

ControllerBot.prototype.removeFocusTrap = function() {
    if (this.focusTrapHandler) {
        document.removeEventListener('keydown', this.focusTrapHandler);
        this.focusTrapHandler = null;
    }
};

ControllerBot.prototype.addWelcomeMessage = function() {
    var welcomeMessage = {
        type: 'bot',
        content: '👋 Welcome! I\'m Controller Bot, your friendly automation assistant!\n\n' +
                '🎯 **I\'m here to help you:**\n' +
                '• Find the perfect service for your needs\n' +
                '• Answer questions about our expertise\n' +
                '• Connect you with the right team member\n' +
                '• Get you a quote or schedule a consultation\n\n' +
                '**What can I help you with today?**\n' +
                '💬 Just describe what you need, or try asking:\n' +
                '• "I need help finding a service"\n' +
                '• "Tell me about automation"\n' +
                '• "How do I get a quote?"\n' +
                '• "What products do you have?"',
        timestamp: new Date()
    };
    
    this.messages.push(welcomeMessage);
    this.renderMessage(welcomeMessage);
};

ControllerBot.prototype.sendMessage = function() {
    var input = document.getElementById('chatbot-input');
    var message = input.value.trim();
    var self = this;
    
    if (!message || this.isTyping) return;

    // Enhanced input sanitization - remove potentially harmful content
    message = this.sanitizeInput(message);
    
    if (!message) {
        // Input was entirely malicious content
        input.value = '';
        return;
    }

    // Add user message
    var userMessage = {
        type: 'user',
        content: message,
        timestamp: new Date()
    };
    
    this.messages.push(userMessage);
    this.renderMessage(userMessage);
    input.value = '';

    // Get bot response
    this.getBotResponse(message);
};

ControllerBot.prototype.sendQuickMessage = function(message) {
    var input = document.getElementById('chatbot-input');
    input.value = message;
    this.sendMessage();
};

ControllerBot.prototype.getBotResponse = function(userMessage) {
    var self = this;
    this.showTypingIndicator();

    this.getLocalResponse(userMessage)
        .then(function(response) {
            var botMessage = {
                type: 'bot',
                content: response,
                timestamp: new Date()
            };
            
            self.messages.push(botMessage);
            self.hideTypingIndicator();
            self.renderMessage(botMessage);
        })
        .catch(function(error) {
            self.hideTypingIndicator();
            
            var errorMessage = {
                type: 'bot',
                content: "I apologize, but I'm experiencing technical difficulties. Please contact us directly at +353 (0) 52 7443258 or info@rcltd.ie for immediate assistance.",
                timestamp: new Date()
            };
            
            self.messages.push(errorMessage);
            self.renderMessage(errorMessage);
        });
};

// Enhanced intelligent response system with conversation state
ControllerBot.prototype.getLocalResponse = function(message) {
    var self = this;
    var lowerMessage = message.toLowerCase();
    
    // Simulate API delay for natural conversation feel
    return new Promise(function(resolve, reject) {
        setTimeout(function() {

        // Check for restart/reset intent
        if (lowerMessage.match(/\b(start over|restart|reset|main menu|show options|go back)\b/)) {
            self.conversationState = {}; // Clear conversation state
            var response = '🔄 **Let\'s start fresh!**\n\n' +
                'I\'ve reset our conversation. How can I help you today?\n\n' +
                '**Quick Options:**\n' +
                '• Type "help" to explore our services\n' +
                '• Tell me what you\'re looking for\n' +
                '• Ask about a specific service\n' +
                '• Request a quote\n\n' +
                'What would you like to know about R&C Ltd? 😊';
            resolve(response);
            return;
        }

        // Check for greeting first
        if (lowerMessage.match(/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/)) {
            var response = '👋 Hello there! Great to meet you!\n\n' +
                'I\'m here to help you find the perfect automation solution for your needs. To get started, could you tell me:\n\n' +
                '**What brings you to R&C Ltd today?**\n' +
                '• Looking for a specific service?\n' +
                '• Need a custom automation solution?\n' +
                '• Want to discuss a project?\n' +
                '• Just exploring what we offer?\n\n' +
                'Feel free to describe your needs in your own words - I\'m here to help! 😊';
            resolve(response);
            return;
        }

        // Intent detection: User needs help finding a service/product
        if (lowerMessage.match(/\b(help|find|looking for|need|want|search)\b/) && 
            !self.conversationState.serviceCategory) {
            self.conversationState.discoveryMode = true;
            var response = '🔍 **I\'d be happy to help you find the right solution!**\n\n' +
                'Let me ask you a few quick questions to point you in the right direction:\n\n' +
                '**What type of solution are you looking for?**\n\n' +
                '1️⃣ **Control & Automation** - PLC systems, SCADA, process control\n' +
                '2️⃣ **Safety & Compliance** - Machine safety, risk assessment, CE marking\n' +
                '3️⃣ **Design Services** - Electrical design, system engineering\n' +
                '4️⃣ **Manufacturing** - Panel building, control cabinet assembly\n' +
                '5️⃣ **Training** - On-site safety training for your team\n' +
                '6️⃣ **Not Sure** - Let me help you figure it out!\n\n' +
                'Just type the number or describe what you need!';
            resolve(response);
            return;
        }

        // Discovery mode: Guide user through finding right service
        if (self.conversationState.discoveryMode && !self.conversationState.serviceCategory) {
            if (lowerMessage.match(/\b(1|one|control|automation|plc|scada|robot)\b/)) {
                self.conversationState.serviceCategory = 'automation';
                var response = '🔧 **Perfect! Automation Solutions it is.**\n\n' +
                    'Now, what industry are you in? This helps me recommend the best approach:\n\n' +
                    '**Industries we specialize in:**\n' +
                    '🏭 **Pharmaceutical** - GMP compliance, validation, clean room systems\n' +
                    '🚗 **Automotive** - Assembly lines, robotics, quality control\n' +
                    '🍎 **Food & Beverage** - Hygienic design, HACCP compliance\n' +
                    '🏗️ **General Manufacturing** - Custom industrial automation\n\n' +
                    'Which one matches your needs?';
                resolve(response);
                return;
            } else if (lowerMessage.match(/\b(2|two|safety|compliance|risk|ce mark)\b/)) {
                self.conversationState.serviceCategory = 'safety';
                var response = '🛡️ **Excellent choice! Safety is crucial.**\n\n' +
                    'What\'s your main safety concern?\n\n' +
                    '**Common safety needs:**\n' +
                    '✅ **New Machine Compliance** - CE marking for new equipment\n' +
                    '⚠️ **Existing Machine Assessment** - Safety audit & upgrades\n' +
                    '📋 **Risk Assessment** - ISO 12100, ISO 13849 compliance\n' +
                    '🤖 **Robot Safety** - Collaborative & industrial robot safety\n' +
                    '🎓 **Safety Training** - On-site team training programs\n\n' +
                    'Tell me what safety challenge you\'re facing!';
                resolve(response);
                return;
            } else if (lowerMessage.match(/\b(3|three|design|electrical|engineering|schematic)\b/)) {
                self.conversationState.serviceCategory = 'design';
                var response = '⚡ **Great! Let\'s talk Electrical Design.**\n\n' +
                    'What type of design project do you need?\n\n' +
                    '**Design Services:**\n' +
                    '📐 **Control System Design** - Complete control architecture\n' +
                    '🔌 **Power Distribution** - Load calculations, cable sizing\n' +
                    '🎯 **Motor Control Centers** - MCC design & specifications\n' +
                    '🏭 **Instrumentation Design** - Field devices, control loops\n' +
                    '⚠️ **Hazardous Area Design** - ATEX/IECEx compliance\n\n' +
                    'Which design service interests you?';
                resolve(response);
                return;
            } else if (lowerMessage.match(/\b(4|four|panel|building|cabinet|mcc|manufacture)\b/)) {
                self.conversationState.serviceCategory = 'panel';
                var response = '🏗️ **Perfect! Panel Building is our specialty.**\n\n' +
                    'What type of panel do you need?\n\n' +
                    '**Panel Types:**\n' +
                    '⚙️ **Control Panels** - Motor control, process control\n' +
                    '🏭 **Motor Control Centers (MCC)** - To IEC 61439 standard\n' +
                    '🔌 **Distribution Panels** - Power distribution, switchgear\n' +
                    '📊 **Instrumentation Panels** - Field junction, marshalling\n' +
                    '♻️ **Retrofit & Upgrades** - Modernizing existing panels\n\n' +
                    'Tell me about your panel requirements!';
                resolve(response);
                return;
            } else if (lowerMessage.match(/\b(5|five|training|course|learn|education)\b/)) {
                self.conversationState.serviceCategory = 'training';
                var response = '📚 **Excellent! On-Site Safety Training.**\n\n' +
                    'What does your team need to learn?\n\n' +
                    '**Training Programs (Delivered at Your Facility):**\n' +
                    '🤖 **Automation Safety** - Robot safety, cobot integration\n' +
                    '⚡ **Electrical Safety** - IEC 60204-1, protective systems\n' +
                    '🏗️ **Panel Building Safety** - IEC 61439, testing procedures\n' +
                    '⚠️ **Risk Assessment** - ISO 12100 methodology\n' +
                    '🛡️ **Machine Safety** - Guards, interlocks, emergency systems\n\n' +
                    'All training includes practical exercises and certification!\n\n' +
                    'Which training would benefit your team?';
                resolve(response);
                return;
            } else if (lowerMessage.match(/\b(6|six|not sure|unsure|don\'t know|help me)\b/)) {
                var response = '💡 **No problem! Let me help you narrow it down.**\n\n' +
                    'Tell me about your situation:\n\n' +
                    '**Quick Questions:**\n' +
                    '• Do you have existing machinery that needs upgrading? 🔧\n' +
                    '• Are you planning a new production line or system? 🏭\n' +
                    '• Do you need safety compliance or CE marking? ✅\n' +
                    '• Looking for electrical drawings or designs? 📐\n' +
                    '• Need control panels manufactured? 🏗️\n' +
                    '• Want to train your team on safety? 📚\n\n' +
                    'Just describe your situation and I\'ll guide you to the right service!';
                resolve(response);
                return;
            }
        }

        // Industry-specific automation guidance
        if (self.conversationState.serviceCategory === 'automation') {
            if (lowerMessage.match(/\b(pharma|pharmaceutical|drug|medicine|gmp)\b/)) {
                self.conversationState.industry = 'pharmaceutical';
                var response = '🏥 **Pharmaceutical Automation - We\'ve got extensive experience!**\n\n' +
                    '**What we offer for pharma:**\n' +
                    '• **GMP Compliant Systems** - Validation protocols, audit trails\n' +
                    '• **Clean Room Automation** - Aseptic processing controls\n' +
                    '• **Batch Management** - Recipe control, electronic batch records\n' +
                    '• **21 CFR Part 11** - Electronic signature compliance\n' +
                    '• **Serialization** - Track & trace systems\n\n' +
                    '**✨ Recent Pharma Projects:**\n' +
                    '• Sterile filling line automation with full validation\n' +
                    '• Tablet packaging SCADA with batch genealogy\n' +
                    '• API reactor control with SIL-rated safety systems\n\n' +
                    '**🔗 Next Steps:**\n' +
                    '[View Automation Services →](automation.html)\n' +
                    '[Get Pharmaceutical Quote →](contact.html?dept=sales&service=automation&industry=pharmaceutical)\n\n' +
                    '**Ready to discuss your pharma automation project?** 🎯\n' +
                    'Click "Get Quote" above or call our sales team: [+353 (0) 52 7443258](tel:+353527443258)';
                resolve(response);
                return;
            } else if (lowerMessage.match(/\b(auto|automotive|car|vehicle|assembly)\b/)) {
                self.conversationState.industry = 'automotive';
                var response = '🚗 **Automotive Automation - High-speed, high-precision!**\n\n' +
                    '**Automotive Solutions:**\n' +
                    '• **Assembly Line Control** - Synchronized multi-station systems\n' +
                    '• **Robotic Welding** - Spot welding, arc welding automation\n' +
                    '• **Quality Control** - Vision systems, leak testing, torque monitoring\n' +
                    '• **Material Handling** - AGV integration, conveyor systems\n' +
                    '• **Paint Shop Automation** - Environmental controls, recipe management\n\n' +
                    '**✨ Automotive Projects:**\n' +
                    '• Engine assembly line with poka-yoke systems\n' +
                    '• Body shop robot cell programming (6-axis robots)\n' +
                    '• Final assembly MES integration\n\n' +
                    '**🔗 Next Steps:**\n' +
                    '[View Automation Portfolio →](automation.html)\n' +
                    '[Request Automotive Quote →](contact.html?dept=sales&service=automation&industry=automotive)\n\n' +
                    '**Let\'s automate your production line!** 🎯\n' +
                    'Click "Get Quote" or call: [+353 (0) 52 7443258](tel:+353527443258)';
                resolve(response);
                return;
            } else if (lowerMessage.match(/\b(food|beverage|drink|dairy|bakery|haccp)\b/)) {
                self.conversationState.industry = 'food';
                var response = '🍎 **Food & Beverage Automation - Hygienic & compliant!**\n\n' +
                    '**F&B Specializations:**\n' +
                    '• **Hygienic Design** - IP65/IP69K washdown systems\n' +
                    '• **HACCP Compliance** - Critical control point monitoring\n' +
                    '• **Batch Control** - Recipe management, ingredient tracking\n' +
                    '• **CIP/SIP Automation** - Cleaning & sterilization cycles\n' +
                    '• **Packaging Lines** - Filling, capping, labeling, case packing\n' +
                    '• **Temperature Control** - Pasteurization, fermentation\n\n' +
                    '**✨ F&B Projects:**\n' +
                    '• Dairy processing SCADA with CIP automation\n' +
                    '• Beverage filling line (12,000 bottles/hour)\n' +
                    '• Bakery oven control with recipe management\n\n' +
                    '**🔗 Next Steps:**\n' +
                    '[View F&B Solutions →](automation.html)\n' +
                    '[Get Food Safety Quote →](contact.html?dept=sales&service=automation&industry=food)\n\n' +
                    '**Ready to upgrade your food production?** 🎯\n' +
                    'Click "Get Quote" or call: [+353 (0) 52 7443258](tel:+353527443258)';
                resolve(response);
                return;
            }
        }

        // Safety service guidance with smart routing
        if (self.conversationState.serviceCategory === 'safety') {
            if (lowerMessage.match(/\b(new machine|ce mark|machinery directive|compliance)\b/)) {
                var contactLink = self.buildContactLink({dept: 'technical', service: 'safety', type: 'ce_marking'});
                var response = '✅ **New Machine CE Marking & Compliance**\n\n' +
                    '**Our CE Marking Process:**\n' +
                    '1️⃣ **Risk Assessment** - ISO 12100 hazard identification\n' +
                    '2️⃣ **Safety Design** - Guards, interlocks, emergency stops\n' +
                    '3️⃣ **Documentation** - Technical file, DoC, user manual\n' +
                    '4️⃣ **Testing & Validation** - Functional safety verification\n' +
                    '5️⃣ **CE Declaration** - Full compliance certification\n\n' +
                    '**Standards We Work With:**\n' +
                    '• Machinery Directive 2006/42/EC\n' +
                    '• ISO 13849 (Safety-related parts of control systems)\n' +
                    '• IEC 62061 (Functional safety of electrical systems)\n' +
                    '• ISO 12100 (Risk assessment)\n\n' +
                    '**🔗 Get CE Marking:**\n' +
                    '[Safety Services Details →](safety.html)\n' +
                    '[Request CE Marking Quote →](' + contactLink + ')\n\n' +
                    '**📞 Contact Technical Team:**\n' +
                    '[Call: +353 (0) 52 7443258](tel:+353527443258) | [Email: info@rcltd.ie](mailto:info@rcltd.ie)\n\n' +
                    'Ready to get your machine CE marked? Click "Request Quote" above!';
                resolve(response);
                return;
            } else if (lowerMessage.match(/\b(audit|existing|assess|upgrade|retrofit)\b/)) {
                var contactLink = self.buildContactLink({dept: 'technical', service: 'safety', type: 'audit'});
                var response = '⚠️ **Safety Audit & Existing Machine Assessment**\n\n' +
                    '**Our Safety Audit Process:**\n' +
                    '1️⃣ **Site Survey** - Physical inspection of machinery\n' +
                    '2️⃣ **Gap Analysis** - Compare against current standards\n' +
                    '3️⃣ **Risk Assessment** - Identify hazards & required measures\n' +
                    '4️⃣ **Upgrade Plan** - Prioritized recommendations with costs\n' +
                    '5️⃣ **Implementation** - Safety system upgrades & installation\n\n' +
                    '**Common Upgrades:**\n' +
                    '• Safety light curtains & scanners\n' +
                    '• Interlocking guard systems\n' +
                    '• Emergency stop circuits (Category 0, 1)\n' +
                    '• Two-hand control stations\n' +
                    '• Safety PLC integration (Siemens F-CPU, AB GuardLogix)\n\n' +
                    '**🔗 Book Safety Audit:**\n' +
                    '[View Safety Services →](safety.html)\n' +
                    '[Request Safety Audit →](' + contactLink + ')\n\n' +
                    '**📞 Contact Technical Team:**\n' +
                    '[Call: +353 (0) 52 7443258](tel:+353527443258) | [Email: info@rcltd.ie](mailto:info@rcltd.ie)\n\n' +
                    'Get your machines compliant today! Click "Request Audit" above!';
                resolve(response);
                return;
            }
        }

        // Design service guidance with smart routing
        if (self.conversationState.serviceCategory === 'design') {
            if (lowerMessage.match(/\b(control|motor|mcc|power|instrumentation|hazardous|atex)\b/)) {
                var contactLink = self.buildContactLink({dept: 'technical', service: 'design'});
                var response = '⚡ **Professional Electrical Design Services**\n\n' +
                    '**Design Capabilities:**\n' +
                    '• **Control System Design** - Complete control architecture\n' +
                    '• **Power Distribution** - Load calculations, cable sizing\n' +
                    '• **Motor Control Centers** - MCC design & specifications\n' +
                    '• **Instrumentation Design** - Field devices, control loops\n' +
                    '• **Hazardous Area Design** - ATEX/IECEx compliance\n\n' +
                    '**Design Standards:**\n' +
                    '• IEC 60204-1 (Electrical equipment of machines)\n' +
                    '• IEC 61439 (Low-voltage switchgear assemblies)\n' +
                    '• IEC 60364 (Electrical installations)\n' +
                    '• EN 60204 (Safety of machinery electrical equipment)\n\n' +
                    '**Software & Tools:**\n' +
                    '• E3.Series, AutoCAD Electrical\n' +
                    '• EPLAN Electric P8\n' +
                    '• DIgSILENT PowerFactory\n\n' +
                    '**🔗 Get Design Services:**\n' +
                    '[View Design Portfolio →](design.html)\n' +
                    '[Request Design Quote →](' + contactLink + ')\n\n' +
                    '**📞 Contact Engineering Team:**\n' +
                    '[Call: +353 (0) 52 7443258](tel:+353527443258) | [Email: info@rcltd.ie](mailto:info@rcltd.ie)\n\n' +
                    'Ready to start your design project? Click "Request Quote" above!';
                resolve(response);
                return;
            }
        }

        // Panel building guidance with smart routing
        if (self.conversationState.serviceCategory === 'panel') {
            if (lowerMessage.match(/\b(control|mcc|distribution|instrumentation|retrofit)\b/)) {
                var contactLink = self.buildContactLink({dept: 'sales', service: 'panel'});
                var response = '🏗️ **Custom Panel Building & Manufacturing**\n\n' +
                    '**Panel Types:**\n' +
                    '• **Control Panels** - Motor control, process control\n' +
                    '• **Motor Control Centers (MCC)** - To IEC 61439 standard\n' +
                    '• **Distribution Panels** - Power distribution, switchgear\n' +
                    '• **Instrumentation Panels** - Field junction, marshalling\n' +
                    '• **Retrofit & Upgrades** - Modernizing existing panels\n\n' +
                    '**Manufacturing Standards:**\n' +
                    '• IEC 61439 (Switchgear and controlgear assemblies)\n' +
                    '• CE Marking - Full compliance and documentation\n' +
                    '• Quality Control - Rigorous testing at every stage\n\n' +
                    '**What We Deliver:**\n' +
                    '• Professional wiring and labeling\n' +
                    '• Comprehensive testing reports (FAT/SAT)\n' +
                    '• Installation and commissioning support\n' +
                    '• 12-month warranty on all work\n\n' +
                    '**🔗 Get Panel Quote:**\n' +
                    '[View Panel Gallery →](panel.html)\n' +
                    '[Request Panel Quote →](' + contactLink + ')\n\n' +
                    '**📞 Contact Sales Team:**\n' +
                    '[Call: +353 (0) 52 7443258](tel:+353527443258) | [Email: info@rcltd.ie](mailto:info@rcltd.ie)\n\n' +
                    'Ready to build your control panel? Click "Request Quote" above!';
                resolve(response);
                return;
            }
        }

        // Training guidance with smart routing
        if (self.conversationState.serviceCategory === 'training') {
            if (lowerMessage.match(/\b(automation|electrical|panel|risk|machine)\b/)) {
                var contactLink = self.buildContactLink({dept: 'sales', service: 'training'});
                var response = '📚 **On-Site Safety Training Programs**\n\n' +
                    '**Training Modules (Delivered at Your Facility):**\n' +
                    '• **Automation Safety** - Robot safety, cobot integration\n' +
                    '• **Electrical Safety** - IEC 60204-1, protective systems\n' +
                    '• **Panel Building Safety** - IEC 61439, testing procedures\n' +
                    '• **Risk Assessment** - ISO 12100 methodology\n' +
                    '• **Machine Safety** - Guards, interlocks, emergency systems\n\n' +
                    '**Training Benefits:**\n' +
                    '• Practical hands-on exercises\n' +
                    '• Industry certification\n' +
                    '• Delivered on-site at your facility\n' +
                    '• Customized to your equipment\n' +
                    '• Expert instructors with real-world experience\n\n' +
                    '**🔗 Book Training:**\n' +
                    '[Request Training Quote →](' + contactLink + ')\n\n' +
                    '**📞 Contact Training Coordinator:**\n' +
                    '[Call: +353 (0) 52 7443258](tel:+353527443258) | [Email: info@rcltd.ie](mailto:info@rcltd.ie)\n\n' +
                    'Ready to train your team? Click "Request Quote" above!';
                resolve(response);
                return;
            }
        }

        // General automation service inquiry (fallback if not in discovery mode)
        if (lowerMessage.includes('automation') && (lowerMessage.includes('service') || lowerMessage.includes('tell me about') || lowerMessage.includes('what'))) {
            var response = '**🔧 Industrial Automation Services - Robotics & Control Ltd**\n\n' +
                'We specialize in advanced automation solutions across **pharmaceutical, industrial, automotive, and food & beverage** sectors:\n\n' +
                '**🏭 Our Automation Expertise:**\n' +
                '• **PLC Programming & Integration** - Siemens, Allen-Bradley, Schneider Electric\n' +
                '• **SCADA Systems** - Ignition, WinCC, FactoryTalk View\n' +
                '• **Industrial Networking** - Profinet, EtherNet/IP, Modbus TCP\n' +
                '• **Process Control** - Temperature, pressure, flow control systems\n' +
                '• **Robotics Integration** - Industrial & collaborative robots\n' +
                '• **Vision Systems** - Quality control and inspection automation\n\n' +
                '**💼 Recent Projects:**\n' +
                '• Pharmaceutical packaging line automation\n' +
                '• Automotive assembly line control systems\n' +
                '• Food processing SCADA implementation\n\n' +
                '**🔗 Learn More:**\n' +
                '[View Automation Services →](automation.html)\n' +
                '[Get Free Quote →](contact.html?dept=sales&service=automation)\n\n' +
                'Which industry are you in? I can provide more specific examples for your sector!';
            resolve(response);
        } else if (lowerMessage.includes('safety') && (lowerMessage.includes('service') || lowerMessage.includes('what') || lowerMessage.includes('provide'))) {
            var response = '**🛡️ Machine Safety Services - Keeping Your Operations Compliant**\n\n' +
                'R&C Ltd provides comprehensive safety solutions to protect your workforce and ensure regulatory compliance:\n\n' +
                '**🔍 Safety Assessment & Design:**\n' +
                '• **Risk Assessment** - ISO 12100, ISO 13849 compliance\n' +
                '• **Safety System Design** - Safety PLCs, light curtains, emergency stops\n' +
                '• **Machine Safeguarding** - Guards, interlocks, two-hand controls\n' +
                '• **Functional Safety** - SIL rating and validation\n' +
                '• **Robot Safety** - Collaborative and industrial robot safety systems\n\n' +
                '**📋 Compliance Services:**\n' +
                '• **CE Marking** - Machinery Directive 2006/42/EC\n' +
                '• **Safety Audits** - Existing machine assessments\n' +
                '• **Documentation** - Safety manuals, risk assessments\n' +
                '• **Training** - Safety awareness for operators and engineers\n\n' +
                '**✅ Industries We Serve:**\n' +
                '• Pharmaceutical (GMP compliance)\n' +
                '• Automotive (safety-critical systems)\n' +
                '• Food & Beverage (hygiene + safety)\n\n' +
                '**🔗 Take Action:**\n' +
                '[Safety Services Details →](safety.html)\n' +
                '[Request Safety Audit →](contact.html)\n\n' +
                'Do you have specific safety challenges or compliance requirements?';
            resolve(response);

        } else if (lowerMessage.includes('electrical') && (lowerMessage.includes('design') || lowerMessage.includes('tell me') || lowerMessage.includes('about'))) {
            var response = '**⚡ Professional Electrical Design Services**\n\n' +
                'Our experienced engineers deliver robust electrical solutions using industry-leading design tools:\n\n' +
                '**🎯 Design Capabilities:**\n' +
                '• **Control System Design** - Motor control, power distribution\n' +
                '• **Schematic Design** - E3.Series, AutoCAD Electrical\n' +
                '• **Power Systems** - Load calculations, cable sizing\n' +
                '• **Motor Control Centers** - Custom MCC design and specifications\n' +
                '• **Instrumentation Design** - Field devices, control loops\n' +
                '• **Hazardous Area Design** - ATEX/IECEx classifications\n\n' +
                '**📐 Design Standards:**\n' +
                '• **IEC 60204-1** - Electrical equipment of machines\n' +
                '• **IEC 61439** - Low-voltage switchgear assemblies\n' +
                '• **IEC 60364** - Electrical installations of buildings\n' +
                '• **EN 60204** - Safety of machinery electrical equipment\n\n' +
                '**🏆 Our Track Record:**\n' +
                '• 15+ years of design experience\n' +
                '• 200+ successful projects delivered\n' +
                '• Full compliance with Irish and EU regulations\n\n' +
                '**🔗 Get Started:**\n' +
                '[Electrical Design Portfolio →](design.html)\n' +
                '[Request Design Quote →](contact.html)\n\n' +
                'What type of electrical system are you planning?';
            resolve(response);
        } else if (lowerMessage.includes('panel') && (lowerMessage.includes('building') || lowerMessage.includes('about') || lowerMessage.includes('what'))) {
            var response = '**🏗️ Custom Panel Building & Manufacturing**\n\n' +
                'From design to delivery, we build professional control panels to the highest standards:\n\n' +
                '**🔧 Panel Building Services:**\n' +
                '• **Custom Control Panels** - Motor control, process control\n' +
                '• **MCC Manufacturing** - Motor Control Centers to IEC 61439\n' +
                '• **Switchgear Assembly** - Low voltage distribution panels\n' +
                '• **Instrumentation Panels** - Field junction boxes, marshalling\n' +
                '• **Retrofit & Upgrades** - Modernizing existing panels\n' +
                '• **Testing & Commissioning** - Full FAT and SAT procedures\n\n' +
                '**🏭 Manufacturing Standards:**\n' +
                '• **IEC 61439** - Switchgear and controlgear assemblies\n' +
                '• **CE Marking** - Full compliance and documentation\n' +
                '• **Quality Control** - Rigorous testing at every stage\n' +
                '• **Documentation** - Complete as-built drawings and manuals\n\n' +
                '**📦 What We Deliver:**\n' +
                '• Professional wiring and labeling\n' +
                '• Comprehensive testing reports\n' +
                '• Installation and commissioning support\n' +
                '• 12-month warranty on all work\n\n' +
                '**🔗 Next Steps:**\n' +
                '[Panel Building Gallery →](panel.html)\n' +
                '[Request Panel Quote →](contact.html)\n\n' +
                'What size and type of panel do you need?';
            resolve(response);
        } else if (lowerMessage.includes('service') || lowerMessage.includes('what do you do')) {
            var response = '**🏢 Robotics & Control Ltd - Your Automation Partner Since 2010**\n\n' +
                'We provide comprehensive industrial solutions across Ireland and internationally:\n\n' +
                '**🔧 Core Services:**\n' +
                '• **[Automation Services](automation.html)** - PLC, SCADA, robotics integration\n' +
                '• **[Safety Solutions](safety.html)** - Risk assessment, compliance, CE marking\n' +
                '• **[Electrical Design](design.html)** - Control systems, power distribution\n' +
                '• **[Panel Building](panel.html)** - Custom control panels, MCCs\n' +
                '• **[On-Site Safety Training](contact.html)** - Professional on-site courses, certification\n\n' +
                '**🏭 Industries We Serve:**\n' +
                '• **Pharmaceutical** - GMP compliance, validation protocols\n' +
                '• **Automotive** - Assembly lines, quality control systems\n' +
                '• **Food & Beverage** - Process control, hygiene standards\n' +
                '• **General Industry** - Manufacturing automation solutions\n\n' +
                '**📞 Ready to Start?**\n' +
                '[View All Services →](services.html)\n' +
                '[Get Free Quote →](contact.html)\n' +
                '[Call Now: +353 (0) 52 7443258](tel:+353527443258)\n\n' +
                'Which service interests you most?';
            resolve(response);
        } else if (lowerMessage.includes('training') || lowerMessage.includes('course') || lowerMessage.includes('learn')) {
            var response = '**📚 Professional On-Site Safety Training Programs**\n\n' +
                'R&C Ltd offers comprehensive on-site safety training delivered at your facility to keep your team compliant and safe:\n\n' +
                '**🎓 Available On-Site Training Modules:**\n' +
                '• **Automation Safety** - Industrial robot safety, cobot integration (delivered at your facility)\n' +
                '• **Electrical Design Safety** - IEC 60204-1, protective systems (delivered at your facility)\n' +
                '• **Panel Building Safety** - IEC 61439, testing procedures (delivered at your facility)\n' +
                '• **Risk Assessment** - ISO 12100 methodology and practice\n' +
                '• **Machine Safety** - Guards, interlocks, emergency systems\n\n' +
                '**💡 Training Features:**\n' +
                '• **Professional On-Site Delivery** - Expert-led training at your facility\n' +
                '• **Real Industry Scenarios** - Practical examples from our projects\n' +
                '• **Progress Tracking** - Monitor your team\'s development\n' +
                '• **90% Pass Requirement** - Ensures thorough understanding\n' +
                '• **Industry Recognition** - Certificates valued by employers\n\n' +
                '**🏆 Why Choose Our Training:**\n' +
                '• Developed by practicing engineers with 15+ years experience\n' +
                '• Based on real-world projects and challenges\n' +
                '• Covers latest standards and best practices\n' +
                '• Flexible on-site format fits your facility schedule\n\n' +
                '**🔗 Get Started:**\n' +
                '[Request Training Quote →](contact.html)\n' +
                '[Contact for Group Training →](contact.html)\n\n' +
                'Which training module interests your team most?';
            resolve(response);
        } else if (lowerMessage.includes('quote') || lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('contact')) {
            var response = '**💬 Get Your Free Quote Today!**\n\n' +

                'R&C Ltd provides competitive quotes with detailed project breakdowns:\n\n' +
                '**📞 Multiple Ways to Connect:**\n' +
                '• **Call Direct:** [+353 (0) 52 7443258](tel:+353527443258) - *Speak with an engineer*\n' +
                '• **Email:** [info@rcltd.ie](mailto:info@rcltd.ie) - *Send project details*\n' +
                '• **Online Form:** [Quick Quote Request →](contact.html) - *24hr response*\n' +
                '• **Site Visit:** Free consultation at your facility\n\n' +
                '**⚡ Fast Quote Process:**\n' +
                '1. **Tell us your needs** - Service type, timeline, location\n' +
                '2. **We assess** - Our engineers review requirements\n' +
                '3. **You receive** - Detailed quote within 24-48 hours\n' +
                '4. **We deliver** - Professional implementation\n\n' +
                '**💼 For Best Quote, Include:**\n' +
                '• Type of project (automation, safety, electrical, panels)\n' +
                '• Timeline and budget range\n' +
                '• Site location and access details\n' +
                '• Existing equipment and standards\n' +
                '• Any specific compliance requirements\n\n' +
                '**🏆 Why Choose R&C Ltd:**\n' +
                '• 15+ years experience\n' +
                '• Competitive pricing\n' +
                '• No hidden costs\n' +
                '• Full project support\n\n' +
                '**🔗 Get Started:**\n' +
                '[Request Quote Now →](contact.html)\n\n' +
                'What type of project can we quote for you?';
            resolve(response);
        } else if (lowerMessage.includes('pharmaceutical') || lowerMessage.includes('pharma') || lowerMessage.includes('gmp')) {
            var response = '**💊 Pharmaceutical Industry Expertise**\n\n' +
                'R&C Ltd specializes in pharmaceutical automation with deep GMP compliance knowledge:\n\n' +
                '**🏥 Pharmaceutical Services:**\n' +
                '• **GMP Compliant Systems** - 21 CFR Part 11, GAMP 5 guidelines\n' +
                '• **Process Validation** - IQ/OQ/PQ documentation and execution\n' +
                '• **Batch Control Systems** - Recipe management, electronic batch records\n' +
                '• **Clean Room Automation** - Classified area equipment and controls\n' +
                '• **Track & Trace Systems** - Serialization and traceability solutions\n' +
                '• **Quality Control Automation** - Automated testing and inspection\n\n' +
                '**✅ Compliance Standards:**\n' +
                '• FDA 21 CFR Part 11 (Electronic Records)\n' +
                '• EU GMP Guidelines\n' +
                '• ISPE GAMP 5 (Good Automated Manufacturing Practice)\n' +
                '• ISO 14971 (Risk Management)\n\n' +
                '**🔬 Recent Pharma Projects:**\n' +
                '• Tablet packaging line automation with batch tracking\n' +
                '• Clean room HVAC control system with 21 CFR Part 11 compliance\n' +
                '• API manufacturing process control system\n\n' +
                '**🔗 Learn More:**\n' +
                '[Pharmaceutical Solutions →](automation.html)\n' +
                '[Schedule GMP Consultation →](contact.html)\n\n' +
                'What pharmaceutical process are you looking to automate?';
            resolve(response);
        } else if (lowerMessage.includes('automotive') || lowerMessage.includes('assembly') || lowerMessage.includes('manufacturing')) {
            var response = '**🚗 Automotive Manufacturing Solutions**\n\n' +
                'R&C Ltd delivers robust automation for automotive production environments:\n\n' +
                '**⚙️ Automotive Expertise:**\n' +
                '• **Assembly Line Control** - Conveyor systems, station control, tracking\n' +
                '• **Quality Control Systems** - Vision inspection, torque monitoring\n' +
                '• **Robot Integration** - Welding, painting, material handling robots\n' +
                '• **MES Integration** - Manufacturing Execution System connectivity\n' +
                '• **Traceability Systems** - Part tracking, genealogy, quality data\n' +
                '• **Lean Manufacturing** - Cycle time optimization, waste reduction\n\n' +
                '**🏭 System Capabilities:**\n' +
                '• High-speed production lines (up to 60 units/hour)\n' +
                '• Multi-station synchronization\n' +
                '• Flexible changeover for different models\n' +
                '• Real-time production monitoring\n' +
                '• Predictive maintenance systems\n\n' +
                '**📊 Proven Results:**\n' +
                '• 15% increase in OEE (Overall Equipment Effectiveness)\n' +
                '• 50% reduction in changeover time\n' +
                '• Zero defect quality systems\n\n' +
                '**🔗 Next Steps:**\n' +
                '[Automotive Case Studies →](automation.html)\n' +
                '[Request Plant Visit →](contact.html)\n\n' +
                'What automotive processes need automation in your facility?';
            resolve(response);
        } else if (lowerMessage.includes('food') || lowerMessage.includes('beverage') || lowerMessage.includes('haccp')) {
            var response = '**🍎 Food & Beverage Industry Solutions**\n\n' +
                'R&C Ltd provides hygienic design automation for food and beverage production:\n\n' +
                '**🥤 F&B Specializations:**\n' +
                '• **Hygienic Design** - IP65/IP69K rated equipment, washdown systems\n' +
                '• **HACCP Compliance** - Critical Control Point monitoring and control\n' +
                '• **Batch Control** - Recipe management, ingredient tracking\n' +
                '• **CIP/SIP Systems** - Cleaning-in-Place, Sterilization-in-Place automation\n' +
                '• **Temperature Control** - Pasteurization, fermentation, cold chain\n' +
                '• **Packaging Lines** - Filling, capping, labeling, case packing\n\n' +
                '**🛡️ Food Safety Standards:**\n' +
                '• HACCP (Hazard Analysis Critical Control Points)\n' +
                '• BRC Global Standard\n' +
                '• SQF (Safe Quality Food)\n' +
                '• FDA Food Safety Modernization Act\n' +
                '• EU Food Hygiene Regulations\n\n' +
                '**🏆 F&B Project Examples:**\n' +
                '• Dairy processing SCADA with CIP automation\n' +
                '• Beverage filling line with track & trace\n' +
                '• Bakery oven control with recipe management\n\n' +
                '**🔗 Get Started:**\n' +
                '[Food Processing Solutions →](automation.html)\n' +
                '[Food Safety Consultation →](contact.html)\n\n' +
                'What food safety challenges can we help you solve?';
            resolve(response);
        } else if (lowerMessage.match(/\b(quote|pricing|price|cost|how much)\b/)) {
            var response = '💰 **Let\'s Get You a Quote!**\n\n' +
                'I can help you get pricing for any of our services. To provide an accurate quote, I need to understand your needs:\n\n' +
                '**What service are you interested in?**\n\n' +
                '🔧 **Automation** - PLC programming, SCADA, robotics\n' +
                '   [Get Automation Quote →](contact.html?dept=sales&service=automation)\n\n' +
                '🛡️ **Safety** - CE marking, risk assessment, safety systems\n' +
                '   [Get Safety Quote →](contact.html?dept=technical&service=safety)\n\n' +
                '⚡ **Electrical Design** - Schematics, control system design\n' +
                '   [Get Design Quote →](contact.html?dept=technical&service=design)\n\n' +
                '🏗️ **Panel Building** - Control panels, MCCs, switchgear\n' +
                '   [Get Panel Quote →](contact.html?dept=sales&service=panel)\n\n' +
                '📚 **Training** - On-site safety training for your team\n' +
                '   [Get Training Quote →](contact.html?dept=sales&service=training)\n\n' +
                '**📞 Quick Quote:** Call our sales team directly at [+353 (0) 52 7443258](tel:+353527443258)\n\n' +
                'Click any link above to fill out a quick quote form, or tell me which service you need!';
            resolve(response);
        } else if (lowerMessage.match(/\b(store|shop|product|catalog|buy|purchase)\b/)) {
            var response = '🛒 **Industrial Automation Products & Solutions**\n\n' +
                'Welcome to our product catalog! We offer a comprehensive range of industrial automation components and solutions:\n\n' +
                '**🏭 Browse Our Product Categories:**\n' +
                '• **PLCs & Controllers** - Siemens, Allen-Bradley, Schneider Electric\n' +
                '• **HMI & SCADA** - Operator interfaces & visualization systems\n' +
                '• **Safety Components** - Light curtains, safety relays, e-stops\n' +
                '• **Sensors & Instrumentation** - Temperature, pressure, flow devices\n' +
                '• **Motor Controls** - VFDs, soft starters, contactors\n' +
                '• **Industrial Networking** - Switches, cables, communication modules\n\n' +
                '**🔗 Explore Products:**\n' +
                '[Visit Our Store →](store.html)\n' +
                '[Request Product Quote →](contact.html?dept=sales&service=products)\n\n' +
                '**💡 Need Help Choosing?**\n' +
                'Tell me about your application and I\'ll recommend the right products!\n\n' +
                '**📞 Sales Support:** [+353 (0) 52 7443258](tel:+353527443258)';
            resolve(response);
        } else if (lowerMessage.match(/\b(contact|reach|speak|talk|call|email)\b/) && lowerMessage.match(/\b(sales|technical|support|engineering)\b/)) {
            var dept = 'general';
            if (lowerMessage.includes('sales')) dept = 'sales';
            else if (lowerMessage.includes('technical') || lowerMessage.includes('engineering')) dept = 'technical';
            else if (lowerMessage.includes('support')) dept = 'support';
            
            var response = '📞 **Let Me Connect You with the Right Team!**\n\n';
            
            if (dept === 'sales') {
                response += '**💼 Sales Department:**\n' +
                    'Perfect for quotes, new projects, product purchases\n\n' +
                    '• **Phone:** [+353 (0) 52 7443258](tel:+353527443258)\n' +
                    '• **Email:** [info@rcltd.ie](mailto:info@rcltd.ie)\n' +
                    '• **Quote Form:** [Get Quote →](contact.html?dept=sales)\n\n' +
                    '⏰ **Available:** Mon-Fri, 9:00 AM - 5:30 PM IST';
            } else if (dept === 'technical') {
                response += '**🔧 Technical Department:**\n' +
                    'Perfect for engineering questions, design support, technical specs\n\n' +
                    '• **Phone:** [+353 (0) 52 7443258](tel:+353527443258)\n' +
                    '• **Email:** [info@rcltd.ie](mailto:info@rcltd.ie)\n' +
                    '• **Technical Form:** [Contact Engineering →](contact.html?dept=technical)\n\n' +
                    '⏰ **Available:** Mon-Fri, 9:00 AM - 5:30 PM IST';
            } else if (dept === 'support') {
                response += '**🛠️ Support Department:**\n' +
                    'Perfect for troubleshooting, maintenance, service requests\n\n' +
                    '• **Phone:** [+353 (0) 52 7443258](tel:+353527443258)\n' +
                    '• **Email:** [info@rcltd.ie](mailto:info@rcltd.ie)\n' +
                    '• **Support Form:** [Get Support →](contact.html?dept=support)\n\n' +
                    '⏰ **Available:** Mon-Fri, 9:00 AM - 5:30 PM IST\n' +
                    '⚡ **Emergency Support:** Available for critical systems';
            }
            
            response += '\n\nHow can we assist you today?';
            resolve(response);
        } else if (lowerMessage.includes('complaint') || lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('wrong') || lowerMessage.includes('error') || lowerMessage.includes('broken') || lowerMessage.includes('not working') || lowerMessage.includes('disappointed') || lowerMessage.includes('unsatisfied') || lowerMessage.includes('grievance') || lowerMessage.includes('dispute')) {
            var contactLink = self.buildContactLink({dept: 'support', service: 'support'});
            var response = '**🙏 We Sincerely Apologize**\n\n' +
                'I\'m truly sorry to hear that you\'re experiencing issues with our service. Your concerns are our **highest priority** and we take all feedback very seriously.\n\n' +
                '**🚨 Immediate Action Required:**\n' +
                'Please contact us directly so we can resolve this matter urgently:\n\n' +
                '**📞 Priority Contact Methods:**\n' +
                '• **Call Direct:** [+353 (0) 52 7443258](tel:+353527443258) - *Speak with management*\n' +
                '• **Email:** [info@rcltd.ie](mailto:info@rcltd.ie) - *Mark as URGENT*\n' +
                '• **Support Form:** [Priority Support →](' + contactLink + ') - *24hr response guaranteed*\n\n' +
                '**🔧 What We\'ll Do:**\n' +
                '• **Listen** - Understand your specific concerns\n' +
                '• **Investigate** - Thoroughly review what went wrong\n' +
                '• **Resolve** - Take immediate corrective action\n' +
                '• **Follow-up** - Ensure your complete satisfaction\n\n' +
                '**💯 Our Promise:**\n' +
                '• Your issue will be escalated to senior management\n' +
                '• We will respond within 4 business hours\n' +
                '• We will work tirelessly to make this right\n' +
                '• Your satisfaction is our ultimate goal\n\n' +
                'At R&C Ltd, we stand behind our work 100%. Please don\'t hesitate to reach out - we value your business and want to earn back your trust.\n\n' +
                '**🔗 Contact Support Now:**\n' +
                '[Submit Support Request →](' + contactLink + ') | [Call: +353 (0) 52 7443258](tel:+353527443258)';
            resolve(response);
        } else if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('address') || lowerMessage.includes('about') || lowerMessage.includes('company')) {
            var response = '**🏢 About Robotics & Control Ltd**\n\n' +
                '**📍 Our Location:**\n' +
                'Unit 2 Cahir Business Park\n' +
                'Cahir, Co. Tipperary\n' +
                'Ireland, E21 C564\n\n' +
                '**🎯 Company Overview:**\n' +
                '• **Founded:** 2010 (15+ years of excellence)\n' +
                '• **Team:** Experienced engineers and technicians\n' +
                '• **Scope:** Ireland and international projects\n' +
                '• **Certifications:** Professional engineering memberships\n\n' +
                '**🏆 Why Choose R&C Ltd:**\n' +
                '• **Proven Track Record** - 200+ successful projects delivered\n' +
                '• **Industry Expertise** - Pharmaceutical, automotive, food & beverage\n' +
                '• **Full Service** - Design through commissioning and support\n' +
                '• **Compliance Focus** - CE marking, safety standards, industry regulations\n' +
                '• **Local Support** - Irish company with international reach\n\n' +
                '**🤝 Professional Memberships:**\n' +
                '• Engineers Ireland\n' +
                '• Engineering the South East\n' +
                '• TÜV Certified Engineers\n\n' +
                '**📞 Contact Us:**\n' +
                '[Call: +353 (0) 52 7443258](tel:+353527443258)\n' +
                '[Email: info@rcltd.ie](mailto:info@rcltd.ie)\n' +
                '[Visit Our Office →](contact.html)\n\n' +
                'Would you like to schedule a site visit or consultation?';
            resolve(response);
        } else {
            // Default helpful response with smart suggestions
            // Note: message is not directly included to prevent XSS via bot message reflection
            var response = 'I understand your question. Let me help you find the right information!\n\n' +
                '**🔍 Popular Topics:**\n' +
                '• **[🔧 Automation Services](automation.html)** - PLC, SCADA, robotics\n' +
                '• **[🛡️ Safety Solutions](safety.html)** - Risk assessment, compliance\n' +
                '• **[⚡ Electrical Design](design.html)** - Control systems, power distribution\n' +
                '• **[🏗️ Panel Building](panel.html)** - Custom control panels, MCCs\n' +
                '• **[📚 On-Site Safety Training](contact.html)** - Professional on-site courses\n\n' +
                '**🏭 Industry Solutions:**\n' +
                '• **Pharmaceutical** - GMP compliance, process validation\n' +
                '• **Automotive** - Assembly lines, quality control\n' +
                '• **Food & Beverage** - Hygienic design, HACCP compliance\n\n' +
                '**💬 Quick Actions:**\n' +
                '[Get Free Quote →](contact.html) | [Call Now: +353 (0) 52 7443258](tel:+353527443258)\n\n' +
                'Try the quick action buttons below or ask me about specific services, industries, or projects!';
            resolve(response);
        }
        
        }, 1000 + Math.random() * 1000);
    });
};

ControllerBot.prototype.renderMessage = function(message) {
        var messagesContainer = document.getElementById('chatbot-messages');
        
        var messageElement = document.createElement('div');
        messageElement.className = 'message ' + message.type + '-message';
        
        var avatar = message.type === 'bot' ? 
            '<img src="images/logo.png" alt="Controller Bot" class="message-avatar">' : 
            '<div class="user-avatar">👤</div>';
        
        var time = message.timestamp.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        // Only apply formatting to bot messages for security
        var formattedContent = message.type === 'bot' ? 
            this.formatMessage(message.content) : 
            this.escapeHtml(message.content);

        // Create avatar element safely
        if (message.type === 'bot') {
            var avatarImg = document.createElement('img');
            avatarImg.src = 'images/logo.png';
            avatarImg.alt = 'Controller Bot';
            avatarImg.className = 'message-avatar';
            messageElement.appendChild(avatarImg);
        } else {
            var avatarDiv = document.createElement('div');
            avatarDiv.className = 'user-avatar';
            avatarDiv.textContent = '👤';
            messageElement.appendChild(avatarDiv);
        }

        // Create message content container
        var messageContentDiv = document.createElement('div');
        messageContentDiv.className = 'message-content';

        // Create message text element
        var messageTextDiv = document.createElement('div');
        messageTextDiv.className = 'message-text';
        
        // For bot messages, we can safely use innerHTML since content is controlled and pre-escaped
        // For user messages, use textContent to prevent any HTML
        if (message.type === 'bot') {
            messageTextDiv.innerHTML = formattedContent; // Safe: content is from controlled sources and pre-escaped
        } else {
            messageTextDiv.textContent = message.content; // Safe: direct text content
        }

        // Create timestamp element
        var timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = time;

        // Assemble the structure
        messageContentDiv.appendChild(messageTextDiv);
        messageContentDiv.appendChild(timeDiv);
        messageElement.appendChild(messageContentDiv);

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

ControllerBot.prototype.formatMessage = function(content) {
        // Convert markdown-like formatting to HTML with navigation links (bot messages only)
        // First escape any existing HTML to prevent injection
        return this.escapeHtml(content)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, text, url) {
                // Sanitize URLs - strict whitelist approach for safe schemes only (RFC 3986 compliant)
                if (url.match(/^https?:\/\/[a-zA-Z0-9\-._~:/?#\[\]@!$&'()*+,;=%]+$/) || 
                    url.match(/^tel:\+?[0-9\s\-()]+$/) ||
                    url.match(/^mailto:[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}(?:\?[a-zA-Z0-9=&_%+\-]+)?$/) ||
                    url.match(/^[a-zA-Z0-9][a-zA-Z0-9_\/-]*\.html(?:\?[a-zA-Z0-9=&_%\-]+)?$/)) {
                    // Text is already escaped above, URL is validated
                    return '<a href="' + url + '" target="_self" rel="noopener" class="chat-link">' + text + '</a>';
                }
                return text; // Strip unsafe links, keep text
            });
            // Note: \n already converted to <br> by escapeHtml
    }

ControllerBot.prototype.escapeHtml = function(text) {
        // Escape HTML in user messages to prevent XSS
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }

    ControllerBot.prototype.sanitizeInput = function(input) {
        // Enhanced input sanitization for security - DOM-based approach
        if (!input || typeof input !== 'string') {
            return '';
        }
        
        // First pass: use DOM to parse and sanitize
        var temp = document.createElement('div');
        temp.textContent = input; // textContent automatically escapes HTML
        var sanitized = temp.innerHTML; // Get the escaped version
        
        // Second pass: remove any dangerous patterns that might have been encoded
        var dangerousPatterns = [
            /&lt;script/gi,
            /&lt;iframe/gi,
            /&lt;object/gi,
            /&lt;embed/gi
        ];
        
        for (var i = 0; i < dangerousPatterns.length; i++) {
            sanitized = sanitized.replace(dangerousPatterns[i], '');
        }
        
        // Remove dangerous protocols (case-insensitive)
        sanitized = sanitized.replace(/javascript\s*:/gi, '');
        sanitized = sanitized.replace(/data\s*:/gi, '');
        sanitized = sanitized.replace(/vbscript\s*:/gi, '');
        
        // Clean up whitespace
        sanitized = sanitized.replace(/\s+/g, ' ').trim();
            
        // Check for excessive length (could be an attack)
        if (sanitized.length > 500) {
            sanitized = sanitized.substring(0, 500);
        }
        
        // Basic check for obvious injection attempts
        var suspiciousPatterns = [
            /<\/?\w+[^>]*>/i,  // HTML tags
            /\beval\s*\(/i,     // eval functions
            /\balert\s*\(/i,    // alert functions
            /\bdocument\./i,    // document access
            /\bwindow\./i       // window access
        ];
        
        for (var i = 0; i < suspiciousPatterns.length; i++) {
            if (suspiciousPatterns[i].test(sanitized)) {
                // Log potential attack (in production, this would be logged server-side)
                console.warn('Potential security threat detected in user input');
                // Return empty string to block the input
                return '';
            }
        }
        
        return sanitized;
    }

ControllerBot.prototype.showTypingIndicator = function() {
        this.isTyping = true;
        var messagesContainer = document.getElementById('chatbot-messages');
        
        var typingElement = document.createElement('div');
        typingElement.className = 'message bot-message typing-indicator';
        typingElement.id = 'typing-indicator';
        
        typingElement.innerHTML = '<img src="images/logo.png" alt="Controller Bot" class="message-avatar">' +
            '<div class="message-content">' +
                '<div class="typing-dots">' +
                    '<span></span>' +
                    '<span></span>' +
                    '<span></span>' +
                '</div>' +
            '</div>';

        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

ControllerBot.prototype.hideTypingIndicator = function() {
        this.isTyping = false;
        var typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

// Initialize Controller Bot when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.controllerBot = new ControllerBot();
});
// Controller Bot - AI Chatbot for Robotics & Control Ltd
// Using OpenAI integration - referenced from blueprint:javascript_openai
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

function ControllerBot() {
    this.isOpen = false;
    this.messages = [];
    this.isTyping = false;
    this.init();
}

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
        '                <img src="images/logo.png" alt="Controller Bot" class="chatbot-icon">',
        '                <div class="chatbot-pulse"></div>',
        '            </div>',
        '',
        '            <!-- Chatbot Container -->',
        '            <div id="chatbot-container" class="chatbot-container">',
        '                <div class="chatbot-header">',
        '                    <div class="chatbot-header-info">',
        '                        <img src="images/logo.png" alt="Controller Bot" class="chatbot-avatar">',
        '                        <div class="chatbot-header-text">',
        '                            <h3>Controller Bot</h3>',
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
        '                <div class="chatbot-messages" id="chatbot-messages">',
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

    // Focus input after animation
    setTimeout(function() {
        document.getElementById('chatbot-input').focus();
    }, 300);
};

ControllerBot.prototype.closeChat = function() {
    var container = document.getElementById('chatbot-container');
    var toggle = document.getElementById('chatbot-toggle');
    
    container.classList.remove('open');
    toggle.classList.remove('hidden');
    this.isOpen = false;
};

ControllerBot.prototype.addWelcomeMessage = function() {
    var welcomeMessage = {
        type: 'bot',
        content: 'Hello! I\'m Controller Bot 🤖, your virtual assistant from Robotics & Control Ltd. ' +
                '\n\nI\'m here to help you with:\n' +
                '• **Automation Solutions** - Industrial control systems\n' +
                '• **Safety Services** - Machine safety and compliance\n' +
                '• **Electrical Design** - Professional engineering\n' +
                '• **Panel Building** - Custom control panels\n' +
                '• **Safety Training** - Interactive courses and certification\n' +
                '\nHow can I assist you today?',
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

// Local knowledge base - replace with OpenAI API calls in production
ControllerBot.prototype.getLocalResponse = function(message) {
    var lowerMessage = message.toLowerCase();
    
    // Simulate API delay
    return new Promise(function(resolve, reject) {
        setTimeout(function() {

        // Automation services
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
                '[Get Free Consultation →](contact.html)\n\n' +
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
                // Sanitize URLs - only allow safe schemes with proper full URL patterns
                if (url.match(/^(https?:\/\/[^\s"'<>]+|tel:[0-9+()\-\s]+|mailto:[^\s"'<>]+|[A-Za-z0-9._\/-]+\.html)$/)) {
                    // Text is already escaped above, URL is validated
                    return '<a href="' + url + '" target="_self" rel="noopener" class="chat-link">' + text + '</a>';
                }
                return text; // Strip unsafe links, keep text
            })
            .replace(/•/g, '•');
            // Note: \n already converted to <br> by escapeHtml
    }

ControllerBot.prototype.escapeHtml = function(text) {
        // Escape HTML in user messages to prevent XSS
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
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
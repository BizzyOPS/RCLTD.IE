// Controller Bot - AI Chatbot for Robotics & Control Ltd
// Using OpenAI integration - referenced from blueprint:javascript_openai
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

class ControllerBot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        this.init();
    }

    init() {
        this.createChatInterface();
        this.bindEvents();
        this.addWelcomeMessage();
    }

    createChatInterface() {
        // Create chatbot HTML structure
        const chatbotHTML = `
            <!-- Chatbot Toggle Button -->
            <div id="chatbot-toggle" class="chatbot-toggle" title="Chat with Controller Bot">
                <img src="images/logo.png" alt="Controller Bot" class="chatbot-icon">
                <div class="chatbot-pulse"></div>
            </div>

            <!-- Chatbot Container -->
            <div id="chatbot-container" class="chatbot-container">
                <div class="chatbot-header">
                    <div class="chatbot-header-info">
                        <img src="images/logo.png" alt="Controller Bot" class="chatbot-avatar">
                        <div class="chatbot-header-text">
                            <h3>Controller Bot</h3>
                            <span class="chatbot-status">Online • Ready to help</span>
                        </div>
                    </div>
                    <button id="chatbot-close" class="chatbot-close" aria-label="Close chat">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
                
                <div class="chatbot-messages" id="chatbot-messages">
                    <!-- Messages will be added here dynamically -->
                </div>
                
                <div class="chatbot-input-container">
                    <div class="chatbot-input-wrapper">
                        <input 
                            type="text" 
                            id="chatbot-input" 
                            class="chatbot-input" 
                            placeholder="Ask me about services, training, or products..."
                            maxlength="500"
                        >
                        <button id="chatbot-send" class="chatbot-send-btn" aria-label="Send message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="chatbot-quick-actions">
                        <button class="quick-action-btn" data-message="Tell me about automation services">
                            🔧 Automation
                        </button>
                        <button class="quick-action-btn" data-message="What safety services do you provide?">
                            🛡️ Safety
                        </button>
                        <button class="quick-action-btn" data-message="Tell me about electrical design">
                            ⚡ Electrical Design
                        </button>
                        <button class="quick-action-btn" data-message="What about panel building?">
                            🏗️ Panel Building
                        </button>
                        <button class="quick-action-btn" data-message="Tell me about safety training">
                            📚 Training
                        </button>
                        <button class="quick-action-btn" data-message="How can I get a quote?">
                            💬 Get Quote
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add chatbot to the page
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    bindEvents() {
        const toggle = document.getElementById('chatbot-toggle');
        const close = document.getElementById('chatbot-close');
        const sendBtn = document.getElementById('chatbot-send');
        const input = document.getElementById('chatbot-input');
        const quickActions = document.querySelectorAll('.quick-action-btn');

        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.closeChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Quick action buttons
        quickActions.forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.dataset.message;
                this.sendQuickMessage(message);
            });
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChat();
            }
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const container = document.getElementById('chatbot-container');
        const toggle = document.getElementById('chatbot-toggle');
        
        container.classList.add('open');
        toggle.classList.add('hidden');
        this.isOpen = true;

        // Focus input after animation
        setTimeout(() => {
            document.getElementById('chatbot-input').focus();
        }, 300);
    }

    closeChat() {
        const container = document.getElementById('chatbot-container');
        const toggle = document.getElementById('chatbot-toggle');
        
        container.classList.remove('open');
        toggle.classList.remove('hidden');
        this.isOpen = false;
    }

    addWelcomeMessage() {
        const welcomeMessage = {
            type: 'bot',
            content: `Hello! I'm Controller Bot 🤖, your virtual assistant from Robotics & Control Ltd. 

I'm here to help you with:
• **Automation Solutions** - Industrial control systems
• **Safety Services** - Machine safety and compliance  
• **Electrical Design** - Professional engineering
• **Panel Building** - Custom control panels
• **Safety Training** - Interactive courses and certification

How can I assist you today?`,
            timestamp: new Date()
        };
        
        this.messages.push(welcomeMessage);
        this.renderMessage(welcomeMessage);
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message || this.isTyping) return;

        // Add user message
        const userMessage = {
            type: 'user',
            content: message,
            timestamp: new Date()
        };
        
        this.messages.push(userMessage);
        this.renderMessage(userMessage);
        input.value = '';

        // Get bot response
        await this.getBotResponse(message);
    }

    sendQuickMessage(message) {
        const input = document.getElementById('chatbot-input');
        input.value = message;
        this.sendMessage();
    }

    async getBotResponse(userMessage) {
        this.showTypingIndicator();

        try {
            // For now, use local knowledge base - in production, this would call OpenAI API
            const response = await this.getLocalResponse(userMessage);
            
            const botMessage = {
                type: 'bot',
                content: response,
                timestamp: new Date()
            };
            
            this.messages.push(botMessage);
            this.hideTypingIndicator();
            this.renderMessage(botMessage);
            
        } catch (error) {
            this.hideTypingIndicator();
            
            const errorMessage = {
                type: 'bot',
                content: "I apologize, but I'm experiencing technical difficulties. Please contact us directly at +353 (0) 52 7443258 or info@rcltd.ie for immediate assistance.",
                timestamp: new Date()
            };
            
            this.messages.push(errorMessage);
            this.renderMessage(errorMessage);
        }
    }

    // Local knowledge base - replace with OpenAI API calls in production
    async getLocalResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        // Automation services
        if (lowerMessage.includes('automation') && (lowerMessage.includes('service') || lowerMessage.includes('tell me about') || lowerMessage.includes('what'))) {
            return `**🔧 Industrial Automation Services - Robotics & Control Ltd**

We specialize in advanced automation solutions across **pharmaceutical, industrial, automotive, and food & beverage** sectors:

**🏭 Our Automation Expertise:**
• **PLC Programming & Integration** - Siemens, Allen-Bradley, Schneider Electric
• **SCADA Systems** - Ignition, WinCC, FactoryTalk View
• **Industrial Networking** - Profinet, EtherNet/IP, Modbus TCP
• **Process Control** - Temperature, pressure, flow control systems
• **Robotics Integration** - Industrial & collaborative robots
• **Vision Systems** - Quality control and inspection automation

**💼 Recent Projects:**
• Pharmaceutical packaging line automation
• Automotive assembly line control systems
• Food processing SCADA implementation

**🔗 Learn More:**
[View Automation Services →](automation.html)
[Get Free Consultation →](contact.html)

Which industry are you in? I can provide more specific examples for your sector!`;
        }

        // Safety services
        if (lowerMessage.includes('safety') && (lowerMessage.includes('service') || lowerMessage.includes('what') || lowerMessage.includes('provide'))) {
            return `**🛡️ Machine Safety Services - Keeping Your Operations Compliant**

R&C Ltd provides comprehensive safety solutions to protect your workforce and ensure regulatory compliance:

**🔍 Safety Assessment & Design:**
• **Risk Assessment** - ISO 12100, ISO 13849 compliance
• **Safety System Design** - Safety PLCs, light curtains, emergency stops
• **Machine Safeguarding** - Guards, interlocks, two-hand controls
• **Functional Safety** - SIL rating and validation
• **Robot Safety** - Collaborative and industrial robot safety systems

**📋 Compliance Services:**
• **CE Marking** - Machinery Directive 2006/42/EC
• **Safety Audits** - Existing machine assessments
• **Documentation** - Safety manuals, risk assessments
• **Training** - Safety awareness for operators and engineers

**✅ Industries We Serve:**
• Pharmaceutical (GMP compliance)
• Automotive (safety-critical systems)
• Food & Beverage (hygiene + safety)

**🔗 Take Action:**
[Safety Services Details →](safety.html)
[Request Safety Audit →](contact.html)

Do you have specific safety challenges or compliance requirements?`;
        }

        // Electrical design
        if (lowerMessage.includes('electrical') && (lowerMessage.includes('design') || lowerMessage.includes('tell me') || lowerMessage.includes('about'))) {
            return `**⚡ Professional Electrical Design Services**

Our experienced engineers deliver robust electrical solutions using industry-leading design tools:

**🎯 Design Capabilities:**
• **Control System Design** - Motor control, power distribution
• **Schematic Design** - E3.Series, AutoCAD Electrical
• **Power Systems** - Load calculations, cable sizing
• **Motor Control Centers** - Custom MCC design and specifications
• **Instrumentation Design** - Field devices, control loops
• **Hazardous Area Design** - ATEX/IECEx classifications

**📐 Design Standards:**
• **IEC 60204-1** - Electrical equipment of machines
• **IEC 61439** - Low-voltage switchgear assemblies
• **IEC 60364** - Electrical installations of buildings
• **EN 60204** - Safety of machinery electrical equipment

**🏆 Our Track Record:**
• 15+ years of design experience
• 200+ successful projects delivered
• Full compliance with Irish and EU regulations

**🔗 Get Started:**
[Electrical Design Portfolio →](design.html)
[Request Design Quote →](contact.html)

What type of electrical system are you planning?`;
        }

        // Panel building
        if (lowerMessage.includes('panel') && (lowerMessage.includes('building') || lowerMessage.includes('about') || lowerMessage.includes('what'))) {
            return `**🏗️ Custom Panel Building & Manufacturing**

From design to delivery, we build professional control panels to the highest standards:

**🔧 Panel Building Services:**
• **Custom Control Panels** - Motor control, process control
• **MCC Manufacturing** - Motor Control Centers to IEC 61439
• **Switchgear Assembly** - Low voltage distribution panels
• **Instrumentation Panels** - Field junction boxes, marshalling
• **Retrofit & Upgrades** - Modernizing existing panels
• **Testing & Commissioning** - Full FAT and SAT procedures

**🏭 Manufacturing Standards:**
• **IEC 61439** - Switchgear and controlgear assemblies
• **CE Marking** - Full compliance and documentation
• **Quality Control** - Rigorous testing at every stage
• **Documentation** - Complete as-built drawings and manuals

**📦 What We Deliver:**
• Professional wiring and labeling
• Comprehensive testing reports
• Installation and commissioning support
• 12-month warranty on all work

**🔗 Next Steps:**
[Panel Building Gallery →](panel.html)
[Request Panel Quote →](contact.html)

What size and type of panel do you need?`;
        }

        // General services overview
        if (lowerMessage.includes('service') || lowerMessage.includes('what do you do')) {
            return `**🏢 Robotics & Control Ltd - Your Automation Partner Since 2010**

We provide comprehensive industrial solutions across Ireland and internationally:

**🔧 Core Services:**
• **[Automation Services](automation.html)** - PLC, SCADA, robotics integration
• **[Safety Solutions](safety.html)** - Risk assessment, compliance, CE marking
• **[Electrical Design](design.html)** - Control systems, power distribution
• **[Panel Building](panel.html)** - Custom control panels, MCCs
• **[Safety Training](safety-training.html)** - Interactive courses, certification

**🏭 Industries We Serve:**
• **Pharmaceutical** - GMP compliance, validation protocols
• **Automotive** - Assembly lines, quality control systems
• **Food & Beverage** - Process control, hygiene standards
• **General Industry** - Manufacturing automation solutions

**📞 Ready to Start?**
[View All Services →](services.html)
[Get Free Quote →](contact.html)
[Call Now: +353 (0) 52 7443258](tel:+353527443258)

Which service interests you most?`;
        }

        // Training responses
        if (lowerMessage.includes('training') || lowerMessage.includes('course') || lowerMessage.includes('learn')) {
            return `**📚 Professional Safety Training Programs**

R&C Ltd offers comprehensive safety training to keep your team compliant and safe:

**🎓 Available Training Modules:**
• **Automation Safety** - Industrial robot safety, cobot integration (4-5 hrs)
• **Electrical Design Safety** - IEC 60204-1, protective systems (4-5 hrs)  
• **Panel Building Safety** - IEC 61439, testing procedures (4-5 hrs)
• **Risk Assessment** - ISO 12100 methodology and practice
• **Machine Safety** - Guards, interlocks, emergency systems

**💡 Training Features:**
• **Interactive Online Platform** - Learn at your own pace
• **Real Industry Scenarios** - Practical examples from our projects
• **Progress Tracking** - Monitor your team's development
• **90% Pass Requirement** - Ensures thorough understanding
• **Industry Recognition** - Certificates valued by employers

**🏆 Why Choose Our Training:**
• Developed by practicing engineers with 15+ years experience
• Based on real-world projects and challenges
• Covers latest standards and best practices
• Flexible online format fits busy schedules

**🔗 Get Started:**
[Start Training Now →](safety-training.html)
[Contact for Group Training →](contact.html)

Which training module interests your team most?`;
        }

        // Quote/pricing responses
        if (lowerMessage.includes('quote') || lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('contact')) {
            return `**💬 Get Your Free Quote Today!**

R&C Ltd provides competitive quotes with detailed project breakdowns:

**📞 Multiple Ways to Connect:**
• **Call Direct:** [+353 (0) 52 7443258](tel:+353527443258) - *Speak with an engineer*
• **Email:** [info@rcltd.ie](mailto:info@rcltd.ie) - *Send project details*
• **Online Form:** [Quick Quote Request →](contact.html) - *24hr response*
• **Site Visit:** Free consultation at your facility

**⚡ Fast Quote Process:**
1. **Tell us your needs** - Service type, timeline, location
2. **We assess** - Our engineers review requirements
3. **You receive** - Detailed quote within 24-48 hours
4. **We deliver** - Professional implementation

**💼 For Best Quote, Include:**
• Type of project (automation, safety, electrical, panels)
• Timeline and budget range
• Site location and access details
• Existing equipment and standards
• Any specific compliance requirements

**🏆 Why Choose R&C Ltd:**
• 15+ years experience
• Competitive pricing
• No hidden costs
• Full project support

**🔗 Get Started:**
[Request Quote Now →](contact.html)

What type of project can we quote for you?`;
        }

        // Industry-specific responses
        if (lowerMessage.includes('pharmaceutical') || lowerMessage.includes('pharma') || lowerMessage.includes('gmp')) {
            return `**💊 Pharmaceutical Industry Expertise**

R&C Ltd specializes in pharmaceutical automation with deep GMP compliance knowledge:

**🏥 Pharmaceutical Services:**
• **GMP Compliant Systems** - 21 CFR Part 11, GAMP 5 guidelines
• **Process Validation** - IQ/OQ/PQ documentation and execution
• **Batch Control Systems** - Recipe management, electronic batch records
• **Clean Room Automation** - Classified area equipment and controls
• **Track & Trace Systems** - Serialization and traceability solutions
• **Quality Control Automation** - Automated testing and inspection

**✅ Compliance Standards:**
• FDA 21 CFR Part 11 (Electronic Records)
• EU GMP Guidelines
• ISPE GAMP 5 (Good Automated Manufacturing Practice)
• ISO 14971 (Risk Management)

**🔬 Recent Pharma Projects:**
• Tablet packaging line automation with batch tracking
• Clean room HVAC control system with 21 CFR Part 11 compliance
• API manufacturing process control system

**🔗 Learn More:**
[Pharmaceutical Solutions →](automation.html)
[Schedule GMP Consultation →](contact.html)

What pharmaceutical process are you looking to automate?`;
        }

        if (lowerMessage.includes('automotive') || lowerMessage.includes('assembly') || lowerMessage.includes('manufacturing')) {
            return `**🚗 Automotive Manufacturing Solutions**

R&C Ltd delivers robust automation for automotive production environments:

**⚙️ Automotive Expertise:**
• **Assembly Line Control** - Conveyor systems, station control, tracking
• **Quality Control Systems** - Vision inspection, torque monitoring
• **Robot Integration** - Welding, painting, material handling robots
• **MES Integration** - Manufacturing Execution System connectivity
• **Traceability Systems** - Part tracking, genealogy, quality data
• **Lean Manufacturing** - Cycle time optimization, waste reduction

**🏭 System Capabilities:**
• High-speed production lines (up to 60 units/hour)
• Multi-station synchronization
• Flexible changeover for different models
• Real-time production monitoring
• Predictive maintenance systems

**📊 Proven Results:**
• 15% increase in OEE (Overall Equipment Effectiveness)
• 50% reduction in changeover time
• Zero defect quality systems

**🔗 Next Steps:**
[Automotive Case Studies →](automation.html)
[Request Plant Visit →](contact.html)

What automotive processes need automation in your facility?`;
        }

        if (lowerMessage.includes('food') || lowerMessage.includes('beverage') || lowerMessage.includes('haccp')) {
            return `**🍎 Food & Beverage Industry Solutions**

R&C Ltd provides hygienic design automation for food and beverage production:

**🥤 F&B Specializations:**
• **Hygienic Design** - IP65/IP69K rated equipment, washdown systems
• **HACCP Compliance** - Critical Control Point monitoring and control
• **Batch Control** - Recipe management, ingredient tracking
• **CIP/SIP Systems** - Cleaning-in-Place, Sterilization-in-Place automation
• **Temperature Control** - Pasteurization, fermentation, cold chain
• **Packaging Lines** - Filling, capping, labeling, case packing

**🛡️ Food Safety Standards:**
• HACCP (Hazard Analysis Critical Control Points)
• BRC Global Standard
• SQF (Safe Quality Food)
• FDA Food Safety Modernization Act
• EU Food Hygiene Regulations

**🏆 F&B Project Examples:**
• Dairy processing SCADA with CIP automation
• Beverage filling line with track & trace
• Bakery oven control with recipe management

**🔗 Get Started:**
[Food Processing Solutions →](automation.html)
[Food Safety Consultation →](contact.html)

What food safety challenges can we help you solve?`;
        }

        // Location/company info
        if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('address') || lowerMessage.includes('about') || lowerMessage.includes('company')) {
            return `**🏢 About Robotics & Control Ltd**

**📍 Our Location:**
Unit 2 Cahir Business Park  
Cahir, Co. Tipperary  
Ireland, E21 C564

**🎯 Company Overview:**
• **Founded:** 2010 (15+ years of excellence)
• **Team:** Experienced engineers and technicians
• **Scope:** Ireland and international projects
• **Certifications:** Professional engineering memberships

**🏆 Why Choose R&C Ltd:**
• **Proven Track Record** - 200+ successful projects delivered
• **Industry Expertise** - Pharmaceutical, automotive, food & beverage
• **Full Service** - Design through commissioning and support
• **Compliance Focus** - CE marking, safety standards, industry regulations
• **Local Support** - Irish company with international reach

**🤝 Professional Memberships:**
• Engineers Ireland
• Engineering the South East
• TÜV Certified Engineers

**📞 Contact Us:**
[Call: +353 (0) 52 7443258](tel:+353527443258)
[Email: info@rcltd.ie](mailto:info@rcltd.ie)
[Visit Our Office →](contact.html)

Would you like to schedule a site visit or consultation?`;
        }

        // Default helpful response with smart suggestions
        // Note: message is not directly included to prevent XSS via bot message reflection
        return `I understand your question. Let me help you find the right information!

**🔍 Popular Topics:**
• **[🔧 Automation Services](automation.html)** - PLC, SCADA, robotics
• **[🛡️ Safety Solutions](safety.html)** - Risk assessment, compliance
• **[⚡ Electrical Design](design.html)** - Control systems, power distribution
• **[🏗️ Panel Building](panel.html)** - Custom control panels, MCCs
• **[📚 Safety Training](safety-training.html)** - Interactive online courses

**🏭 Industry Solutions:**
• **Pharmaceutical** - GMP compliance, process validation
• **Automotive** - Assembly lines, quality control
• **Food & Beverage** - Hygienic design, HACCP compliance

**💬 Quick Actions:**
[Get Free Quote →](contact.html) | [Call Now: +353 (0) 52 7443258](tel:+353527443258)

Try the quick action buttons below or ask me about specific services, industries, or projects!`;
    }

    renderMessage(message) {
        const messagesContainer = document.getElementById('chatbot-messages');
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}-message`;
        
        const avatar = message.type === 'bot' ? 
            '<img src="images/logo.png" alt="Controller Bot" class="message-avatar">' : 
            '<div class="user-avatar">👤</div>';
        
        const time = message.timestamp.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        // Only apply formatting to bot messages for security
        const formattedContent = message.type === 'bot' ? 
            this.formatMessage(message.content) : 
            this.escapeHtml(message.content);

        // Create avatar element safely
        if (message.type === 'bot') {
            const avatarImg = document.createElement('img');
            avatarImg.src = 'images/logo.png';
            avatarImg.alt = 'Controller Bot';
            avatarImg.className = 'message-avatar';
            messageElement.appendChild(avatarImg);
        } else {
            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'user-avatar';
            avatarDiv.textContent = '👤';
            messageElement.appendChild(avatarDiv);
        }

        // Create message content container
        const messageContentDiv = document.createElement('div');
        messageContentDiv.className = 'message-content';

        // Create message text element
        const messageTextDiv = document.createElement('div');
        messageTextDiv.className = 'message-text';
        
        // For bot messages, we can safely use innerHTML since content is controlled and pre-escaped
        // For user messages, use textContent to prevent any HTML
        if (message.type === 'bot') {
            messageTextDiv.innerHTML = formattedContent; // Safe: content is from controlled sources and pre-escaped
        } else {
            messageTextDiv.textContent = message.content; // Safe: direct text content
        }

        // Create timestamp element
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = time;

        // Assemble the structure
        messageContentDiv.appendChild(messageTextDiv);
        messageContentDiv.appendChild(timeDiv);
        messageElement.appendChild(messageContentDiv);

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(content) {
        // Convert markdown-like formatting to HTML with navigation links (bot messages only)
        // First escape any existing HTML to prevent injection
        return this.escapeHtml(content)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
                // Sanitize URLs - only allow safe schemes with proper full URL patterns
                if (url.match(/^(https?:\/\/[^\s"'<>]+|tel:[0-9+()\-\s]+|mailto:[^\s"'<>]+|[A-Za-z0-9._\/-]+\.html)$/)) {
                    // Text is already escaped above, URL is validated
                    return `<a href="${url}" target="_self" rel="noopener" class="chat-link">${text}</a>`;
                }
                return text; // Strip unsafe links, keep text
            })
            .replace(/•/g, '•');
            // Note: \n already converted to <br> by escapeHtml
    }

    escapeHtml(text) {
        // Escape HTML in user messages to prevent XSS
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chatbot-messages');
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message bot-message typing-indicator';
        typingElement.id = 'typing-indicator';
        
        typingElement.innerHTML = `
            <img src="images/logo.png" alt="Controller Bot" class="message-avatar">
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Initialize Controller Bot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.controllerBot = new ControllerBot();
});
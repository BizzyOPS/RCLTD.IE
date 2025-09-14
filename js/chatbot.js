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
                        <button class="quick-action-btn" data-message="What services do you offer?">
                            Our Services
                        </button>
                        <button class="quick-action-btn" data-message="Tell me about safety training">
                            Safety Training
                        </button>
                        <button class="quick-action-btn" data-message="How can I get a quote?">
                            Get Quote
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
            console.error('Chatbot error:', error);
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

        // Services responses
        if (lowerMessage.includes('service') || lowerMessage.includes('what do you do')) {
            return `We provide comprehensive industrial automation solutions:

**🔧 Automation Services**
• PLC Programming & Integration
• SCADA Systems
• Industrial Networks
• Process Control

**⚡ Electrical Design**
• Control System Design
• Power Distribution
• Motor Control Centers
• Instrumentation

**🛡️ Safety Solutions**
• Machine Safety Assessment
• Safety System Design
• Risk Assessment
• Compliance Consulting

**🏗️ Panel Building**
• Custom Control Panels
• MCC Manufacturing
• Testing & Commissioning

Would you like more details about any specific service?`;
        }

        // Training responses
        if (lowerMessage.includes('training') || lowerMessage.includes('course') || lowerMessage.includes('learn')) {
            return `Our **Safety Training** programs help you maintain compliance and safety:

**📚 Available Courses:**
• Machinery Safety Fundamentals
• Risk Assessment Techniques  
• Safety Standards (ISO 13849, IEC 62061)
• Lockout/Tagout Procedures
• Electrical Safety

**✨ Features:**
• Interactive online modules
• Real-world scenarios
• Progress tracking
• 90% pass requirement
• Professional certificates

Ready to start learning? Visit our [Safety Training page](safety-training.html) or would you like to know about a specific course?`;
        }

        // Quote/pricing responses
        if (lowerMessage.includes('quote') || lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('contact')) {
            return `I'd be happy to help you get a quote! Here's how to reach us:

**📞 Contact Information:**
• **Phone:** +353 (0) 52 7443258
• **Email:** info@rcltd.ie
• **Address:** Unit 2 Cahir Business Park, Cahir, Co. Tipperary

**💬 Quick Quote Request:**
For the fastest response, please include:
• Type of project/service needed
• Timeline requirements  
• Location/site details
• Any specific requirements

You can also fill out our [contact form](contact.html) and we'll get back to you within 24 hours!

What type of project are you looking to quote?`;
        }

        // Location/company info
        if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('address')) {
            return `**📍 Robotics & Control Ltd Location:**

Unit 2 Cahir Business Park  
Cahir, Co. Tipperary  
Ireland, E21 C564

We're strategically located in Tipperary to serve clients across Ireland and internationally. Founded in 2010, we've been providing reliable automation and safety solutions for over 15 years.

**Industries We Serve:**
• Pharmaceutical
• Industrial Manufacturing  
• Automotive
• Food & Beverage

Need directions or want to schedule a site visit?`;
        }

        // Default helpful response
        return `I understand you're asking about "${message}". 

I can help you with information about:
• **Services** - Automation, electrical design, safety, panel building
• **Training** - Safety courses and certification programs  
• **Contact** - Getting quotes and speaking with our team
• **Company** - About R&C Ltd and our expertise

Could you be more specific about what you'd like to know? Or feel free to use one of the quick action buttons below for common topics!`;
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

        messageElement.innerHTML = `
            ${avatar}
            <div class="message-content">
                <div class="message-text">${this.formatMessage(message.content)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(content) {
        // Convert markdown-like formatting to HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/•/g, '•')
            .replace(/\n/g, '<br>');
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
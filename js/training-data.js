// Comprehensive Safety Training Data for R&C Ltd
// Professional-grade training content aligned with company services

var trainingData = {
    modules: {
        automation: {
            id: 'automation',
            title: 'Automation Safety',
            description: 'Comprehensive safety training for industrial automation systems, robot cells, and collaborative robotics.',
            duration: '4-5 hours',
            difficulty: 'Intermediate to Advanced',
            chapters: {
                1: {
                    id: 1,
                    title: 'Industrial Robot Safety Fundamentals',
                    learningObjectives: [
                        'Understand the key safety principles for industrial robotics',
                        'Identify common hazards in robotic workcells',
                        'Apply ISO 10218 safety standards',
                        'Implement proper safeguarding strategies'
                    ],
                    content: '<h3>Understanding Industrial Robot Hazards</h3>' +
                        '<p>Industrial robots present unique safety challenges that require specialized knowledge and careful planning. The primary hazards include:</p>' +
                        '<h4>Mechanical Hazards</h4>' +
                        '<p>Industrial robots operate with considerable force and speed, creating potential for serious injury. A typical 6-axis industrial robot can exert forces exceeding 1000N and move at speeds up to 2 m/s. The unpredictable movement patterns, especially during programming or maintenance, make these systems particularly dangerous.</p>' +
                        '<h4>Electrical Hazards</h4>' +
                        '<p>Robot systems typically operate at high voltages (400V-480V AC) and require significant electrical power. Improper isolation during maintenance can result in electrocution. Additionally, servo motors can generate back-EMF even when the main power is disconnected.</p>' +
                        '<h3>ISO 10218 Standard Overview</h3>' +
                        '<p>ISO 10218 provides the fundamental safety requirements for industrial robots. Part 1 covers robot design and Part 2 addresses robot system integration. Key requirements include:</p>' +
                        '<ul>' +
                            '<li><strong>Emergency stop systems:</strong> Must be easily accessible and bring the robot to a safe stop condition</li>' +
                            '<li><strong>Reduced speed operation:</strong> Maximum 250mm/s for manual operation modes</li>' +
                            '<li><strong>Three-position enabling devices:</strong> Required for teach pendant operation</li>' +
                            '<li><strong>Safeguarded space:</strong> Physical barriers to prevent unauthorized access</li>' +
                        '</ul>' +
                        '<h3>Real-World Application at R&C Ltd</h3>' +
                        '<p>At R&C Ltd, we have implemented automated assembly lines for automotive components where robots handle parts weighing up to 25kg. Our safety approach includes redundant safety systems, light curtains for flexible access, and comprehensive operator training. A recent project involved integrating 6 ABB robots in a synchronized welding cell, requiring careful analysis of interaction zones and implementation of master-slave safety controls.</p>' +
                        '<div class="safety-tip">' +
                            '<strong>Industry Best Practice:</strong> Always implement a "safety-first" design philosophy. It is far more cost-effective to design safety into the system initially rather than retrofit safety measures later.' +
                        '</div>',
                    questions: [
                        {
                            type: 'multiple-choice',
                            question: 'According to ISO 10218, what is the maximum permitted speed for manual robot operation?',
                            options: [
                                '150mm/s',
                                '250mm/s',
                                '300mm/s',
                                '500mm/s'
                            ],
                            correct: 1,
                            explanation: 'ISO 10218 specifies a maximum speed of 250mm/s for manual operation modes to ensure operators have sufficient time to react to unexpected robot movements.'
                        },
                        {
                            type: 'multiple-choice',
                            question: 'What is the primary purpose of a three-position enabling device on a teach pendant?',
                            options: [
                                'To control robot speed',
                                'To ensure operator presence and readiness',
                                'To program robot movements',
                                'To stop the robot automatically'
                            ],
                            correct: 1,
                            explanation: 'The three-position enabling device ensures that an operator is present, alert, and ready to stop the robot if necessary. The middle position allows operation, while releasing or gripping too hard stops the robot.'
                        },
                        {
                            type: 'fill-in-blank',
                            question: 'A typical 6-axis industrial robot can exert forces exceeding _____ N and move at speeds up to _____ m/s.',
                            blanks: ['1000', '2'],
                            explanation: 'Industrial robots are powerful machines capable of exerting forces over 1000N and operating at speeds up to 2 m/s, which is why proper safety measures are critical.',
                            flexibleAnswers: [
                                {pattern: /^(1000|1,000|one thousand)$/i, replacement: '1000'},
                                {pattern: /^(2|two|2\.0)$/i, replacement: '2'}
                            ]
                        },
                        {
                            type: 'fill-in-blank',
                            question: 'The ISO _____ standard covers safety requirements for industrial robots, with Part 1 addressing robot _____ and Part 2 covering robot system _____.',
                            blanks: ['10218', 'design', 'integration'],
                            explanation: 'ISO 10218 is the fundamental safety standard for industrial robots, divided into Part 1 (robot design) and Part 2 (robot system integration).',
                            flexibleAnswers: [
                                {pattern: /^(10218|10,218)$/i, replacement: '10218'},
                                {pattern: /^design(ing)?$/i, replacement: 'design'},
                                {pattern: /^integration$/i, replacement: 'integration'}
                            ]
                        }
                    ]
                },
                2: {
                    id: 2,
                    title: 'Collaborative Robot (Cobot) Safety',
                    learningObjectives: [
                        'Understand collaborative robot safety principles',
                        'Implement ISO/TS 15066 requirements',
                        'Design safe human-robot collaboration workspaces',
                        'Apply appropriate safety measures for different collaboration modes'
                    ],
                    content: '<h3>Collaborative Robotics Revolution</h3>' +
                        '<p>Collaborative robots (cobots) represent a paradigm shift in industrial automation, designed to work safely alongside humans without traditional safety barriers. This collaboration requires sophisticated safety systems and careful risk assessment.</p>' +
                        '<h4>Four Collaborative Operation Types (ISO/TS 15066)</h4>' +
                        '<h5>1. Safety-Monitored Stop</h5>' +
                        '<p>The robot stops when a human enters the collaborative workspace but can resume automatically when the space is clear. This mode is ideal for part loading/unloading operations where minimal human interaction is required.</p>' +
                        '<h5>2. Hand Guiding</h5>' +
                        '<p>Operators can manually guide the robot using a hand-guiding device. The robot only moves when the operator activates the guiding controls. This mode is excellent for teaching applications and flexible manufacturing.</p>' +
                        '<h5>3. Speed and Separation Monitoring</h5>' +
                        '<p>The robot continuously monitors the minimum protective separation distance to humans and adjusts its speed accordingly. Advanced sensor systems track human positions in real-time, slowing or stopping the robot as people approach.</p>' +
                        '<h5>4. Power and Force Limiting</h5>' +
                        '<p>The robot is designed to limit contact forces and pressures to safe levels. Built-in torque sensors and compliance mechanisms ensure that any contact with humans remains below harmful thresholds.</p>' +
                        '<h3>Biomechanical Limits and Contact Forces</h3>' +
                        '<p>ISO/TS 15066 specifies maximum permissible contact forces based on body regions:</p>' +
                        '<ul>' +
                            '<li><strong>Skull/Forehead:</strong> 130N force, 16 N·m²/s specific energy</li>' +
                            '<li><strong>Face:</strong> 65N force, 4.3 N·m²/s specific energy</li>' +
                            '<li><strong>Neck (sides):</strong> 150N force, 9.6 N·m²/s specific energy</li>' +
                            '<li><strong>Arms/Hands:</strong> 280N force, 23 N·m²/s specific energy</li>' +
                        '</ul>' +
                        '<h3>R&C Ltd Cobot Implementation Case Study</h3>' +
                        '<p>R&C Ltd recently designed a collaborative workspace for precision assembly operations. The system uses a Universal Robots UR10e with advanced vision systems for speed and separation monitoring. Key design considerations included:</p>' +
                        '<ul>' +
                            '<li>3D LiDAR sensors for accurate human tracking</li>' +
                            '<li>Dynamic safety zones that adjust based on robot payload</li>' +
                            '<li>Torque limiting at 80% of maximum permissible contact forces</li>' +
                            '<li>Emergency stop access within 600mm of any operator position</li>' +
                        '</ul>' +
                        '<div class="safety-tip">' +
                            '<strong>Critical Safety Note:</strong> Never assume a robot is "inherently safe" simply because it is labeled as collaborative. Proper risk assessment and validation testing are essential for every application.' +
                        '</div>',
                    questions: [
                        {
                            type: 'multiple-choice',
                            question: 'Which collaborative operation mode allows the robot to resume operation automatically after a human leaves the workspace?',
                            options: [
                                'Hand Guiding',
                                'Speed and Separation Monitoring',
                                'Safety-Monitored Stop',
                                'Power and Force Limiting'
                            ],
                            correct: 2,
                            explanation: 'Safety-Monitored Stop allows automatic resumption once the collaborative workspace is clear, making it ideal for part loading/unloading operations.'
                        },
                        {
                            type: 'multiple-choice',
                            question: 'According to ISO/TS 15066, what is the maximum permissible contact force for the human face region?',
                            options: [
                                '65N',
                                '130N',
                                '150N',
                                '280N'
                            ],
                            correct: 0,
                            explanation: 'The face region has a maximum permissible contact force of 65N due to the sensitivity and vulnerability of facial features.'
                        },
                        {
                            type: 'fill-in-blank',
                            question: 'ISO/TS _____ defines four types of collaborative operation, including safety-monitored stop, hand guiding, speed and separation monitoring, and _____ and _____ limiting.',
                            blanks: ['15066', 'power', 'force'],
                            explanation: 'ISO/TS 15066 is the technical specification that defines collaborative robot safety requirements and the four operational modes.',
                            flexibleAnswers: [
                                {pattern: /^(15066|15,066)$/i, replacement: '15066'},
                                {pattern: /^power$/i, replacement: 'power'},
                                {pattern: /^force$/i, replacement: 'force'}
                            ]
                        }
                    ]
                },
                3: {
                    id: 3,
                    title: 'Safeguarding Systems and Risk Assessment',
                    learningObjectives: [
                        'Conduct comprehensive risk assessments for robotic systems',
                        'Select appropriate safeguarding devices and methods',
                        'Understand safety integrity levels and performance requirements',
                        'Implement validation and verification procedures'
                    ],
                    content: '<h3>Systematic Risk Assessment Methodology</h3>' +
                        '<p>Risk assessment for robotic systems requires a structured approach following ISO 12100 principles. The process involves hazard identification, risk evaluation, and risk reduction through inherent safe design, safeguarding, and information for use.</p>' +
                        '<h4>Risk Assessment Steps</h4>' +
                        '<ol>' +
                            '<li><strong>Hazard Identification:</strong> Systematically identify all potential hazards throughout the robot operation phases</li>' +
                            '<li><strong>Risk Estimation:</strong> Evaluate severity and probability using standardized risk matrices</li>' +
                            '<li><strong>Risk Evaluation:</strong> Determine if risks are acceptable or require reduction measures</li>' +
                            '<li><strong>Risk Reduction:</strong> Implement appropriate control measures following the hierarchy of controls</li>' +
                        '</ol>' +
                        '<h3>Safeguarding Device Selection</h3>' +
                        '<h4>Presence Sensing Safety Devices</h4>' +
                        '<p><strong>Safety Light Curtains:</strong> Provide invisible barriers using infrared light beams. Type 4 devices offer the highest safety integrity with resolution as fine as 14mm for finger detection. Ideal for applications requiring frequent access to the robot workspace.</p>' +
                        '<p><strong>Safety Laser Scanners:</strong> Create configurable safety zones and warning zones around robotic systems. Advanced scanners can distinguish between humans and objects, allowing more flexible automation while maintaining safety.</p>' +
                        '<p><strong>Safety Vision Systems:</strong> Use 3D cameras and AI algorithms for sophisticated presence detection. Can track multiple people simultaneously and predict movement patterns for proactive safety responses.</p>' +
                        '<h4>Interlocking Safety Devices</h4>' +
                        '<p><strong>Safety Gate Switches:</strong> Mechanical interlocks that prevent robot operation when access doors are open. Modern switches include guard locking mechanisms that hold doors closed during hazardous robot movements.</p>' +
                        '<p><strong>RFID Safety Switches:</strong> Non-contact interlocking using coded RFID tags. Provide higher security against tampering and defeat, essential for high-risk applications.</p>' +
                        '<h3>Safety Integrity and Performance Requirements</h3>' +
                        '<p>Safety-related control systems must achieve appropriate Performance Levels (PL) according to ISO 13849-1:</p>' +
                        '<ul>' +
                            '<li><strong>PLa:</strong> 10^-5 ≤ PFH &lt; 10^-4 (Low risk reduction)</li>' +
                            '<li><strong>PLb:</strong> 3×10^-6 ≤ PFH &lt; 10^-5 (Low risk reduction)</li>' +
                            '<li><strong>PLc:</strong> 10^-6 ≤ PFH &lt; 3×10^-6 (Medium risk reduction)</li>' +
                            '<li><strong>PLd:</strong> 10^-7 ≤ PFH &lt; 10^-6 (High risk reduction)</li>' +
                            '<li><strong>PLe:</strong> 10^-8 ≤ PFH &lt; 10^-7 (Very high risk reduction)</li>' +
                        '</ul>' +
                        '<h3>R&C Ltd Risk Assessment Example</h3>' +
                        '<p>For a recent automotive parts handling robot cell, R&C Ltd identified the following critical risks:</p>' +
                        '<ol>' +
                            '<li><strong>Crushing hazard from robot arm movement:</strong> Severity S2, Frequency F2, Possibility P2 = Risk Level 8 (High)</li>' +
                            '<li><strong>Electric shock during maintenance:</strong> Severity S2, Frequency F1, Possibility P1 = Risk Level 4 (Medium)</li>' +
                            '<li><strong>Part ejection from gripper:</strong> Severity S1, Frequency F2, Possibility P2 = Risk Level 5 (Medium)</li>' +
                        '</ol>' +
                        '<p>Risk reduction measures included PLd-rated safety light curtains, lockout/tagout procedures, and pneumatic gripper pressure monitoring.</p>',
                    questions: [
                        {
                            type: 'multiple-choice',
                            question: 'What is the probability of failure per hour (PFH) range for Performance Level d (PLd)?',
                            options: [
                                '10^-6 ≤ PFH &lt; 3×10^-6',
                                '10^-7 ≤ PFH &lt; 10^-6',
                                '10^-8 ≤ PFH &lt; 10^-7',
                                '3×10^-6 ≤ PFH &lt; 10^-5'
                            ],
                            correct: 1,
                            explanation: 'Performance Level d (PLd) requires a probability of failure per hour between 10^-7 and 10^-6, representing high risk reduction capability.'
                        },
                        {
                            type: 'multiple-choice',
                            question: 'Which safeguarding device is best suited for applications requiring frequent access to robot workspaces?',
                            options: [
                                'Physical barriers',
                                'Safety light curtains',
                                'Emergency stop buttons',
                                'Warning lights'
                            ],
                            correct: 1,
                            explanation: 'Safety light curtains provide invisible barriers that allow easy access while maintaining safety protection, making them ideal for frequent access applications.'
                        },
                        {
                            type: 'fill-in-blank',
                            question: 'The risk assessment methodology following ISO _____ involves hazard identification, risk _____, risk evaluation, and risk _____.',
                            blanks: ['12100', 'estimation', 'reduction'],
                            explanation: 'ISO 12100 provides the fundamental methodology for machinery safety risk assessment, including systematic hazard identification, risk estimation, and risk reduction.',
                            flexibleAnswers: [
                                {pattern: /^(12100|12,100)$/i, replacement: '12100'},
                                {pattern: /^estimation$/i, replacement: 'estimation'},
                                {pattern: /^reduction$/i, replacement: 'reduction'}
                            ]
                        }
                    ]
                }
            }
        },
        machine: {
            id: 'machine',
            title: 'Machine Safety',
            description: 'Essential safety principles for industrial machinery including risk assessment, guards, interlocks, and control systems.',
            duration: '5-6 hours',
            difficulty: 'Intermediate',
            chapters: {
                1: {
                    id: 1,
                    title: 'ISO 12100 Machinery Safety Fundamentals',
                    learningObjectives: [
                        'Understand the fundamental principles of machinery safety',
                        'Apply ISO 12100 risk assessment methodology',
                        'Implement the hierarchy of risk reduction measures',
                        'Recognize common machinery hazards and their controls'
                    ],
                    content: '<h3>The Foundation of Machine Safety</h3>' +
                        '<p>ISO 12100 establishes the fundamental principles for designing safe machinery. This standard provides a systematic approach to achieving safety through inherent safe design, safeguarding, and complementary protective measures.</p>' +
                        '<h4>The Three-Step Risk Reduction Method</h4>' +
                        '<h5>Step 1: Inherent Safe Design</h5>' +
                        '<p>The most effective safety approach eliminates hazards through design. Examples include:</p>' +
                        '<ul>' +
                            '<li>Using pneumatic systems instead of hydraulic where possible to reduce pressure hazards</li>' +
                            '<li>Designing automatic feeding systems to eliminate manual material handling</li>' +
                            '<li>Incorporating fail-safe mechanisms that move to safe positions upon power loss</li>' +
                            '<li>Selecting materials and energy sources that minimize risk</li>' +
                        '</ul>' +
                        '<h5>Step 2: Safeguarding and Complementary Protective Measures</h5>' +
                        '<p>When hazards cannot be eliminated, implement protective measures:</p>' +
                        '<ul>' +
                            '<li><strong>Guards:</strong> Fixed, interlocked, or adjustable barriers</li>' +
                            '<li><strong>Protective devices:</strong> Light curtains, pressure-sensitive mats, two-hand controls</li>' +
                            '<li><strong>Complementary measures:</strong> Emergency stops, energy isolation, warning devices</li>' +
                        '</ul>' +
                        '<h5>Step 3: Information for Use</h5>' +
                        '<p>Provide users with essential safety information through:</p>' +
                        '<ul>' +
                            '<li>Clear warning labels and safety signs</li>' +
                            '<li>Comprehensive operating manuals</li>' +
                            '<li>Training programs for operators and maintenance personnel</li>' +
                            '<li>Residual risk warnings</li>' +
                        '</ul>' +
                        '<h3>Common Machinery Hazards</h3>' +
                        '<h4>Mechanical Hazards</h4>' +
                        '<p><strong>Crushing and Shearing:</strong> Power presses, stamping machines, and hydraulic systems create significant crushing forces. Guards must prevent access to dangerous zones while allowing necessary operations.</p>' +
                        '<p><strong>Cutting and Puncturing:</strong> Sharp edges, blades, and pointed components require proper guarding or position design to prevent contact during normal operations and maintenance.</p>' +
                        '<p><strong>Entanglement:</strong> Rotating machinery, conveyor systems, and drive mechanisms can catch clothing, hair, or body parts. Proper guarding and emergency stops are essential.</p>' +
                        '<h3>R&C Ltd Machine Safety Implementation</h3>' +
                        '<p>R&C Ltd recently upgraded a legacy stamping press line with modern safety systems. The comprehensive safety upgrade included:</p>' +
                        '<ol>' +
                            '<li><strong>Inherent Safe Design:</strong> Reduced pinch points by increasing minimum gaps to 25mm</li>' +
                            '<li><strong>Safeguarding:</strong> Type 4 safety light curtains with 14mm resolution for finger protection</li>' +
                            '<li><strong>Control Systems:</strong> PLe-rated safety controllers with redundant monitoring</li>' +
                            '<li><strong>Information for Use:</strong> Comprehensive training program and visual safety indicators</li>' +
                        '</ol>',
                    questions: [
                        {
                            type: 'multiple-choice',
                            question: 'According to ISO 12100, what is the first step in the hierarchy of risk reduction?',
                            options: [
                                'Safeguarding',
                                'Information for use',
                                'Inherent safe design',
                                'Protective equipment'
                            ],
                            correct: 2,
                            explanation: 'Inherent safe design is the first and most effective step in the risk reduction hierarchy, as it eliminates hazards at the source rather than protecting against them.'
                        },
                        {
                            type: 'multiple-choice',
                            question: 'What is the minimum gap size recommended to prevent crushing hazards in machinery design?',
                            options: [
                                '15mm',
                                '20mm',
                                '25mm',
                                '30mm'
                            ],
                            correct: 2,
                            explanation: 'A minimum gap of 25mm is recommended to prevent crushing hazards, as this distance prevents fingers from being caught in pinch points.'
                        },
                        {
                            type: 'fill-in-blank',
                            question: 'The ISO _____ standard establishes the _____ principles for designing safe machinery through inherent safe design, _____, and information for use.',
                            blanks: ['12100', 'fundamental', 'safeguarding'],
                            explanation: 'ISO 12100 provides the fundamental principles for machinery safety through a three-step approach: inherent safe design, safeguarding, and information for use.',
                            flexibleAnswers: [
                                {pattern: /^(12100|12,100)$/i, replacement: '12100'},
                                {pattern: /^fundamental$/i, replacement: 'fundamental'},
                                {pattern: /^safeguarding$/i, replacement: 'safeguarding'}
                            ]
                        }
                    ]
                }
            }
        },
        electrical: {
            id: 'electrical',
            title: 'Electrical Safety',
            description: 'Comprehensive electrical safety training covering hazard identification, safe work practices, and protective measures.',
            duration: '4-5 hours',
            difficulty: 'Intermediate to Advanced',
            chapters: {
                1: {
                    id: 1,
                    title: 'Electrical Hazards and Safety Fundamentals',
                    learningObjectives: [
                        'Identify electrical hazards in industrial environments',
                        'Understand the effects of electric current on the human body',
                        'Apply appropriate electrical safety measures and procedures',
                        'Implement lockout/tagout procedures for electrical systems'
                    ],
                    content: '<h3>Understanding Electrical Hazards</h3>' +
                        '<p>Electrical hazards pose serious risks in industrial environments, with the potential for severe injury or death. Understanding these hazards is the first step in developing effective safety measures.</p>' +
                        '<h4>Primary Electrical Hazards</h4>' +
                        '<h5>Electric Shock</h5>' +
                        '<p>Electric shock occurs when electric current passes through the human body. The severity depends on current magnitude, duration, and path through the body. As little as 10 milliamperes can cause muscle paralysis, preventing a person from releasing their grip on an energized conductor.</p>' +
                        '<h5>Arc Flash</h5>' +
                        '<p>Arc flash is an explosive release of energy caused by an electrical fault. Temperatures can reach 35,000°F (19,400°C) - four times hotter than the sun surface. The intense heat, pressure wave, and molten metal can cause severe burns and injuries even at significant distances.</p>' +
                        '<h5>Arc Blast</h5>' +
                        '<p>Arc blast is the pressure wave generated during an arc flash event. This can cause hearing damage, lung damage from pressure changes, and physical trauma from the force of the blast.</p>' +
                        '<h3>Effects of Electric Current on the Human Body</h3>' +
                        '<p>The human body response to electric current varies with amperage:</p>' +
                        '<ul>' +
                            '<li><strong>1 milliampere:</strong> Barely perceptible</li>' +
                            '<li><strong>5 milliamperes:</strong> Maximum safe current</li>' +
                            '<li><strong>10-20 milliamperes:</strong> Muscular control lost</li>' +
                            '<li><strong>50 milliamperes:</strong> Ventricular fibrillation possible</li>' +
                            '<li><strong>100-200 milliamperes:</strong> Ventricular fibrillation likely, death probable</li>' +
                        '</ul>' +
                        '<h3>Electrical Safety Best Practices</h3>' +
                        '<p><strong>De-energization:</strong> Always assume electrical equipment is energized until proven otherwise through proper testing procedures. Use appropriate test equipment to verify zero energy state.</p>' +
                        '<p><strong>Lockout/Tagout (LOTO):</strong> Implement comprehensive LOTO procedures to control hazardous energy during maintenance and servicing operations.</p>' +
                        '<p><strong>Personal Protective Equipment:</strong> Use appropriate PPE including arc-rated clothing, insulated gloves, safety glasses, and hard hats when working on or near electrical equipment.</p>' +
                        '<h3>R&C Ltd Electrical Safety Case Study</h3>' +
                        '<p>R&C Ltd implemented a comprehensive electrical safety program for a new manufacturing facility. The program included:</p>' +
                        '<ul>' +
                            '<li>Arc flash hazard analysis for all electrical equipment above 240V</li>' +
                            '<li>Installation of arc-resistant switchgear in critical areas</li>' +
                            '<li>Comprehensive LOTO procedures for all electrical systems</li>' +
                            '<li>Regular electrical safety training for all maintenance personnel</li>' +
                            '<li>Implementation of an electrical work permit system</li>' +
                        '</ul>',
                    questions: [
                        {
                            type: 'multiple-choice',
                            question: 'At what current level does muscular control typically become lost, preventing a person from releasing their grip?',
                            options: [
                                '1-5 milliamperes',
                                '10-20 milliamperes',
                                '50 milliamperes',
                                '100 milliamperes'
                            ],
                            correct: 1,
                            explanation: 'At 10-20 milliamperes, muscular control is lost, which prevents a person from releasing their grip on an energized conductor, making the situation extremely dangerous.'
                        },
                        {
                            type: 'multiple-choice',
                            question: 'What temperature can an arc flash reach?',
                            options: [
                                '5,000°F (2,760°C)',
                                '15,000°F (8,315°C)',
                                '25,000°F (13,870°C)',
                                '35,000°F (19,400°C)'
                            ],
                            correct: 3,
                            explanation: 'Arc flash temperatures can reach 35,000°F (19,400°C), which is approximately four times hotter than the surface of the sun.'
                        },
                        {
                            type: 'fill-in-blank',
                            question: 'The maximum safe current for the human body is _____ milliamperes, while ventricular fibrillation becomes likely at _____-_____ milliamperes.',
                            blanks: ['5', '100', '200'],
                            explanation: 'The maximum safe current is 5 milliamperes, while ventricular fibrillation becomes likely in the range of 100-200 milliamperes.',
                            flexibleAnswers: [
                                {pattern: /^(5|five)$/i, replacement: '5'},
                                {pattern: /^(100|one hundred)$/i, replacement: '100'},
                                {pattern: /^(200|two hundred)$/i, replacement: '200'}
                            ]
                        }
                    ]
                }
            }
        }
    },
    
    getModuleById: function(moduleId) {
        return this.modules[moduleId] || null;
    },
    
    getChapterById: function(moduleId, chapterId) {
        var module = this.getModuleById(moduleId);
        return module && module.chapters ? module.chapters[chapterId] || null : null;
    },
    
    getAllModules: function() {
        return Object.keys(this.modules).map(function(key) {
            return this.modules[key];
        }.bind(this));
    },
    
    getModuleProgress: function(moduleId, completedChapters) {
        var module = this.getModuleById(moduleId);
        if (!module || !module.chapters) return 0;
        
        var totalChapters = Object.keys(module.chapters).length;
        var completed = completedChapters ? completedChapters.length : 0;
        
        return totalChapters > 0 ? Math.round((completed / totalChapters) * 100) : 0;
    },
    
    validateAnswers: function(moduleId, chapterId, answers) {
        var chapter = this.getChapterById(moduleId, chapterId);
        if (!chapter || !chapter.questions) return null;
        
        var results = [];
        var correctCount = 0;
        
        for (var i = 0; i < chapter.questions.length; i++) {
            var question = chapter.questions[i];
            var userAnswer = answers[i];
            var isCorrect = false;
            
            if (question.type === 'multiple-choice') {
                isCorrect = userAnswer === question.correct;
            } else if (question.type === 'fill-in-blank') {
                if (Array.isArray(userAnswer) && Array.isArray(question.blanks)) {
                    isCorrect = userAnswer.length === question.blanks.length;
                    for (var j = 0; j < question.blanks.length && isCorrect; j++) {
                        var expectedAnswer = question.blanks[j].toLowerCase();
                        var providedAnswer = (userAnswer[j] || '').toLowerCase().trim();
                        
                        // Check flexible answers if available
                        if (question.flexibleAnswers && question.flexibleAnswers[j]) {
                            var flexible = question.flexibleAnswers[j];
                            if (flexible.pattern.test(providedAnswer)) {
                                providedAnswer = flexible.replacement;
                            }
                        }
                        
                        isCorrect = isCorrect && (providedAnswer === expectedAnswer);
                    }
                }
            }
            
            if (isCorrect) correctCount++;
            
            results.push({
                questionIndex: i,
                correct: isCorrect,
                explanation: question.explanation
            });
        }
        
        return {
            results: results,
            score: Math.round((correctCount / chapter.questions.length) * 100),
            passed: correctCount >= Math.ceil(chapter.questions.length * 0.7) // 70% passing score
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = trainingData;
}
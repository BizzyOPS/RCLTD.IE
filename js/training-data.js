// Comprehensive Safety Training Data for R&C Ltd
// Professional-grade training content aligned with company services

const trainingData = {
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
                    content: `
                        <h3>Understanding Industrial Robot Hazards</h3>
                        <p>Industrial robots present unique safety challenges that require specialized knowledge and careful planning. The primary hazards include:</p>
                        
                        <h4>Mechanical Hazards</h4>
                        <p>Industrial robots operate with considerable force and speed, creating potential for serious injury. A typical 6-axis industrial robot can exert forces exceeding 1000N and move at speeds up to 2 m/s. The unpredictable movement patterns, especially during programming or maintenance, make these systems particularly dangerous.</p>
                        
                        <h4>Electrical Hazards</h4>
                        <p>Robot systems typically operate at high voltages (400V-480V AC) and require significant electrical power. Improper isolation during maintenance can result in electrocution. Additionally, servo motors can generate back-EMF even when the main power is disconnected.</p>
                        
                        <h3>ISO 10218 Standard Overview</h3>
                        <p>ISO 10218 provides the fundamental safety requirements for industrial robots. Part 1 covers robot design and Part 2 addresses robot system integration. Key requirements include:</p>
                        
                        <ul>
                            <li><strong>Emergency stop systems:</strong> Must be easily accessible and bring the robot to a safe stop condition</li>
                            <li><strong>Reduced speed operation:</strong> Maximum 250mm/s for manual operation modes</li>
                            <li><strong>Three-position enabling devices:</strong> Required for teach pendant operation</li>
                            <li><strong>Safeguarded space:</strong> Physical barriers to prevent unauthorized access</li>
                        </ul>
                        
                        <h3>Real-World Application at R&C Ltd</h3>
                        <p>At R&C Ltd, we've implemented automated assembly lines for automotive components where robots handle parts weighing up to 25kg. Our safety approach includes redundant safety systems, light curtains for flexible access, and comprehensive operator training. A recent project involved integrating 6 ABB robots in a synchronized welding cell, requiring careful analysis of interaction zones and implementation of master-slave safety controls.</p>
                        
                        <div class="safety-tip">
                            <strong>Industry Best Practice:</strong> Always implement a "safety-first" design philosophy. It's far more cost-effective to design safety into the system initially rather than retrofit safety measures later.
                        </div>
                    `,
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
                    content: `
                        <h3>Collaborative Robotics Revolution</h3>
                        <p>Collaborative robots (cobots) represent a paradigm shift in industrial automation, designed to work safely alongside humans without traditional safety barriers. This collaboration requires sophisticated safety systems and careful risk assessment.</p>
                        
                        <h4>Four Collaborative Operation Types (ISO/TS 15066)</h4>
                        
                        <h5>1. Safety-Monitored Stop</h5>
                        <p>The robot stops when a human enters the collaborative workspace but can resume automatically when the space is clear. This mode is ideal for part loading/unloading operations where minimal human interaction is required.</p>
                        
                        <h5>2. Hand Guiding</h5>
                        <p>Operators can manually guide the robot using a hand-guiding device. The robot only moves when the operator activates the guiding controls. This mode is excellent for teaching applications and flexible manufacturing.</p>
                        
                        <h5>3. Speed and Separation Monitoring</h5>
                        <p>The robot continuously monitors the minimum protective separation distance to humans and adjusts its speed accordingly. Advanced sensor systems track human positions in real-time, slowing or stopping the robot as people approach.</p>
                        
                        <h5>4. Power and Force Limiting</h5>
                        <p>The robot is designed to limit contact forces and pressures to safe levels. Built-in torque sensors and compliance mechanisms ensure that any contact with humans remains below harmful thresholds.</p>
                        
                        <h3>Biomechanical Limits and Contact Forces</h3>
                        <p>ISO/TS 15066 specifies maximum permissible contact forces based on body regions:</p>
                        <ul>
                            <li><strong>Skull/Forehead:</strong> 130N force, 16 N·m²/s specific energy</li>
                            <li><strong>Face:</strong> 65N force, 4.3 N·m²/s specific energy</li>
                            <li><strong>Neck (sides):</strong> 150N force, 9.6 N·m²/s specific energy</li>
                            <li><strong>Arms/Hands:</strong> 280N force, 23 N·m²/s specific energy</li>
                        </ul>
                        
                        <h3>R&C Ltd Cobot Implementation Case Study</h3>
                        <p>R&C Ltd recently designed a collaborative workspace for precision assembly operations. The system uses a Universal Robots UR10e with advanced vision systems for speed and separation monitoring. Key design considerations included:</p>
                        
                        <ul>
                            <li>3D LiDAR sensors for accurate human tracking</li>
                            <li>Dynamic safety zones that adjust based on robot payload</li>
                            <li>Torque limiting at 80% of maximum permissible contact forces</li>
                            <li>Emergency stop access within 600mm of any operator position</li>
                        </ul>
                        
                        <div class="safety-tip">
                            <strong>Critical Safety Note:</strong> Never assume a robot is "inherently safe" simply because it's labeled as collaborative. Proper risk assessment and validation testing are essential for every application.
                        </div>
                    `,
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
                    content: `
                        <h3>Systematic Risk Assessment Methodology</h3>
                        <p>Risk assessment for robotic systems requires a structured approach following ISO 12100 principles. The process involves hazard identification, risk evaluation, and risk reduction through inherent safe design, safeguarding, and information for use.</p>
                        
                        <h4>Risk Assessment Steps</h4>
                        <ol>
                            <li><strong>Hazard Identification:</strong> Systematically identify all potential hazards throughout the robot's operational phases</li>
                            <li><strong>Risk Estimation:</strong> Evaluate severity and probability using standardized risk matrices</li>
                            <li><strong>Risk Evaluation:</strong> Determine if risks are acceptable or require reduction measures</li>
                            <li><strong>Risk Reduction:</strong> Implement appropriate control measures following the hierarchy of controls</li>
                        </ol>
                        
                        <h3>Safeguarding Device Selection</h3>
                        
                        <h4>Presence Sensing Safety Devices</h4>
                        <p><strong>Safety Light Curtains:</strong> Provide invisible barriers using infrared light beams. Type 4 devices offer the highest safety integrity with resolution as fine as 14mm for finger detection. Ideal for applications requiring frequent access to the robot workspace.</p>
                        
                        <p><strong>Safety Laser Scanners:</strong> Create configurable safety zones and warning zones around robotic systems. Advanced scanners can distinguish between humans and objects, allowing more flexible automation while maintaining safety.</p>
                        
                        <p><strong>Safety Vision Systems:</strong> Use 3D cameras and AI algorithms for sophisticated presence detection. Can track multiple people simultaneously and predict movement patterns for proactive safety responses.</p>
                        
                        <h4>Interlocking Safety Devices</h4>
                        <p><strong>Safety Gate Switches:</strong> Mechanical interlocks that prevent robot operation when access doors are open. Modern switches include guard locking mechanisms that hold doors closed during hazardous robot movements.</p>
                        
                        <p><strong>RFID Safety Switches:</strong> Non-contact interlocking using coded RFID tags. Provide higher security against tampering and defeat, essential for high-risk applications.</p>
                        
                        <h3>Safety Integrity and Performance Requirements</h3>
                        <p>Safety-related control systems must achieve appropriate Performance Levels (PL) according to ISO 13849-1:</p>
                        
                        <ul>
                            <li><strong>PLa:</strong> 10⁻⁵ ≤ PFH < 10⁻⁴ (Low risk reduction)</li>
                            <li><strong>PLb:</strong> 3×10⁻⁶ ≤ PFH < 10⁻⁵ (Low risk reduction)</li>
                            <li><strong>PLc:</strong> 10⁻⁶ ≤ PFH < 3×10⁻⁶ (Medium risk reduction)</li>
                            <li><strong>PLd:</strong> 10⁻⁷ ≤ PFH < 10⁻⁶ (High risk reduction)</li>
                            <li><strong>PLe:</strong> 10⁻⁸ ≤ PFH < 10⁻⁷ (Very high risk reduction)</li>
                        </ul>
                        
                        <h3>R&C Ltd Risk Assessment Example</h3>
                        <p>For a recent automotive parts handling robot cell, R&C Ltd identified the following critical risks:</p>
                        
                        <ol>
                            <li><strong>Crushing hazard from robot arm movement:</strong> Severity S2, Frequency F2, Possibility P2 = Risk Level 8 (High)</li>
                            <li><strong>Electric shock during maintenance:</strong> Severity S2, Frequency F1, Possibility P1 = Risk Level 4 (Medium)</li>
                            <li><strong>Part ejection from gripper:</strong> Severity S1, Frequency F2, Possibility P2 = Risk Level 5 (Medium)</li>
                        </ol>
                        
                        <p>Risk reduction measures included PLd-rated safety light curtains, lockout/tagout procedures, and pneumatic gripper pressure monitoring.</p>
                    `,
                    questions: [
                        {
                            type: 'multiple-choice',
                            question: 'What is the probability of failure per hour (PFH) range for Performance Level d (PLd)?',
                            options: [
                                '10⁻⁶ ≤ PFH < 3×10⁻⁶',
                                '10⁻⁷ ≤ PFH < 10⁻⁶',
                                '10⁻⁸ ≤ PFH < 10⁻⁷',
                                '3×10⁻⁶ ≤ PFH < 10⁻⁵'
                            ],
                            correct: 1,
                            explanation: 'Performance Level d (PLd) requires a probability of failure per hour between 10⁻⁷ and 10⁻⁶, representing high risk reduction capability.'
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
                    content: `
                        <h3>The Foundation of Machine Safety</h3>
                        <p>ISO 12100 establishes the fundamental principles for designing safe machinery. This standard provides a systematic approach to achieving safety through inherent safe design, safeguarding, and complementary protective measures.</p>
                        
                        <h4>The Three-Step Risk Reduction Method</h4>
                        
                        <h5>Step 1: Inherent Safe Design</h5>
                        <p>The most effective safety approach eliminates hazards through design. Examples include:</p>
                        <ul>
                            <li>Using pneumatic systems instead of hydraulic where possible to reduce pressure hazards</li>
                            <li>Designing automatic feeding systems to eliminate manual material handling</li>
                            <li>Incorporating fail-safe mechanisms that move to safe positions upon power loss</li>
                            <li>Selecting materials and energy sources that minimize risk</li>
                        </ul>
                        
                        <h5>Step 2: Safeguarding and Complementary Protective Measures</h5>
                        <p>When hazards cannot be eliminated, implement protective measures:</p>
                        <ul>
                            <li><strong>Guards:</strong> Fixed, interlocked, or adjustable barriers</li>
                            <li><strong>Protective devices:</strong> Light curtains, pressure-sensitive mats, two-hand controls</li>
                            <li><strong>Complementary measures:</strong> Emergency stops, energy isolation, warning devices</li>
                        </ul>
                        
                        <h5>Step 3: Information for Use</h5>
                        <p>Provide users with essential safety information through:</p>
                        <ul>
                            <li>Clear warning labels and safety signs</li>
                            <li>Comprehensive operating manuals</li>
                            <li>Training programs for operators and maintenance personnel</li>
                            <li>Residual risk warnings</li>
                        </ul>
                        
                        <h3>Common Machinery Hazards</h3>
                        
                        <h4>Mechanical Hazards</h4>
                        <p><strong>Crushing and Shearing:</strong> Power presses, stamping machines, and hydraulic systems create significant crushing forces. Guards must prevent access to dangerous zones while allowing necessary operations.</p>
                        
                        <p><strong>Cutting and Puncturing:</strong> Sharp edges, blades, and pointed components require proper guarding or position design to prevent contact during normal operations and maintenance.</p>
                        
                        <p><strong>Entanglement:</strong> Rotating machinery, conveyors, and drive systems pose entanglement risks. Smooth surfaces, emergency stops, and proper guarding are essential.</p>
                        
                        <h4>Electrical Hazards</h4>
                        <p>Industrial machinery typically operates at dangerous voltage levels. Protection requires proper insulation, grounding, circuit protection, and lockout/tagout procedures.</p>
                        
                        <h4>Pneumatic and Hydraulic Hazards</h4>
                        <p>Stored energy in compressed air and hydraulic systems can cause serious injuries. Proper pressure relief, isolation valves, and energy dissipation procedures are critical.</p>
                        
                        <h3>R&C Ltd Machine Safety Implementation</h3>
                        <p>In a recent packaging machine design project, R&C Ltd applied ISO 12100 principles systematically:</p>
                        
                        <ol>
                            <li><strong>Inherent Safe Design:</strong> Reduced pinch points by increasing minimum gaps to 25mm</li>
                            <li><strong>Safeguarding:</strong> Implemented Type 4 safety light curtains with 30mm resolution</li>
                            <li><strong>Information for Use:</strong> Created comprehensive safety training program and visual safety aids</li>
                        </ol>
                        
                        <p>The result was a 60% reduction in safety-related incidents compared to the previous machine design.</p>
                        
                        <div class="safety-tip">
                            <strong>Remember:</strong> The goal isn't just compliance with standards, but creating machinery that protects people throughout its entire lifecycle, from installation through decommissioning.
                        </div>
                    `,
                    questions: [
                        {
                            type: 'multiple-choice',
                            question: 'According to ISO 12100, which risk reduction method should be considered first?',
                            options: [
                                'Information for use',
                                'Safeguarding measures',
                                'Inherent safe design',
                                'Protective devices'
                            ],
                            correct: 2,
                            explanation: 'Inherent safe design is the first and most effective step in the risk reduction hierarchy because it eliminates hazards rather than simply protecting against them.'
                        },
                        {
                            type: 'multiple-choice',
                            question: 'What is the recommended minimum gap to prevent access to pinch points for adults?',
                            options: [
                                '4mm',
                                '6mm',
                                '25mm',
                                '120mm'
                            ],
                            correct: 2,
                            explanation: 'A minimum gap of 25mm prevents adult fingers from reaching through to pinch points, based on anthropometric data in safety standards.'
                        },
                        {
                            type: 'fill-in-blank',
                            question: 'ISO _____ establishes the fundamental principles for machinery safety through a _____-step risk reduction method.',
                            blanks: ['12100', 'three'],
                            explanation: 'ISO 12100 is the fundamental machinery safety standard that defines the three-step approach: inherent safe design, safeguarding, and information for use.',
                            flexibleAnswers: [
                                {pattern: /^(12100|12,100)$/i, replacement: '12100'},
                                {pattern: /^(three|3)$/i, replacement: 'three'}
                            ]
                        },
                        {
                            type: 'fill-in-blank',
                            question: 'The most effective safety approach eliminates _____ through design rather than simply protecting against them with _____ or protective devices.',
                            blanks: ['hazards', 'guards'],
                            explanation: 'Inherent safe design eliminates hazards at the source, which is more effective than relying on guards or protective devices that can fail or be bypassed.',
                            flexibleAnswers: [
                                {pattern: /^hazards?$/i, replacement: 'hazards'},
                                {pattern: /^guards?$/i, replacement: 'guards'}
                            ]
                        }
                    ]
                },
                2: {
                    id: 2,
                    title: 'Guards and Physical Protection Systems',
                    learningObjectives: [
                        'Select appropriate guard types for different applications',
                        'Design guards that meet safety standards and operational requirements',
                        'Understand guard materials and construction requirements',
                        'Implement proper guard mounting and access provisions'
                    ],
                    content: `
                        <h3>Types of Guards and Their Applications</h3>
                        
                        <h4>Fixed Guards</h4>
                        <p>Fixed guards provide permanent protection and cannot be removed without tools. They are the preferred solution when operator access is not required during normal operations.</p>
                        
                        <p><strong>Advantages:</strong></p>
                        <ul>
                            <li>Highest level of protection</li>
                            <li>Cannot be easily bypassed</li>
                            <li>No complex control systems required</li>
                            <li>Lower maintenance requirements</li>
                        </ul>
                        
                        <p><strong>Applications:</strong> Motor enclosures, transmission guards, conveyor covers where no routine access is needed.</p>
                        
                        <h4>Interlocked Guards</h4>
                        <p>Interlocked guards prevent hazardous machine functions when opened and may include guard locking mechanisms to keep guards closed during hazardous conditions.</p>
                        
                        <p><strong>Design Requirements:</strong></p>
                        <ul>
                            <li>Fail-safe operation - guard opening must stop hazardous functions</li>
                            <li>Tamper resistance - switches must be designed to prevent easy defeat</li>
                            <li>Appropriate safety category/performance level for the application</li>
                            <li>Guard locking when stopping time exceeds access time</li>
                        </ul>
                        
                        <h4>Adjustable Guards</h4>
                        <p>Provide protection while allowing necessary adjustments for different workpieces or operations. Common on table saws, grinding machines, and similar equipment.</p>
                        
                        <h3>Guard Design Principles</h3>
                        
                        <h4>Access Prevention</h4>
                        <p>Guards must prevent access based on anthropometric data:</p>
                        <ul>
                            <li><strong>Reach through openings:</strong> Maximum 8mm for finger tips, 25mm for fingers</li>
                            <li><strong>Reach over guards:</strong> Minimum height based on horizontal distance to hazard</li>
                            <li><strong>Reach around guards:</strong> Adequate extension beyond hazard zone</li>
                        </ul>
                        
                        <h4>Structural Requirements</h4>
                        <p>Guards must withstand expected loads and environmental conditions:</p>
                        <ul>
                            <li>Impact resistance appropriate for the application</li>
                            <li>Corrosion resistance in harsh environments</li>
                            <li>Thermal considerations for high-temperature operations</li>
                            <li>Transparency requirements for polycarbonate guards</li>
                        </ul>
                        
                        <h3>Guard Materials Selection</h3>
                        
                        <h4>Metal Guards</h4>
                        <p><strong>Steel:</strong> Excellent strength and impact resistance. Suitable for heavy-duty applications with high impact potential. Consider galvanizing or coating for corrosion protection.</p>
                        
                        <p><strong>Aluminum:</strong> Good strength-to-weight ratio with natural corrosion resistance. Ideal for food processing and clean environments.</p>
                        
                        <h4>Transparent Guards</h4>
                        <p><strong>Polycarbonate:</strong> High impact strength and good clarity. Mark with "SAFETY GLAZING" labels and replace when damaged or scratched.</p>
                        
                        <p><strong>Safety Glass:</strong> Excellent clarity but brittle failure mode. Use laminated or tempered types only for appropriate applications.</p>
                        
                        <h4>Mesh Guards</h4>
                        <p>Welded wire mesh or expanded metal provides good visibility while preventing access. Opening size must comply with anthropometric requirements.</p>
                        
                        <h3>R&C Ltd Guard Design Case Study</h3>
                        <p>For a high-speed packaging line, R&C Ltd designed a modular guard system:</p>
                        
                        <ul>
                            <li><strong>Fixed sections:</strong> 3mm aluminum panels for areas with no access requirements</li>
                            <li><strong>Interlocked access doors:</strong> 5mm polycarbonate with magnetic safety switches rated Category 3</li>
                            <li><strong>Adjustable guards:</strong> Telescoping sections for different product sizes</li>
                            <li><strong>Perimeter guarding:</strong> 8mm polycarbonate panels with Category 4 safety light curtains</li>
                        </ul>
                        
                        <p>The modular design reduced installation time by 40% while maintaining full safety compliance.</p>
                        
                        <div class="safety-tip">
                            <strong>Design Tip:</strong> Guards should feel like an integral part of the machine, not an afterthought. Good guard design enhances both safety and operational efficiency.
                        </div>
                    `,
                    questions: [
                        {
                            type: 'multiple-choice',
                            question: 'What is the maximum opening size to prevent finger access to hazards?',
                            options: [
                                '4mm',
                                '8mm',
                                '25mm',
                                '50mm'
                            ],
                            correct: 2,
                            explanation: 'A maximum opening of 25mm prevents fingers from reaching through to hazards, based on anthropometric data in safety standards.'
                        },
                        {
                            type: 'multiple-choice',
                            question: 'Which type of guard provides the highest level of protection?',
                            options: [
                                'Adjustable guards',
                                'Interlocked guards',
                                'Fixed guards',
                                'Removable guards'
                            ],
                            correct: 2,
                            explanation: 'Fixed guards provide the highest level of protection because they cannot be easily removed or bypassed and require no complex control systems.'
                        },
                        {
                            type: 'fill-in-blank',
                            question: 'Polycarbonate guards must be marked with "_____ _____" labels and should be replaced when _____ or scratched.',
                            blanks: ['SAFETY GLAZING', 'damaged'],
                            explanation: 'Safety glazing labels identify polycarbonate guards as safety-rated materials, and damaged guards lose their protective capability.',
                            flexibleAnswers: [
                                {pattern: /^(safety\s*glazing|safety glazing)$/i, replacement: 'SAFETY GLAZING'},
                                {pattern: /^damaged?$/i, replacement: 'damaged'}
                            ]
                        }
                    ]
                },
                3: {
                    id: 3,
                    title: 'Interlocking Systems and Safety Controls',
                    learningObjectives: [
                        'Design and implement proper interlocking systems',
                        'Select appropriate safety switches and devices',
                        'Understand safety circuit design principles',
                        'Apply safety categories and performance levels'
                    ],
                    content: `
                        <h3>Principles of Safety Interlocking</h3>
                        <p>Interlocking systems ensure that hazardous machine functions cannot operate when guards are open or when personnel are in dangerous areas. Proper interlocking requires careful consideration of switch selection, circuit design, and failure modes.</p>
                        
                        <h4>Interlock Switch Technologies</h4>
                        
                        <h5>Mechanical Safety Switches</h5>
                        <p>Traditional lever and hinge switches provide reliable operation through physical contact. Key characteristics:</p>
                        <ul>
                            <li>Positive opening action ensures contacts separate even if welded</li>
                            <li>High current switching capability for direct load control</li>
                            <li>Proven technology with long service history</li>
                            <li>Visible actuation for troubleshooting</li>
                        </ul>
                        
                        <h5>Magnetic Safety Switches</h5>
                        <p>Non-contact operation using coded magnetic actuators provides several advantages:</p>
                        <ul>
                            <li>No mechanical wear from repeated operations</li>
                            <li>Sealed construction resists contamination</li>
                            <li>Difficult to defeat with simple tools</li>
                            <li>Multiple coding levels available for security</li>
                        </ul>
                        
                        <h5>RFID Safety Switches</h5>
                        <p>Radio frequency identification provides the highest security against tampering:</p>
                        <ul>
                            <li>Unique coded transponders virtually impossible to duplicate</li>
                            <li>Diagnostic capabilities detect tampering attempts</li>
                            <li>Multiple safety outputs for different functions</li>
                            <li>Integration with safety controllers for complex logic</li>
                        </ul>
                        
                        <h3>Safety Circuit Design Principles</h3>
                        
                        <h4>Redundancy and Monitoring</h4>
                        <p>Higher safety categories require redundant circuits with cross-monitoring:</p>
                        
                        <p><strong>Category 2:</strong> Test intervals verify system function using test signals</p>
                        <p><strong>Category 3:</strong> Single fault tolerance with fault detection at next operation</p>
                        <p><strong>Category 4:</strong> Single fault tolerance with immediate fault detection</p>
                        
                        <h4>Common Cause Failures</h4>
                        <p>Avoid single points of failure that can affect multiple safety channels:</p>
                        <ul>
                            <li>Separate routing for redundant cables</li>
                            <li>Different switching technologies in parallel channels</li>
                            <li>Independent power supplies for safety circuits</li>
                            <li>Protection against electromagnetic interference</li>
                        </ul>
                        
                        <h3>Guard Locking Systems</h3>
                        <p>When machine stopping time exceeds the time required to reach the hazard, guard locking prevents access until the machine reaches a safe state.</p>
                        
                        <h4>Solenoid Locking</h4>
                        <p>Electromagnetic locks hold guards closed during hazardous conditions:</p>
                        <ul>
                            <li>Spring-biased to unlocked position (fail-safe)</li>
                            <li>Force monitoring to detect jamming or tampering</li>
                            <li>Manual release for emergency situations</li>
                            <li>Integration with safety control systems</li>
                        </ul>
                        
                        <h4>Mechanical Locking</h4>
                        <p>Positive mechanical engagement prevents guard opening:</p>
                        <ul>
                            <li>Bolt locks for high-force applications</li>
                            <li>Cam locks for frequent access requirements</li>
                            <li>Trapped key systems for procedural enforcement</li>
                        </ul>
                        
                        <h3>R&C Ltd Interlocking Implementation</h3>
                        <p>For a metal stamping press application, R&C Ltd implemented a comprehensive interlocking system:</p>
                        
                        <ol>
                            <li><strong>Perimeter Guards:</strong> Category 4 rated magnetic switches with unique coding</li>
                            <li><strong>Access Gates:</strong> RFID switches with solenoid guard locking</li>
                            <li><strong>Light Curtains:</strong> Type 4 devices with 30mm resolution for die area protection</li>
                            <li><strong>Emergency Stops:</strong> Category 0 stopping with mechanical latching</li>
                            <li><strong>Control Integration:</strong> Safety PLC coordinating all protective devices</li>
                        </ol>
                        
                        <p>The system achieved Performance Level e (PLe) with a calculated PFH of 1.2 × 10⁻⁸, well within the required range.</p>
                        
                        <div class="safety-tip">
                            <strong>Critical Point:</strong> Interlocking systems must be designed so that defeating one protection device doesn't compromise the entire safety system. Defense in depth is essential.
                        </div>
                    `,
                    questions: [
                        {
                            type: 'multiple-choice',
                            question: 'Which safety category requires single fault tolerance with immediate fault detection?',
                            options: [
                                'Category 2',
                                'Category 3',
                                'Category 4',
                                'Category B'
                            ],
                            correct: 2,
                            explanation: 'Category 4 requires single fault tolerance with immediate fault detection, providing the highest level of safety for control systems.'
                        },
                        {
                            type: 'multiple-choice',
                            question: 'When is guard locking required?',
                            options: [
                                'Always with interlocked guards',
                                'When stopping time exceeds access time',
                                'Only for Category 4 systems',
                                'When using RFID switches'
                            ],
                            correct: 1,
                            explanation: 'Guard locking is required when the machine stopping time exceeds the time required for a person to reach the hazard after opening the guard.'
                        },
                        {
                            type: 'fill-in-blank',
                            question: '_____ safety switches use coded magnetic actuators and provide non-contact operation, while _____ switches use radio frequency identification for the highest security.',
                            blanks: ['Magnetic', 'RFID'],
                            explanation: 'Magnetic safety switches use coded magnetic actuators for non-contact operation, while RFID switches provide the highest security through unique coded transponders.',
                            flexibleAnswers: [
                                {pattern: /^magnetic$/i, replacement: 'Magnetic'},
                                {pattern: /^(rfid|r\.f\.i\.d\.)$/i, replacement: 'RFID'}
                            ]
                        }
                    ]
                }
            }
        },
        electrical: {
            id: 'electrical',
            title: 'Electrical Design Safety',
            description: 'Comprehensive electrical safety covering IEC 60204-1, protective bonding, circuit protection, and safe design practices.',
            duration: '5-6 hours',
            difficulty: 'Advanced',
            chapters: {
                1: {
                    id: 1,
                    title: 'IEC 60204-1 Electrical Safety Fundamentals',
                    learningObjectives: [
                        'Understand IEC 60204-1 requirements for machine electrical equipment',
                        'Apply proper electrical safety principles in machine design',
                        'Implement appropriate protective measures and devices',
                        'Design safe electrical control systems'
                    ],
                    content: `
                        <h3>Introduction to IEC 60204-1</h3>
                        <p>IEC 60204-1 is the international standard for electrical equipment of machines, providing comprehensive requirements for the electrical safety of industrial machinery. This standard ensures electrical safety through proper design, installation, and maintenance practices.</p>
                        
                        <h4>Scope and Application</h4>
                        <p>IEC 60204-1 applies to electrical equipment operating at voltages up to 1000V AC or 1500V DC, including:</p>
                        <ul>
                            <li>Control circuits and their components</li>
                            <li>Power circuits for motors and actuators</li>
                            <li>Protective devices and emergency stopping systems</li>
                            <li>Electrical enclosures and their accessibility</li>
                        </ul>
                        
                        <h3>Electrical Safety Principles</h3>
                        
                        <h4>Protection Against Electric Shock</h4>
                        <p>The standard requires multiple levels of protection:</p>
                        
                        <p><strong>Basic Protection (formerly Direct Contact):</strong></p>
                        <ul>
                            <li>Insulation of live parts</li>
                            <li>Barriers and enclosures (IP protection levels)</li>
                            <li>Placing out of reach or in restricted access areas</li>
                        </ul>
                        
                        <p><strong>Fault Protection (formerly Indirect Contact):</strong></p>
                        <ul>
                            <li>Protective bonding and earthing</li>
                            <li>Residual current devices (RCDs)</li>
                            <li>Double or reinforced insulation</li>
                            <li>Electrical separation</li>
                        </ul>
                        
                        <h4>Emergency Stop Requirements</h4>
                        <p>Emergency stop systems must provide Category 0 or Category 1 stopping according to IEC 60204-1:</p>
                        
                        <p><strong>Category 0:</strong> Immediate removal of power to machine actuators (uncontrolled stop)</p>
                        <p><strong>Category 1:</strong> Controlled stop with power removal after the stop is achieved</p>
                        
                        <h3>Control Circuit Design</h3>
                        
                        <h4>Voltage Levels and Isolation</h4>
                        <p>Control circuits typically operate at reduced voltages for enhanced safety:</p>
                        <ul>
                            <li><strong>24V DC:</strong> Most common for digital I/O and safety circuits</li>
                            <li><strong>48V DC:</strong> Used for higher power control devices</li>
                            <li><strong>120V AC:</strong> Traditional control voltage, requires additional protection</li>
                        </ul>
                        
                        <h4>Control Transformers</h4>
                        <p>Isolation transformers for control circuits must meet specific requirements:</p>
                        <ul>
                            <li>Primary and secondary windings isolated to 500V test voltage minimum</li>
                            <li>Proper ratio for desired control voltage</li>
                            <li>Adequate power rating for connected loads</li>
                            <li>Short-circuit protection on both primary and secondary</li>
                        </ul>
                        
                        <h3>Enclosure and IP Ratings</h3>
                        <p>Electrical enclosures must provide appropriate protection based on environmental conditions:</p>
                        
                        <ul>
                            <li><strong>IP20:</strong> Basic protection against solid objects >12mm (standard office/clean industrial)</li>
                            <li><strong>IP54:</strong> Protection against dust and water splashing (general industrial)</li>
                            <li><strong>IP65:</strong> Complete dust protection and protection against water jets (harsh industrial)</li>
                            <li><strong>IP67:</strong> Complete dust protection and temporary immersion protection (washdown applications)</li>
                        </ul>
                        
                        <h3>R&C Ltd Electrical Design Example</h3>
                        <p>For a food processing conveyor system, R&C Ltd implemented IEC 60204-1 requirements:</p>
                        
                        <ol>
                            <li><strong>Power Distribution:</strong> 400V three-phase with TN-S earthing system</li>
                            <li><strong>Control Circuits:</strong> 24V DC SELV system with isolated power supply</li>
                            <li><strong>Emergency Stops:</strong> Category 0 stops with safety relay monitoring</li>
                            <li><strong>Enclosures:</strong> IP65 rated stainless steel for washdown environment</li>
                            <li><strong>Protection:</strong> RCD protection (30mA) for all circuits</li>
                        </ol>
                        
                        <p>The design achieved full compliance with IEC 60204-1 while meeting food safety requirements for regular washdown procedures.</p>
                        
                        <div class="safety-tip">
                            <strong>Key Principle:</strong> Electrical safety is achieved through multiple independent protective measures. No single protection method should be relied upon exclusively.
                        </div>
                    `,
                    questions: [
                        {
                            type: 'multiple-choice',
                            question: 'What is the voltage range covered by IEC 60204-1?',
                            options: [
                                'Up to 500V AC or 750V DC',
                                'Up to 1000V AC or 1500V DC',
                                'Up to 690V AC or 1000V DC',
                                'Up to 1500V AC or 2000V DC'
                            ],
                            correct: 1,
                            explanation: 'IEC 60204-1 applies to electrical equipment operating at voltages up to 1000V AC or 1500V DC.'
                        },
                        {
                            type: 'multiple-choice',
                            question: 'What type of stopping does a Category 0 emergency stop provide?',
                            options: [
                                'Controlled stop with power maintained',
                                'Controlled stop with power removal after stop',
                                'Immediate removal of power (uncontrolled stop)',
                                'Gradual power reduction'
                            ],
                            correct: 2,
                            explanation: 'Category 0 emergency stop provides immediate removal of power to machine actuators, resulting in an uncontrolled stop for maximum safety.'
                        },
                        {
                            type: 'fill-in-blank',
                            question: 'Control transformers must have primary and secondary windings isolated to _____ V test voltage minimum, and IP_____ enclosures provide complete dust protection and protection against water jets.',
                            blanks: ['500', '65'],
                            explanation: 'Control transformers require 500V minimum isolation between windings, and IP65 enclosures provide complete dust protection and water jet protection.',
                            flexibleAnswers: [
                                {pattern: /^(500|five hundred)$/i, replacement: '500'},
                                {pattern: /^(65|sixty-five)$/i, replacement: '65'}
                            ]
                        }
                    ]
                },
                2: {
                    id: 2,
                    title: 'Protective Bonding and Earthing Systems',
                    learningObjectives: [
                        'Understand the principles of protective bonding and earthing',
                        'Design proper earthing systems for machinery',
                        'Implement equipotential bonding requirements',
                        'Select appropriate earthing conductors and connections'
                    ],
                    content: `
                        <h3>Fundamental Principles of Protective Earthing</h3>
                        <p>Protective earthing (grounding) is a critical safety measure that provides a low-impedance path for fault currents, ensuring rapid operation of protective devices and preventing dangerous voltages on exposed metalwork.</p>
                        
                        <h4>Types of Earthing Systems</h4>
                        
                        <h5>TN Systems (Terra Neutral)</h5>
                        <p><strong>TN-S System:</strong> Separate neutral and protective conductors throughout. Provides the most reliable earthing with dedicated protective earth conductor.</p>
                        
                        <p><strong>TN-C System:</strong> Combined neutral and protective conductor (PEN). Common in older installations but not recommended for new machinery due to neutral current in protective conductor.</p>
                        
                        <p><strong>TN-C-S System:</strong> Combined PEN conductor in part of the system, separate N and PE elsewhere. Commonly used in building electrical systems.</p>
                        
                        <h5>TT System (Terra Terra)</h5>
                        <p>Equipment earthing independent of supply neutral earthing. Requires RCD protection due to higher earth loop impedance. Common in rural installations with overhead lines.</p>
                        
                        <h5>IT System (Isolated Terra)</h5>
                        <p>Supply not earthed or earthed through high impedance. Provides continuity of supply during first earth fault but requires insulation monitoring and skilled maintenance personnel.</p>
                        
                        <h3>Protective Bonding Requirements</h3>
                        
                        <h4>Main Equipotential Bonding</h4>
                        <p>Connects all metallic parts that may introduce earth potential to the main earthing terminal:</p>
                        <ul>
                            <li>Water pipes and gas pipes</li>
                            <li>Structural steelwork</li>
                            <li>Air conditioning and ventilation ducting</li>
                            <li>Cable conduits and trunking</li>
                        </ul>
                        
                        <h4>Supplementary Equipotential Bonding</h4>
                        <p>Additional bonding in specific areas where increased risk exists:</p>
                        <ul>
                            <li>Machine frames and enclosures</li>
                            <li>Metallic conduits and cable trays</li>
                            <li>Exposed conductive parts of electrical equipment</li>
                            <li>Extraneous conductive parts within reach</li>
                        </ul>
                        
                        <h3>Earth Conductor Sizing</h3>
                        <p>Protective conductors must be sized to carry fault current safely:</p>
                        
                        <h4>Standard Sizing Rules</h4>
                        <ul>
                            <li><strong>Line conductor ≤ 16mm²:</strong> PE conductor same size as line conductor</li>
                            <li><strong>Line conductor 16-35mm²:</strong> PE conductor minimum 16mm²</li>
                            <li><strong>Line conductor > 35mm²:</strong> PE conductor minimum half the line conductor area</li>
                        </ul>
                        
                        <h4>Calculation Method</h4>
                        <p>For specific applications, calculate minimum cross-sectional area:</p>
                        <p><strong>S = I√t / k</strong></p>
                        <p>Where:</p>
                        <ul>
                            <li>S = cross-sectional area (mm²)</li>
                            <li>I = fault current (A)</li>
                            <li>t = disconnection time (s)</li>
                            <li>k = material factor (copper: 143, aluminum: 95)</li>
                        </ul>
                        
                        <h3>Earth Electrode Systems</h3>
                        
                        <h4>Types of Earth Electrodes</h4>
                        <p><strong>Rod Electrodes:</strong> Copper-bonded steel rods driven vertically into the ground. Easy to install and suitable for most soil conditions.</p>
                        
                        <p><strong>Plate Electrodes:</strong> Copper or steel plates buried horizontally. Effective in areas with limited depth access.</p>
                        
                        <p><strong>Tape/Strip Electrodes:</strong> Copper or steel strips buried horizontally. Provide large contact area with soil.</p>
                        
                        <h4>Soil Resistivity Considerations</h4>
                        <p>Earth electrode effectiveness depends on soil conditions:</p>
                        <ul>
                            <li><strong>Clay soil:</strong> 10-100 Ω⋅m (good conductivity)</li>
                            <li><strong>Sand and gravel:</strong> 100-1000 Ω⋅m (moderate conductivity)</li>
                            <li><strong>Rock:</strong> 1000-10000 Ω⋅m (poor conductivity)</li>
                        </ul>
                        
                        <h3>R&C Ltd Earthing System Design</h3>
                        <p>For a large industrial robot installation, R&C Ltd designed a comprehensive earthing system:</p>
                        
                        <ol>
                            <li><strong>Main Earth Terminal:</strong> Copper busbar in main electrical panel</li>
                            <li><strong>Equipment Bonding:</strong> 16mm² copper conductors to all robot frames</li>
                            <li><strong>Functional Earth:</strong> Separate 4mm² conductors for signal references</li>
                            <li><strong>Earth Electrode:</strong> Ring of 10 copper rods achieving 1Ω total resistance</li>
                            <li><strong>Testing Points:</strong> Accessible test links for periodic verification</li>
                        </ol>
                        
                        <p>The system achieved earth loop impedance values well below the maximum permitted for the protective devices used, ensuring reliable fault clearance.</p>
                        
                        <div class="safety-tip">
                            <strong>Critical Safety Point:</strong> Earthing systems must be tested during installation and periodically thereafter. Poor earthing can be worse than no earthing if it provides false sense of security.
                        </div>
                    `,
                    questions: [
                        {
                            type: 'multiple-choice',
                            question: 'In a TN-S earthing system, what characterizes the neutral and protective conductors?',
                            options: [
                                'They are combined throughout the system',
                                'They are separate throughout the system',
                                'They are combined at the equipment only',
                                'They are not connected to earth'
                            ],
                            correct: 1,
                            explanation: 'In a TN-S system, the neutral (N) and protective earth (PE) conductors are separate throughout the entire system, providing the most reliable earthing arrangement.'
                        },
                        {
                            type: 'multiple-choice',
                            question: 'For line conductors larger than 35mm², what is the minimum size for the protective earth conductor?',
                            options: [
                                'Same size as line conductor',
                                'Minimum 16mm²',
                                'Half the line conductor area',
                                'Minimum 25mm²'
                            ],
                            correct: 2,
                            explanation: 'For line conductors greater than 35mm², the protective earth conductor must be at least half the cross-sectional area of the line conductor.'
                        },
                        {
                            type: 'fill-in-blank',
                            question: 'The formula for calculating protective conductor cross-sectional area is S = I√t / k, where k is the material factor: _____ for copper and _____ for aluminum.',
                            blanks: ['143', '95'],
                            explanation: 'The material factor k is 143 for copper conductors and 95 for aluminum conductors in the protective conductor sizing calculation.',
                            flexibleAnswers: [
                                {pattern: /^(143|one hundred forty-three)$/i, replacement: '143'},
                                {pattern: /^(95|ninety-five)$/i, replacement: '95'}
                            ]
                        }
                    ]
                },
                3: {
                    id: 3,
                    title: 'Circuit Protection and Overcurrent Devices',
                    learningObjectives: [
                        'Select appropriate circuit protection devices',
                        'Understand coordination between protection devices',
                        'Design proper motor protection circuits',
                        'Implement fault current calculations and device ratings'
                    ],
                    content: `
                        <h3>Principles of Circuit Protection</h3>
                        <p>Circuit protection serves multiple critical functions: preventing fire hazards from overcurrent, protecting equipment from damage, and ensuring reliable operation of electrical systems. Proper protection requires careful selection and coordination of devices.</p>
                        
                        <h4>Types of Overcurrent</h4>
                        
                        <h5>Overload Current</h5>
                        <p>Current exceeding the rated current but remaining within the normal circuit path. Typically 1.1 to 6 times normal current. Causes include:</p>
                        <ul>
                            <li>Mechanical overloading of motors</li>
                            <li>Excessive connected load</li>
                            <li>Voltage reduction causing increased current</li>
                            <li>Blocked ventilation causing temperature rise</li>
                        </ul>
                        
                        <h5>Short Circuit Current</h5>
                        <p>Current flowing outside the normal circuit path due to insulation failure or accidental contact. Extremely high magnitude (10 to 50 times normal current) requiring rapid interruption.</p>
                        
                        <h3>Protection Device Types</h3>
                        
                        <h4>Molded Case Circuit Breakers (MCCBs)</h4>
                        <p>Provide protection against both overload and short circuit currents in a single device:</p>
                        
                        <p><strong>Thermal-Magnetic Trip Units:</strong></p>
                        <ul>
                            <li>Thermal element for overload protection (inverse time characteristic)</li>
                            <li>Magnetic element for short circuit protection (instantaneous)</li>
                            <li>Adjustable trip settings on larger frames</li>
                            <li>High interrupting capacity for fault current protection</li>
                        </ul>
                        
                        <p><strong>Electronic Trip Units:</strong></p>
                        <ul>
                            <li>Precise current measurement using current transformers</li>
                            <li>Programmable trip curves and settings</li>
                            <li>Ground fault protection capabilities</li>
                            <li>Communication and monitoring functions</li>
                        </ul>
                        
                        <h4>Fuses</h4>
                        <p>Single-use devices that provide excellent short circuit protection:</p>
                        
                        <p><strong>Class J Fuses:</strong> Current-limiting with high interrupting rating (200kA). Excellent for motor starter protection.</p>
                        
                        <p><strong>Class RK1/RK5 Fuses:</strong> Current-limiting with good overload characteristics. Common in general circuits.</p>
                        
                        <p><strong>Semiconductor Fuses:</strong> Ultra-fast operation for protecting electronic devices like drives and soft starters.</p>
                        
                        <h3>Motor Protection Requirements</h3>
                        
                        <h4>Overload Protection</h4>
                        <p>Motors require protection against sustained overcurrent that could damage windings:</p>
                        
                        <ul>
                            <li><strong>Thermal Overloads:</strong> Bi-metallic devices that respond to current and ambient temperature</li>
                            <li><strong>Electronic Overloads:</strong> Current transformers with electronic trip units for precise protection</li>
                            <li><strong>Motor Protection Relays:</strong> Comprehensive protection including phase loss, phase imbalance, and undervoltage</li>
                        </ul>
                        
                        <h4>Short Circuit Protection</h4>
                        <p>High-magnitude fault current protection for motor circuits:</p>
                        
                        <ul>
                            <li>Sized for motor inrush current (typically 6-8 times full load)</li>
                            <li>Coordination with overload devices</li>
                            <li>Adequate interrupting capacity for available fault current</li>
                        </ul>
                        
                        <h3>Protection Coordination</h3>
                        <p>Proper coordination ensures that the protective device closest to the fault operates first, minimizing system disruption.</p>
                        
                        <h4>Selective Coordination</h4>
                        <p>Upstream devices must not trip for faults handled by downstream devices:</p>
                        
                        <ul>
                            <li>Time-current curve analysis</li>
                            <li>Current-limiting effects</li>
                            <li>Let-through energy calculations</li>
                            <li>Zone selective interlocking for instantaneous coordination</li>
                        </ul>
                        
                        <h4>Arc Flash Considerations</h4>
                        <p>Fast fault clearing reduces arc flash incident energy:</p>
                        
                        <ul>
                            <li>Zone selective interlocking for 0.1-second clearing</li>
                            <li>Current-limiting devices to reduce peak let-through current</li>
                            <li>Maintenance mode switches for slower coordination during maintenance</li>
                        </ul>
                        
                        <h3>R&C Ltd Protection System Design</h3>
                        <p>For a manufacturing facility with multiple production lines, R&C Ltd designed a coordinated protection system:</p>
                        
                        <ol>
                            <li><strong>Main Service:</strong> 1600A electronic trip breaker with zone selective interlocking</li>
                            <li><strong>Distribution Panels:</strong> 400A thermal-magnetic breakers with 0.2-second intentional delay</li>
                            <li><strong>Motor Starters:</strong> Class J fuses with electronic overload relays</li>
                            <li><strong>Control Circuits:</strong> 2A supplementary protectors with UL 508 listing</li>
                            <li><strong>Coordination Study:</strong> Computer analysis ensuring selective operation up to 10kA</li>
                        </ol>
                        
                        <p>The system achieved selective coordination for all fault levels while meeting NEC arc flash requirements.</p>
                        
                        <div class="safety-tip">
                            <strong>Design Principle:</strong> Protection devices must be rated for the available fault current and coordinate properly. An improperly rated device may fail to clear a fault, creating a serious fire and explosion hazard.
                        </div>
                    `,
                    questions: [
                        {
                            type: 'multiple-choice',
                            question: 'What is the typical range of motor inrush current compared to full load current?',
                            options: [
                                '2-3 times full load',
                                '4-5 times full load',
                                '6-8 times full load',
                                '10-12 times full load'
                            ],
                            correct: 2,
                            explanation: 'Motor inrush current is typically 6-8 times the full load current during starting, which protection devices must accommodate without nuisance tripping.'
                        },
                        {
                            type: 'multiple-choice',
                            question: 'Which fuse class provides current-limiting with high interrupting rating suitable for motor starter protection?',
                            options: [
                                'Class RK1',
                                'Class RK5',
                                'Class J',
                                'Class T'
                            ],
                            correct: 2,
                            explanation: 'Class J fuses are current-limiting with high interrupting ratings (200kA) and are commonly used for motor starter protection.'
                        },
                        {
                            type: 'fill-in-blank',
                            question: 'Circuit breakers with _____ trip units use current transformers for precise measurement, while _____-_____ trip units use bi-metallic and magnetic elements.',
                            blanks: ['electronic', 'thermal-magnetic'],
                            explanation: 'Electronic trip units use current transformers for precise current measurement, while thermal-magnetic trip units use bi-metallic elements for overload protection and magnetic elements for short circuit protection.',
                            flexibleAnswers: [
                                {pattern: /^electronic$/i, replacement: 'electronic'},
                                {pattern: /^(thermal-magnetic|thermal magnetic)$/i, replacement: 'thermal-magnetic'}
                            ]
                        }
                    ]
                }
            }
        },
        panel: {
            id: 'panel',
            title: 'Panel Building Safety',
            description: 'Comprehensive panel building safety covering IEC 61439, creepage and clearance distances, and testing procedures.',
            duration: '4-5 hours',
            difficulty: 'Advanced',
            chapters: {
                1: {
                    id: 1,
                    title: 'IEC 61439 Switchgear Standards',
                    learningObjectives: [
                        'Understand IEC 61439 requirements for low-voltage switchgear',
                        'Apply proper design verification and routine testing procedures',
                        'Implement appropriate temperature rise and dielectric testing',
                        'Design panels meeting safety and performance requirements'
                    ],
                    content: `
                        <h3>Introduction to IEC 61439 Series</h3>
                        <p>IEC 61439 is the international standard for low-voltage switchgear and controlgear assemblies, replacing the older IEC 60439 series. This standard provides comprehensive requirements for design, testing, and verification of electrical panels and switchboards.</p>
                        
                        <h4>Standard Structure</h4>
                        <ul>
                            <li><strong>IEC 61439-1:</strong> General rules and requirements</li>
                            <li><strong>IEC 61439-2:</strong> Power switchgear and controlgear assemblies (PSC)</li>
                            <li><strong>IEC 61439-3:</strong> Distribution boards for non-skilled persons (ASD)</li>
                            <li><strong>IEC 61439-4:</strong> Construction site assemblies (ACS)</li>
                            <li><strong>IEC 61439-5:</strong> Public electricity supply distribution assemblies</li>
                            <li><strong>IEC 61439-6:</strong> Busway systems</li>
                        </ul>
                        
                        <h3>Design Verification Requirements</h3>
                        <p>IEC 61439-1 requires comprehensive design verification through testing or calculation to demonstrate compliance with performance requirements.</p>
                        
                        <h4>Mandatory Verification Tests</h4>
                        
                        <h5>1. Dielectric Properties</h5>
                        <p>Verification of insulation integrity:</p>
                        <ul>
                            <li><strong>Power frequency withstand test:</strong> 2.5kV AC for 1 minute for 400V systems</li>
                            <li><strong>Impulse voltage test:</strong> 6kV peak for pollution degree 3 environments</li>
                            <li><strong>Verification of clearances:</strong> Ensure adequate air gaps for voltage stress</li>
                        </ul>
                        
                        <h5>2. Temperature Rise</h5>
                        <p>Critical for ensuring safe operation and component life:</p>
                        <ul>
                            <li>Thermal testing at rated current and ambient conditions</li>
                            <li>Maximum temperature limits for different materials and components</li>
                            <li>Verification of heat dissipation and ventilation design</li>
                            <li>Derating calculations for ambient temperatures above 35°C</li>
                        </ul>
                        
                        <h5>3. Short-Circuit Withstand</h5>
                        <p>Demonstration of panel ability to withstand fault currents:</p>
                        <ul>
                            <li>Calculation of prospective short-circuit current</li>
                            <li>Verification of busbar and connection integrity</li>
                            <li>Assessment of electromagnetic forces during faults</li>
                        </ul>
                        
                        <h5>4. Electromagnetic Compatibility (EMC)</h5>
                        <p>Ensuring proper operation in electromagnetic environments:</p>
                        <ul>
                            <li>Immunity testing for control circuits</li>
                            <li>Emission limits for switching operations</li>
                            <li>Proper cable routing and shielding</li>
                        </ul>
                        
                        <h3>Assembly Categories and Types</h3>
                        
                        <h4>Type of Assembly</h4>
                        <p><strong>Type-tested Assembly (TTA):</strong> Design verified by testing a representative assembly</p>
                        <p><strong>Partially Type-tested Assembly (PTTA):</strong> Combination of tested and calculated verification</p>
                        
                        <h4>Form of Internal Separation</h4>
                        <p>Defines the degree of separation between functional units:</p>
                        <ul>
                            <li><strong>Form 1:</strong> No internal separation</li>
                            <li><strong>Form 2:</strong> Separation of busbars from functional units</li>
                            <li><strong>Form 3:</strong> Separation of busbars and functional units from each other</li>
                            <li><strong>Form 4:</strong> Separation of busbars, functional units, and terminals</li>
                        </ul>
                        
                        <h3>Routine Testing Requirements</h3>
                        <p>Every manufactured assembly must undergo routine testing to verify proper construction:</p>
                        
                        <ol>
                            <li><strong>Insulation Test:</strong> Dielectric strength verification at reduced voltage</li>
                            <li><strong>Continuity Test:</strong> Verification of protective bonding circuits</li>
                            <li><strong>Function Test:</strong> Operation of all switching devices and interlocks</li>
                            <li><strong>Visual Inspection:</strong> Compliance with drawings and standards</li>
                        </ol>
                        
                        <h3>R&C Ltd Panel Design Application</h3>
                        <p>For a pharmaceutical manufacturing facility, R&C Ltd designed switchgear assemblies meeting IEC 61439 requirements:</p>
                        
                        <ul>
                            <li><strong>Type:</strong> PTTA with calculated verification for standard configurations</li>
                            <li><strong>Form:</strong> Form 3b separation for maintenance safety</li>
                            <li><strong>Rating:</strong> 630A main busbar, 65kA short-circuit withstand</li>
                            <li><strong>Environment:</strong> IP54 enclosures for cleanroom compatibility</li>
                            <li><strong>Testing:</strong> Full design verification including temperature rise testing</li>
                        </ul>
                        
                        <p>The design achieved 20% better thermal performance than minimum requirements, ensuring reliable operation in high-temperature production areas.</p>
                        
                        <div class="safety-tip">
                            <strong>Quality Assurance:</strong> IEC 61439 compliance requires rigorous design verification and routine testing. Shortcuts in testing can result in unsafe assemblies that may fail catastrophically in service.
                        </div>
                    `,
                    questions: [
                        {
                            type: 'multiple-choice',
                            question: 'What is the power frequency withstand test voltage for 400V systems according to IEC 61439?',
                            options: [
                                '1.5kV AC for 1 minute',
                                '2.0kV AC for 1 minute',
                                '2.5kV AC for 1 minute',
                                '3.0kV AC for 1 minute'
                            ],
                            correct: 2,
                            explanation: 'IEC 61439 requires a power frequency withstand test of 2.5kV AC for 1 minute for 400V systems to verify dielectric properties.'
                        },
                        {
                            type: 'multiple-choice',
                            question: 'Which form of internal separation provides separation of busbars, functional units, and terminals?',
                            options: [
                                'Form 1',
                                'Form 2',
                                'Form 3',
                                'Form 4'
                            ],
                            correct: 3,
                            explanation: 'Form 4 provides the highest level of internal separation, including separation of busbars, functional units, and terminals.'
                        },
                        {
                            type: 'fill-in-blank',
                            question: 'IEC _____ replaces the older IEC _____ series for low-voltage switchgear standards, and requires both design _____ and routine _____ for compliance.',
                            blanks: ['61439', '60439', 'verification', 'testing'],
                            explanation: 'IEC 61439 replaced IEC 60439 and requires both design verification (through testing or calculation) and routine testing of every manufactured assembly.',
                            flexibleAnswers: [
                                {pattern: /^(61439|61,439)$/i, replacement: '61439'},
                                {pattern: /^(60439|60,439)$/i, replacement: '60439'},
                                {pattern: /^verification$/i, replacement: 'verification'},
                                {pattern: /^testing$/i, replacement: 'testing'}
                            ]
                        }
                    ]
                },
                2: {
                    id: 2,
                    title: 'Creepage and Clearance Requirements',
                    learningObjectives: [
                        'Understand the difference between creepage and clearance distances',
                        'Apply IEC 60664-1 requirements for insulation coordination',
                        'Select appropriate distances based on voltage and pollution degree',
                        'Design layouts meeting safety spacing requirements'
                    ],
                    content: `
                        <h3>Fundamental Concepts</h3>
                        <p>Creepage and clearance distances are critical safety parameters that prevent electrical flashover and tracking between live parts and between live parts and earth. Proper understanding and application of these requirements is essential for safe panel design.</p>
                        
                        <h4>Definitions</h4>
                        <p><strong>Clearance Distance:</strong> The shortest distance through air between two conducting parts or between a conducting part and earth. This is the straight-line distance through air.</p>
                        
                        <p><strong>Creepage Distance:</strong> The shortest distance along the surface of insulating material between two conducting parts or between a conducting part and earth. This path follows the contour of the insulating surface.</p>
                        
                        <h3>IEC 60664-1 Insulation Coordination</h3>
                        <p>IEC 60664-1 provides the fundamental requirements for insulation coordination in low-voltage systems, establishing minimum distances based on system voltage and environmental conditions.</p>
                        
                        <h4>Overvoltage Categories</h4>
                        <p>Systems are classified based on their susceptibility to transient overvoltages:</p>
                        
                        <ul>
                            <li><strong>Category I:</strong> Protected electronic circuits (inside equipment)</li>
                            <li><strong>Category II:</strong> Local level equipment (appliances, portable tools)</li>
                            <li><strong>Category III:</strong> Distribution level (fixed installations, motor control centers)</li>
                            <li><strong>Category IV:</strong> Primary supply level (utility connections, meters)</li>
                        </ul>
                        
                        <h4>Pollution Degrees</h4>
                        <p>Environmental contamination affects insulation performance:</p>
                        
                        <ul>
                            <li><strong>Pollution Degree 1:</strong> Clean environments (sealed enclosures)</li>
                            <li><strong>Pollution Degree 2:</strong> Normal environments (most indoor installations)</li>
                            <li><strong>Pollution Degree 3:</strong> Harsh environments (industrial, outdoor protected)</li>
                            <li><strong>Pollution Degree 4:</strong> Severe environments (outdoor unprotected, heavy contamination)</li>
                        </ul>
                        
                        <h3>Minimum Distance Requirements</h3>
                        
                        <h4>Clearance Distances (Air Gaps)</h4>
                        <p>For 400V systems (Category III, Pollution Degree 2):</p>
                        <ul>
                            <li><strong>Phase to phase:</strong> 5.5mm minimum</li>
                            <li><strong>Phase to earth:</strong> 5.5mm minimum</li>
                            <li><strong>Different circuits:</strong> Based on highest voltage present</li>
                        </ul>
                        
                        <h4>Creepage Distances (Surface Paths)</h4>
                        <p>Dependent on material group and pollution degree:</p>
                        
                        <p><strong>Material Group I (600 ≤ CTI):</strong> Best tracking resistance</p>
                        <ul>
                            <li>Pollution Degree 2: 2.5mm for 400V</li>
                            <li>Pollution Degree 3: 4.0mm for 400V</li>
                        </ul>
                        
                        <p><strong>Material Group II (400 ≤ CTI < 600):</strong> Medium tracking resistance</p>
                        <ul>
                            <li>Pollution Degree 2: 4.0mm for 400V</li>
                            <li>Pollution Degree 3: 6.3mm for 400V</li>
                        </ul>
                        
                        <p><strong>Material Group III (175 ≤ CTI < 400):</strong> Poor tracking resistance</p>
                        <ul>
                            <li>Pollution Degree 2: 8.0mm for 400V</li>
                            <li>Pollution Degree 3: 12.5mm for 400V</li>
                        </ul>
                        
                        <h3>Practical Design Considerations</h3>
                        
                        <h4>Component Selection</h4>
                        <p>Choose components with appropriate insulation ratings:</p>
                        <ul>
                            <li>Terminal blocks with adequate creepage distances</li>
                            <li>Insulating barriers between voltage levels</li>
                            <li>Appropriate insulation classes for operating environment</li>
                        </ul>
                        
                        <h4>Layout Design</h4>
                        <p>Optimize panel layout to maintain required distances:</p>
                        <ul>
                            <li>Group components by voltage level</li>
                            <li>Use physical barriers to increase effective distances</li>
                            <li>Consider manufacturing tolerances in spacing calculations</li>
                            <li>Provide additional margin for field modifications</li>
                        </ul>
                        
                        <h4>Environmental Protection</h4>
                        <p>Enclosure design affects pollution degree determination:</p>
                        <ul>
                            <li>IP ratings determine dust and moisture ingress</li>
                            <li>Ventilation design affects contamination accumulation</li>
                            <li>Material selection for UV resistance and temperature stability</li>
                        </ul>
                        
                        <h3>Testing and Verification</h3>
                        
                        <h4>Tracking Resistance Testing</h4>
                        <p>IEC 60112 test method determines Comparative Tracking Index (CTI):</p>
                        <ul>
                            <li>50 drops of contaminated water applied to material surface</li>
                            <li>Increasing voltage until tracking occurs</li>
                            <li>CTI value determines material group classification</li>
                        </ul>
                        
                        <h4>Routine Verification</h4>
                        <p>Measurement procedures for completed assemblies:</p>
                        <ul>
                            <li>Use appropriate measuring tools (gauges, calipers)</li>
                            <li>Document critical dimensions on assembly drawings</li>
                            <li>Include tolerance analysis for worst-case conditions</li>
                        </ul>
                        
                        <h3>R&C Ltd Creepage and Clearance Application</h3>
                        <p>For a marine environment control panel, R&C Ltd applied enhanced spacing requirements:</p>
                        
                        <ul>
                            <li><strong>Environment:</strong> Pollution Degree 3 (salt spray, humidity)</li>
                            <li><strong>Materials:</strong> Material Group I insulators throughout</li>
                            <li><strong>Clearances:</strong> 8mm minimum (45% above standard requirement)</li>
                            <li><strong>Creepage:</strong> 6mm minimum for 400V circuits</li>
                            <li><strong>Barriers:</strong> Physical separation between voltage levels</li>
                            <li><strong>Testing:</strong> Salt spray testing for 500 hours per IEC 60068-2-11</li>
                        </ul>
                        
                        <p>The enhanced design provided reliable operation in harsh marine conditions with no insulation failures over 5 years of service.</p>
                        
                        <div class="safety-tip">
                            <strong>Design Margin:</strong> Always provide additional margin beyond minimum requirements. Environmental conditions can change, and manufacturing tolerances can reduce effective distances.
                        </div>
                    `,
                    questions: [
                        {
                            type: 'multiple-choice',
                            question: 'What is the difference between clearance and creepage distance?',
                            options: [
                                'Clearance is along surface, creepage is through air',
                                'Clearance is through air, creepage is along surface',
                                'They are the same measurement',
                                'Clearance is always larger than creepage'
                            ],
                            correct: 1,
                            explanation: 'Clearance distance is the shortest distance through air between conductors, while creepage distance is the shortest distance along the surface of insulating material.'
                        },
                        {
                            type: 'multiple-choice',
                            question: 'For a 400V system in Pollution Degree 2 with Material Group I insulators, what is the minimum creepage distance?',
                            options: [
                                '2.5mm',
                                '4.0mm',
                                '6.3mm',
                                '8.0mm'
                            ],
                            correct: 0,
                            explanation: 'For 400V systems in Pollution Degree 2 with Material Group I insulators (CTI ≥ 600), the minimum creepage distance is 2.5mm.'
                        },
                        {
                            type: 'fill-in-blank',
                            question: 'The Comparative Tracking Index (CTI) test per IEC _____ determines material group classification, with Material Group I having CTI ≥ _____ and providing the _____ tracking resistance.',
                            blanks: ['60112', '600', 'best'],
                            explanation: 'IEC 60112 defines the CTI test method, with Material Group I materials having CTI ≥ 600 and providing the best tracking resistance.',
                            flexibleAnswers: [
                                {pattern: /^(60112|60,112)$/i, replacement: '60112'},
                                {pattern: /^(600|six hundred)$/i, replacement: '600'},
                                {pattern: /^best$/i, replacement: 'best'}
                            ]
                        }
                    ]
                },
                3: {
                    id: 3,
                    title: 'Testing and Commissioning Procedures',
                    learningObjectives: [
                        'Implement proper testing procedures for electrical panels',
                        'Conduct safety and performance verification tests',
                        'Document test results and compliance certification',
                        'Understand maintenance and periodic testing requirements'
                    ],
                    content: `
                        <h3>Comprehensive Testing Philosophy</h3>
                        <p>Proper testing and commissioning of electrical panels ensures safety, reliability, and performance throughout the equipment lifecycle. Testing must be systematic, documented, and performed by qualified personnel using calibrated instruments.</p>
                        
                        <h4>Testing Categories</h4>
                        <ul>
                            <li><strong>Factory Acceptance Testing (FAT):</strong> Comprehensive testing at manufacturer's facility</li>
                            <li><strong>Site Acceptance Testing (SAT):</strong> Verification testing after installation</li>
                            <li><strong>Commissioning Tests:</strong> Functional testing with connected loads</li>
                            <li><strong>Periodic Testing:</strong> Ongoing maintenance and safety verification</li>
                        </ul>
                        
                        <h3>Factory Acceptance Testing Procedures</h3>
                        
                        <h4>Visual and Mechanical Inspection</h4>
                        <p><strong>Checklist Items:</strong></p>
                        <ul>
                            <li>Compliance with approved drawings and specifications</li>
                            <li>Proper component mounting and mechanical security</li>
                            <li>Adequate clearances and spacing per standards</li>
                            <li>Quality of workmanship and materials</li>
                            <li>Proper labeling and identification</li>
                            <li>Completeness of documentation package</li>
                        </ul>
                        
                        <h4>Insulation Resistance Testing</h4>
                        <p>Verification of insulation integrity using megohmmeter:</p>
                        
                        <p><strong>Test Voltages:</strong></p>
                        <ul>
                            <li>Circuits rated ≤ 50V: Test at 100V DC</li>
                            <li>Circuits rated 50-500V: Test at 500V DC</li>
                            <li>Circuits rated 500-1000V: Test at 1000V DC</li>
                        </ul>
                        
                        <p><strong>Minimum Acceptable Values:</strong></p>
                        <ul>
                            <li>New installations: ≥ 1000 MΩ per circuit</li>
                            <li>Existing installations: ≥ 1 MΩ per circuit</li>
                            <li>Test duration: 1 minute minimum</li>
                        </ul>
                        
                        <h4>Dielectric Strength Testing</h4>
                        <p>High-voltage testing to verify insulation withstand capability:</p>
                        
                        <p><strong>Test Parameters:</strong></p>
                        <ul>
                            <li>Applied voltage: 2 × rated voltage + 1000V (minimum 1500V)</li>
                            <li>Test duration: 1 minute</li>
                            <li>Current limit: 5mA for protection of sensitive devices</li>
                            <li>Rise/fall rate: ≤ 500V/second</li>
                        </ul>
                        
                        <h4>Protective Bonding Verification</h4>
                        <p>Earth continuity testing using low-resistance ohmmeter:</p>
                        <ul>
                            <li>Test current: Minimum 10A DC or equivalent AC</li>
                            <li>Maximum resistance: 0.1Ω for protective bonding circuits</li>
                            <li>Test all exposed metalwork and equipment frames</li>
                            <li>Verify main earthing terminal connections</li>
                        </ul>
                        
                        <h3>Functional Testing Procedures</h3>
                        
                        <h4>Control Circuit Testing</h4>
                        <p>Systematic verification of all control functions:</p>
                        
                        <ol>
                            <li><strong>Interlocking Verification:</strong> Test all safety interlocks and permissive logic</li>
                            <li><strong>Emergency Stop Testing:</strong> Verify Category 0 or Category 1 stopping performance</li>
                            <li><strong>Indicator Testing:</strong> Check all pilot lights, displays, and alarms</li>
                            <li><strong>Communication Testing:</strong> Verify network communications and protocols</li>
                        </ol>
                        
                        <h4>Protection Device Testing</h4>
                        <p>Verification of protective relay and device settings:</p>
                        
                        <ul>
                            <li><strong>Overcurrent Relays:</strong> Primary and secondary injection testing</li>
                            <li><strong>Motor Protection:</strong> Phase loss, phase imbalance, and thermal testing</li>
                            <li><strong>Ground Fault:</strong> Sensitivity and time delay verification</li>
                            <li><strong>Arc Flash:</strong> Light and current sensor testing where applicable</li>
                        </ul>
                        
                        <h3>Site Testing and Commissioning</h3>
                        
                        <h4>Installation Verification</h4>
                        <p>Confirming proper installation conditions:</p>
                        <ul>
                            <li>Environmental conditions within design parameters</li>
                            <li>Adequate ventilation and clearances maintained</li>
                            <li>Proper torque on all electrical connections</li>
                            <li>Cable termination quality and labeling</li>
                        </ul>
                        
                        <h4>System Integration Testing</h4>
                        <p>End-to-end verification with connected equipment:</p>
                        <ul>
                            <li>Load testing at rated current</li>
                            <li>Sequence of operations verification</li>
                            <li>Fault simulation and response testing</li>
                            <li>Performance under varying load conditions</li>
                        </ul>
                        
                        <h3>Documentation and Certification</h3>
                        
                        <h4>Test Documentation Requirements</h4>
                        <p>Comprehensive record keeping for compliance and maintenance:</p>
                        
                        <ul>
                            <li><strong>Test Certificates:</strong> Signed records of all tests performed</li>
                            <li><strong>Instrument Calibration:</strong> Current calibration certificates for all test equipment</li>
                            <li><strong>Non-Conformance Reports:</strong> Documentation of any deficiencies found</li>
                            <li><strong>Corrective Actions:</strong> Records of remedial work performed</li>
                        </ul>
                        
                        <h4>Compliance Certification</h4>
                        <p>Final certification of standards compliance:</p>
                        <ul>
                            <li>IEC 61439 design verification confirmation</li>
                            <li>Local electrical code compliance</li>
                            <li>Industry-specific requirements (UL, CSA, etc.)</li>
                            <li>Quality management system traceability</li>
                        </ul>
                        
                        <h3>R&C Ltd Testing Excellence Case Study</h3>
                        <p>For a critical pharmaceutical manufacturing facility, R&C Ltd implemented comprehensive testing protocols:</p>
                        
                        <ol>
                            <li><strong>Factory Testing:</strong> 100% functional testing with witness by client representatives</li>
                            <li><strong>Environmental Testing:</strong> Vibration and temperature cycling per IEC 60068</li>
                            <li><strong>EMC Testing:</strong> Immunity and emission testing per IEC 61000 series</li>
                            <li><strong>Site Commissioning:</strong> 7-day continuous operation test under full load</li>
                            <li><strong>Documentation:</strong> Complete test dossier with 25-year retention requirement</li>
                        </ol>
                        
                        <p>The rigorous testing program identified and corrected 12 minor issues before shipment, preventing costly field failures and ensuring 99.97% uptime over the first year of operation.</p>
                        
                        <div class="safety-tip">
                            <strong>Quality First:</strong> Comprehensive testing may seem expensive, but it's far less costly than equipment failure, production downtime, or safety incidents. Never compromise on testing thoroughness.
                        </div>
                    `,
                    questions: [
                        {
                            type: 'multiple-choice',
                            question: 'What is the minimum insulation resistance value for new electrical installations?',
                            options: [
                                '≥ 0.5 MΩ per circuit',
                                '≥ 1 MΩ per circuit',
                                '≥ 500 MΩ per circuit',
                                '≥ 1000 MΩ per circuit'
                            ],
                            correct: 3,
                            explanation: 'New electrical installations should achieve minimum insulation resistance of ≥ 1000 MΩ per circuit to ensure adequate insulation integrity.'
                        },
                        {
                            type: 'multiple-choice',
                            question: 'For dielectric strength testing of 400V circuits, what test voltage should be applied?',
                            options: [
                                '1500V for 1 minute',
                                '1800V for 1 minute',
                                '2000V for 1 minute',
                                '2500V for 1 minute'
                            ],
                            correct: 1,
                            explanation: 'For 400V circuits, the dielectric test voltage is 2 × rated voltage + 1000V = 2 × 400 + 1000 = 1800V for 1 minute.'
                        },
                        {
                            type: 'fill-in-blank',
                            question: 'Protective bonding testing requires a minimum test current of _____ A and maximum resistance of _____ Ω for protective bonding circuits.',
                            blanks: ['10', '0.1'],
                            explanation: 'Protective bonding verification requires minimum 10A test current and maximum 0.1Ω resistance to ensure adequate fault current capability.',
                            flexibleAnswers: [
                                {pattern: /^(10|ten)$/i, replacement: '10'},
                                {pattern: /^(0\.1|0,1|point one)$/i, replacement: '0.1'}
                            ]
                        }
                    ]
                }
            }
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = trainingData;
}
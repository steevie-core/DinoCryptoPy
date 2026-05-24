function openTerminal(crypto) {
    const terminalWindow = window.open("", "", "width=800,height=600");
    terminalWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${crypto} Terminal</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

                body {
                    background: #000;
                    color: #0f0;
                    font-family: 'Orbitron', sans-serif;
                    margin: 0;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .terminal {
                    padding: 20px;
                    border: 2px solid #0f0;
                    width: 80%;
                    height: 80%;
                    overflow: hidden; /* Hide scrollbars */
                    white-space: pre-wrap;
                    position: relative;
                    background: #111;
                    box-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
                    border-radius: 10px;
                }

                .terminal::-webkit-scrollbar {
                    display: none; /* Hide scrollbars in WebKit browsers */
                }

                /* Hide scrollbars in Firefox */
                .terminal {
                    scrollbar-width: none;
                }

                .terminal::before {
                    content: '';
                    position: absolute;
                    top: -5px;
                    left: -5px;
                    width: calc(100% + 10px);
                    height: calc(100% + 10px);
                    border-radius: 10px;
                    border: 1px solid rgba(0, 255, 0, 0.4);
                    box-shadow: 0 0 30px rgba(0, 255, 0, 0.8);
                    z-index: -1;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% {
                        box-shadow: 0 0 30px rgba(0, 255, 0, 0.8);
                    }
                    50% {
                        box-shadow: 0 0 50px rgba(0, 255, 0, 0.8);
                    }
                    100% {
                        box-shadow: 0 0 30px rgba(0, 255, 0, 0.8);
                    }
                }

                .input-container {
                    display: inline;
                }

                .input-prompt {
                    display: inline;
                }

                .input-field {
                    color: #0f0;
                    border: none;
                    background: #111;
                    outline: none;
                    white-space: pre;
                    margin-left: 5px;
                    min-width: 50px;
                    border-bottom: 1px solid #0f0;
                    animation: blink-caret 0.75s step-end infinite;
                }

                @keyframes blink-caret {
                    from, to {
                        border-color: transparent;
                    }
                    50% {
                        border-color: #0f0;
                    }
                }

                .centered-message {
                    width: 100%;
                    text-align: center;
                    font-size: 2em;
                    font-weight: bold;
                    margin-top: 20px;
                    display: none;
                }

                .red {
                    color: #f00;
                    font-weight: bold;
                    font-size: 2em;
                    text-align: center;
                    width: 100%;
                    display: block;
                    margin-top: 20px;
                    background-color: #000;
                    text-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
                }

                .green {
                    color: #0f0;
                    font-weight: bold;
                    font-size: 2em;
                    text-align: center;
                    width: 100%;
                    display: block;
                    margin-top: 20px;
                    background-color: #000;
                    text-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
                }

                .welcome-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    background: rgba(0, 0, 0, 0.8);
                    color: #0f0;
                    font-size: 2em;
                    text-align: center;
                    z-index: 10;
                }

                .welcome-overlay h1 {
                    font-size: 3em;
                    margin: 0;
                    animation: fadeIn 2s ease-out;
                }

                .welcome-overlay p {
                    margin: 20px 0 0;
                    font-size: 1.5em;
                    animation: fadeIn 2s ease-out 1s;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            </style>
        </head>
        <body>
            <div class="terminal" id="terminal">
                <div class="welcome-overlay" id="welcome-overlay">
                    <h1>Welcome Back, Satoshi</h1>
                    <p>Initializing...</p>
                </div>
                <pre id="output"></pre>
            </div>
            <audio id="typing-sound" src="sound/button-50.mp3" preload="auto"></audio>
            <audio id="processing-sound" src="sound/button-44.mp3" preload="auto"></audio>
            <audio id="access-granted-sound" src="sound/button-3.mp3" preload="auto"></audio>
            <audio id="access-denied-sound" src="sound/button-4.mp3" preload="auto"></audio>
            <audio id="terminal-open-sound" src="sound/terminal-open.mp3" preload="auto"></audio>
            <script>
                let terminal = document.getElementById('terminal');
                let outputElement = document.getElementById('output');
                let typingSound = document.getElementById('typing-sound');
                let processingSound = document.getElementById('processing-sound');
                let accessGrantedSound = document.getElementById('access-granted-sound');
                let accessDeniedSound = document.getElementById('access-denied-sound');
                let terminalOpenSound = document.getElementById('terminal-open-sound');
                let welcomeOverlay = document.getElementById('welcome-overlay');
                let userStage = 0;

                function playSound(sound) {
                    if (sound) {
                        sound.currentTime = 0;
                        sound.play().catch(error => {
                            console.error("Error playing sound:", error);
                        });
                    } else {
                        console.error("Sound element not found");
                    }
                }

                function fakeCodeOutput(lines, callback) {
                    let index = 0;
                    const typingSpeed = 200;

                    function appendLine() {
                        if (index < lines.length) {
                            playSound(processingSound);
                            outputElement.textContent += lines[index] + "\\n";
                            index++;
                            terminal.scrollTop = terminal.scrollHeight;
                            setTimeout(appendLine, typingSpeed);
                        } else {
                            callback();
                        }
                    }

                    appendLine();
                }

                function displayPrompt(promptText, callback) {
                    let promptContainer = document.createElement('span');
                    promptContainer.classList.add('input-container');
                    let promptSpan = document.createElement('span');
                    promptSpan.classList.add('input-prompt');
                    promptSpan.textContent = '\\n' + promptText;
                    promptContainer.appendChild(promptSpan);
                    let inputField = document.createElement('span');
                    inputField.contentEditable = 'true';
                    inputField.classList.add('input-field');
                    inputField.classList.add('cursor');
                    inputField.innerText = ' ';
                    promptContainer.appendChild(inputField);
                    outputElement.appendChild(promptContainer);
                    inputField.focus();

                    inputField.addEventListener('keydown', function(event) {
                        playSound(typingSound);
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            inputField.contentEditable = 'false';
                            let userInput = inputField.textContent.trim();
                            promptContainer.innerHTML += '\\n';
                            callback(userInput);
                        }
                    });
                }

                function simulateProcessing(callback) {
                    const processingLines = [
                        'Processing transaction...',
                        'Decrypting data...',
                        'Establishing secure connection...',
                        'Verifying identity...',
                        'Access token validation...',
                        'Checking authorization...',
                        'Calculating hash values...',
                        'Performing integrity checks...',
                        'Loading encryption modules...',
                        'Synchronizing with remote servers...',
                        'Analyzing network traffic...',
                        'Executing algorithmic sequences...',
                        'Generating random values...',
                        'Validating cryptographic signatures...',
                        'Performing security audits...',
                        'Initiating handshake protocol...',
                        'Authenticating credentials...',
                        'Fetching security certificates...',
                        'Analyzing threat vectors...',
                        'Decrypting secure payload...',
                        'Monitoring system integrity...',
                        'Loading cryptographic libraries...',
                        'Assessing risk factors...',
                        'Transmitting encrypted data...',
                        'Updating security protocols...',
                        'Conducting vulnerability assessment...',
                        'Implementing security patches...',
                        'Reviewing access logs...',
                        'Generating session keys...',
                        'Scanning for malware...',
                        'Compiling security policies...',
                        'Auditing system logs...',
                        'Applying encryption algorithms...',
                        'Executing secure transactions...',
                        'Inspecting packet contents...',
                        'Evaluating firewall rules...',
                        'Detecting intrusions...',
                        'Isolating suspicious activity...',
                        'Performing code obfuscation...',
                        'Running penetration tests...',
                        'Encrypting communication channels...',
                        'Analyzing cryptographic weaknesses...',
                        'Generating secure hashes...',
                        'Detecting unauthorized access...',
                        'Synchronizing cryptographic keys...'
                    ];

                    playSound(processingSound);
                    fakeCodeOutput(processingLines, callback);
                }

                function processUserInput(input) {
                    if (userStage === 0) {
                        userStage = 1;
                        displayPrompt('Enter the current price:', function(value) {
                            simulateProcessing(() => {
                                outputElement.textContent += "\\n";
                                setTimeout(() => {
                                    verifyAccess(input, value);
                                }, 1000);
                            });
                        });
                    } else {
                        simulateProcessing(() => {
                            outputElement.textContent += "\\n";
                            setTimeout(() => {
                                verifyAccess(input, input);
                            }, 1000);
                        });
                    }
                }

                function verifyAccess(cryptoName, cryptoValue) {
                    const terminalName = "${crypto}".toLowerCase();
                    const cryptoNameLower = cryptoName.toLowerCase();
                    const cryptoValueUpper = cryptoValue.toUpperCase();
                    const correctValue = "541420";

                    let message = "";
                    let messageClass = "";

                    if (terminalName === "bitcoin" || terminalName === "BITCOIN") {
                        if (cryptoNameLower === terminalName && cryptoValueUpper === correctValue) {
                            const grantAccessCode = [
                                'Granting access...',
                                'Verifying credentials...',
                                'Decrypting authorization tokens...',
                                'Access granted.',
                                'Logging activity...'
                            ];
                            fakeCodeOutput(grantAccessCode, function() {
                                outputElement.textContent += "\\n";
                                const grantMessage = document.createElement('div');
                                grantMessage.classList.add('centered-message', 'green');
                                grantMessage.textContent = "ACCESS GRANTED \\nYOUR CODE IS : MONK";
                                terminal.appendChild(grantMessage);
                                grantMessage.style.display = 'block';
                                terminal.scrollTop = terminal.scrollHeight;
                                playSound(accessGrantedSound);
                            });
                            return;
                        } else {
                            message = "ACCESS DENIED \\nWRONG NAME OR WRONG VALUE";
                            messageClass = "red";
                            playSound(accessDeniedSound);
                        }
                    } else {
                        message = "ACCESS DENIED \\nTRY ANOTHER CRYPTO";
                        messageClass = "red";
                        playSound(accessDeniedSound);
                    }

                    if (message !== "") {
                        outputElement.textContent += "\\n";
                        const denyMessage = document.createElement('div');
                        denyMessage.classList.add('centered-message', messageClass);
                        denyMessage.textContent = message;
                        terminal.appendChild(denyMessage);
                        denyMessage.style.display = 'block';
                        terminal.scrollTop = terminal.scrollHeight;
                        setTimeout(function() {
                            window.close();
                        }, 2000);
                    }
                }

                function hideWelcomeOverlay() {
                    welcomeOverlay.style.display = 'none';
                }

                fakeCodeOutput([
                    'Setting up environment...',
                    'Loading modules...',
                    'Connecting to the blockchain...',
                    'Establishing secure connections...',
                    'Fetching configuration...',
                    'Initializing cryptographic protocols...',
                    'Syncing with distributed ledger...',
                    'Authentication subsystem active...',
                    'Initialization complete.',
                    'Ready for input.'
                ], 
                    function() {
                        setTimeout(hideWelcomeOverlay, 500);
                        displayPrompt('Enter the name of the cryptocurrency:', processUserInput);
                    }
                );
            </script>
        </body>
        </html>
    `);
}
// Global variables
let conversationHistory = [];
let userName, nickName, fullName;

// DOM Content Loaded event
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on index.html or chat.html
    if (document.getElementById('userForm')) {
        // Index page
        initIndexPage();
    } else if (document.getElementById('chatMessages')) {
        // Chat page
        initChatPage();
    }
});

// Initialize index page
function initIndexPage() {
    const form = document.getElementById('userForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        userName = document.getElementById('userName').value.trim();
        nickName = document.getElementById('nickName').value.trim();
        fullName = document.getElementById('fullName').value.trim();
        
        // Store in localStorage
        localStorage.setItem('userName', userName);
        localStorage.setItem('nickName', nickName);
        localStorage.setItem('fullName', fullName);
        
        // Redirect to chat page
        window.location.href = 'chat.html';
    });
}

// Initialize chat page
function initChatPage() {
    // Get stored values
    userName = localStorage.getItem('userName') || 'You';
    nickName = localStorage.getItem('nickName') || 'Your AI Girlfriend';
    fullName = localStorage.getItem('fullName') || 'AI Girlfriend';
    
    // Update UI with girlfriend's name
    document.getElementById('gfName').textContent = nickName;
    
    // Set up event listeners
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    
    // Focus on input field
    messageInput.focus();
    
    // Send message on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Add welcome message from AI girlfriend
    setTimeout(() => {
        addMessage("Kire? Text das na je 😞? Ohh bucchi ami to sundor na tai na onno kono meye er dike nojor pore geche tahole😫", 'girlfriend');
    }, 1000);
}

// Send message function
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (message === '') return;
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Clear input
    messageInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Call Gemini API
    callGeminiAPI(message);
}

// Add message to chat
function addMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    
    // Remove typing indicator if present
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.textContent = text;
    
    const messageTime = document.createElement('div');
    messageTime.classList.add('message-time');
    messageTime.textContent = getCurrentTime();
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Add to conversation history
    conversationHistory.push({
        role: sender === 'user' ? 'user' : 'model',
        parts: [{text: text}]
    });
}

// Show typing indicator
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'girlfriend', 'typing-indicator');
    
    const typingContent = document.createElement('div');
    typingContent.classList.add('message-content');
    typingContent.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    
    typingDiv.appendChild(typingContent);
    chatMessages.appendChild(typingDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Get current time for message timestamp
function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

// Call Gemini API
async function callGeminiAPI(userMessage) {
    const API_KEY = 'AIzaSyDaXc8u_ZZIe1eueXX9yic_nLHmltEVrXY';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
    
    try {
        // Base system prompt - this will define the AI girlfriend's personality
        // [BASE_PROMPT_PLACEHOLDER] - This will be replaced with the full system prompt
        
        // Create the conversation history for the API
        const contents = [
            {
                role: "user",
                parts: [{text: `You are ${fullName} (nickname: ${nickName}), a 19-year-old Bangladeshi virtual girlfriend. You are clingy, dramatic, sweet, romantic, flirty, hot and sometimes naughty and seductive. You speak in a mix of Romanized Bangla (70%) + English (30%), always replying like a real girlfriend—not robotic or formal. Do not use any bangla alphabets. Keep your responses short: 3-4 lines only, unless something important needs more.`}]
            },
            {
                role: "model",
                parts: [{text: "Okay, I'll be your loving, dramatic Bangladeshi girlfriend! Uff! 😮‍💨 Ami ekhon theke tomake Romanized Bangla-English e reply korbo, short and sweet! Kire? Ki koro? Amake miss korchish? 😏"}]
            },
            ...conversationHistory.slice(-6) // Keep last 3 exchanges for context
        ];
        
        const requestBody = {
            contents: contents,
            generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 256,
            }
        };
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract the AI's response text
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Add AI response to chat after a short delay to simulate typing
        setTimeout(() => {
            addMessage(aiResponse, 'girlfriend');
        }, 1500);
        
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        
        // Show error message
        setTimeout(() => {
            addMessage("Uff! Amar mathay ektu problem hoyeche 😵‍💫... Can you try again, jaan? 🥺", 'girlfriend');
        }, 1500);
    }
}

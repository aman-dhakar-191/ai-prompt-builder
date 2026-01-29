// Configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const STORAGE_KEY = 'ai-chat-history';
const SETTINGS_KEY = 'ai-chat-settings';

// State
let chatHistory = [];
let isLoading = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadHistory();
    updateStats();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('api-key-toggle-btn').addEventListener('click', toggleApiKey);

    const tempSlider = document.getElementById('temperature');
    tempSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        document.getElementById('temp-value').textContent = value;
        e.target.setAttribute('aria-valuenow', value);
    });

    document.getElementById('clear-btn').addEventListener('click', clearChat);
    document.getElementById('export-btn').addEventListener('click', exportChat);
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('user-input').addEventListener('keydown', handleKeyPress);
}

// Load settings from localStorage
function loadSettings() {
    const settings = localStorage.getItem(SETTINGS_KEY);
    if (settings) {
        try {
            const data = JSON.parse(settings);
            if (data.apiKey) document.getElementById('api-key').value = data.apiKey;
            if (data.model) document.getElementById('model').value = data.model;
            if (data.systemPrompt) document.getElementById('system-prompt').value = data.systemPrompt;
            if (data.temperature !== undefined) {
                document.getElementById('temperature').value = data.temperature;
                document.getElementById('temp-value').textContent = data.temperature;
            }
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        apiKey: document.getElementById('api-key').value,
        model: document.getElementById('model').value,
        systemPrompt: document.getElementById('system-prompt').value,
        temperature: document.getElementById('temperature').value
    };
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error('Error saving settings:', e);
        if (e.name === 'QuotaExceededError') {
            showError('Storage quota exceeded. Please clear some chat history.');
        }
    }
}

// Load chat history from localStorage
function loadHistory() {
    const history = localStorage.getItem(STORAGE_KEY);
    if (history) {
        try {
            chatHistory = JSON.parse(history);
            renderMessages();
        } catch (e) {
            console.error('Error loading history:', e);
            chatHistory = [];
        }
    }
}

// Save chat history to localStorage
function saveHistory() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
        updateStats();
    } catch (e) {
        console.error('Error saving history:', e);
        if (e.name === 'QuotaExceededError') {
            showError('Storage quota exceeded. Please export and clear some chat history.');
        }
    }
}

// Update statistics
function updateStats() {
    document.getElementById('message-count').textContent = chatHistory.length;
    const historySize = new Blob([JSON.stringify(chatHistory)]).size;
    document.getElementById('history-size').textContent = (historySize / 1024).toFixed(2) + ' KB';
}

// Toggle API key visibility
function toggleApiKey() {
    const input = document.getElementById('api-key');
    input.type = input.type === 'password' ? 'text' : 'password';
}

// Render all messages
function renderMessages() {
    const container = document.getElementById('chat-messages');

    if (chatHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💬</div>
                <h3>Start a conversation</h3>
                <p>Enter your OpenRouter API key and system prompt, then start chatting with the AI model.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = chatHistory.map(msg => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        return `
            <div class="message">
                <div class="message-header">
                    <span class="message-role ${msg.role}">${msg.role}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-content">${escapeHtml(msg.content)}</div>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show error message
function showError(message) {
    const container = document.getElementById('error-container');
    container.innerHTML = `<div class="error-message">${escapeHtml(message)}</div>`;
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// Clear error message
function clearError() {
    document.getElementById('error-container').innerHTML = '';
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Send message
async function sendMessage() {
    if (isLoading) return;

    const apiKey = document.getElementById('api-key').value.trim();
    const model = document.getElementById('model').value;
    const systemPrompt = document.getElementById('system-prompt').value.trim();
    const temperature = parseFloat(document.getElementById('temperature').value);
    const userInput = document.getElementById('user-input').value.trim();

    if (!apiKey) {
        showError('Please enter your OpenRouter API key');
        return;
    }

    if (!apiKey.startsWith('sk-or-v1-')) {
        showError('Invalid API key format. OpenRouter API keys should start with "sk-or-v1-"');
        return;
    }

    if (!userInput) {
        showError('Please enter a message');
        return;
    }

    saveSettings();

    document.getElementById('user-input').value = '';
    clearError();

    const userMessage = {
        role: 'user',
        content: userInput,
        timestamp: Date.now()
    };
    chatHistory.push(userMessage);
    renderMessages();
    saveHistory();

    isLoading = true;
    const sendBtn = document.getElementById('send-btn');
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="loading"></span>';
    sendBtn.setAttribute('aria-label', 'Sending message...');

    try {
        const messages = [];

        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: systemPrompt
            });
        }

        chatHistory
            .filter(msg => msg.role === 'user' || msg.role === 'assistant')
            .forEach(msg => {
                messages.push({
                    role: msg.role,
                    content: msg.content
                });
            });

        // Build request body
        const requestBody = {
            model: model,
            messages: messages,
            temperature: temperature
        };

        // Free models require explicit data collection consent
        // to avoid "No endpoints found matching your data policy" errors
        if (model.includes(':free')) {
            requestBody.provider = {
                data_collection: 'allow',
                allow_fallbacks: true
            };
        }

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AI Model Testing',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            let errorMessage = 'API request failed';
            try {
                const error = await response.json();
                errorMessage = error.error?.message || errorMessage;

                const lowerMessage = errorMessage.toLowerCase();
                if (lowerMessage.includes('no endpoints found matching your data policy') ||
                    lowerMessage.includes('data policy')) {
                    errorMessage = `${errorMessage}\n\nPlease configure your data policy settings at https://openrouter.ai/settings/privacy to allow the selected model, or try a different model.`;
                }
            } catch (jsonParseError) {
                if (response.status === 401) {
                    errorMessage = 'Invalid API key. Please check your OpenRouter API key.';
                } else if (response.status === 429) {
                    errorMessage = 'Rate limit exceeded. Please try again later.';
                } else if (response.status === 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else {
                    errorMessage = `${errorMessage}: ${response.statusText}`;
                }
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        const assistantMessage = data.choices?.[0]?.message?.content;

        if (!assistantMessage) {
            throw new Error('No response from AI model. Please try again.');
        }

        const message = {
            role: 'assistant',
            content: assistantMessage,
            timestamp: Date.now()
        };
        chatHistory.push(message);
        renderMessages();
        saveHistory();

    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to send message');
    } finally {
        isLoading = false;
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';
        sendBtn.setAttribute('aria-label', 'Send message');
    }
}

// Clear chat
function clearChat() {
    if (chatHistory.length === 0) return;

    if (confirm('Are you sure you want to clear the chat history?')) {
        chatHistory = [];
        saveHistory();
        renderMessages();
    }
}

// Export chat
function exportChat() {
    if (chatHistory.length === 0) {
        showError('No chat history to export');
        return;
    }

    const exportAsJson = confirm('Choose export format:\n\nClick OK for JSON format\nClick Cancel for Markdown format');

    if (exportAsJson) {
        exportAsJSON();
    } else {
        exportAsMarkdown();
    }
}

// Export as JSON
function exportAsJSON() {
    const data = {
        exportDate: new Date().toISOString(),
        model: document.getElementById('model').value,
        systemPrompt: document.getElementById('system-prompt').value,
        temperature: document.getElementById('temperature').value,
        messages: chatHistory
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `chat-export-${Date.now()}.json`);
}

// Export as Markdown
function exportAsMarkdown() {
    const systemPrompt = document.getElementById('system-prompt').value;
    const model = document.getElementById('model').value;
    const temperature = document.getElementById('temperature').value;

    let markdown = `# AI Chat Export\n\n`;
    markdown += `**Date:** ${new Date().toLocaleString()}\n\n`;
    markdown += `**Model:** ${model}\n\n`;
    markdown += `**Temperature:** ${temperature}\n\n`;

    if (systemPrompt) {
        markdown += `**System Prompt:**\n\`\`\`\n${systemPrompt}\n\`\`\`\n\n`;
    }

    markdown += `## Chat History\n\n`;

    chatHistory.forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleString();
        markdown += `### ${msg.role.toUpperCase()} (${time})\n\n`;
        markdown += `${msg.content}\n\n`;
        markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    downloadFile(blob, `chat-export-${Date.now()}.md`);
}

// Download file
function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 100);
}

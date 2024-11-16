// Constants
const VM1_BASE_URL = 'http://34.122.47.164:3000/*';
const VM2_BASE_URL = 'http://34.122.47.164:3000/*';

// DOM Elements
const landingView = document.getElementById('landing');
const homeView = document.getElementById('home');
const userEmailSpan = document.getElementById('user-email');
const currentUrlP = document.getElementById('current-url');
const redirectBtn = document.getElementById('redirect-btn');
const generatePwdBtn = document.getElementById('generate-pwd');
const viewSitesBtn = document.getElementById('view-sites');
const logoutBtn = document.getElementById('logout-btn');

// State management
let currentUser = null;
let currentTab = null;

// Initialize extension
async function init() {
    try {
        // Check if user is authenticated
        const identity = await chrome.cookies.get({
            url: VM1_BASE_URL,
            name: 'digital_identity'
        });

        if (identity) {
            currentUser = await fetchUserInfo(identity.value);
            showHomeView();
        } else {
            showLandingView();
        }

        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        currentTab = tab;
        if (currentTab && currentTab.url) {
            currentUrlP.textContent = new URL(currentTab.url).hostname;
        }
    } catch (error) {
        console.error('Initialization failed:', error);
        showLandingView();
    }
}

// View management
function showLandingView() {
    landingView.classList.remove('hidden');
    homeView.classList.add('hidden');
}

function showHomeView() {
    landingView.classList.add('hidden');
    homeView.classList.remove('hidden');
    if (currentUser && currentUser.email) {
        userEmailSpan.textContent = currentUser.email;
    }
}

// User information
async function fetchUserInfo(identityToken) {
    try {
        const response = await fetch(`${VM1_BASE_URL}/user`, {
            headers: {
                'Authorization': `Bearer ${identityToken}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch user info');
        return await response.json();
    } catch (error) {
        console.error('Error fetching user info:', error);
        return null;
    }
}

// Password generation and management
async function generatePassword() {
    try {
        if (!currentTab || !currentTab.url) {
            throw new Error('No active website');
        }

        const hostname = new URL(currentTab.url).hostname;
        
        // Get keypair from cookies
        const keypair = await chrome.cookies.get({
            url: VM1_BASE_URL,
            name: 'keypair'
        });

        if (!keypair) {
            throw new Error('No keypair found');
        }

        // Get password requirements from website
        const requirements = await detectPwReq(currentTab.id);

        // Request password from VM2
        const passwordResponse = await fetch(`${VM2_BASE_URL}/generate-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                keypair: keypair.value,
                requirements,
                website: hostname
            })
        });

        if (!passwordResponse.ok) {
            throw new Error('Failed to generate password');
        }

        const { password } = await passwordResponse.json();

        // Store password hash in VM1
        await fetch(`${VM1_BASE_URL}/websites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({
                website_url: hostname,
                password_hash: await hashPassword(password)
            })
        });

        // Inject password into the website
        await chrome.tabs.sendMessage(currentTab.id, {
            action: 'fillPassword',
            password
        });

        // Show success message
        alert('Password generated and filled successfully');
    } catch (error) {
        console.error('Password generation failed:', error);
        alert('Failed to generate password: ' + error.message);
    }
}

// Password requirements detection
async function detectPwReq(tabId) {
    try {
        // Inject content script to analyze password field
        const [requirements] = await chrome.scripting.executeScript({
            target: { tabId },
            function: () => {
                const passwordField = document.querySelector('input[type="password"]');
                if (!passwordField) return null;

                // Get requirements from aria attributes or other metadata
                const minLength = passwordField.getAttribute('minlength') || 8;
                const pattern = passwordField.pattern || null;
                const required = passwordField.required || false;

                return {
                    minLength: parseInt(minLength),
                    pattern,
                    required,
                    // Additional requirements that might be specified in page metadata
                    specialChars: document.querySelector('meta[name="password-special-chars"]')?.content === 'true',
                    numbers: document.querySelector('meta[name="password-numbers"]')?.content === 'true',
                    uppercase: document.querySelector('meta[name="password-uppercase"]')?.content === 'true'
                };
            }
        });

        return requirements?.result || {
            minLength: 12,  // Default requirements if none detected
            specialChars: true,
            numbers: true,
            uppercase: true
        };
    } catch (error) {
        console.error('Error detecting password requirements:', error);
        return null;
    }
}

// Utility functions
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Event listeners
redirectBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: `${VM1_BASE_URL}/` });
});

generatePwdBtn.addEventListener('click', generatePassword);

viewSitesBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'saved-sites.html' });
});

logoutBtn.addEventListener('click', async () => {
    // Clear cookies
    await chrome.cookies.remove({
        url: VM1_BASE_URL,
        name: 'digital_identity'
    });
    await chrome.cookies.remove({
        url: VM1_BASE_URL,
        name: 'keypair'
    });
    
    // Reset state and show landing view
    currentUser = null;
    showLandingView();
});

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

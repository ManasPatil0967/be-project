// content-script.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillPassword') {
        const passwordField = document.querySelector('input[type="password"]');
        if (passwordField) {
            passwordField.value = message.password;
            // Trigger any necessary events
            passwordField.dispatchEvent(new Event('input', { bubbles: true }));
            passwordField.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
});

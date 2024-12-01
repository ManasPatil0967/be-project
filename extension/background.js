chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillPassword') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                    }
                    sendResponse(response);
                });
            }
        });
        return true; // Required for async `sendResponse`
    }
});
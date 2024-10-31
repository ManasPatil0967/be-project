// popup.js
document.addEventListener('DOMContentLoaded', function() {
  // Connect to the native messaging host
  const port = chrome.runtime.connectNative('com.example.kyber_host');
  
  // Handle messages from the native host
  port.onMessage.addListener(function(response) {
    console.log('Received response:', response);
    
    switch(response.type) {
      case 'keypairGenerated':
        // Store keys securely or use them as needed
        console.log('Generated Public Key:', response.publicKey);
        console.log('Generated Private Key:', response.privateKey);
        break;
        
      case 'encrypted':
        console.log('Ciphertext:', response.ciphertext);
        console.log('Shared Secret:', response.sharedSecret);
        break;
        
      case 'decrypted':
        console.log('Decrypted Shared Secret:', response.sharedSecret);
        break;
        
      case 'error':
        console.error('Error from native host:', response.error);
        // Display error to user
        break;
    }
  });
  
  // Handle disconnection
  port.onDisconnect.addListener(function() {
    console.error('Disconnected from native host:', chrome.runtime.lastError);
  });
  
  // Button click handlers
  document.getElementById('generateKeypair').addEventListener('click', function() {
    port.postMessage({
      type: 'generateKeypair'
    });
  });
  
  document.getElementById('encrypt').addEventListener('click', function() {
    // Assuming you have stored the public key somewhere
    const publicKey = '...'; // Get this from your storage
    
    port.postMessage({
      type: 'encrypt',
      publicKey: publicKey
    });
  });
  
  document.getElementById('decrypt').addEventListener('click', function() {
    // Assuming you have stored the private key and ciphertext somewhere
    const privateKey = '...'; // Get this from your storage
    const ciphertext = '...'; // Get this from your application state
    
    port.postMessage({
      type: 'decrypt',
      privateKey: privateKey,
      ciphertext: ciphertext
    });
  });
});

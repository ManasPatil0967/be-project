document.getElementById('button').addEventListener('click', async function() {
    const serverUrl = 'http://35.239.38.217:3000';
    
    try {
        // First test server connectivity
        const healthCheck = await fetch(`${serverUrl}/health`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!healthCheck.ok) {
            throw new Error('Server is not responding properly');
        }
        
        console.log('Generating keypair...');
        const response = await fetch(`${serverUrl}/generate-keypair`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Key generation failed');
        }

        const { publicKey, secretKey } = await response.json();
        console.log('Received keys successfully');

        // Display the keys
        const keyDisplay = document.createElement('div');
        keyDisplay.innerHTML = `
            <h3>Public Key:</h3>
            <pre>${publicKey}</pre>
            <h3>Secret Key:</h3>
            <pre>${secretKey}</pre>
        `;
        document.body.appendChild(keyDisplay);

    } catch (error) {
        console.error('Error:', error);
        // Display error to user
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.textContent = `Error: ${error.message}`;
        document.body.appendChild(errorDiv);
    }
});

document.getElementById('download-public-key').addEventListener('click', async function() {
    try {
        const serverUrl = 'http://35.239.38.217:3000';
        const response = await fetch(`${serverUrl}/download/public-key`, {
            method: 'GET',
            headers: {
                'Accept': 'application/octet-stream'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Download failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'public_key.bin');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    } catch (error) {
        console.error('Error:', error);
        // Display error to user
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.textContent = `Error: ${error.message}`;
        document.body.appendChild(errorDiv);
    }
});

document.getElementById('download-secret-key').addEventListener('click', async function() {
    try {
        const serverUrl = 'http://35.239.38.217:3000';
        const response = await fetch(`${serverUrl}/download/secret-key`, {
            method: 'GET',
            headers: {
                'Accept': 'application/octet-stream'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Download failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'secret_key.bin');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    } catch (error) {
        console.error('Error:', error);
        // Display error to user
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.textContent = `Error: ${error.message}`;
        document.body.appendChild(errorDiv);
    }
});


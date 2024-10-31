export class KyberNativeMessaging {
    constructor() {
        this.port = null;
        this.hostName = "com.example.kyber";
    }

    connect() {
        this.port = chrome.runtime.connectNative(this.hostName);

        this.port.onMessage.addListener((response) => {
            console.log('Received:', response);
        });

        this.port.onDisconnect.addListener(() => {
            console.error('Disconnected:', chrome.runtime.lastError?.message);
            this.port = null;
        });
    }

    async generateKeypair() {
        console.log("Generate Keypair from kyberNM");
        return this._sendMessage({ type: 'generateKeypair' });
    }

    async encrypt(publicKey) {
        return this._sendMessage({
            type: 'encrypt',
            publicKey
        });
    }

    async decrypt(privateKey, ciphertext) {
        return this._sendMessage({
            type: 'decrypt',
            privateKey,
            ciphertext
        });
    }

    _sendMessage(message) {
        console.log('Sending message:', message);
        return new Promise((resolve, reject) => {
            if (!this.port) {
                console.error('No port connection available');
                reject(new Error('Not connected to native host'));
                return;
            }

            const messageHandler = (response) => {
                console.log('Message handler triggered:', response);
                this.port.onMessage.removeListener(messageHandler);

                if (response.type === 'error') {
                    reject(new Error(response.error));
                    return;
                }

                resolve(response);
            };

            this.port.onMessage.addListener(messageHandler);
            this.port.postMessage(message);
        });
    }

}


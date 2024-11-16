const snarkjs = require('snarkjs');
const fs = require('fs');

const generateZKProof = async (age, sapId) => {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve({ age: 19,
        sapID: [1,2,3,4,5,6,7,8,9,0,1]}, 
        "circuit.wasm", 
        "circuit.zkey"
    );

    return { proof, publicSignals };
};

const verifyProof = async (proofData) => {
    const { proof, publicSignals } = proofData;

    const vKey = JSON.parse(await fs.promises.readFile('verification_key.json', 'utf-8'));

    return snarkjs.groth16.verify(vKey, publicSignals, proof);
}

const registerUser = async (email) => {
    const res = await fetch('https://vm1.dappnode.net/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });

    if (!res.ok) {
        throw new Error('Failed to register user');
    }

    return await res.json();
}

document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const sapIdVal = document.getElementById('sapId').value;
    const sapId = sapIdVal.split('').map(String);
    const age = document.getElementById('age').value.toString();

    if (!email) {
        alert('Email is required');
        return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        alert('Invalid email format');
        return;
    }
    document.getElementById('verification-status').classList.remove('hidden');

    try {
        const proofData = await generateZKProof(age, sapId);

        const verificationResult = await verifyProof(proofData);

        if (verificationResult.verified) {
            const registration = await registerUser(email);

            if (registration.success) {
                document.cookie = `digital_identity=${registration.identity}; Secure; SameSite=Strict`;
                window.location.href = '/success';
            }
        }
    } catch (error) {
        console.error('Registration failed:', error);
    }
});

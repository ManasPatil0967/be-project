import * as snarkjs from './snarkjs.js';

const generateZKProof = async (age, sapId) => {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { age: Number(age), sapID: sapId },
        'circuit.wasm',
        'circuit.zkey'
    );

    console.log(proof, publicSignals);
    return { proof, publicSignals };
};

const verifyProof = async (proofData) => {
    const { proof, publicSignals } = proofData;

    const vKey = await fetch('verification_key.json').then((res) => res.json());

    return snarkjs.groth16.verify(vKey, publicSignals, proof);
};

const registerUser = async (email) => {
    const res = await fetch('https://vm1.dappnode.net/gen-identity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    if (!res.ok) {
        throw new Error('Failed to register user');
    }

    return await res.json();
};

document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const sapIdVal = document.getElementById('sapId').value;
    const sapId = sapIdVal.split('').map(Number); // Convert input into an array of numbers
    const age = document.getElementById('age').value;

    console.log(sapId, age);

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

        if (verificationResult) {
            const registration = await registerUser(email);

            if (registration.success) {
                document.cookie = `digital_identity=${registration.privateIdentity}; Secure; SameSite=Strict`;
                window.location.href = '/success';
            }
        } else {
            alert('Proof verification failed.');
        }
    } catch (error) {
        console.error('Registration failed:', error);
        alert('An error occurred during registration.');
    }
});


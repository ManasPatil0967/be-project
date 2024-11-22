const ffi = require('ffi-napi');
const ref = require('ref-napi');
const ArrayType = require('ref-array-napi');

// Define types
const uint8_t = ref.types.uint8;
const size_t = ref.types.size_t;
const uint8_t_ptr = ref.refType(uint8_t);

// Define array types
const uint8_t_array = ArrayType(uint8_t);
const size_t_ptr = ref.refType(size_t);

// Load the shared library
const dilithiumLib = ffi.Library('./libsign2.so', {
  'gen_keypair': ['int', [uint8_t_ptr, uint8_t_ptr]],
  'sign': [
    'int',
    [uint8_t_ptr, size_t_ptr, uint8_t_ptr, size_t, uint8_t_ptr, size_t, uint8_t_ptr],
  ],
  'verify': [
    'int',
    [uint8_t_ptr, size_t_ptr, uint8_t_ptr, size_t, uint8_t_ptr, size_t, uint8_t_ptr],
  ],
});

// Wrapper for buffer handling
function createBuffer(size) {
  return Buffer.alloc(size);
}

// Parameters from params.h
const CRYPTO_PUBLICKEYBYTES = 1312; // SEEDBYTES + K * POLYT1_PACKEDBYTES
const CRYPTO_SECRETKEYBYTES = 2544; // Computed from secret key formula
const CRYPTO_BYTES = 2420;

// Generate keypair
function generateKeypair() {
  const pk = createBuffer(CRYPTO_PUBLICKEYBYTES);
  const sk = createBuffer(CRYPTO_SECRETKEYBYTES);

  const result = dilithiumLib.gen_keypair(pk, sk);
  if (result !== 0) {
    throw new Error('Keypair generation failed!');
  }

  return { publicKey: pk, secretKey: sk };
}

// Sign a message
function signMessage(message, secretKey) {
  const mBuffer = Buffer.from(message);
  const sm = createBuffer(CRYPTO_BYTES + mBuffer.length);
  const smLength = ref.alloc(size_t);

  const result = dilithiumLib.sign(
    sm,
    smLength,
    mBuffer,
    mBuffer.length,
    null, // Context
    0, // Context length
    secretKey
  );

  if (result !== 0) {
    throw new Error('Message signing failed!');
  }

  return { signedMessage: sm.slice(0, smLength.deref()), signedMessageLength: smLength.deref() };
}

// Verify a signed message
function verifySignedMessage(signedMessage, publicKey) {
  const smBuffer = Buffer.from(signedMessage);
  const m = createBuffer(smBuffer.length - CRYPTO_BYTES);
  const mLength = ref.alloc(size_t);

    console.log(m.length, mLength);

  const result = dilithiumLib.verify(
    m,
    mLength,
    smBuffer,
    smBuffer.length,
    null, // Context
    0, // Context length
    publicKey
  );

  if (result !== 0) {
    throw new Error('Signature verification failed!');
  }

  return m.slice(0, mLength.deref()).toString(); // Return the verified message
}

// Example usage
try {
  // Generate keypair
  const { publicKey, secretKey } = generateKeypair();
  console.log('Keypair generated.');

  // Sign a message
  const message = 'Hello, Dilithium!';
  const { signedMessage } = signMessage(message, secretKey);
  console.log('Message signed.');

  // Verify the signed message
  const verifiedMessage = verifySignedMessage(signedMessage, publicKey);
  console.log('Signature verified. Verified message:', verifiedMessage);
} catch (err) {
  console.error(err.message);
}


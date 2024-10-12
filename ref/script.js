const ffi = require('ffi-napi');
const fs = require('fs');


const kyber = ffi.Library('./libkyber.so', {
  'generate_keypair': ['int', ['string', 'string']], 
  'encrypt': ['int', ['string', 'string', 'string']], 
  'decrypt': ['int', ['string', 'string', 'string']]  
});


const pkFile = 'public_key.bin';
const skFile = 'secret_key.bin';
const genResult = kyber.generate_keypair(pkFile, skFile);
console.log("Keypair generation result: ", genResult);


const ctFile = 'ciphertext.bin';
const ssEncFile = 'shared_secret_enc.bin';
const encResult = kyber.encrypt(pkFile, ctFile, ssEncFile);
console.log("Encryption result: ", encResult);


const ssDecFile = 'shared_secret_dec.bin';
const decResult = kyber.decrypt(skFile, ctFile, ssDecFile);
console.log("Decryption result: ", decResult);


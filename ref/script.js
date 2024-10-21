const ffi = require('ffi-napi');
const fs = require('fs');
const process = require('process');

const data = "kyber768-data.csv";
const NTESTS = 1000;

const kyber = ffi.Library('./libkyber.so', {
  'generate_keypair': ['int', ['string', 'string']], 
  'encrypt': ['int', ['string', 'string', 'string']], 
  'decrypt': ['int', ['string', 'string', 'string']]  
});


const pkFile = 'public_key.bin';
const skFile = 'secret_key.bin';
const genResult = kyber.generate_keypair(pkFile, skFile);
console.log("Keypair generation result: ", genResult);

for (let i = 0; i < NTESTS; i++) {
    let time = process.hrtime();
    let mem = process.memoryUsage().heapUsed;
    let start = time[0] * 1000 + time[1] / 1000000;
    const ctFile = 'ciphertext.bin';
    const ssEncFile = 'shared_secret_enc.bin';
    const encResult = kyber.encrypt(pkFile, ctFile, ssEncFile);
    time = process.hrtime();
    let end = time[0] * 1000 + time[1] / 1000000;
    mem = process.memoryUsage().heapUsed - mem;
    // add to data file
    fs.appendFileSync(data, `${end - start},${mem}\n`);
    console.log("Encryption result: ", encResult);
}

const ssDecFile = 'shared_secret_dec.bin';
const decResult = kyber.decrypt(skFile, ctFile, ssDecFile);
console.log("Decryption result: ", decResult);


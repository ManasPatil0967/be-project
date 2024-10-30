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
const ctFile = 'ciphertext.bin';
const ssEncFile = 'shared_secret_enc.bin';
const ssDecFile = 'shared_secret_dec.bin';


console.log(`Working directory: ${process.cwd()}`);

for (let i = 0; i < NTESTS; i++) {
    
    let time_init = process.hrtime();
    let mem_init = process.memoryUsage().rss;
    let start = time_init[0] * 1000 + time_init[1] / 1000000;

    
    const genResult = kyber.generate_keypair(pkFile, skFile);
    if (genResult !== 0) {
        console.log(`Keygen failed at iteration ${i} with result ${genResult}`);
        break;
    }

    let time_after_key = process.hrtime();
    let mem_after_key = process.memoryUsage().rss;
    let after_key = time_after_key[0] * 1000 + time_after_key[1] / 1e6;

    
    const encResult = kyber.encrypt(pkFile, ctFile, ssEncFile);
    if (encResult !== 0) {
        console.log(`Encap failed at iteration ${i} with result ${encResult}`);
        break;
    }

    let time_after_enc = process.hrtime();
    let mem_after_enc = process.memoryUsage().rss;
    let after_enc = time_after_enc[0] * 1000 + time_after_enc[1] / 1e6;

    
    const decResult = kyber.decrypt(skFile, ctFile, ssDecFile);
    if (decResult !== 0) {
        console.log(`Decap failed at iteration ${i} with result ${decResult}`);
        break;
    }

    let time_after_dec = process.hrtime();
    let mem_end = process.memoryUsage().rss;
    let end = time_after_dec[0] * 1000 + time_after_dec[1] / 1000000;

    
    fs.appendFileSync(data, `${after_key - start}, ${after_enc - after_key}, ${end - after_enc}, ${mem_after_key - mem_init}, ${mem_after_enc - mem_after_key}, ${mem_end - mem_after_enc}\n`);
}

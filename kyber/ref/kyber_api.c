#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include "kem.h"  


int generate_keypair(const char* pk_file, const char* sk_file) {
    uint8_t pk[CRYPTO_PUBLICKEYBYTES];
    uint8_t sk[CRYPTO_SECRETKEYBYTES];

    
    if (crypto_kem_keypair(pk, sk) != 0) {
        return -1; 
    }

    
    FILE *f_pk = fopen(pk_file, "wb");
    if (!f_pk) return -1;
    fwrite(pk, 1, CRYPTO_PUBLICKEYBYTES, f_pk);
    fclose(f_pk);

    
    FILE *f_sk = fopen(sk_file, "wb");
    if (!f_sk) return -1;
    fwrite(sk, 1, CRYPTO_SECRETKEYBYTES, f_sk);
    fclose(f_sk);

    return 0; 
}


int encrypt(const char* pk_file, const char* ct_file, const char* ss_file) {
    uint8_t pk[CRYPTO_PUBLICKEYBYTES];
    uint8_t ct[CRYPTO_CIPHERTEXTBYTES];
    uint8_t ss[CRYPTO_BYTES];

    
    FILE *f_pk = fopen(pk_file, "rb");
    if (!f_pk) return -1;
    fread(pk, 1, CRYPTO_PUBLICKEYBYTES, f_pk);
    fclose(f_pk);

    
    if (crypto_kem_enc(ct, ss, pk) != 0) {
        return -1; 
    }

    
    FILE *f_ct = fopen(ct_file, "wb");
    if (!f_ct) return -1;
    fwrite(ct, 1, CRYPTO_CIPHERTEXTBYTES, f_ct);
    fclose(f_ct);

    FILE *f_ss = fopen(ss_file, "wb");
    if (!f_ss) return -1;
    fwrite(ss, 1, CRYPTO_BYTES, f_ss);
    fclose(f_ss);

    return 0; 
}


int decrypt(const char* sk_file, const char* ct_file, const char* ss_file) {
    uint8_t sk[CRYPTO_SECRETKEYBYTES];
    uint8_t ct[CRYPTO_CIPHERTEXTBYTES];
    uint8_t ss[CRYPTO_BYTES];

    
    FILE *f_sk = fopen(sk_file, "rb");
    if (!f_sk) return -1;
    fread(sk, 1, CRYPTO_SECRETKEYBYTES, f_sk);
    fclose(f_sk);

    FILE *f_ct = fopen(ct_file, "rb");
    if (!f_ct) return -1;
    fread(ct, 1, CRYPTO_CIPHERTEXTBYTES, f_ct);
    fclose(f_ct);

    
    if (crypto_kem_dec(ss, ct, sk) != 0) {
        return -1; 
    }

    
    FILE *f_ss = fopen(ss_file, "wb");
    if (!f_ss) return -1;
    fwrite(ss, 1, CRYPTO_BYTES, f_ss);
    fclose(f_ss);

    return 0; 
}


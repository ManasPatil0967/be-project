#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include "kyber_api.h"
#include "kem.h"

int main() {
    const char* pk_file = "public_key.bin";
    const char* sk_file = "secret_key.bin";
    const char* ct_file = "ciphertext.bin";
    const char* ss_enc_file = "shared_secret_enc.bin";
    const char* ss_dec_file = "shared_secret_dec.bin";

    if (generate_keypair(pk_file, sk_file) != 0) {
        printf("Error: generate_keypair failed.\n");
        return -1;
    }

    if (encrypt(pk_file, ct_file, ss_enc_file) != 0) {
        printf("Error: encrypt failed.\n");
        return -1;
    }

    if (decrypt(sk_file, ct_file, ss_dec_file) != 0) {
        printf("Error: decrypt failed.\n");
        return -1;
    }

    return 0;
}

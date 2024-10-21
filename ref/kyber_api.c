#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include "kem.h"

int generate_keypair(const char* pk_file, const char* sk_file) {
    uint8_t pk[CRYPTO_PUBLICKEYBYTES];
    uint8_t sk[CRYPTO_SECRETKEYBYTES];

    // Generate the key pair
    if (crypto_kem_keypair(pk, sk) != 0) {
        printf("Error: crypto_kem_keypair failed.\n");
        return -1;
    }

    // Save hexadecimal pk and sk to a text file for debugging
    FILE *f_pk_hex = fopen("pk_hex.txt", "w");
    if (!f_pk_hex) {
        perror("Error opening pk_hex.txt");
        return -1;
    }
    for (int i = 0; i < CRYPTO_PUBLICKEYBYTES; i++) {
        fprintf(f_pk_hex, "%02x", pk[i]);
    }
    fclose(f_pk_hex);

    FILE *f_sk_hex = fopen("sk_hex.txt", "w");
    if (!f_sk_hex) {
        perror("Error opening sk_hex.txt");
        return -1;
    }
    for (int i = 0; i < CRYPTO_SECRETKEYBYTES; i++) {
        fprintf(f_sk_hex, "%02x", sk[i]);
    }
    fclose(f_sk_hex);

    // Write public and secret keys to binary files
    FILE *f_pk = fopen(pk_file, "wb");
    if (!f_pk) {
        perror("Error opening public key file");
        return -1;
    }
    fwrite(pk, 1, CRYPTO_PUBLICKEYBYTES, f_pk);
    fclose(f_pk);

    FILE *f_sk = fopen(sk_file, "wb");
    if (!f_sk) {
        perror("Error opening secret key file");
        return -1;
    }
    fwrite(sk, 1, CRYPTO_SECRETKEYBYTES, f_sk);
    fclose(f_sk);

    return 0;
}

int encrypt(const char* pk_file, const char* ct_file, const char* ss_file) {
    uint8_t pk[CRYPTO_PUBLICKEYBYTES];
    uint8_t ct[CRYPTO_CIPHERTEXTBYTES];
    uint8_t ss[CRYPTO_BYTES];

    // Read the public key from file
    FILE *f_pk = fopen(pk_file, "rb");
    if (!f_pk) {
        perror("Error opening public key file");
        return -1;
    }
    fread(pk, 1, CRYPTO_PUBLICKEYBYTES, f_pk);
    fclose(f_pk);

    // Encrypt and generate ciphertext and shared secret
    if (crypto_kem_enc(ct, ss, pk) != 0) {
        printf("Error: crypto_kem_enc failed.\n");
        return -1;
    }

    // Save ciphertext and shared secret to hexadecimal text files for debugging
    FILE *f_ct_2 = fopen("ct_hex.txt", "w");
    if (!f_ct_2) {
        perror("Error opening ct_hex.txt");
        return -1;
    }
    for (int i = 0; i < CRYPTO_CIPHERTEXTBYTES; i++) {
        fprintf(f_ct_2, "%02x", ct[i]);
    }
    fclose(f_ct_2);

    FILE *f_ss_2 = fopen("ss_hex.txt", "w");
    if (!f_ss_2) {
        perror("Error opening ss_hex.txt");
        return -1;
    }
    for (int i = 0; i < CRYPTO_BYTES; i++) {
        fprintf(f_ss_2, "%02x", ss[i]);
    }
    fclose(f_ss_2);

    // Write ciphertext and shared secret to binary files
    FILE *f_ct = fopen(ct_file, "wb");
    if (!f_ct) {
        perror("Error opening ciphertext file");
        return -1;
    }
    fwrite(ct, 1, CRYPTO_CIPHERTEXTBYTES, f_ct);
    fclose(f_ct);

    FILE *f_ss = fopen(ss_file, "wb");
    if (!f_ss) {
        perror("Error opening shared secret file");
        return -1;
    }
    fwrite(ss, 1, CRYPTO_BYTES, f_ss);
    fclose(f_ss);

    return 0;
}

int decrypt(const char* sk_file, const char* ct_file, const char* ss_file) {
    uint8_t sk[CRYPTO_SECRETKEYBYTES];
    uint8_t ct[CRYPTO_CIPHERTEXTBYTES];
    uint8_t ss[CRYPTO_BYTES];
    uint8_t ss_orig[CRYPTO_BYTES];

    // Read the secret key and ciphertext from file
    FILE *f_sk = fopen(sk_file, "rb");
    if (!f_sk) {
        perror("Error opening secret key file");
        return -1;
    }
    fread(sk, 1, CRYPTO_SECRETKEYBYTES, f_sk);
    fclose(f_sk);

    FILE *f_ct = fopen(ct_file, "rb");
    if (!f_ct) {
        perror("Error opening ciphertext file");
        return -1;
    }
    fread(ct, 1, CRYPTO_CIPHERTEXTBYTES, f_ct);
    fclose(f_ct);

    // Decrypt the shared secret
    if (crypto_kem_dec(ss, ct, sk) != 0) {
        printf("Error: crypto_kem_dec failed.\n");
        return -1;
    }

    // Save decapsulated shared secret for debugging
    FILE *f_ss_hex = fopen("ss_hex_dec.txt", "w");
    if (!f_ss_hex) {
        perror("Error opening ss_hex_dec.txt");
        return -1;
    }
    for (int i = 0; i < CRYPTO_BYTES; i++) {
        fprintf(f_ss_hex, "%02x", ss[i]);
    }
    fclose(f_ss_hex);

    // Read the original shared secret for comparison
    FILE *f_ss = fopen("shared_secret_enc.bin", "rb");
    if (!f_ss) {
        perror("Error opening shared secret file");
        return -1;
    }
    fread(ss_orig, 1, CRYPTO_BYTES, f_ss);
    fclose(f_ss);

    // Verify if the original and decapsulated shared secrets match
    for (int i = 0; i < CRYPTO_BYTES; i++) {
        if (ss[i] != ss_orig[i]) {
            printf("Shared secret does not match\n");
            return -1;
        }
    }

    return 0;
}

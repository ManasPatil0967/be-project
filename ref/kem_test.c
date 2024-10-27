#include "kem.h"
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include "params.h"
#include <inttypes.h>

const int N_TESTS = 1e3;

char* hex_string(uint8_t* data, size_t len) {
    char* hex = (char*)malloc(len * 2 + 1);
    for (int i = 0; i < len; i++) {
        sprintf(hex + i * 2, "%02x", data[i]);
    }
    hex[len * 2] = '\0';
    return hex;
}

uint64_t cpucycles(void) {
    uint64_t t0, t1, overhead = -1LL;

    __asm__ volatile ("rdtsc; shlq $32,%%rdx; orq %%rdx,%%rax"
            : "=a" (t0) : : "%rdx");
    __asm__ volatile ("rdtsc; shlq $32,%%rdx; orq %%rdx,%%rax"
            : "=a" (t1) : : "%rdx");

    if (t1 > t0) {
        overhead = t1 - t0;
    }

    return overhead;
}

int main() {
    uint8_t pk[KYBER_PUBLICKEYBYTES];
    uint8_t sk[KYBER_SECRETKEYBYTES];
    uint8_t ct[KYBER_CIPHERTEXTBYTES];
    uint8_t ss_enc[KYBER_SSBYTES];
    uint8_t ss_dec[KYBER_SSBYTES];

    uint64_t init, after_keypair, after_enc, after_dec;

    const char* csv_file = "kyber2.csv";
    FILE* fp = fopen(csv_file, "w");
    if (fp == NULL) {
        printf("Error: failed to open file.\n");
        return -1;
    }

    for (int i = 0; i < N_TESTS; i++) {
        __asm__ volatile ("rdtsc; shlq $32,%%rdx; orq %%rdx,%%rax"
                : "=a" (init) : : "%rdx");
        
        if (crypto_kem_keypair(pk, sk) != 0) {
            printf("Error: crypto_kem_keypair failed.\n");
            return -1;
        }
        __asm__ volatile ("rdtsc; shlq $32,%%rdx; orq %%rdx,%%rax"
                : "=a" (after_keypair) : : "%rdx");
        
        if (crypto_kem_enc(ct, ss_enc, pk) != 0) {
            printf("Error: crypto_kem_enc failed.\n");
            return -1;
        }
        __asm__ volatile ("rdtsc; shlq $32,%%rdx; orq %%rdx,%%rax"
                : "=a" (after_enc) : : "%rdx");

        if (crypto_kem_dec(ss_dec, ct, sk) != 0) {
            printf("Error: crypto_kem_dec failed.\n");
            return -1;
        }
        if (memcmp(ss_enc, ss_dec, KYBER_SSBYTES) != 0) {
            printf("Error: shared secrets are not equal.\n");
            return -1;
        }
        __asm__ volatile ("rdtsc; shlq $32,%%rdx; orq %%rdx,%%rax"
                : "=a" (after_dec) : : "%rdx");

        fprintf(fp, "%s,%s,%s,%s,%" PRIu64 ",%"PRIu64",%"PRIu64"\n", hex_string(pk, KYBER_PUBLICKEYBYTES), hex_string(sk, KYBER_SECRETKEYBYTES), hex_string(ct, KYBER_CIPHERTEXTBYTES), hex_string(ss_enc, KYBER_SSBYTES), after_keypair - init, after_enc - after_keypair, after_dec - after_enc);
    }

    fclose(fp);
    return 0;
}

#include "kem.h"
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include "params.h"
#include <inttypes.h>

const int N_TESTS = 1e4;

char* hex_string(uint8_t* data, size_t len) {
    char* hex = (char*)malloc(len * 2 + 1);
    for (int i = 0; i < len; i++) {
        sprintf(hex + i * 2, "%02x", data[i]);
    }
    hex[len * 2] = '\0';
    return hex;
}

static inline uint64_t cpucycles(void) {
  uint64_t result;

  __asm__ volatile ("rdtsc; shlq $32,%%rdx; orq %%rdx,%%rax"
    : "=a" (result) : : "%rdx");

  return result;
}

uint64_t cpucycles_overhead(void) {
  uint64_t t0, t1, overhead = -1LL;
  unsigned int i;

  for(i=0;i<100000;i++) {
    t0 = cpucycles();
    __asm__ volatile ("");
    t1 = cpucycles();
    if(t1 - t0 < overhead)
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

    uint64_t overhead = cpucycles_overhead();

    const char* csv_file = "kyber4.csv";
    FILE* fp = fopen(csv_file, "w");
    if (fp == NULL) {
        printf("Error: failed to open file.\n");
        return -1;
    }

    for (int i = 0; i < N_TESTS; i++) {
        init = cpucycles();
        
        if (crypto_kem_keypair(pk, sk) != 0) {
            printf("Error: crypto_kem_keypair failed.\n");
            return -1;
        }
        after_keypair = cpucycles();
        
        if (crypto_kem_enc(ct, ss_enc, pk) != 0) {
            printf("Error: crypto_kem_enc failed.\n");
            return -1;
        }
        after_enc = cpucycles();

        if (crypto_kem_dec(ss_dec, ct, sk) != 0) {
            printf("Error: crypto_kem_dec failed.\n");
            return -1;
        }
        if (memcmp(ss_enc, ss_dec, KYBER_SSBYTES) != 0) {
            printf("Error: shared secrets are not equal.\n");
            return -1;
        }
        after_dec = cpucycles();

        fprintf(fp, "%s,%s,%s,%s,%" PRIu64 ",%"PRIu64",%"PRIu64"\n", hex_string(pk, KYBER_PUBLICKEYBYTES), hex_string(sk, KYBER_SECRETKEYBYTES), hex_string(ct, KYBER_CIPHERTEXTBYTES), hex_string(ss_enc, KYBER_SSBYTES), after_keypair - init - overhead, after_enc - after_keypair - overhead, after_dec - after_enc - overhead);
    }

    fclose(fp);
    return 0;
}

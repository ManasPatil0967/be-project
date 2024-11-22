#include <errno.h>
#include <stdint.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <omp.h>
#include "fips202.h"

uint8_t* kdf(
        const uint8_t* in, 
        size_t inlen,
        uint8_t* out,
        size_t outlen
        ) {
    uint8_t* buf = (uint8_t*)malloc(inlen + 1);
    memcpy(buf, in, inlen);
    buf[inlen] = 0;
#pragma omp parallel
    for (size_t i = 0; i < outlen / 32; i++) {
        shake256(out + i * 32, 32, buf, inlen + 1);
        buf[inlen]++;
    }
    free(buf);
    return out;
}

int main() {
    const char* in = "Hello, world!";
    /*FILE *fp;*/
    /*int err;*/
    /*err = fopen_s(&fp, "kdf.txt", "w");*/
    /*if (err != 0) {*/
    /*    printf("Error opening file\n");*/
    /*    return 1;*/
    /*}*/
    size_t inlen = strlen(in);
    uint8_t out[8 * 4];
    uint64_t start;
    __asm__ volatile ("rdtsc; shlq $32,%%rdx; orq %%rdx,%%rax" : "=a" (start) : : "%rdx");
    for (int i = 0; i < 10000; i++) 
        kdf((const uint8_t*)in, inlen, out, 8 * 4);
    uint64_t end;
    __asm__ volatile ("rdtsc; shlq $32,%%rdx; orq %%rdx,%%rax" : "=a" (end) : : "%rdx");
    printf("Time: %f\n", (end - start) / 3.6e9);
    /*printf("KDF(\"%s\") =\n", in);*/
    /*for (size_t i = 0; i < 8 * 4; i++) {*/
    /*    printf(" %02x", out[i]);*/
    /*    fprintf(fp, "%02x", out[i]);*/
    /*}*/
    /*printf("\n");*/
    /*fclose(fp);*/
    return 0;
}

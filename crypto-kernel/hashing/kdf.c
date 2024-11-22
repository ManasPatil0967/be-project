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
// #pragma omp parallel
    for (size_t i = 0; i < outlen / 32; i++) {
        shake256(out + i * 32, 32, buf, inlen + 1);
        buf[inlen]++;
    }
    free(buf);
    return out;
}

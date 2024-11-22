#ifndef SIGN_EXTERN
#define SIGN_EXTERN

#include <stdint.h>
#include <stdio.h>
#include "sign.h"
int gen_keypair(uint8_t *pk, uint8_t *sk);

int sign(uint8_t *sm,
                size_t *smlen,
                const uint8_t *m,
                size_t mlen,
                const uint8_t *ctx,
                size_t ctxlen,
                const uint8_t *sk); 

int verify(uint8_t *m,
                     size_t *mlen,
                     const uint8_t *sm,
                     size_t smlen,
                     const uint8_t *ctx,
                     size_t ctxlen,
                     const uint8_t *pk); 

#endif

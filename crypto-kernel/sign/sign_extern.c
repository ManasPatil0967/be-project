#include <stdint.h>
#include <stdio.h>
#include "sign.h"
#include "sign_extern.h"

int gen_keypair(uint8_t *pk, uint8_t *sk) {
    return crypto_sign_keypair(pk, sk);
}

int sign(uint8_t *sm,
                size_t *smlen,
                const uint8_t *m,
                size_t mlen,
                const uint8_t *ctx,
                size_t ctxlen,
                const uint8_t *sk) {
    return crypto_sign(sm, smlen, m, mlen, ctx, ctxlen, sk);
}

int verify(uint8_t *m,
                     size_t *mlen,
                     const uint8_t *sm,
                     size_t smlen,
                     const uint8_t *ctx,
                     size_t ctxlen,
                     const uint8_t *pk) {
    return crypto_sign_open(m, mlen, sm, smlen, ctx, ctxlen, pk);
}

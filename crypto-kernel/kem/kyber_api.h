#ifndef KYBER_API_H
#define KYBER_API_H

#include "kem.h"
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

int generate_keypair(const char* pk_file, const char* sk_file);

int encrypt(const char* pk_file, const char* ct_file, const char* ss_file);

int decrypt(const char* sk_file, const char* ct_file, const char* ss_file);

uint8_t* buf_gen_keypair();

uint8_t* buf_encrypt(uint8_t* pk, uint8_t* ct, uint8_t* ss);

uint8_t* buf_decrypt(uint8_t* sk, uint8_t* ct, uint8_t* ss);

#endif

#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <stdlib.h>

#include "params.h"
#include "sign.h"

int main() {
    // Allocate memory for key pair
    uint8_t pk[CRYPTO_PUBLICKEYBYTES];
    uint8_t sk[CRYPTO_SECRETKEYBYTES];

    // Generate keypair
    if (crypto_sign_keypair(pk, sk) != 0) {
        fprintf(stderr, "Keypair generation failed!\n");
        return EXIT_FAILURE;
    }
    printf("Keypair generated successfully.\n");

    // Define a message to sign
    const char *message = "Hello, this is a test message!";
    size_t message_len = strlen(message);

    // Allocate memory for signed message
    uint8_t signed_message[CRYPTO_BYTES + message_len];
    size_t signed_message_len;

    // Sign the message
    if (crypto_sign(signed_message, &signed_message_len, (const uint8_t *)message, message_len, NULL, 0, sk) != 0) {
        fprintf(stderr, "Signing failed!\n");
        return EXIT_FAILURE;
    }
    printf("Message signed successfully.\n");

    // Allocate memory for the verified message
    uint8_t verified_message[signed_message_len];
    size_t verified_message_len;

    // Verify the signature
    if (crypto_sign_open(verified_message, &verified_message_len, signed_message, signed_message_len, NULL, 0, pk) != 0) {
        fprintf(stderr, "Signature verification failed!\n");
        return EXIT_FAILURE;
    }

    // Check if the verified message matches the original message
    if (verified_message_len != message_len || memcmp(verified_message, message, message_len) != 0) {
        fprintf(stderr, "Verified message does not match the original message!\n");
        return EXIT_FAILURE;
    }

    printf("Signature verified successfully. Verified message: %s\n", verified_message);
    printf("%d %d\n", (int)signed_message_len, (int)verified_message_len);

    return EXIT_SUCCESS;
}

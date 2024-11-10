#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>
#include <time.h>
#include <openssl/sha.h>

typedef struct {
    int p;  // Prime field
    int g;  // Generator
} ZKPIdentitySystem;

typedef struct {
    ZKPIdentitySystem zkp;
    int *registered_users;
    int user_count;
} DigitalIdentitySystem;

// Improved modular exponentiation with overflow protection
int pow_mod(int base, int exp, int mod) {
    long long result = 1;
    long long b = base % mod;
    
    while (exp > 0) {
        if (exp & 1) {
            result = (result * b) % mod;
        }
        b = (b * b) % mod;
        exp >>= 1;
    }
    return (int)result;
}

// Improved modulo function that handles negative numbers correctly
int mod(int a, int m) {
    int result = a % m;
    return result >= 0 ? result : result + m;
}

void init_zkp_identity_system(ZKPIdentitySystem *zkp, int prime_field, int generator) {
    zkp->p = prime_field;
    zkp->g = generator;
}

void generate_user_credentials(ZKPIdentitySystem *zkp, int secret, int *private_key, int *public_key) {
    *private_key = mod(secret, zkp->p - 1);  // Keep private key in range [0, p-2]
    *public_key = pow_mod(zkp->g, *private_key, zkp->p);
}

// Improved proof creation with better random number generation
void create_proof(ZKPIdentitySystem *zkp, int private_key, int challenge, int *commitment, int *response) {
    // Generate random r in range [1, p-2]
    int r = (rand() % (zkp->p - 2)) + 1;
    
    *commitment = pow_mod(zkp->g, r, zkp->p);
    // Calculate response = (r + challenge * private_key) mod (p-1)
    *response = mod(r + (long long)challenge * private_key, zkp->p - 1);
}

int generate_challenge(ZKPIdentitySystem *zkp, int commitment, int nonce) {
    char challenge_input[64];
    snprintf(challenge_input, sizeof(challenge_input), "%d%d", commitment, nonce);
    
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256((unsigned char*)challenge_input, strlen(challenge_input), hash);
    
    // Use only first 4 bytes to avoid overflow
    uint32_t challenge = 0;
    memcpy(&challenge, hash, sizeof(uint32_t));
    return mod(challenge, zkp->p - 1) + 1;  // Ensure non-zero challenge
}

bool verify_proof(ZKPIdentitySystem *zkp, int public_key, int commitment, int challenge, int response) {
    // Verify: g^response ≡ commitment * public_key^challenge (mod p)
    int left_side = pow_mod(zkp->g, response, zkp->p);
    int temp = pow_mod(public_key, challenge, zkp->p);
    int right_side = mod((long long)commitment * temp, zkp->p);
    
    printf("Debug - left_side: %d, right_side: %d\n", left_side, right_side);
    return left_side == right_side;
}

void init_digital_identity_system(DigitalIdentitySystem *id_system, int prime_field) {
    init_zkp_identity_system(&id_system->zkp, prime_field, 2);
    id_system->registered_users = malloc(100 * sizeof(int));
    id_system->user_count = 0;
}

void register_user(DigitalIdentitySystem *id_system, const char *username, int secret, int *private_key, int *public_key) {
    generate_user_credentials(&id_system->zkp, secret, private_key, public_key);
    id_system->registered_users[id_system->user_count++] = *public_key;
    printf("Debug - Registered user with private_key: %d, public_key: %d\n", *private_key, *public_key);
}

bool authenticate_user(DigitalIdentitySystem *id_system, const char *username, int private_key) {
    // Find user's public key
    int public_key = pow_mod(id_system->zkp.g, private_key, id_system->zkp.p);
    bool found = false;
    
    for (int i = 0; i < id_system->user_count; i++) {
        if (id_system->registered_users[i] == public_key) {
            found = true;
            break;
        }
    }
    
    if (!found) {
        printf("Debug - User not found\n");
        return false;
    }

    // Generate proof
    int commitment, response;
    int nonce = rand() % id_system->zkp.p;
    int challenge = generate_challenge(&id_system->zkp, commitment, nonce);
    
    create_proof(&id_system->zkp, private_key, challenge, &commitment, &response);
    
    printf("Debug - Proof parameters:\n");
    printf("  commitment: %d\n  challenge: %d\n  response: %d\n", 
           commitment, challenge, response);
    
    return verify_proof(&id_system->zkp, public_key, commitment, challenge, response);
}

int main() {
    srand(time(NULL));
    
    // Use a small but secure prime for testing
    const int TEST_PRIME = 3329;  // A prime number suitable for testing
    
    DigitalIdentitySystem id_system;
    init_digital_identity_system(&id_system, TEST_PRIME);
    
    const char *username = "alice";
    int secret = (rand() % (TEST_PRIME - 2)) + 1;  // Random secret in [1, p-2]
    int private_key, public_key;
    
    register_user(&id_system, username, secret, &private_key, &public_key);
    printf("User %s registered with public key: %d\n", username, public_key);
    
    bool is_authenticated = authenticate_user(&id_system, username, private_key);
    printf("Authentication %s\n", is_authenticated ? "successful" : "failed");
    
    int wrong_key = mod(private_key + 1, id_system.zkp.p - 1);
    is_authenticated = authenticate_user(&id_system, username, wrong_key);
    printf("Authentication with wrong key %s\n", is_authenticated ? "successful" : "failed");
    
    free(id_system.registered_users);
    return 0;
}

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>
#include <time.h>
#include <openssl/sha.h>

typedef struct {
    int p;
    int g;
} ZKPIdentitySystem;

typedef struct {
    ZKPIdentitySystem zkp;
    int *registered_users;
    int user_count;
} DigitalIdentitySystem;

void init_zkp_identity_system(ZKPIdentitySystem *zkp, int prime_field, int generator) {
    zkp->p = prime_field;
    zkp->g = generator;
}

void generate_user_credentials(ZKPIdentitySystem *zkp, int secret, int *private_key, int *public_key) {
    *private_key = secret % zkp->p;
    *public_key = 1;
    for (int i = 0; i < *private_key; i++) {
        *public_key = (*public_key * zkp->g) % zkp->p;
    }
}

void create_proof(ZKPIdentitySystem *zkp, int private_key, int challenge, int *commitment, int *response) {
    int r = rand() % (zkp->p - 1);
    *commitment = 1;
    for (int i = 0; i < r; i++) {
        *commitment = (*commitment * zkp->g) % zkp->p;
    }
    *response = (r + challenge * private_key) % (zkp->p - 1);
}

int generate_challenge(ZKPIdentitySystem *zkp, int commitment, int nonce) {
    char challenge_input[64];
    snprintf(challenge_input, sizeof(challenge_input), "%d%d", commitment, nonce);
    
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256((unsigned char*)challenge_input, strlen(challenge_input), hash);
    
    int challenge = 0;
    for (int i = 0; i < 8; i++) {
        challenge = (challenge << 8) | hash[i];
    }
    return challenge % zkp->p;
}

bool verify_proof(ZKPIdentitySystem *zkp, int public_key, int commitment, int challenge, int response) {
    int left_side = 1;
    for (int i = 0; i < response; i++) {
        left_side = (left_side * zkp->g) % zkp->p;
    }
    
    int right_side = (commitment * 1) % zkp->p; // Placeholder for public_key^challenge
    for (int i = 0; i < challenge; i++) {
        right_side = (right_side * public_key) % zkp->p;
    }
    
    return left_side == right_side;
}

void init_digital_identity_system(DigitalIdentitySystem *id_system, int prime_field) {
    init_zkp_identity_system(&id_system->zkp, prime_field, 2);
    id_system->registered_users = malloc(100 * sizeof(int)); // Arbitrary size for demonstration
    id_system->user_count = 0;
}

void register_user(DigitalIdentitySystem *id_system, const char *username, int secret, int *private_key, int *public_key) {
    for (int i = 0; i < id_system->user_count; i++) {
        if (id_system->registered_users[i] == secret) {
            printf("Username already registered.\n");
            return;
        }
    }
    
    generate_user_credentials(&id_system->zkp, secret, private_key, public_key);
    id_system->registered_users[id_system->user_count++] = *public_key;
}

bool authenticate_user(DigitalIdentitySystem *id_system, const char *username, int private_key) {
    for (int i = 0; i < id_system->user_count; i++) {
        if (id_system->registered_users[i] == private_key) {
            int public_key = id_system->registered_users[i];
            int nonce = rand() % id_system->zkp.p;
            int commitment, response;
            create_proof(&id_system->zkp, private_key, 0, &commitment, &response);
            int challenge = generate_challenge(&id_system->zkp, commitment, nonce);
            create_proof(&id_system->zkp, private_key, challenge, &commitment, &response);
            return verify_proof(&id_system->zkp, public_key, commitment, challenge, response);
        }
    }
    return false;
}

void demo_system() {
    DigitalIdentitySystem id_system;
    init_digital_identity_system(&id_system, 3329);
    
    const char *username = "alice";
    int secret = rand() % id_system.zkp.p;
    int private_key, public_key;
    register_user(&id_system, username, secret, &private_key, &public_key);
    printf("User %s registered with public key: %d\n", username, public_key);
    
    bool is_authenticated = authenticate_user(&id_system, username, private_key);
    printf("Authentication %s\n", is_authenticated ? "successful" : "failed");
    
    int wrong_key = private_key + 1;
    is_authenticated = authenticate_user(&id_system, username, wrong_key);
    printf("Authentication with wrong key %s\n", is_authenticated ? "successful" : "failed");
}

int main() {
    srand(time(NULL));
    demo_system();
    return 0;
}



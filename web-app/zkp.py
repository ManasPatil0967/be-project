import hashlib
import random
from typing import Tuple
import secrets


class ZKPIdentitySystem:
    def __init__(self, prime_field: int):
        """Initialize the ZKP system with a prime field."""
        self.p = prime_field  # Large prime number for the field
        self.g = 2  # Generator for the multiplicative group

    def generate_user_credentials(self, secret: int) -> Tuple[int, int]:
        """Generate user's public and private credentials."""
        private_key = secret % self.p
        public_key = pow(self.g, private_key, self.p)
        return private_key, public_key

    def create_proof(self, private_key: int) -> Tuple[int, int, int]:
        """Create a ZK proof of identity."""
        # Random value for this proof instance
        r = secrets.randbelow(self.p - 1)
        # Commitment
        commitment = pow(self.g, r, self.p)
        # Challenge - in real system this would come from verifier
        challenge = int(hashlib.sha256(str(commitment).encode()).hexdigest(), 16) % self.p
        # Response
        response = (r + challenge * private_key) % (self.p - 1)

        return commitment, challenge, response

    def verify_proof(self, public_key: int, commitment: int, challenge: int, response: int) -> bool:
        """Verify the ZK proof."""
        # Verify: g^response = commitment * public_key^challenge (mod p)
        left_side = pow(self.g, response, self.p)
        right_side = (commitment * pow(public_key, challenge, self.p)) % self.p

        # Verify challenge matches commitment
        expected_challenge = int(hashlib.sha256(str(commitment).encode()).hexdigest(), 16) % self.p

        return left_side == right_side and challenge == expected_challenge


class DigitalIdentitySystem:
    def __init__(self):
        # Use a 2048-bit prime for production. This is just an example.
        self.zkp = ZKPIdentitySystem(prime_field=3329)
        self.registered_users = {}  # Map of username to public_key

    def register_user(self, username: str, secret: int) -> Tuple[int, int]:
        """Register a new user with the system."""
        private_key, public_key = self.zkp.generate_user_credentials(secret)
        self.registered_users[username] = public_key
        return private_key, public_key

    def authenticate_user(self, username: str, private_key: int) -> bool:
        """Authenticate a user using ZKP."""
        if username not in self.registered_users:
            return False

        public_key = self.registered_users[username]
        commitment, challenge, response = self.zkp.create_proof(private_key)
        return self.zkp.verify_proof(public_key, commitment, challenge, response)


def demo_system():
    """Demonstrate the ZKP-based digital identity system."""
    # Initialize the system
    id_system = DigitalIdentitySystem()

    # Register a new user
    username = "alice"
    secret = secrets.randbelow(id_system.zkp.p)  # User's secret
    private_key, public_key = id_system.register_user(username, secret)

    print(f"User {username} registered with public key: {public_key}")

    # Authenticate the user
    is_authenticated = id_system.authenticate_user(username, private_key)
    print(f"Authentication {'successful' if is_authenticated else 'failed'}")

    # Try to authenticate with wrong private key
    wrong_key = private_key + 1
    is_authenticated = id_system.authenticate_user(username, wrong_key)
    print(f"Authentication with wrong key {'successful' if is_authenticated else 'failed'}")


if __name__ == "__main__":
    demo_system()

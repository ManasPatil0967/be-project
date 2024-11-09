import hashlib
import secrets
from typing import Tuple, Dict

class ZKPIdentitySystem:
    def __init__(self, prime_field: int, generator: int = 2):
        """Initialize the ZKP system with a prime field and generator."""
        self.p = prime_field  
        self.g = generator  
        
    def generate_user_credentials(self, secret: int) -> Tuple[int, int]:
        """Generate user's public and private credentials."""
        private_key = secret % self.p
        public_key = pow(self.g, private_key, self.p)
        return private_key, public_key
    
    def create_proof(self, private_key: int, challenge: int) -> Tuple[int, int, int]:
        """Create a ZKP of identity using an external challenge."""
        
        r = secrets.randbelow(self.p - 1)
        
        commitment = pow(self.g, r, self.p)
        
        response = (r + challenge * private_key) % (self.p - 1)
        
        return commitment, challenge, response
    
    def generate_challenge(self, commitment: int, nonce: int) -> int:
        """Generate a challenge using the commitment and a random nonce."""
        challenge_input = f"{commitment}{nonce}".encode()
        challenge = int(hashlib.sha256(challenge_input).hexdigest(), 16) % self.p
        return challenge
    
    def verify_proof(self, public_key: int, commitment: int, challenge: int, response: int) -> bool:
        """Verify the ZK proof."""
        
        left_side = pow(self.g, response, self.p)
        right_side = (commitment * pow(public_key, challenge, self.p)) % self.p
        return left_side == right_side

class DigitalIdentitySystem:
    def __init__(self, prime_field: int):
        """Initialize the digital identity system with ZKPIdentitySystem."""
        self.zkp = ZKPIdentitySystem(prime_field)
        self.registered_users: Dict[str, int] = {}  
        
    def register_user(self, username: str, secret: int) -> Tuple[int, int]:
        """Register a new user with the system."""
        if username in self.registered_users:
            raise ValueError("Username already registered.")
            
        private_key, public_key = self.zkp.generate_user_credentials(secret)
        self.registered_users[username] = public_key
        return private_key, public_key
    
    def authenticate_user(self, username: str, private_key: int) -> bool:
        """Authenticate a user using ZKP."""
        if username not in self.registered_users:
            return False
            
        public_key = self.registered_users[username]
        
        
        nonce = secrets.randbelow(self.zkp.p)
        
        commitment, _, _ = self.zkp.create_proof(private_key, 0)  
        
        
        challenge = self.zkp.generate_challenge(commitment, nonce)
        
        
        _, _, response = self.zkp.create_proof(private_key, challenge)
        
        
        return self.zkp.verify_proof(public_key, commitment, challenge, response)

def demo_system():
    """Demonstrate the ZKP-based digital identity system."""
    
    id_system = DigitalIdentitySystem(
        prime_field=101
    )
    
    
    username = "alice"
    secret = secrets.randbelow(id_system.zkp.p)  
    private_key, public_key = id_system.register_user(username, secret)
    print(f"User {username} registered with public key: {public_key}")
    
    
    is_authenticated = id_system.authenticate_user(username, private_key)
    print(f"Authentication {'successful' if is_authenticated else 'failed'}")
    
    wrong_key = private_key + 1
    is_authenticated = id_system.authenticate_user(username, wrong_key)
    print(f"Authentication with wrong key {'successful' if is_authenticated else 'failed'}")


if __name__ == "__main__":
    demo_system()


snarkjs wtns calculate circuit_js/circuit.wasm input.json witness.wtns -v
snarkjs groth16 prove circuit.zkey witness.wtns proof.json public.json -v
snarkjs groth16 verify verification_key.json public.json proof.json -v

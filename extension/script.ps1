snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit.zkey -v
snarkjs zkey export verificationkey circuit.zkey verification_key.json -v
snarkjs wtns calculate circuit_js/circuit.wasm input.json witness.wtns -v
snarkjs groth16 prove circuit.zkey witness.wtns proof.json public.json -v
snarkjs groth16 verify verification_key.json public.json proof.json -v

#!/usr/bin/bash
/usr/local/ssl/bin/openssl req -x509 -new -newkey dilithium3 -keyout dilithium3_CA.key -out dilithium3_CA.crt -nodes -subj "/CN=VM2 CA" -days 365 -config /usr/local/ssl/openssl.cnf
/usr/local/ssl/bin/openssl genpkey -algorithm dilithium3 -out dilithium3_cli.key
/usr/local/ssl/bin/openssl req -new -key dilithium3_cli.key -out dilithium3_cli.csr -nodes -subj "/CN=VM2 Client" -config /usr/local/ssl/openssl.cnf
/usr/local/ssl/bin/openssl x509 -req -in dilithium3_cli.csr -out dilithium3_cli.crt -CA dilithium3_CA.crt -CAkey dilithium3_CA.key -CAcreateserial -days 365
/usr/local/ssl/bin/openssl s_client -connect 34.55.135.135:4433 -cert dilithium3_cli.crt -key dilithium3_cli.key -groups kyber768

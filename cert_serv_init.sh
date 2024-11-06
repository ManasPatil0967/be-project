#!/usr/bin/bash
/usr/local/ssl/bin/openssl req -x509 -new -newkey dilithium3 -keyout dilithium3_CA.key -out dilithium3_CA.crt -nodes -subj "/CN=test CA" -days 365 -config /usr/local/ssl/openssl.cnf
/usr/local/ssl/bin/openssl genpkey -algorithm dilithium3 -out dilithium3_srv.key
/usr/local/ssl/bin/openssl req -new -newkey dilithium3 -keyout dilithium3_srv.key -out dilithium3_srv.csr -nodes -subj "/CN=test server" -config /usr/local/ssl/openssl.cnf
/usr/local/ssl/bin/openssl x509 -req -in dilithium3_srv.csr -out dilithium3_srv.crt -CA dilithium3_CA.crt -CAkey dilithium3_CA.key -CAcreateserial -days 365
/usr/local/ssl/bin/openssl s_server -cert dilithium3_srv.crt -key dilithium3_srv.key -www -tls1_3 -groups kyber768:frodo640shake -debug -security_debug_verbose -provider oqsprovider

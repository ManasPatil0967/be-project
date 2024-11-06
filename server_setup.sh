#!/usr/bin/bash
cd /usr/local/src
wget https://github.com/openssl/openssl/releases/download/openssl-3.4.0/openssl-3.4.0.tar.gz
tar -xvf openssl-3.4.0.tar.gz
cd /usr/local/src/openssl-3.4.0
./Configure --prefix=/usr/local/ssl --openssldir=/usr/local/ssl '-Wl,--enable-new-dtags,-rpath,$(LIBRPATH)'

make -j8
make test
sudo make install
/usr/local/ssl/bin/openssl version -a

sudo apt install astyle cmake gcc ninja-build libssl-dev python3-pytest python3-pytest-xdist unzip xsltproc doxygen graphviz python3-yaml valgrind

cd /usr/local/src
git clone https://github.com/open-quantum-safe/liboqs
cd liboqs

mkdir build && cd build
cmake -GNinja ..
ninja
ninja run_tests
sudo ninja install

cd /usr/local/src
git clone https://github.com/open-quantum-safe/oqs-provider
cd oqs-provider
cmake -DOPENSSL_ROOT_DIR=/usr/local/ssl -S . -B _build && cmake --build _build && sudo cmake --install _build

cd _build && ctest --parallel 5 --rerun-failed --output-on-failure -V

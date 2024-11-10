pragma circom 2.1.6;

// include "circomlib/circuits/bitify.circom";
template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;

    var e2=1;
    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * e2;
        e2 = e2+e2;
    }

    lc1 === in;
}

template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;

    component n2b = Num2Bits(n+1);

    n2b.in <== in[0]+ (1<<n) - in[1];

    out <== 1-n2b.out[n];
}

template GreaterEqThan(n) {
    signal input in[2];
    signal output out;

    component lt = LessThan(n);

    lt.in[0] <== in[1];
    lt.in[1] <== in[0]+1;
    lt.out ==> out;
}

template AgeAndIDVerification() {
    signal input age;
    signal input sapID[11];

    signal output isAgeValid;
    signal output isSAPValid;

    component gteq = GreaterEqThan(8);
    component gteq4 = GreaterEqThan(4);
    
    gteq.in[0] <== age;
    gteq.in[1] <== 18;
    gteq.out ==> isAgeValid;

    gteq4.in[0] <== sapID[0];
    gteq4.in[1] <== 6;
    gteq4.out ==> isSAPValid;
    
    isAgeValid * (isAgeValid - 1) === 0;
    isSAPValid* (isSAPValid - 1) === 0;
}

component main { public [ age, sapID ] } = AgeAndIDVerification();

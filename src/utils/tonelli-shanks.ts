import { zeroBI, oneBI } from '../constants';
const ZERO = zeroBI;
const ONE = oneBI;
const TWO = BigInt("2");
const FOUR = BigInt("4");

function powMod(a: bigint, e: bigint, p: bigint): bigint {
    console.log("LOCKICI2")
    console.log("A^e mod p : a: "+a+", e:"+e+", p: "+p)
    return (a**e)%p
    
    //return a.toRed(BN.red(p)).redPow(e).fromRed(); => a^e mod p?
}

function ls(a: bigint, p: bigint): bigint {
    console.log("LOCKICI1")
    return powMod(a, (p - ONE)/TWO, p);
}

function cmp(a: bigint, b: bigint): -1|0|1{
    if(a<b)return -1;
    else if(a>b)return 1;
    else return 0;

}
/**
 * Computes the square root of n mod p if it exists, otherwise null is returned.
 * In other words, find x such that x^2 = n mod p, where p must be an odd prime.
 * The implementation is adapted from https://rosettacode.org/wiki/Tonelli-Shanks_algorithm#Java
 * to reflect the Java library.
 */
export function modSqrt(n: bigint, p: bigint): bigint {
    console.log("Lock1")
    if (!(ls(n, p)===ONE)) {
        console.log("NULLLLL")
        return null;
    }
    console.log("Lock2")

    let q = p - ONE;
    let ss = ZERO;
    console.log("Lock3")

    while ((q && ONE) === ZERO) {
        ss = ss +ONE;
        q = q >> BigInt(1);
    }
    console.log("Lock4")

    if (ss === ONE) {
        return powMod(n, (p + ONE) / FOUR, p);
    }
    console.log("Lock5")

    let z = TWO;
    while (!(ls(z, p)===(p-ONE))) {
        z = z + ONE;
    }
    console.log("Lock6")

    let c = powMod(z, q, p);
    let r = powMod(n, (q + ONE) / TWO, p);
    let t = powMod(n, q, p);
    let m = ss;
    console.log("Lock7")

    for (;;) {    
        console.log("Lock8")

        if (t === ONE) {
            return r;
        }

        let i = ZERO;
        let zz = t;
        while (!(zz === ONE) && cmp(i,m-ONE) < 0) {
            zz = zz*zz % p;
            i = i + ONE;
        }

        let b = c;
        let e = m-i-ONE;
        while (cmp(e,ZERO) > 0) {
            b = b*b %(p);
            e = e-ONE;
        }

        r = r*b % p;
        c = b*b % p;
        t = t*c % p;
        m = i;
    }
}

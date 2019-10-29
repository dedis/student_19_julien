import { zeroBI, oneBI } from '../constants';
const ZERO = zeroBI;
const ONE = oneBI;
const TWO = BigInt("2");
const FOUR = BigInt("4");

// FROM: method 3https://helloacm.com/compute-powermod-abn/
//Note: method 1 and 2 does not work with big numbers
function powMod0(a: bigint, e: bigint, p: bigint): bigint {
    let r = ONE;
    while(e > 0){
        if((e & ONE)=== ONE){
            r = (r * a) % p
        }
        e /= TWO;
        a = (a*a) %p;
    }
    return r    
}
// FROM: method 4https://helloacm.com/compute-powermod-abn/
function powMod1(a: bigint, e:bigint, p:bigint): bigint{
    if(e === ONE){
        return a % p
    }
    let r = powMod1(a, e/TWO, p)
    r = r*r % p
    if((e & ONE)=== ONE){
        r = r*a%p
    }
    return r
}
//from https://en.wikibooks.org/wiki/Algorithm_Implementation/Mathematics/Modular_Exponentiation with java BIGINTEGER
function powMod2(a: bigint, e:bigint, p:bigint): bigint{
    let acc = a
    if(e === ZERO){
        return ONE
    }
    let lenE = e.toString(2).length -1
    for(lenE--; lenE>=0; lenE--){
        acc = acc * acc % p
        let maskn = oneBI << BigInt(lenE);
        let maskAndNumber = maskn & e;
        if(maskAndNumber != zeroBI){
            acc = acc * a % p
        }
    }
    return acc
}
function ls(a: bigint, p: bigint): bigint {
    return powMod(a, (p - ONE)/TWO, p);
}
//this method is just used to call once the different powmod to test the speed
function powMod(a: bigint, e:bigint, p:bigint): bigint{
    return powMod2(a,e,p)
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

    if (!(ls(n, p)===ONE)) {
        return null;
    }
    let q = p - ONE;
    let ss = ZERO;

    while ((q & ONE) === ZERO) {
        ss = ss +ONE;
        q = q >> ONE;
    }

    if (ss === ONE) {
        return powMod(n, (p + ONE) / FOUR, p);
    }

    let z = TWO;
    while (!(ls(z, p)===(p-ONE))) {
        z = z + ONE;
    }

    let c = powMod(z, q, p);
    let r = powMod(n, (q + ONE) / TWO, p);
    let t = powMod(n, q, p);
    let m = ss;

    for (;;) {    

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

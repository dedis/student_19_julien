import { oneBI, zeroBI } from "../constants";

export function egcd(m: bigint, n: bigint): {a:bigint, b:bigint,gcd:bigint}{
    //egcd between p and e1
    //can be done from https://github.com/lpcsmath/egcd/blob/master/javascript/egcd.js
        let a1 : bigint = oneBI;
        let b1 : bigint = zeroBI;
        let a : bigint  = zeroBI;
        let b : bigint = oneBI;
        let c : bigint = m;
        let d :bigint = n;
        let q : bigint = c/d;
        let r = c % d;
        // such that
        //             a1 m + b2 n = c
        //                 am + bn = d
        // (a1 - qa)m + (b1 - qb)n = r
        while (r > 0) {
            let t : bigint = a1;
            a1 = a;
            a = t - q*a; // a1 - qa
            t = b1;
            b1 = b;
            b = t - q*b; // b1 - qb
            c = d;
            d = r;
            q = c/d;
            r = c % d;
        }
    return {
        a:a,
        b:b,
        gcd:d
    };

}
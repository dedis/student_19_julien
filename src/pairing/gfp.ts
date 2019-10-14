import { BNType } from '../constants';

/**
 * Field of size p
 * This object acts as an immutable and then any modification will instantiate
 * a new object.
 */
export default class GfP {
    private static ELEM_SIZE = 256 / 8;

    private v: bigint;

    constructor(value: BNType) {
        this.v = BigInt(value);
    }

    /**
     * Get the BigNumber value
     * @returns the BN object
     */
    getValue(): bigint {
        return this.v;
    }

    /**
     * Compare the sign of the number
     * @returns -1 for a negative, 1 for a positive and 0 for zero
     */
    signum(): -1 | 0 | 1 {
        if(this.v > 0)return 1;
        else if(this.v < 0) return -1;
        else return 0;
    }

    /**
     * Check if the number is one
     * @returns true for one, false otherwise
     */
    isOne(): boolean {
        return this.v === 1n;
    }

    /**
     * Check if the number is zero
     * @returns true for zero, false otherwise
     */
    isZero(): boolean {
        return this.v === 0n;
    }

    /**
     * Add the value of a to the current value
     * @param a the value to add
     * @returns the new value
     */
    add(a: GfP): GfP {
        return new GfP(this.v + a.v);
    }

    /**
     * Subtract the value of a to the current value
     * @param a the value to subtract
     * @return the new value
     */
    sub(a: GfP): GfP {
        if (this.v > a.v) return new GfP(this.v - a.v);
        else return new GfP(a.v - this.v)
        //return new GfP(this.v.sub(a.v));
    }

    /**
     * Multiply the current value by a
     * @param a the value to multiply
     * @returns the new value
     */
    mul(a: GfP): GfP {
        return new GfP(this.v * a.v);
    }

    /**
     * Get the square of the current value
     * @returns the new value
     */
    sqr(): GfP {
        if (this.v < 0n) {
			throw 'square root of negative numbers is not supported'
		}

		if (this.v < 2n) {
			return new GfP(this.v);
		}

		function newtonIteration(n: bigint, x0: bigint): bigint{
			const x1 = ((n / x0) + x0) >> 1n;
			if (x0 === x1 || x0 === (x1 - 1n)) {
				return x0;
			}
			return newtonIteration(n, x1);
		}

		return new GfP(newtonIteration(this.v, 1n));
	}

    /**
     * Get the power k of the current value
     * @param k the coefficient
     * @returns the new value
     */
    pow(k: bigint) {
        return new GfP(this.v ** k);
    }

    /**
     * Get the unsigned modulo p of the current value
     * @param p the modulus
     * @returns the new value
     */
    mod(p: bigint): GfP {
        if(this.v < 0) return new GfP(p +(this.v % p));
        else return new GfP(this.v % p)
        }

    /**
     * Get the modular inverse of the current value
     * @param p the modulus
     * @returns the new value
     */
    invmod(p: bigint): GfP {
        let a : bigint = this.v % p;
        for(let x = 1n; x<p; x++){
            if((a*x)%p==1n)return new GfP(x);
        }
        //https://www.geeksforgeeks.org/multiplicative-inverse-under-modulo-m/
    }

    /**
     * Get the negative of the current value
     * @returns the new value
     */
    negate(): GfP {
        return new GfP(-this.v);
    }

    /**
     * Left shift by k bits of the current value
     * @param k number of positions to switch
     * @returns the new value
     */
    shiftLeft(k: number): GfP {
        let b: bigint = BigInt(k)
        return new GfP(this.v << b);
    }

    /**
     * Compare the current value with a
     * @param o the value to compare
     * @returns -1 when o is greater, 1 when smaller and 0 when equal
     */
    compareTo(o: any): 0 | -1 | 1 {
        if(this.v > o.v)return -1;
        else if(this.v < o.v) return 1;
        else return 0;
    }

    /**
     * Check the equality with o
     * @param o the object to compare
     * @returns true when equal, false otherwise
     */
    equals(o: any): o is GfP {
        return this.v === o.v;
    }

    /**
     * Convert the group field element into a buffer in big-endian
     * and a fixed size.
     * @returns the buffer
     */
    toBytes(): Buffer {
        return new Buffer("Null", "be");
        //return this.v.toArrayLike(Buffer, 'be', GfP.ELEM_SIZE);
    }

    /**
     * Get the hexadecimal representation of the element
     * @returns the hex string
     */
    toString(): string {
        return this.toHex();
    }

    /**
     * Get the hexadecimal shape of the element without leading zeros
     * @returns the hex shape in a string
     */
    toHex(): string {
        return this.v.toString(16);
    }
}

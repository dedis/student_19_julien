import { egcd } from './util-bigint';
import { toBufferBE } from 'bigint-buffer';
import { oneBI, zeroBI } from '../constants';

/**
 * Field of size p
 * This object acts as an immutable and then any modification will instantiate
 * a new object.
 */
export default class GfP {
    private static ELEM_SIZE = 256 / 8;

    private v: bigint;

    constructor(value: bigint) {
        this.v = value;
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
        return this.v === oneBI;
    }

    /**
     * Check if the number is zero
     * @returns true for zero, false otherwise
     */
    isZero(): boolean {
        return this.v === zeroBI;
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
        return new GfP(this.v - a.v)
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
        return this.mul(this)
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
        if(this.v < 0) this.v = p + (this.v % p);
        return new GfP(this.v % p)
        }

    /**
     * Get the modular inverse of the current value
     * @param p the modulus
     * @returns the new value
     */
    invmod(p: bigint): GfP {
        return new GfP(egcd(this.v, p).a % p);
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
        return new GfP(this.v << BigInt(k));
    }

    /**
     * Compare the current value with a
     * @param o the value to compare
     * @returns -1 when o is greater, 1 when smaller and 0 when equal
     */
    compareTo(o: any): 0 | -1 | 1 {
        if(this.v < o.v)return -1;
        else if(this.v > o.v) return 1;
        else return 0;
    }

    /**
     * Check the equality with o
     * @param o the object to compare
     * @returns true when equal, false otherwise
     */
    equals(o: any): o is GfP {
        return this.v == o.v;
    }

    /**
     * Convert the group field element into a buffer in big-endian
     * and a fixed size.
     * @returns the buffer
     */
    toBytes(): Buffer {
        return toBufferBE(this.v, GfP.ELEM_SIZE);
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

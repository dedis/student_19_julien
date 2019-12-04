import { egcd } from './util-bigint';
import { toBufferBE } from 'bigint-buffer';
import { oneBI, zeroBI } from '../constants';
import deePool from 'deepool'


export const GfPPool1 = deePool.create(function makeGFP12(){
        return new GfP(BigInt(0))
})
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

    setValue(v: bigint): GfP{
        this.v = v
        return this
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
    add(a: GfP, b: GfP): GfP {
        this.v = a.v + b.v
        return this
    }

    /**this.mul(this)
     * Subtract the value of a to the current value
     * @param a the value to subtract
     * @return the new value
     */
    sub(a: GfP, b: GfP): GfP {
        this.v = a.v - b.v
        return this
    }

    /**
     * Multiply the current value by a
     * @param a the value to multiply
     * @returns the new value
     */
    mul(a: GfP, b: GfP): GfP {
        this.v = a.v * b.v
        return this
    }

    /**
     * Get the square of the current value
     * @returns the new value
     */
    sqr(a: GfP): GfP {
        this.v = this.mul(a,a).v
        return this
	}

    /**
     * Get the power k of the current value
     * @param k the coefficient
     * @returns the new value
     */
    pow(a: GfP, k: bigint) {
        let tmp = BigInt("1")
        for(let i = BigInt(1); i <= k; i++){
            tmp = tmp * a.v;
        }
        this.v = tmp
        return this;
    }

    /**
     * Get the unsigned modulo p of the current value
     * @param p the modulus
     * @returns the new value
     */
    mod(a: GfP, p: bigint): GfP {
        let tmp: bigint = a.v % p
        if(tmp < 0) tmp += p
        this.v = tmp
        return this
        }

    /**
     * Get the modular inverse of the current value
     * @param p the modulus
     * @returns the new value
     */
    invmod(a: GfP, p: bigint): GfP {
        this.v = egcd(a.v, p).a % p
        return this
    }

    /**
     * Get the negative of the current value
     * @returns the new value
     */
    negate(a: GfP): GfP {
        this.v = -a.v
        return this
    }

    /**
     * Left shift by k bits of the current value
     * @param k number of positions to switch
     * @returns the new value
     */
    shiftLeft(a: GfP, k: number): GfP {
        this.v = a.v << BigInt(k)
        return this
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

    copy(a: GfP): GfP{
        this.setValue(a.v)
        return this
    }

    static release(...a: GfP[]): void{
        for(let i = 0; i<a.length; i++){
            GfPPool1.recycle(a[i])
        }
    }
}

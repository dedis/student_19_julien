import GfP6 from './gfp6';
import GfP from './gfp';
import { xiToPMinus1Over6, xiToPSquaredMinus1Over6, p } from './constants';
import {toBigIntBE, toBufferBE} from 'bigint-buffer';
import { oneBI, zeroBI } from '../constants';
import {GFpPool12} from './gfpPool'
/**
 * Group field element of size p^12
 * This object acts as an immutable and then any modification will instantiate
 * a new object.
 */
var ert = 0
 export default class GfP12 {
    private static ZERO = new GfP12(GfP6.zero(), GfP6.zero());
    private static ONE = new GfP12(GfP6.zero(), GfP6.one());

    /**
     * Get the addition identity for this group field
     * @returns the zero element
     */
    public static zero(): GfP12 {
        return GfP12.ZERO;
    }

    /**
     * Get the multiplication identity for this group field
     * @returns the one element
     */
    public static one(): GfP12 {
        return GfP12.ONE;
    }

    private x: GfP6;
    private y: GfP6;

    constructor(x?: GfP6, y?: GfP6) {
        this.x = x || GfP6.zero();
        this.y = y || GfP6.zero();
    }

    /**
     * Get the x value of the element
     * @returns the x element
     */
    getX(): GfP6 {
        return this.x;
    }

    /**
     * Get the y value of the element
     * @returns the y element
     */
    getY(): GfP6 {
        return this.y;
    }

    /**
     * Check if the element is zero
     * @returns true when zero, false otherwise
     */
    isZero(): boolean {
        return this.x.isZero() && this.y.isZero();
    }

    /**
     * Check if the element is one
     * @returns true when one, false otherwise
     */
    isOne(): boolean {
        return this.x.isZero() && this.y.isOne();
    }

    /**
     * Get the conjugate of the element
     * @returns the new element
     */
    conjugate(): GfP12 {
        //12 calls of this function for one verify
        const x = this.x.neg();

        return new GfP12(x, this.y);
    }

    /**
     * Get the negative of the element
     * @returns the new element
     */
    neg(): GfP12 {
        //0 calls of this function for one verify
        const x = this.x.neg();
        const y = this.y.neg();

        return new GfP12(x, y);
    }

    frobenius(): GfP12 {
        //10 calls of this function for one verify
        const x = this.x.frobenius().mulScalar(xiToPMinus1Over6);
        const y = this.y.frobenius();
        return new GfP12(x, y);
    }

    frobeniusP2(): GfP12 {
        //6 calls of this function for one verify
        const x = this.x.frobeniusP2().mulGfP(new GfP(xiToPSquaredMinus1Over6));
        const y = this.y.frobeniusP2();
        return new GfP12(x, y);
    }

    /**
     * Add b to the current element
     * @param b the element to add
     * @returns the new element
     */
    add(b: GfP12): GfP12 {
        //0 calls of this function for one verify
        const x = this.x.add(b.x);
        const y = this.y.add(b.y);
        return new GfP12(x, y);
    }

    /**
     * Subtract b to the current element
     * @param b the element to subtract
     * @returns the new element
     */
    sub(b: GfP12): GfP12 {
        //0 calls of this function for one verify
        const x = this.x.sub(b.x);
        const y = this.y.sub(b.y);
        return new GfP12(x, y);
    }

    mod(k: bigint): GfP12 {
        //408 calls of this function for one verify
        return new GfP12(this.x.mod(k), this.y.mod(k))
    }


    /**
     * Multiply b by the current element
     * @param b the element to multiply with
     * @returns the new element
     */
    mul(a: GfP12, b: GfP12): GfP12 {
        //210 calls of this function for one verify
        this.x = a.x.mul(b.y, true)
            .add(b.x.mul(a.y, true)).mod(p);

        this.y = a.y.mul(b.y, true)
            .add(a.x.mul(b.x, true).mulTau()).mod(p);
        return this
    }

    /**
     * Multiply the current element by a scalar
     * @param k the scalar
     * @returns the new element
     */
    mulScalar(k: GfP6): GfP12 {
        //4 calls of this function for one verify
        const x = this.x.mul(k);
        const y = this.y.mul(k);
        return new GfP12(x, y);
    }

    /**
     * Get the power k of the current element
     * @param k the coefficient
     * @returns the new element
     */
    exp(k: bigint): GfP12 {
        //12 calls of this function for one verify

        let sum : GfP12 = GFpPool12.use()
        sum = sum.add(GfP12.one())
        let t : GfP12;
        let s :string = k.toString(2);
        //Get the string of the BigInt, convert to byte, then get number of bits

        for (let i = s.length - 1; i >= 0; i--) {
            t = sum.square().mod(p);
            let maskn = oneBI << BigInt(i);
            let maskAndNumber = maskn & k;
            if(maskAndNumber != zeroBI) sum.mul(t, this)
            else sum = t;
        }

        return sum;
    }

    /**
     * Get the square of the current element
     * @returns the new element
     */
    square(): GfP12 {
        //512 calls of this function for one verify
        const v0 = this.x.mul(this.y, true);

        let t = this.x.mulTau();
        t = this.y.add(t);
        let ty = this.x.add(this.y);
        ty = ty.mul(t, true).sub(v0);
        t = v0.mulTau();
        ty = ty.sub(t);
            
        return new GfP12(v0.add(v0), ty);
    }

    /**
     * Get the inverse of the current element
     * @returns the new element
     */
    invert(): GfP12 {
        //2 calls of this function for one verify
        let t1 = this.x.square();
        let t2 = this.y.square();
        t1 = t2.sub(t1.mulTau());
        t2 = t1.invert();

        return new GfP12(this.x.neg(), this.y).mulScalar(t2);
    }

    /**
     * Check the equality with the object
     * @param o the object to compare
     * @returns true when both are equal, false otherwise
     */
    equals(o: any): o is GfP12 {
        return this.x.equals(o.x) && this.y.equals(o.y);
    }

    /**
     * Get the string representation of the element
     * @returns the string representation
     */
    toString(): string {
        return `(${this.x.toString()}, ${this.y.toString()})`;
    }
}

import GfP6 from './gfp6';
import GfP from './gfp';
import { xiToPMinus1Over6, xiToPSquaredMinus1Over6, p } from './constants';
import { oneBI, zeroBI } from '../constants';
import {GfPPool6} from './gfp6'

import deePool from 'deepool'
import GfP2 from './gfp2';



/**
 * Group field element of size p^12
 * This object acts as an immutable and then any modification will instantiate
 * a new object.
 */

 export default class GfP12 {

    /**
     * Get the addition identity for this group field
     * @returns the zero element
     */
    public static zero(): GfP12 {
        return new GfP12(GfP6.zero(), GfP6.zero());
    }

    /**
     * Get the multiplication identity for this group field
     * @returns the one element
     */
    public static one(): GfP12 {
        return new GfP12(GfP6.zero(), GfP6.one());
    }

    private x: GfP6;
    private y: GfP6;

    constructor(x?: GfP6, y?: GfP6) {
        /*this.x = x || GfP6.zero()
        this.y = y || GfP6.zero()*/

        this.x = x instanceof GfP6? new GfP6(new GfP2(x.getX().getX().getValue(), x.getX().getY().getValue()),
                                            new GfP2(x.getY().getX().getValue(), x.getY().getY().getValue()),
                                            new GfP2(x.getZ().getX().getValue(), x.getZ().getY().getValue()))
        : GfP6.zero()

        this.y = y instanceof GfP6? new GfP6(new GfP2(y.getX().getX().getValue(), y.getX().getY().getValue()),
                                            new GfP2(y.getY().getX().getValue(), y.getY().getY().getValue()),
                                            new GfP2(y.getZ().getX().getValue(), y.getZ().getY().getValue()))
        : GfP6.zero()
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

    setX(x: GfP6): GfP12{
        this.x.copy(x)
        return this
    }

    setY(y: GfP6): GfP12{
        this.y.copy(y)
        return this
    }
    
    setXY(a: GfP12): GfP12{
        this.setX(a.x)
        this.setY(a.y)
        return this
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
    conjugate(a: GfP12): GfP12 {
        this.x.neg(a.x)
        this.y.copy(a.y)

        return this
    }

    /**
     * Get the negative of the element
     * @returns the new element
     */
    neg(a: GfP12): GfP12 {
        this.x.neg(a.x);
        this.y.neg(a.y);

        return this
    }

    frobenius(a: GfP12): GfP12 {
        this.x.frobenius(a.x).mulScalar(this.x, xiToPMinus1Over6);
        this.y.frobenius(a.y);
        return this
    }

    frobeniusP2(a: GfP12): GfP12 {
        this.x.frobeniusP2(a.x).mulGfP(this.x, new GfP(xiToPSquaredMinus1Over6));
        this.y.frobeniusP2(a.y);

        return this
    }

    /**
     * Add b to the current element
     * @param b the element to add
     * @returns the new element
     */
    add(a: GfP12, b: GfP12): GfP12 {
        this.x.add(a.x, b.x);
        this.y.add(a.y, b.y);
        return this
    }

    /**
     * Subtract b to the current element
     * @param b the element to subtract
     * @returns the new element
     */
    sub(a: GfP12, b: GfP12): GfP12 {
        this.x.sub(a.x, b.x);
        this.y.sub(a.y, b.y);
        return this
    }

    mod(a: GfP12, k: bigint): GfP12 {
        this.x.mod(a.x, k)
        this.y.mod(a.y, k)
        return this    }


    /**
     * Multiply b by the current element
     * @param b the element to multiply with
     * @returns the new element
     */
    mul(a: GfP12, b: GfP12): GfP12 {
        let tx: GfP6 = GfPPool6.use()
        let t: GfP6 = GfPPool6.use()
        let t1: GfP6 = GfPPool6.use()
        let ty: GfP6 = GfPPool6.use()

        tx.mul(a.x, b.y, true).add(tx, t.mul(b.x, a.y, true)).mod(tx, p)

        
        ty.mul(a.y, b.y, true)

        t.mul(a.x, b.x, true)
        t1.mulTau(t)
        ty.add(ty, t1)
        ty.mod(ty, p)
        this.x.copy(tx)
        this.y.copy(ty)
        GfP6.release(tx, t, t1, ty)
        return this
    }

    /**
     * Multiply the current element by a scalar
     * @param k the scalar
     * @returns the new element
     */
    mulScalar(a: GfP12, k: GfP6): GfP12 {
        this.x.mul(a.x, k);
        this.y.mul(a.y, k);
        return this;
    }

    /**
     * Get the power k of the current element
     * @param k the coefficient
     * @returns the new element
     */
    exp(a: GfP12, k: bigint): GfP12 {
        let sum : GfP12 = GfPPool12.use()
        let t : GfP12 = GfPPool12.use()

        sum.copy(GfP12.one())
        let s :string = k.toString(2);
        //Get the string of the BigInt, convert to byte, then get number of bits

        for (let i = s.length - 1; i >= 0; i--) {

            t.square(sum).mod(t, p);
            let maskn = oneBI << BigInt(i);
            let maskAndNumber = maskn & k;
            if(maskAndNumber != zeroBI) sum.mul(t, a)
            else sum.copy(t);
        }
        this.copy(sum)
        GfP12.release(sum, t)
        return this
    }

    /**
     * Get the square of the current element
     * @returns the new element
     */
    square(a: GfP12): GfP12 {
        let v0: GfP6 = GfPPool6.use()
        let t: GfP6 = GfPPool6.use()
        let ty: GfP6 = GfPPool6.use()
        
        v0.mul(a.x, a.y, true);

        t.mulTau(a.x);
        t.add(a.y, t);
        ty.add(a.x, a.y).mul(ty, t, true).sub(ty, v0);
        t.mulTau(v0);
        this.y.copy(ty.sub(ty, t));
        this.x.copy(t.add(v0,v0))

        GfP6.release(v0, t, ty)

        return this
    }

    /**
     * Get the inverse of the current element
     * @returns the new element
     */
    invert(a: GfP12): GfP12 {
        let t1: GfP6 = GfPPool6.use()
        let t2: GfP6 = GfPPool6.use()
        let t3: GfP6 = GfPPool6.use()

        let gfp12: GfP12 = GfPPool12.use()


        t1.square(a.x);
        t2.square(a.y);

        t1.sub(t2, t3.mulTau(t1));
        t2.invert(t1);
        
        gfp12.x.neg(a.x)
        gfp12.setY(a.y)

        this.mulScalar(gfp12, t2)
        GfP6.release(t1,t2, t3)
        GfP12.release(gfp12)

        return this
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

    copy(a: GfP12): GfP12{
        this.setXY(a)
        return this
    }

    static release(...a:GfP12[]): void{
        for(let i = 0; i<a.length; i++){
            GfPPool12.recycle(a[i])
        }
    }
}

export const GfPPool12 = deePool.create(function makeGFP12(){
    return new GfP12()
})

//GfPPool12.grow(5120)
import GfP2 from './gfp2';
import GfP, { GfPPool1 } from './gfp';

import {
    xiTo2PMinus2Over3,
    xiToPMinus1Over3,
    xiTo2PSquaredMinus2Over3,
    xiToPSquaredMinus1Over3,
    p,
} from './constants';
import { GfPPool2 } from './gfp2';

import deePool from 'deepool'



/**
 * Group field of size p^6
 * This object acts as an immutable and then any modification will instantiate
 * a new object.
 */
export default class GfP6 {

    /**
     * Get the addition identity for this group field
     * @returns the element
     */
    public static zero(): GfP6 {
        return new GfP6();
    }

    /**
     * Get the multiplication identity for this group field
     * @returns the element
     */
    public static one(): GfP6 {
        return new GfP6(GfP2.zero(), GfP2.zero(), GfP2.one());
    }

    private x: GfP2;
    private y: GfP2;
    private z: GfP2;

    constructor(x?: GfP2, y?: GfP2, z?: GfP2) {

        this.x = x instanceof GfP2? new GfP2(x.getX().getValue(), x.getY().getValue()) : GfP2.zero()
        this.y = y instanceof GfP2? new GfP2(y.getX().getValue(), y.getY().getValue()) : GfP2.zero()
        this.z = z instanceof GfP2? new GfP2(z.getX().getValue(), z.getY().getValue()) : GfP2.zero()
        
    }

    /**
     * Get the x value of the group field element
     * @returns the x element
     */
    getX(): GfP2 {
        return this.x;
    }

    /**
     * Get the y value of the group field element
     * @returns the y element
     */
    getY(): GfP2 {
        return this.y;
    }

    /**
     * Get the z value of the group field element
     * @returns the z element
     */
    getZ(): GfP2 {
        return this.z;
    }

    setX(x: GfP2): GfP6{
        this.x.copy(x)
        return this
    }

    setY(y: GfP2): GfP6{
        this.y.copy(y)
        return this
    }

    setZ(z: GfP2): GfP6{
        this.z.copy(z)
        return this
    }

    setXYZ(a: GfP6): GfP6{
        this.setX(a.x)
        this.setY(a.y)
        this.setZ(a.z)
        return this
    }

    /**
     * Check if the element is zero
     * @returns true when zero, false otherwise
     */
    isZero(): boolean {
        return this.x.isZero() && this.y.isZero() && this.z.isZero();
    }

    /**
     * Check if the element is one
     * @returns true when one, false otherwise
     */
    isOne(): boolean {
        return this.x.isZero() && this.y.isZero() && this.z.isOne();
    }

    /**
     * Get the negative of the element
     * @returns the new element
     */
    neg(a: GfP6): GfP6 {
        this.x.negative(a.x)
        this.y.negative(a.y)        
        this.z.negative(a.z)
        return this
    }

    frobenius(a: GfP6): GfP6 {
        this.x.conjugate(a.x).mul(this.x, xiTo2PMinus2Over3);
        this.y.conjugate(a.y).mul(this.y, xiToPMinus1Over3);
        this.z.conjugate(a.z);
        return this
    }

    frobeniusP2(a: GfP6): GfP6 {
        let tmp1 : GfP = GfPPool1.use()
        let tmp2 : GfP = GfPPool1.use()

        tmp1.setValue(xiTo2PSquaredMinus2Over3)
        tmp2.setValue(xiToPSquaredMinus1Over3)

        this.x.mulScalar(a.x, tmp1);
        this.y.mulScalar(a.y, tmp2);
        this.z.copy(a.z)
        GfP.release(tmp1, tmp2)
        return this
    }

    /**
     * Add b to the current element
     * @param b the element to add
     * @returns the new element
     */
    add(a: GfP6, b: GfP6): GfP6 {
        this.x.add(a.x, b.x);
        this.y.add(a.y, b.y);
        this.z.add(a.z, b.z);
        return this
    }

    /**
     * Subtract b to the current element
     * @param b the element to subtract
     * @returns the new element
     */
    sub(a: GfP6, b: GfP6): GfP6 {
        this.x.sub(a.x, b.x);
        this.y.sub(a.y, b.y);
        this.z.sub(a.z, b.z);
        return this
    }

    mod(a: GfP6, k: bigint): GfP6 {
        this.x.mod(a.x, k)
        this.y.mod(a.y, k)
        this.z.mod(a.z, k)
        return this
    }

    /**
     * Multiply the current element by b
     * @param b the element to multiply with
     * @returns the new element
     */
    mul(a: GfP6, b: GfP6, bool?: boolean): GfP6 {
        let v0: GfP2 = GfPPool2.use()
        let v1: GfP2 = GfPPool2.use()
        let v2: GfP2 = GfPPool2.use()
        let t0: GfP2 = GfPPool2.use()
        let t1: GfP2 = GfPPool2.use()
        let tz: GfP2 = GfPPool2.use()


        v0.mul(a.z, b.z, true)
        v1.mul(a.y, b.y, true)
        v2.mul(a.x, b.x, true)

        t0.add(a.x, a.y)
        t1.add(b.x, b.y)
        tz.mul(t0, t1, true)

        if(!bool){
            tz.sub(tz, v1).sub(tz, v2).mulXi(tz).add(tz, v0).mod(tz, p)
        }else{
            tz.sub(tz, v1).sub(tz, v2).mulXi(tz).add(tz, v0)
        }

        t0.add(a.y, a.z)
        t1.add(b.y, b.z)
        this.y.mul(t0, t1, true)
        t0.mulXi(v2)

        if(!bool){
            this.y.sub(this.y, v0).sub(this.y, v1).add(this.y, t0).mod(this.y, p)
        }else{
            this.y.sub(this.y, v0).sub(this.y, v1).add(this.y, t0)
        }
        t0.add(a.x, a.z)
        t1.add(b.x, b.z)

        this.x.mul(t0, t1, true)

        if(!bool){
            this.x.sub(this.x, v0).add(this.x, v1).sub(this.x, v2).mod(this.x, p)
        }else{
            this.x.sub(this.x, v0).add(this.x, v1).sub(this.x, v2)
        }
        this.z.copy(tz)
        GfP2.release(v0,v1,v2,t0,t1,tz)
        return this
    }

    /**
     * Multiply the current element by a scalar
     * @param b the scalar
     * @returns the new element
     */
    mulScalar(a: GfP6, b: GfP2): GfP6 {
        this.x.mul(a.x, b);
        this.y.mul(a.y, b);
        this.z.mul(a.z, b);
        return this
    }

    /**
     * Multiply the current element by a GFp element
     * @param b the GFp element
     * @returns the new element
     */
    mulGfP(a: GfP6, b: GfP): GfP6 {
        this.x.mulScalar(a.x, b);
        this.y.mulScalar(a.y, b);
        this.z.mulScalar(a.z, b);
        return this
    }

    mulTau(a: GfP6): GfP6 {
        this.setX(a.y)
        this.setY(a.z)
        this.z.mulXi(a.x)

        return this
    }

    /**
     * Get the square of the current element
     * @returns the new element
     */
    square(a: GfP6): GfP6 {
        let v0: GfP2 = GfPPool2.use()
        let v1: GfP2 = GfPPool2.use()
        let v2: GfP2 = GfPPool2.use()
        let c0: GfP2 = GfPPool2.use()
        let t: GfP2 = GfPPool2.use()

        v0.square(a.z)
        v1.square(a.y)
        v2.square(a.x)

        c0.add(a.x, a.y).square(c0).sub(c0, v1).sub(c0, v2).mulXi(c0).add(c0, v0)

        this.y.add(a.y, a.z).square(this.y).sub(this.y, v0).sub(this.y, v1).add(this.y, t.mulXi(v2))
        this.x.add(a.x, a.z).square(this.x).sub(this.x, v0).add(this.x, v1).sub(this.x, v2)
        this.z.copy(c0)   

        GfP2.release(v0,v1,v2,c0,t)

        return this
    }

    /**
     * Get the inverse of the element
     * @returns the new element
     */
    invert(a: GfP6): GfP6 {
        let A: GfP2 = GfPPool2.use()
        let B: GfP2 = GfPPool2.use()
        let C: GfP2 = GfPPool2.use()
        let F: GfP2 = GfPPool2.use()
        let t1: GfP2 = GfPPool2.use()


        A.square(a.z).sub(A, t1.mul(a.x, a.y).mulXi(t1))
        B.square(a.x).mulXi(B).sub(B, t1.mul(a.y, a.z))
        C.square(a.y).sub(C, t1.mul(a.x, a.z))

        F.mul(C, a.y).mulXi(F).add(F, t1.mul(A, a.z)).add(F, t1.mul(B, a.x).mulXi(t1)).invert(F)
        
        this.x.mul(C, F)
        this.y.mul(B, F)
        this.z.mul(A, F)
        GfP2.release(A,B,C,F,t1)
        return this
    }

    /**
     * Check the equality with the other object
     * @param o the other object
     * @returns true when both are equal, false otherwise
     */
    equals(o: any): o is GfP6 {
        return this.x.equals(o.x) && this.y.equals(o.y) && this.z.equals(o.z);
    }

    /**
     * Get the string representation of the element
     * @returns a string representation
     */
    toString(): string {
        return `(${this.x.toString()}, ${this.y.toString()}, ${this.z.toString()})`;
    }

    copy(a: GfP6): GfP6{
        this.setXYZ(a)
        return this
    }

    static release(...a:GfP6[]): void{
        for(let i = 0; i<a.length; i++){
            GfPPool6.recycle(a[i])
        }
    }
}

export const GfPPool6 = deePool.create(function makeGFP6(){
    return new GfP6()
})

//GfPPool6.grow(6)
import GfP2 from './gfp2';
import GfP from './gfp';

import {
    xiTo2PMinus2Over3,
    xiToPMinus1Over3,
    xiTo2PSquaredMinus2Over3,
    xiToPSquaredMinus1Over3,
    p,
} from './constants';
import { GfPPool2, GfPPool6 } from './gfpPool';


/**
 * Group field of size p^6
 * This object acts as an immutable and then any modification will instantiate
 * a new object.
 */
export default class GfP6 {
    private static ZERO = new GfP6();
    private static ONE = new GfP6(GfP2.zero(), GfP2.zero(), GfP2.one());

    /**
     * Get the addition identity for this group field
     * @returns the element
     */
    public static zero(): GfP6 {
        return GfP6.ZERO;
    }

    /**
     * Get the multiplication identity for this group field
     * @returns the element
     */
    public static one(): GfP6 {
        return GfP6.ONE;
    }

    private x: GfP2;
    private y: GfP2;
    private z: GfP2;

    constructor(x?: GfP2, y?: GfP2, z?: GfP2) {
        this.x = x || GfP2.zero();
        this.y = y || GfP2.zero();
        this.z = z || GfP2.zero();
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

    setX(a: GfP2): GfP6{
        this.x.copy(a)
        return this
    }

    setY(a: GfP2): GfP6{
        this.y.copy(a)
        return this
    }

    setZ(a: GfP2): GfP6{
        this.z.copy(a)
        return this
    }

    setXYZ(a: GfP2, b: GfP2, c: GfP2): GfP6{
        this.setX(a)
        this.setY(b)
        this.setZ(c)
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
        this.x.negative(a.x);
        this.y.negative(a.y);
        this.z.negative(a.z);
        return this
    }

    frobenius(a: GfP6): GfP6 {
        this.x.conjugate(a.x).mul(this.x, xiTo2PMinus2Over3);
        this.y.conjugate(a.y).mul(this.y, xiToPMinus1Over3);
        this.z.conjugate(a.z);
        return this
    }

    frobeniusP2(a: GfP6): GfP6 {
        this.x.mulScalar(a.x, new GfP(xiTo2PSquaredMinus2Over3));
        this.y.mulScalar(a.y, new GfP(xiToPSquaredMinus1Over3));
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
        let ty: GfP2 = GfPPool2.use()
        let tx: GfP2 = GfPPool2.use()

        v0.mul(a.z, b.z, true)
        v1.mul(a.x, b.x, true)
        v2.mul(a.y, b.y, true)

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
        ty.mul(t0, t1, true)
        t0.mulXi(v2)

        if(!bool){
            ty.sub(ty, v0).sub(ty, v1).add(ty, t0).mod(ty, p)
        }else{
            ty.sub(ty, v0).sub(ty, v1).add(ty, t0)
        }
        t0.add(a.x, a.z)
        t1.add(b.x, b.z)

        tx.mul(t0, t1, true)

        if(!bool){
            tx.sub(tx, v0).add(tx, v1).sub(tx, v2).mod(tx, p)
        }else{
            tx.sub(tx, v0).add(tx, v1).sub(tx, v2)
        }
        this.x.copy(tx)
        this.y.copy(ty)
        this.z.copy(tz)
        GfP2.release(v0,v1,v2,t0,t1,tx,ty,tz)
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
        this.z.mulXi(a.x)
        this.setX(a.y)
        this.setY(a.z)

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
        let c1: GfP2 = GfPPool2.use()
        let c2: GfP2 = GfPPool2.use()

        v0.square(a.z)
        v1.square(a.y)
        v2.square(a.x)

        this.z.copy(c0.add(a.x, a.y).square(c0).sub(c0, v1).sub(c0, v2).mulXi(c0).add(c0, v0))
        this.y.copy(c1.add(a.y, a.z).square(c1).sub(c1, v0).sub(c1, v1).add(c1, c2.mulXi(v2)))
        this.x.copy(c2.add(a.x, a.z).square(c2).sub(c2, v0).add(c2, v1).sub(c2, v2))

        GfP2.release(v0,v1,v2,c0,c1,c2)

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
        this.setXYZ(a.x, a.y, a.z)
        return this
    }

    static release(...a:GfP6[]): void{
        for(let i = 0; i<a.length; i++){
            GfPPool6.recycle(a[i])
        }
    }
}

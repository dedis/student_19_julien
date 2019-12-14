import GfP from './gfp';
import { p } from './constants';
import { zeroBI, oneBI } from '../constants';
import { GfPPool1 } from './gfp';
import deePool from 'deepool'



/**
 * Group field of size p^2
 * This object acts as an immutable and then any modification will instantiate
 * a new object.
 */
export default class GfP2 {

    public static zero(): GfP2 {
        return new GfP2(zeroBI, zeroBI);
    }

    public static one(): GfP2 {
        return new GfP2(zeroBI, oneBI)
    }

    private x: GfP;
    private y: GfP;

    constructor(x: bigint | GfP, y: bigint | GfP) {
        this.x = x instanceof GfP ? x : new GfP(x);
        this.y = y instanceof GfP ? y : new GfP(y);
    }

    /**
     * Get the x value of this element
     * @returns the x element
     */
    getX(): GfP {
        return this.x;
    }

    /**
     * Get the y value of this element
     * @returns the y element
     */
    getY(): GfP {
        return this.y;
    }

    setX(x: GfP): GfP2{
        this.x.copy(x)
        return this
    }

    setY(y: GfP): GfP2{
        this.y.copy(y)
        return this
    }

    setXY(a: GfP2): GfP2{
        this.setX(a.x)
        this.setY(a.y)
        return this
    }

    /**
     * Check if the value is zero
     * @returns true when zero, false otherwise
     */
    isZero(): boolean {
        return this.x.getValue() === zeroBI && this.y.getValue() === zeroBI;
    }

    /**
     * Check if the value is one
     * @returns true when one, false otherwise
     */
    isOne(): boolean {
        return this.x.getValue() === zeroBI && this.y.getValue() === oneBI;
    }

    /**
     * Get the conjugate of the element
     * @return the conjugate
     */
    conjugate(a: GfP2): GfP2 {
        this.y.copy(a.y)
        this.x.negate(a.x)
        return this
    }

    /**
     * Get the negative of the element
     * @returns the negative
     */
    negative(a: GfP2): GfP2 {
        this.x.negate(a.x)
        this.y.negate(a.y)
        return this
    }

    /**
     * Add a to the current element
     * @param a the other element to add
     * @returns the new element
     */
    add(a: GfP2, b: GfP2): GfP2 {
        this.x.add(a.x, b.x)
        this.y.add(a.y, b.y)
        return this
    }

    /**
     * Subtract a to the current element
     * @param a the other element to subtract
     * @returns the new element
     */
    sub(a: GfP2, b: GfP2): GfP2 {
        this.x.sub(a.x, b.x)
        this.y.sub(a.y, b.y)
        return this
    }

    /**
     * Multiply a to the current element
     * @param a the other element to multiply
     * @returns the new element
     */

    mul(a: GfP2, b: GfP2, bool?: boolean): GfP2 {
        let tx : GfP = GfPPool1.use()
        let ty : GfP = GfPPool1.use()
        let t : GfP = GfPPool1.use()

        tx.mul(a.x, b.y)
        t.mul(b.x, a.y)

        if(!bool){
            tx.add(tx,t).mod(tx, p)
        }else{
            tx.add(tx,t)
        }
        ty.mul(a.y, b.y)
        t.mul(a.x, b.x)
        if(!bool){
            ty.sub(ty,t).mod(ty, p)
        }else{
            ty.sub(ty,t)
        }
        this.x.copy(tx)
        this.y.copy(ty)

        GfP.release(tx, ty, t)
        return this
    }

    /**
     * Multiply the current element by the scalar k
     * @param k the scalar to multiply with
     * @returns the new element
     */
    mulScalar(a: GfP2, k: GfP): GfP2 {
        this.x.mul(a.x, k);
        this.y.mul(a.y, k);
        return this
    }

    /**
     * Set e=ξa where ξ=i+3 and return the new element
     * @returns the new element
     */

    mulXi(a: GfP2): GfP2 {
        let tmp : GfP2 = GfPPool2.use()
        tmp.copy(a)

        this.x.add(tmp.x, tmp.x).add(this.x, tmp.x).add(this.x, tmp.y)
        this.y.add(tmp.y, tmp.y).add(this.y, tmp.y).sub(this.y, tmp.x);

        GfP2.release(tmp)
        return this
    }

    /**
     * Get the square value of the element
     * @returns the new element
     */
    square(a: GfP2): GfP2 {
        let t1 : GfP = GfPPool1.use()
        let t2 : GfP = GfPPool1.use()

        t1.sub(a.y, a.x)
        t2.add(a.x, a.y)
        t2.mul(t1, t2).mod(t2, p)

        // intermediate modulo is due to a missing implementation
        // in the library that is actually using the unsigned left
        // shift any time
        t1.mul(a.x, a.y).shiftLeft(t1, 1).mod(t1, p)
        this.x.copy(t1)
        this.y.copy(t2)
        GfP.release(t1, t2)
        return this
    }

    /**
     * Get the inverse of the element
     * @returns the new element
     */
    invert(a: GfP2): GfP2 {
        let t : GfP = GfPPool1.use()
        let t2 : GfP = GfPPool1.use()

        t.mul(a.y, a.y)
        t2.mul(a.x, a.x)
        t.add(t,t2)
        t2.invmod(t, p)

        t.negate(a.x).mul(t, t2).mod(t, p)
        t2.mul(a.y, t2).mod(t2, p)

        this.x.copy(t)
        this.y.copy(t2)

        GfP.release(t, t2)

        return this
    }

    mod(a: GfP2, k: bigint): GfP2 {
        this.x.mod(a.x, k)
        this.y.mod(a.y, k)
        return this
    }

    /**
     * Check the equality of the elements
     * @param o the object to compare
     * @returns true when both are equal, false otherwise
     */
    equals(o: any): o is GfP2 {
        return this.x.equals(o.x) && this.y.equals(o.y);
    }

    /**
     * Get the string representation of the element
     * @returns the string representation
     */
    toString(): string {
        return `(${this.x.toHex()},${this.y.toHex()})`;
    }

    copy(a: GfP2): GfP2{
        this.setXY(a)
        return this
    }

    static release(...a:GfP2[]): void{
        for(let i = 0; i<a.length; i++){
            GfPPool2.recycle(a[i])
        }
    }

}

export const GfPPool2 = deePool.create(function makeGFP2(){
    return new GfP2(0n, 0n)
})
//GfPPool2.grow(2560)
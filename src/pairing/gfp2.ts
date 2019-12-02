import GfP from './gfp';
import { p } from './constants';
import { zeroBI, oneBI } from '../constants';
import { GfPPool1 } from './gfp';
import deePool from 'deepool'

export const GfPPool2 = deePool.create(function makeGFP12(){
        return new GfP2()
})

/**
 * Group field of size p^2
 * This object acts as an immutable and then any modification will instantiate
 * a new object.
 */
export default class GfP2 {
    private static ZERO = new GfP2(zeroBI, zeroBI);
    private static ONE = new GfP2(zeroBI, oneBI);

    public static zero(): GfP2 {
        return GfP2.ZERO;
    }

    public static one(): GfP2 {
        return GfP2.ONE;
    }

    private x: GfP;
    private y: GfP;

    constructor(x?: bigint | GfP, y?: bigint | GfP) {
        this.x = x instanceof GfP ? x : new GfP(x || zeroBI);
        this.y = y instanceof GfP ? y : new GfP(y || zeroBI);
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

    setX(a: GfP): GfP2{
        this.x.copy(a)
        return this
    }

    setY(a: GfP): GfP2{
        this.y.copy(a)
        return this
    }

    setXY(a: GfP, b: GfP): GfP2{
        this.setX(a)
        this.setY(b)
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
        this.y = a.y
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

        GfP.release(tx, ty)
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
        let tx : GfP = GfPPool1.use()
        let ty : GfP = GfPPool1.use()

        tx.add(a.x, a.x).add(tx, a.x).add(tx, a.y)

        ty.add(a.y, a.y).add(ty, a.y).add(ty, a.x);

        this.x.copy(tx)
        this.y.copy(ty)
        GfP.release(tx, ty)
        return this
    }

    /**
     * Get the square value of the element
     * @returns the new element
     */
    square(a: GfP2): GfP2 {
        let t1 : GfP = GfPPool1.use()
        let t2 : GfP = GfPPool1.use()
        let ty : GfP = GfPPool1.use()
        
        t1.sub(a.y, a.x)
        t2.add(a.x, a.y)
        ty.mul(t1, t2).mod(ty, p)

        // intermediate modulo is due to a missing implementation
        // in the library that is actually using the unsigned left
        // shift any time
        t1.mul(a.x, a.y).shiftLeft(t1, 1).mod(t1, p)
        this.x.copy(t1)
        this.y.copy(ty)
        GfP.release(t1, t2, ty)
        return this
    }

    /**
     * Get the inverse of the element
     * @returns the new element
     */
    invert(a: GfP2): GfP2 {
        let t : GfP = GfPPool1.use()
        let t2 : GfP = GfPPool1.use()
        let inv : GfP = GfPPool1.use()
        let tx : GfP = GfPPool1.use()
        let ty : GfP = GfPPool1.use()

        t.mul(a.y, a.y)
        t2.mul(a.x, a.x)
        t.add(t,t2)
        inv.invmod(t, p)

        tx.negate(a.x).mul(tx, inv).mod(tx, p)
        ty.mul(a.y, inv).mod(ty, p)

        this.x.copy(tx)
        this.y.copy(ty)

        GfP.release(t, t2, inv, tx, ty)

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
        this.setXY(a.x, a.y)
        return this
    }

    static release(...a:GfP2[]): void{
        for(let i = 0; i<a.length; i++){
            GfPPool2.recycle(a[i])
        }
    }

}

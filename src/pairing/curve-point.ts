import { createHash } from 'crypto';
import GfP from './gfp';
import { p } from './constants';
import { modSqrt } from '../utils/tonelli-shanks';
import { oneBI, zeroBI } from '../constants';
import {toBigIntBE} from 'bigint-buffer'
import { GfPPool1 } from './gfp';
const curveB = new GfP(BigInt(3));

/**
 * Point class used by G1
 */
export default class CurvePoint {

    public static generator(): CurvePoint {
        return new CurvePoint(oneBI, BigInt(-2), oneBI, oneBI);
    }
    /**
     * Hash the message to a point
     * @param msg The message to hash
     * @returns a valid point
     */
    static hashToPoint(msg: Buffer): CurvePoint {
        const h = createHash('sha256');
        h.update(msg);

        let x = toBigIntBE(h.digest()) % p;

        for (;;) {
            const xxx = (x * x * x) % p;
            const t = xxx + curveB.getValue();

            const y = modSqrt(t, p);
            if (y != null) {
                return new CurvePoint(x, y, oneBI, oneBI);
            }

            x += oneBI;
        }
    }
    
    private x: GfP;
    private y: GfP;
    private z: GfP;
    private t: GfP;

    constructor(x?: bigint, y?: bigint, z?: bigint, t?: bigint) {
        // the coefficient are modulo p to insure we have same
        // values when it comes to comparison
        // Other arithmetic operations are already modulo.
        this.x = new GfP(typeof x !== 'undefined' ? x : zeroBI)
        this.y = new GfP(typeof y !== 'undefined' ? y : oneBI)
        this.z = new GfP(typeof z !== 'undefined' ? z : zeroBI)
        this.t = new GfP(typeof t !== 'undefined' ? t : zeroBI)

        this.x.mod(this.x, p)
        this.y.mod(this.y, p)
        this.z.mod(this.z, p)
        this.t.mod(this.t, p)
    }

    /**
     * Get the x element of the point
     * @returns the x element
     */
    getX(): GfP {
        return this.x;
    }

    /**
     * Get the y element of the point
     * @returns the y element
     */
    getY(): GfP {
        return this.y;
    }

    /**
     * Check if the point is valid by checking if it is on the curve
     * @returns true when the point is valid, false otherwise
     */
    isOnCurve(): boolean {
        let yy : GfP = GfPPool1.use()
        let xxx : GfP = GfPPool1.use()
        yy.sqr(this.y);
        xxx.pow(this.x, BigInt("3"));

        yy.sub(yy, xxx);

        yy.sub(yy, curveB);

        if (yy.signum() < 0 || yy.compareTo(new GfP(p)) >= 0) {
            yy.mod(yy, p);
        }
        let r:boolean = yy.signum() == 0
        GfP.release(yy, xxx)

        return r;
    }

    /**
     * Set the point to the infinity
     */
    setInfinity(): void {
        this.x = new GfP(zeroBI);
        this.y = new GfP(oneBI);
        this.z = new GfP(zeroBI);
        this.t = new GfP(zeroBI);
    }

    /**
     * Check if the point is the infinity
     * @returns true when infinity, false otherwise
     */
    isInfinity(): boolean {
        return this.z.isZero();
    }

    /**
     * Add a to b and set the value to the point
     * @param a the first point
     * @param b the second point
     */
    add(a: CurvePoint, b: CurvePoint): void {
        if (a.isInfinity()) {
            this.copy(b)
            return;
        }

        if (b.isInfinity()) {
            this.copy(a);
            return;
        }

        let z1z1 : GfP = GfPPool1.use()
        let z2z2 : GfP = GfPPool1.use()
        let u1 : GfP = GfPPool1.use()
        let u2 : GfP = GfPPool1.use()
        let t : GfP = GfPPool1.use()
        let s1 : GfP = GfPPool1.use()
        let s2 : GfP = GfPPool1.use()
        let h : GfP = GfPPool1.use()
        let i : GfP = GfPPool1.use()
        let j : GfP = GfPPool1.use()


        z1z1.sqr(a.z);
        z2z2.sqr(b.z);
        u1.mul(a.x, z2z2);
        u2.mul(b.x, z1z1);

        t.mul(b.z, z2z2);
        s1.mul(a.y, t);

        t.mul(a.z, z1z1);
        s2.mul(b.y, t);

        h.sub(u2, u1);

        t.add(h, h);
        i.sqr(t);
        j.mul(h, i);

        t.sub(s2, s1);

        if (h.signum() === 0 && t.signum() === 0) {
            this.dbl(a);
            GfP.release(z1z1, z2z2, u1, u2, t, s1, s2, h, i, j)
            return;
        }

        let r : GfP = GfPPool1.use()
        let v : GfP = GfPPool1.use()
        let t4 : GfP = GfPPool1.use()
        let t6 : GfP = GfPPool1.use()
        let tx : GfP = GfPPool1.use()
        let ty : GfP = GfPPool1.use()
        let tz : GfP = GfPPool1.use()


        r.add(t, t);
        v.mul(u1, i);

        t4.sqr(r);
        t.add(v, v);
        t6.sub(t4, j);
        tx.sub(t6, t).mod(tx, p)

        t.sub(v, tx);
        t4.mul(s1, j);
        t6.add(t4, t4);
        t4.mul(r, t);
        ty.sub(t4, t6).mod(ty, p)

        t.add(a.z, b.z);
        t4.sqr(t);
        t.sub(t4, z1z1);
        t4.sub(t, z2z2);
        tz.mul(t4, h).mod(tz, p)
        
        this.x = tx;
        this.y = ty;
        this.z = tz;


        GfP.release(z1z1, z2z2, u1, u2, t, s1, s2, h, i, j, r, v, t4, t6)
    }

    /**
     * Compute the double of a and set the value to the point
     * @param a the point to double
     */
    dbl(a: CurvePoint): void {
        let A : GfP = GfPPool1.use()
        let B : GfP = GfPPool1.use()
        let C : GfP = GfPPool1.use()
        let t : GfP = GfPPool1.use()
        let t2 : GfP = GfPPool1.use()
        let d : GfP = GfPPool1.use()
        let e : GfP = GfPPool1.use()
        let f : GfP = GfPPool1.use()
        let tx : GfP = GfPPool1.use()
        let ty : GfP = GfPPool1.use()
        let tz : GfP = GfPPool1.use()
        let tmp : GfP = GfPPool1.use()

        A.sqr(a.x);
        B.sqr(a.y);
        C.sqr(B);


        t.add(a.x, B);
        t2.sqr(t);
        t.sub(t2, A);
        t2.sub(t, C);
        d.add(t2, t2);
        t.add(A, A);
        e.add(t, A);
        f.sqr(e);

        t.add(d, d);
        tx.sub(f, t)
        tx.mod(tx, p)
        t.add(C, C);
        t2.add(t,t);
        t.add(t2, t2);
        ty.sub(d, tx)

        t2.mul(e, ty);
        ty.sub(t2, t).mod(ty, p)
        t.mul(a.y, a.z);
        tz.add(t, t).mod(tz, p)

        this.x = tx;
        this.y = ty;
        this.z = tz;

        GfP.release(A,B,C,t,t2,d,e,f) //tx, ty, tz cannot release!
    }

    /**
     * Multiply a by a scalar
     * @param a      the point to multiply
     * @param scalar the scalar
     */
    mul(a: CurvePoint, scalar: bigint): void {
        const sum = new CurvePoint();
        sum.setInfinity();
        const t = new CurvePoint();
        let s :string = scalar.toString(2); //convert bigint to binary string to get length

        for (let i = s.length; i >= 0; i--) {
            t.dbl(sum);          
            let maskn = oneBI << BigInt(i);
            let maskAndNumber = maskn & scalar;
            if(maskAndNumber != zeroBI) sum.add(t,a);
            else sum.copy(t);
        }
        this.copy(sum);
    }

    /**
     * Normalize the point coordinates
     */
    makeAffine(): void {
        if (this.z.isOne()) {
            return;
        } else if (this.z.isZero()) {
            this.setInfinity();
            return;
        }

        let zInv : GfP = GfPPool1.use()
        let zInv2 : GfP = GfPPool1.use()
        let t : GfP = GfPPool1.use()

        zInv.invmod(this.z, p);
        t.mul(this.y, zInv);
        zInv2.sqr(zInv);


        this.y.copy(t.mul(t, zInv2).mod(t, p));
        this.x.copy(this.x.mul(this.x, zInv2).mod(this.x, p));
        this.z.copy(new GfP(oneBI));
        this.t.copy(new GfP(oneBI));
        
        GfP.release(zInv, zInv2, t)
    }

    /**
     * Compute the negative of a and set the value to the point
     * @param a the point to negate
     */
    negative(a: CurvePoint): void {
        let t : GfP = GfPPool1.use()

        this.x.copy(a.x);
        this.y.copy(t.negate(a.y));
        this.z.copy(a.z);
        
        GfP.release(t)
    }

    /**
     * Fill the point with the values of a
     * @param p the point to copy
     */
    copy(p: CurvePoint): void {
        // immutable objects so we can copy them
        this.x = p.x;
        this.y = p.y;
        this.z = p.z;
        this.t = p.t;
    }

    /**
     * Get a clone of the current point
     * @returns a clone of the point
     */
    clone(): CurvePoint {
        const p = new CurvePoint();
        p.copy(this);

        return p;
    }

    /**
     * Check the equality between the point and the object
     * @param o the object
     * @returns true when both are equal, false otherwise
     */
    equals(o: any): o is CurvePoint {
        if (!(o instanceof CurvePoint)) {
            return false;
        }

        const a = this.clone();
        a.makeAffine();

        const b = o.clone();
        b.makeAffine();

        return a.x.equals(b.x) && a.y.equals(b.y) && a.z.equals(b.z) && a.t.equals(b.t);
    }

    /**
     * Get the string representation of the point
     * @returns the string representation
     */
    toString(): string {
        const p = this.clone();
        p.makeAffine();

        return `(${p.getX().toString()},${p.getY().toString()})`;
    }
}

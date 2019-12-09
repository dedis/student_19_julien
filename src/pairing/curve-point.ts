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
        this.x.setValue(zeroBI);
        this.y.setValue(oneBI);
        this.z.setValue(zeroBI);
        this.t.setValue(zeroBI);
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
        //let i : GfP = GfPPool1.use()
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
        u2.sqr(t);
        j.mul(h, u2);

        t.sub(s2, s1);

        if (h.signum() === 0 && t.signum() === 0) {
            this.dbl(a);
            GfP.release(z1z1, z2z2, u1, u2, t, s1, s2, h, j)
            return;
        }

        //let r : GfP = GfPPool1.use()
        //let v : GfP = GfPPool1.use()
        //let t4 : GfP = GfPPool1.use()
        let t6 : GfP = GfPPool1.use()
        //let ty : GfP = GfPPool1.use()
        //let tz : GfP = GfPPool1.use()


        s2.add(t, t);
        u1.mul(u1, u2);

        u2.sqr(s2);
        t.add(u1, u1);
        t6.sub(u2, j);
        this.x.sub(t6, t).mod(this.x, p)

        t.sub(u1, this.x);
        u2.mul(s1, j);
        t6.add(u2, u2);
        u2.mul(s2, t);
        this.y.sub(u2, t6).mod(this.y, p)

        t.add(a.z, b.z);
        u2.sqr(t);
        t.sub(u2, z1z1);
        u2.sub(t, z2z2);
        this.z.mul(u2, h).mod(this.z, p)
        
        //this.x.setValue(tx.getValue())
        //this.x = tx
        //this.y = u1;
        //this.z = u2;


        GfP.release(z1z1, z2z2, t, s1, s2, h, j, t6, u1, u2)
    }

    /**
     * Compute the double of a and set the value to the point
     * @param a the point to double
     */
    dbl(a: CurvePoint): void {
        let A : GfP = GfPPool1.use()
        let B : GfP = GfPPool1.use()
        let C : GfP = GfPPool1.use()
        //let t : GfP = GfPPool1.use()
        let t2 : GfP = GfPPool1.use()
        let d : GfP = GfPPool1.use()
        //let e : GfP = GfPPool1.use()
        let f : GfP = GfPPool1.use()
        //let tx : GfP = GfPPool1.use()
        //let ty : GfP = GfPPool1.use()
        //let tz : GfP = GfPPool1.use()

        A.sqr(a.x);
        B.sqr(a.y);
        C.sqr(B);

        B.add(a.x, B);
        t2.sqr(B);
        B.sub(t2, A);
        t2.sub(B, C);
        d.add(t2, t2);
        B.add(A, A);
        A.add(B, A);
        f.sqr(A);

        B.add(d, d);
        f.sub(f, B)
        f.mod(f, p)
        B.add(C, C);
        t2.add(B,B);
        B.add(t2, t2);
        C.sub(d, f)

        t2.mul(A, C);
        C.sub(t2, B).mod(C, p)
        B.mul(a.y, a.z);
        d.add(B, B).mod(d, p)

        this.x.copy(f);
        this.y.copy(C);
        this.z.copy(d);

        GfP.release(A,B,C,t2,d,f)
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

        this.z.invmod(this.z, p);
        this.y.mul(this.y, this.z);
        this.t.sqr(this.z);

        this.y.copy(this.y.mul(this.y, this.t).mod(this.y, p));
        this.x.copy(this.x.mul(this.x, this.t).mod(this.x, p));
        this.z.copy(new GfP(oneBI));
        this.t.copy(new GfP(oneBI));
    }

    /**
     * Compute the negative of a and set the value to the point
     * @param a the point to negate
     */
    negative(a: CurvePoint): void {
        this.x.copy(a.x);
        this.y.negate(a.y);
        this.z.copy(a.z);
    }

    /**
     * Fill the point with the values of a
     * @param p the point to copy
     */
    copy(p: CurvePoint): void {
        this.x.copy(p.x);
        this.y.copy(p.y);
        this.z.copy(p.z);
        this.t.copy(p.t);
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

import GfP2 from './gfp2';
import { zeroBI, oneBI } from '../constants';
import {p} from './constants'
import { GfPPool2 } from './gfpPool';

const twistB = new GfP2(
    BigInt("6500054969564660373279643874235990574282535810762300357187714502686418407178"),
        BigInt("45500384786952622612957507119651934019977750675336102500314001518804928850249")
);

/**
 * Point class used by G2
 */
export default class TwistPoint {
    static generator = new TwistPoint(
        new GfP2(
            BigInt("21167961636542580255011770066570541300993051739349375019639421053990175267184"),
            BigInt("64746500191241794695844075326670126197795977525365406531717464316923369116492"),
        ),
        new GfP2(
            BigInt("20666913350058776956210519119118544732556678129809273996262322366050359951122"),
            BigInt("17778617556404439934652658462602675281523610326338642107814333856843981424549"),
        ),
        new GfP2(zeroBI, oneBI),
        new GfP2(zeroBI, oneBI),
    );

    private x: GfP2;
    private y: GfP2;
    private z: GfP2;
    private t: GfP2;

    constructor(x?: GfP2, y?: GfP2, z?: GfP2, t?: GfP2) {
            this.x = x || GfP2.zero();
            this.y = y || GfP2.zero();
            this.z = z || GfP2.zero();
            this.t = t || GfP2.zero();
    }

    /**
     * Get the x element of the point
     * @returns the x element
     */
    getX(): GfP2 {
        return this.x;
    }

    /**
     * Get the y element of the point
     * @returns the y element
     */
    getY(): GfP2 {
        return this.y;
    }

    /**
     * Get the z element of the point
     * @returns the z element
     */
    getZ(): GfP2 {
        return this.z;
    }

    /**
     * Get the t element of the point
     * @returns the t element
     */
    getT(): GfP2 {
        return this.t;
    }

    /**
     * Check if the point is on the curve, meaning it's a valid point
     * @returns true for a valid point, false otherwise
     */
    isOnCurve(): boolean {
        const cpy = this.clone();
        cpy.makeAffine();
        if (cpy.isInfinity()) {
            return true;
        }

        let yy : GfP2 = GfPPool2.use()
        let xxx : GfP2 = GfPPool2.use()

        yy.square(cpy.y).mod(yy, p);
        xxx.square(cpy.x).mul(xxx, cpy.x).add(xxx, twistB).mod(xxx, p);
        let result : boolean = yy.equals(xxx)
        GfP2.release(yy, xxx)
        return result
    }

    /**
     * Set the point to the infinity value
     */
    setInfinity(): void {
        this.x = GfP2.zero();
        this.y = GfP2.one();
        this.z = GfP2.zero();
        this.t = GfP2.zero();
    }

    /**
     * Check if the point is the infinity
     * @returns true when the infinity, false otherwise
     */
    isInfinity(): boolean {
        return this.z.isZero();
    }

    /**
     * Add a to b and set the value to the point
     * @param a first point
     * @param b second point
     */
    add(a: TwistPoint, b: TwistPoint): void {
        if (a.isInfinity()) {
            this.copy(b);
            return;
        }
        if (b.isInfinity()) {
            this.copy(a);
            return;
        }

        let z12 : GfP2 = GfPPool2.use()
        let z22 : GfP2 = GfPPool2.use()
        let u1 : GfP2 = GfPPool2.use()
        let u2 : GfP2 = GfPPool2.use()
        let t : GfP2 = GfPPool2.use()
        let s1 : GfP2 = GfPPool2.use()
        let s2 : GfP2 = GfPPool2.use()
        let h : GfP2 = GfPPool2.use()
        let i : GfP2 = GfPPool2.use()
        let j : GfP2 = GfPPool2.use()


        z12.square(a.z);
        z22.square(b.z);
        u1.mul(a.x, z22);
        u2.mul(b.x, z12);

        t.mul(b.z, z22);
        s1.mul(a.y, t);

        t.mul(a.z, z12);
        s2.mul(b.y, t);

        h.sub(u2, u1);
        
        t.add(h, h);
        i.square(t);
        j.mul(h, i);

        t.sub(s2, s1);
        if (h.isZero() && t.isZero()) {
            this.double(a);
            GfP2.release(z12, z22, u1, u2, t, s1, s2, h, i, j)
            return;
        }

        let r : GfP2 = GfPPool2.use()
        let v : GfP2 = GfPPool2.use()
        let t4 : GfP2 = GfPPool2.use()
        let t6 : GfP2 = GfPPool2.use()

        r.add(t, t);
        v.mul(u1, i);

        t4.square(r);
        t.add(v, v);
        t6.sub(t4, j);
        this.x.copy(t6.sub(t6, t));

        t.sub(v, this.x);
        t4.mul(s1, j);
        t6.add(t4, t4);
        t4.mul(r, t);
        this.y.copy(t4.sub(t4, t6));

        t.add(a.z, b.z);
        t4.square(t);
        t.sub(t4, z12);
        t4.sub(t, z22);
        this.z.copy(t4.mul(t4, h));

        GfP2.release(z12, z22, u1, u2, t, s1, s2, h, i, j, r, v, t4, t6)
        }

    /**
     * Compute the double of the given point and set the value
     * @param a the point
     */
    double(a: TwistPoint): void {
        let A : GfP2 = GfPPool2.use()
        let B : GfP2 = GfPPool2.use()
        let C : GfP2 = GfPPool2.use()
        let t : GfP2 = GfPPool2.use()
        let t2 : GfP2 = GfPPool2.use()
        let d : GfP2 = GfPPool2.use()
        let e : GfP2 = GfPPool2.use()
        let f : GfP2 = GfPPool2.use()

        A.square(a.x);
        B.square(a.y);
        C.square(B);

        t.add(a.x, B);
        t2.square(t);
        t.sub(t2, A);
        t2.sub(t, C);
        d.add(t2, t2);
        t.add(A, A);
        e.add(t, A);
        f.square(e);

        t.add(d, d);

        this.x.copy(f.sub(f, t));

        t.add(C, C);
        t2.add(t, t);
        t.add(t2, t2);
        this.y.copy(d.sub(d, this.x));
        t2.mul(e, this.y);
        this.y.copy(t2.sub(t2, t));

        t.mul(a.y, a.z);
        this.z.copy(t.add(t, t));

        GfP2.release(A,B,C,t,t2,d,e,f)
    }

    /**
     * Multiply a point by a scalar and set the value to the point
     * @param a the point
     * @param k the scalar
     */
    mul(a: TwistPoint, k: bigint): void {    
        const sum = new TwistPoint();
        const t = new TwistPoint();
        let s = k.toString(2);

        for (let i = s.length; i >= 0; i--) {
            t.double(sum);
            let maskn = oneBI << BigInt(i);
            let maskAndNumber = maskn & k;
            if(maskAndNumber != zeroBI){
                sum.add(t,a);
            }
            else{
                sum.copy(t);
            }
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
        let zInv : GfP2 = GfPPool2.use()
        let t : GfP2 = GfPPool2.use()
        let zInv2 : GfP2 = GfPPool2.use()

        zInv.invert(this.z);
        t.mul(this.y, zInv);
        zInv2.square(zInv);
        this.y.copy(t.mul(t, zInv2));
        this.x.copy(t.mul(this.x, zInv2));
        this.z = GfP2.one();
        this.t = GfP2.one();

        GfP2.release(zInv, zInv2, t)
    }

    /**
     * Compute the negative of a and set the value to the point
     * @param a the point
     */
    neg(a: TwistPoint): void {
        this.x = a.x;
        let tmp : GfP2 = GfPPool2.use()
        this.y.copy(tmp.negative(a.y));
        GfP2.release(tmp)
        this.z = a.z;
    }

    /**
     * Fill the point with the values of a
     * @param a the point
     */
    copy(a: TwistPoint): void {
        this.x = a.x;
        this.y = a.y;
        this.z = a.z;
        this.t = a.t;
    }

    /**
     * Get the a clone of the current point
     * @returns a copy of the point
     */
    clone(): TwistPoint {
        return new TwistPoint(this.x, this.y, this.z, this.t);
    }

    /**
     * Check the equality between two points
     * @returns true when both are equal, false otherwise
     */
    equals(o: any): o is TwistPoint {
        if (!(o instanceof TwistPoint)) {
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
        const cpy = this.clone();
        cpy.makeAffine();

        return `(${cpy.x.toString()},${cpy.y.toString()},${cpy.z.toString()})`;
    }
}

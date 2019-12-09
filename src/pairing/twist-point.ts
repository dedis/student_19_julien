import GfP2 from './gfp2';
import { zeroBI, oneBI } from '../constants';
import {p} from './constants'
import { GfPPool2 } from './gfp2';
import GfP from './gfp';

const twistB = new GfP2(
    BigInt("6500054969564660373279643874235990574282535810762300357187714502686418407178"),
        BigInt("45500384786952622612957507119651934019977750675336102500314001518804928850249")
);

/**
 * Point class used by G2
 */
export default class TwistPoint {
    public static generator(): TwistPoint {
        return new TwistPoint(
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
    }

    private x: GfP2;
    private y: GfP2;
    private z: GfP2;
    private t: GfP2;

    constructor(x?: GfP2, y?: GfP2, z?: GfP2, t?: GfP2) {

        this.x = x instanceof GfP2? new GfP2(x.getX().getValue(), x.getY().getValue()) : GfP2.zero()
        this.y = y instanceof GfP2? new GfP2(y.getX().getValue(), y.getY().getValue()) : GfP2.zero()
        this.z = z instanceof GfP2? new GfP2(z.getX().getValue(), z.getY().getValue()) : GfP2.zero()
        this.t = t instanceof GfP2? new GfP2(t.getX().getValue(), t.getY().getValue()) : GfP2.zero()

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

        let xxx : GfP2 = GfPPool2.use()
        xxx.square(cpy.x).mul(xxx, cpy.x).add(xxx, twistB).mod(xxx, p);
        cpy.y.square(cpy.y).mod(cpy.y, p)
        
        let result : boolean = cpy.y.equals(xxx)
        GfP2.release(xxx)
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

        //let r : GfP2 = GfPPool2.use()
        //let v : GfP2 = GfPPool2.use()
        //let t4 : GfP2 = GfPPool2.use()
        //let t6 : GfP2 = GfPPool2.use()
        let tx : GfP2 = GfPPool2.use()
        //let ty : GfP2 = GfPPool2.use()
        //let tz : GfP2 = GfPPool2.use()


        u2.add(t, t);
        s2.mul(u1, i);

        u1.square(u2);
        t.add(s2, s2);
        i.sub(u1, j);
        tx.sub(i, t)

        t.sub(s2, tx);
        u1.mul(s1, j);
        i.add(u1, u1);
        u1.mul(u2, t);
        s1.sub(u1, i)

        t.add(a.z, b.z);
        u1.square(t);
        t.sub(u1, z12);
        u1.sub(t, z22);
        t.mul(u1, h)

        /*this.getX().getX().setValue(tx.getX().getValue()) 
        this.getX().getY().setValue(tx.getY().getValue()) */

        //this.x.setXY(tx)

        //this.x.copy(tx)

        this.x = tx
        this.y = s1
        this.z = t

        GfP2.release(z12, z22, u1, u2, s2, h, i, j)
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
        let tx : GfP2 = GfPPool2.use()
        let ty : GfP2 = GfPPool2.use()
        let tz : GfP2 = GfPPool2.use()

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

        tx.sub(f, t)

        t.add(C, C);
        t2.add(t, t);
        t.add(t2, t2);
        ty.sub(d, tx)

        t2.mul(e, ty);
        ty.sub(t2, t)

        t.mul(a.y, a.z);
        tz.add(t, t)

        this.x = tx
        this.y = ty
        this.z = tz
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
        let tx : GfP2 = GfPPool2.use()
        let ty : GfP2 = GfPPool2.use()


        zInv.invert(this.z);
        t.mul(this.y, zInv);
        zInv2.square(zInv);

        ty.mul(t, zInv2)
        tx.mul(this.x, zInv2)

        this.y = ty;
        this.x = tx;
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

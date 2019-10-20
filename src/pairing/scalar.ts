import { randomBytes } from 'crypto';
import { Scalar } from '../index';
import { p } from './constants';
import { int } from '../random';
import BN from 'bn.js'
import { egcd } from './util-bigint'
import { oneBI, zeroBI } from '../constants';
import {toBigIntBE, toBufferBE} from 'bigint-buffer'

export type BNType = number | string | number[] | Buffer | BN;

/**
 * Scalar used in combination with G1 and G2 points
 */
export default class BN256Scalar implements Scalar {
    private v: bigint;

    constructor(value?: bigint) {
        this.v = BigInt(value) % p;
    }

    /**
     * Get the BigNumber value of the scalar
     * @returns the value
     */
    getValue(): bigint {
        return this.v;
    }

    /** @inheritdoc */
    set(a: BN256Scalar): BN256Scalar { //une ligne
        let s : String = this.v.toString(16);
        var string_copy = (' ' + s).slice(1);
        this.v = BigInt(string_copy);
        return this;
    }

    /** @inheritdoc */
    one(): BN256Scalar {
        this.v = oneBI;
        return this;
    }

    /** @inheritdoc */
    zero(): BN256Scalar {
        this.v = zeroBI;
        return this;
    }

    /** @inheritdoc */
    add(a: BN256Scalar, b: BN256Scalar): BN256Scalar {
        this.v = (a.v + b.v) % p;
        return this;
    }

    /** @inheritdoc */
    sub(a: BN256Scalar, b: BN256Scalar): BN256Scalar { //a-b
        this.v = a.v - b.v % p;
        while(this.v < 0) this.v += p 
        return this;
    }

    /** @inheritdoc */
    neg(a: BN256Scalar): BN256Scalar {//thisv = -av
        if(a.v > 0) a.v *= (-oneBI); 
        this.v = a.v % p;
        while(this.v < 0) this.v += p
        return this;
    }

    /** @inheritdoc */
    div(a: BN256Scalar, b: BN256Scalar): BN256Scalar {
        this.v = a.v / b.v % p;
        while(this.v < 0) this.v += p
        return this;
    }

    /** @inheritdoc */
    mul(s1: BN256Scalar, b: BN256Scalar): BN256Scalar {
        this.v = s1.v * b.v % p;
        while(this.v < 0) this.v+=p
        return this;
    }

    /** @inheritdoc */
    inv(a: BN256Scalar): BN256Scalar {
        this.v = egcd(a.v, p).a % p;
        //this.v = a.v.invm(p);
        return this;
    }

    /** @inheritdoc */
    pick(callback?: (length: number) => Buffer): BN256Scalar {
        callback = callback || randomBytes;
        
        const bytes = int(p, callback);
        this.setBytes(bytes);
        return this;
    }

    /** @inheritdoc */
    setBytes(bytes: Buffer): BN256Scalar {
        this.v = BigInt(bytes.toString());
        return this;
    }

    /** @inheritdoc */
    marshalBinary(): Buffer {
        return toBufferBE(this.v, 32)
        //return this.v.toArrayLike(Buffer, 'be', 32);
    }

    /** @inheritdoc */
    unmarshalBinary(buf: Buffer | string): void {
        if(typeof buf === 'string') buf = Buffer.from(buf)
        this.v = toBigIntBE(buf);
    }

    /** @inheritdoc */
    marshalSize(): number{
        return 32;
    }

    /** @inheritdoc */
    clone(): BN256Scalar {
        //from: https://stackoverflow.com/questions/31712808/how-to-force-javascript-to-deep-copy-a-string
        let str : String = this.v.toString(16);
        var string_copy = (' ' + str).slice(1);
        const s = new BN256Scalar(BigInt(string_copy));
        return s;
    }

    /** @inheritdoc */
    equals(s2: BN256Scalar): boolean {
        return this.v === s2.v;
    }
}

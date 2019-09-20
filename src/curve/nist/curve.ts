import elliptic from "elliptic";
import BN from "bn.js";
import { Group, Scalar, Point } from "../../index";
import { BNType } from "../../constants";
import NistPoint from "./point";
import NistScalar from "./scalar";

interface ReductionContext {}

export default class Weierstrass implements Group {
    curve: elliptic.curve.short;
    redN: ReductionContext;
    bitSize: number;
    name: string;
    
    constructor(config: { name: string, bitSize: number, gx: BNType, gy: BNType, p: BNType, a: BNType, b: BNType, n: BN}) {
        let { name, bitSize, gx, gy, p, a, b, n } = config;
        this.name = name;
        const toBN = (b: BNType) => new BN(b, 16, "le");
        this.curve = new elliptic.curve.short({
            g: (<any>[new BN(gx, 16, "le"), new BN(gy, 16, "le")]),
            a: toBN(a),
            b: toBN(b),
            p: toBN(p),
            n: n,
        });
        this.bitSize = bitSize;
        this.redN = BN.red(n);
    }
    
    coordLen(): number {
        return (this.bitSize + 7) >> 3;
    }
    
    /** @inheritdoc */
    scalarLen(): number {
        return (this.curve.n.bitLength() + 7) >> 3;
    }
    
    /** @inheritdoc */
    scalar(): Scalar {
        return new NistScalar(this, this.redN);
    }
    
    /** @inheritdoc */
    pointLen(): number {
        // ANSI X9.62: 1 header byte plus 2 coords
        return this.coordLen() * 2 + 1;
    }
    
    /** @inheritdoc */
    point(): Point {
        return new NistPoint(this);
    }

    /**
     * Get the name of the curve
     * @returns the name
     */
    string(): string {
        return this.name;
    }
}

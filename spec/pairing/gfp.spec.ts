import GfP from '../../src/pairing/gfp';

describe('GfP', () => {
    it('should get the correct sign', () => {
        expect(new GfP(BigInt(123)).signum()).toBe(1);
        expect(new GfP(BigInt(0)).signum()).toBe(0);
        expect(new GfP(BigInt(-123)).signum()).toBe(-1);
    });

    it('should check zero and one', () => {
        const zero = new GfP(BigInt(0));
        const one = new GfP(BigInt(1));

        expect(zero.isZero()).toBeTruthy();
        expect(zero.isOne()).toBeFalsy();

        expect(one.isOne()).toBeTruthy();
        expect(one.isZero()).toBeFalsy();
    });

    it('should add and subtract', () => {
        const three = new GfP(BigInt(1)).add(new GfP(BigInt(2)));
        expect(three.equals(new GfP(BigInt(3)))).toBeTruthy();

        const one = new GfP(BigInt(3)).sub(new GfP(BigInt(2)));
        expect(one.equals(new GfP(BigInt(1)))).toBeTruthy();
    });

    it('should multiply and square', () => {
        const a = new GfP(BigInt(123));

        expect(a.mul(a).mul(a).mul(a).equals(a.sqr().sqr())).toBeTruthy();
        expect(a.pow(BigInt(3)).equals(a.sqr().mul(a))).toBeTruthy();
    });

    it('should compute the modulo', () => {
        const v = new GfP(BigInt(-3));

        expect(v.mod(BigInt(5)).getValue()).toBe(BigInt(2));
    });
});

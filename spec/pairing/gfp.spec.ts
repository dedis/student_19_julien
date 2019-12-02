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
        const one = new GfP(BigInt(1));
        const two = new GfP(BigInt(2));
        let three = new GfP()
        three.add(one, two)

        expect(three.equals(new GfP(BigInt(3)))).toBeTruthy();

        let oneS = new GfP()
        oneS.sub(new GfP(BigInt(3)), new GfP(BigInt(2)));
        expect(oneS.equals(new GfP(BigInt(1)))).toBeTruthy();
    });

    it('should multiply and square', () => {
        const a = new GfP(BigInt(123));
        let result1 = new GfP()
        result1.mul(a,a).mul(result1, a).mul(result1, a)
        let result2 = new GfP()
        result2.sqr(a).sqr(result2)
        expect(result1.equals(result2)).toBeTruthy();

        expect(result1.pow(a, BigInt(3)).equals(result2.sqr(a).mul(result2, a))).toBeTruthy();
    });

    it('should compute the modulo', () => {
        const three = new GfP(BigInt(-3));
        let result = new GfP()

        expect(result.mod(three, BigInt(5)).getValue()).toBe(BigInt(2));
    });
});

import GfP from '../../src/pairing/gfp';
import { oneBI } from '../../src/constants';

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
        let three = new GfP(BigInt(0))
        three.add(one, two)

        expect(three.equals(new GfP(BigInt(3)))).toBeTruthy();

        let oneS = new GfP(BigInt(0))
        oneS.sub(new GfP(BigInt(3)), new GfP(BigInt(2)));
        expect(oneS.equals(new GfP(BigInt(1)))).toBeTruthy();
    });

    it('should multiply and square', () => {
        const a = new GfP(BigInt(123));
        let result1 = new GfP(BigInt(0))
        result1.mul(a,a).mul(result1, a).mul(result1, a)
        let result2 = new GfP(BigInt(0))
        result2.sqr(a).sqr(result2)
        expect(result1.equals(result2)).toBeTruthy();

        expect(result1.pow(a, BigInt(3)).equals(result2.sqr(a).mul(result2, a))).toBeTruthy();
    });

    it('should compute the modulo', () => {
        const three = new GfP(BigInt(-3));
        let result = new GfP(BigInt(0))

        expect(result.mod(three, BigInt(5)).getValue()).toBe(BigInt(2));
    });

    it('should copy correctly', () => {
        let three = new GfP(BigInt(3))
        let three_cp = new GfP(BigInt(0))

        three_cp.copy(three)

        expect(three_cp.equals(three)).toBeTruthy()
        three = new GfP(BigInt(4))
        expect(three_cp.equals(three)).toBeFalsy()
    })

    it('should copy correctly with zeroBI and oneBI', () => {
        let three = new GfP(BigInt(3))
        let one = new GfP(oneBI)
        let one_cp = new GfP(oneBI)

        expect(one.equals(one_cp)).toBeTruthy()

        one.add(one, three)
        expect(one.equals(new GfP(BigInt(4)))).toBeTruthy()
        expect(one.equals(one_cp)).toBeFalsy()

    })

});

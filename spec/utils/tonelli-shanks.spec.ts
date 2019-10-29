import { modSqrt } from '../../src/utils/tonelli-shanks';

describe('Tonelli-Shanks', () => {
    it('should pass the reference test', () => {
        expect(modSqrt(BigInt(10), BigInt(13))).toBe(BigInt(7));
        /*expect(modSqrt(BigInt(56), BigInt(101))).toBe(BigInt(37));
        expect(modSqrt(BigInt(1030), BigInt(10009))).toBe(BigInt(1632));
        expect(modSqrt(BigInt(665820697), BigInt(1000000009))).toBe(BigInt(378633312));
        expect(modSqrt(BigInt(1032), BigInt(10009))).toBeNull();

        const a = BigInt("41660815127637347468140745042827704103445750172002");
        const b = BigInt("100000000000000000000000000000000000000000000000577");
        expect(modSqrt(a, b) === (BigInt("32102985369940620849741983987300038903725266634508"))).toBeTruthy();*/
    });
});

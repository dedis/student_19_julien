import { modSqrt } from '../../src/utils/tonelli-shanks';

describe('Tonelli-Shanks', () => {
    it('should pass the reference test', () => {
        expect(modSqrt(10n, 13n)).toBe(7n);
        expect(modSqrt(56n, 101n)).toBe(37n);
        expect(modSqrt(1030n, 10009n)).toBe(1632n);
        expect(modSqrt(665820697n, 1000000009n)).toBe(378633312n);
        expect(modSqrt(1032n, 10009n)).toBeNull();

        const a = 41660815127637347468140745042827704103445750172002n;
        const b = 100000000000000000000000000000000000000000000000577n;
        expect(modSqrt(a, b) === (32102985369940620849741983987300038903725266634508n)).toBeTruthy();
    });
});

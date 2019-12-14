import GfP from '../../src/pairing/gfp';
import {p} from '../../src/pairing/constants';

import { oneBI } from '../../src/constants';

describe('GfP', () => {
    it('should get the correct sign', () => {
        expect(new GfP(123n).signum()).toBe(1);
        expect(new GfP(0n).signum()).toBe(0);
        expect(new GfP(-123n).signum()).toBe(-1);
    });

    it('should check zero and one', () => {
        const zero = new GfP(0n);
        const one = new GfP(1n);

        expect(zero.isZero()).toBeTruthy();
        expect(zero.isOne()).toBeFalsy();

        expect(one.isOne()).toBeTruthy();
        expect(one.isZero()).toBeFalsy();
    });

    it('should add and subtract', () => {
        const one = new GfP(1n);
        const two = new GfP(2n);
        let three = new GfP(0n)
        three.add(one, two)

        expect(three.equals(new GfP(3n))).toBeTruthy();

        let oneS = new GfP(0n)
        oneS.sub(new GfP(3n), new GfP(2n));
        expect(oneS.equals(new GfP(1n))).toBeTruthy();
    });

    it('should multiply and square', () => {
        const a = new GfP(123n);
        let result1 = new GfP(0n)
        result1.mul(a,a).mul(result1, a).mul(result1, a)
        let result2 = new GfP(0n)
        result2.sqr(a).sqr(result2)
        expect(result1.equals(result2)).toBeTruthy();

        expect(result1.pow(a, 3n).equals(result2.sqr(a).mul(result2, a))).toBeTruthy();
    });

    it('should compute the modulo', () => {
        const three = new GfP(-3n);
        let result = new GfP(0n)

        expect(result.mod(three, 5n).getValue()).toBe(2n);
    });

    it('should copy correctly', () => {
        let three = new GfP(3n)
        let three_cp = new GfP(0n)

        three_cp.copy(three)

        expect(three_cp.equals(three)).toBeTruthy()
        three = new GfP(4n)
        expect(three_cp.equals(three)).toBeFalsy()
    })

    it('should copy correctly with zeroBI and oneBI', () => {
        let three = new GfP(3n)
        let one = new GfP(oneBI)
        let one_cp = new GfP(oneBI)

        expect(one.equals(one_cp)).toBeTruthy()

        one.add(one, three)
        expect(one.equals(new GfP(4n))).toBeTruthy()
        expect(one.equals(one_cp)).toBeFalsy()

    })
    it('should compute the invmod', () => {
        let v = new GfP(0n);
        const result = new GfP(19500164908693981119838931622707971722847607432286901071563143508059255221535n)
        expect(result.equals(v.invmod(new GfP(10n),p))).toBeTruthy()
    });

    it('should compute the negate', () => {
        const v = new GfP(10n);
        const result = new GfP(-10n)
        expect(result.equals(v.negate(v))).toBeTruthy()
    });

    it('should compute the shiftLeft', () => {
        const v = new GfP(2n);
        const result = new GfP(8n)
        expect(result.equals(v.shiftLeft(v, 2))).toBeTruthy()
    });

    it('should be ok', () => {
        let a = new GfP(2n)
        let b = new GfP(3n)

        a.add(a,b) 
        expect(a.equals(new GfP(5n))).toBeTruthy()
        a.sub(a,b) 
        expect(a.equals(new GfP(2n))).toBeTruthy()
        a.mul(a,b) 
        expect(a.equals(new GfP(6n))).toBeTruthy()
        a.sqr(a) 
        expect(a.equals(new GfP(36n))).toBeTruthy()
        b.pow(b,2n) 
        expect(b.equals(new GfP(9n))).toBeTruthy()
        a.mod(a,34n) 
        expect(a.equals(new GfP(2n))).toBeTruthy()   
        a.invmod(a, 5n) 
        expect(a.equals(new GfP(-2n))).toBeTruthy()     
        a.negate(a) 
        expect(a.equals(new GfP(2n))).toBeTruthy()    
        a.shiftLeft(a, 1) 
        expect(a.equals(new GfP(4n))).toBeTruthy()    
    });

});

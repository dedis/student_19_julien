import GfP12 from '../../src/pairing/gfp12';
import GfP6 from '../../src/pairing/gfp6';
import GfP2 from '../../src/pairing/gfp2';
import {p} from '../../src/pairing/constants'


describe('GfP12', () => {
    const a = new GfP12(
        new GfP6(
            new GfP2(BigInt("239846234862342323958623"), BigInt("2359862352529835623")),
            new GfP2(BigInt("928836523"), BigInt("9856234")),
            new GfP2(BigInt("235635286"), BigInt("5628392833")),
        ),
        new GfP6(
            new GfP2(BigInt("252936598265329856238956532167968"), BigInt("23596239865236954178968")),
            new GfP2(BigInt("95421692834"), BigInt("236548")),
            new GfP2(BigInt("924523"), BigInt("12954623")),
        ),
    );

    it('should generate one and zero', () => {
        const one = GfP12.one();
        const zero = GfP12.zero();

        expect(one.isOne()).toBeTruthy();
        expect(one.isZero()).toBeFalsy();

        expect(zero.isZero()).toBeTruthy();
        expect(zero.isOne()).toBeFalsy();

    });

    it('should invert', () => {
        let inv: GfP12 = new GfP12()
        let b: GfP12 = new GfP12()
        inv.invert(a).mod(inv, p);
        b.mul(inv, a).mod(b, p);

        expect(b.equals(GfP12.one())).toBeTruthy();
        expect(inv.invert(inv).mod(inv, p).equals(a)).toBeTruthy();

    });

    it('should square and multiply', () => {
        let s: GfP12 = new GfP12()
        let m: GfP12 = new GfP12()
        let e: GfP12 = new GfP12()
        s.square(a).square(s).mod(s, p);
        m.mul(a,a).mul(m, a).mul(m, a).mod(m, p)
        e.exp(a, BigInt(4)).mod(e, p);

        expect(s.equals(m)).toBeTruthy();
        expect(s.equals(e)).toBeTruthy();
    });

    it('should add and subtract', () => {

        let aa: GfP12 = new GfP12()

        aa.add(a, a);
        
        expect(aa.equals(a)).toBeFalsy();
        expect(aa.sub(aa, a).equals(a)).toBeTruthy();
    });

    it('should get the negative and conjugate', () => {

        let n: GfP12 = new GfP12()
        let c: GfP12 = new GfP12()

        n.neg(a);
        c. conjugate(a);

        expect(n.neg(n).equals(a)).toBeTruthy();
        expect(c.conjugate(c).equals(a)).toBeTruthy();
    });

    it('should stringify', () => {
        const one = GfP12.one();
        expect(one.toString()).toBe('(((0,0), (0,0), (0,0)), ((0,0), (0,0), (0,1)))');
    });

    it('should frobenius', () => {
        let resultX = new GfP6(new GfP2(BigInt("11951074425567777564236029039896222338774648658250291865040489018946803642454"), 
        BigInt("54892081592070714004140562431172134438914422279988122694327468951464209228823")), 
        new GfP2(BigInt("55871656295660682778589169201506763040614850432363368324337538269245463106192"), 
        BigInt("64891947365893780477746923039032691731224683261395203559505651799828661486727")), 
        new GfP2(BigInt("13464889642955989182009508794408907850611767649866604862445875769449614297226"), 
        BigInt("5640063634167691042520063438873018708638817292133147492781930735920127791477")))

        let resultY = new GfP6(new GfP2(BigInt("28152323120607927190218192779910391152701941058916432859497304682776769991622"), 
        BigInt("55734300093404421876748464705174980704432171729564016209090420481188089760034")), 
        new GfP2(BigInt("6087667313783309146204506108016468116620164759228018777302115148330049661099"), 
        BigInt("28517111945463571914995714328413613929254435216511068285093402171405872273928")), 
        new GfP2(BigInt("-924523"), 
        BigInt("12954623")))

        let result = new GfP12(resultX, resultY)
        expect(a.frobenius(a).equals(result)).toBeTruthy();
    });
    it('should frobeniusP2', () => {
        let resultX = new GfP6(new GfP2(BigInt("6247822650262726712026905200523361283255902223357314825951963468303087107462"), 
        BigInt("11765762388506801491672576877257674857126465981126323377754601392893855886313")), 
        new GfP2(BigInt("65000549695646603732796438742359905742825358107623003571877145026863255235260"), 
        BigInt("65000549695646603732796438742359905742825358107623003571877145026864174215549")), 
        new GfP2(BigInt("65000549694471777250882472278321960186857207668919984848612206659804971689203"), 
        BigInt("65000549667584656547080064460481235808580712314369965919913637891762210164793")))

        let resultY = new GfP6(new GfP2(BigInt("20880324707934861675111709993496910659323629708447681380972443893281733724888"), 
        BigInt("59745073034512130396339095922579101980851635346106739609846673526361441225593")), 
        new GfP2(BigInt("65000549219894717869473895674655062241550227993953194543624057059859986837929"), 
        BigInt("65000549695645424355720274585268699768074305100859091643707987566122709306795")), 
        new GfP2(BigInt("924523"), 
        BigInt("12954623")))

        let result = new GfP12(resultX, resultY)

        expect(a.frobeniusP2(a).mod(a,p).equals(result)).toBeTruthy();
    });

    it('should mulScalar', () => {
        let multScalar = new GfP6(new GfP2(BigInt("1"), 
        BigInt("2")), 
        new GfP2(BigInt("3"), 
        BigInt("4")), 
        new GfP2(BigInt("5"), 
        BigInt("6")))

        let aX = new GfP6(new GfP2(BigInt("1"), 
        BigInt("2")), 
        new GfP2(BigInt("3"), 
        BigInt("4")), 
        new GfP2(BigInt("5"), 
        BigInt("6")))

        let aY = new GfP6(new GfP2(BigInt("7"), 
        BigInt("8")), 
        new GfP2(BigInt("9"), 
        BigInt("10")), 
        new GfP2(BigInt("11"), 
        BigInt("12")))

        let resultX = new GfP6(new GfP2(BigInt("56"), 
        BigInt("21")), 
        new GfP2(BigInt("91"), 
        BigInt("23")), 
        new GfP2(BigInt("130"), 
        BigInt("21")))

        let resultY = new GfP6(new GfP2(BigInt("182"), 
        BigInt("39")), 
        new GfP2(BigInt("259"), 
        BigInt("35")), 
        new GfP2(BigInt("388"), 
        BigInt("3")))

        let aa = new GfP12(aX, aY)
        let result = new GfP12(resultX, resultY)

        //console.log("A mulS: "+aa.mulScalar(multScalar))

        expect(aa.mulScalar(aa, multScalar).equals(result)).toBeTruthy();
    });

});

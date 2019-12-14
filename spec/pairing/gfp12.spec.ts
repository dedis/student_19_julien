import GfP12 from '../../src/pairing/gfp12';
import GfP6 from '../../src/pairing/gfp6';
import GfP2 from '../../src/pairing/gfp2';
import {p, xiToPSquaredMinus1Over6} from '../../src/pairing/constants'
import { stringify } from 'querystring';


describe('GfP12', () => {
    const a = new GfP12(
        new GfP6(
            new GfP2(239846234862342323958623n, 2359862352529835623n),
            new GfP2(928836523n, 9856234n),
            new GfP2(235635286n, 5628392833n),
        ),
        new GfP6(
            new GfP2(252936598265329856238956532167968n, 23596239865236954178968n),
            new GfP2(95421692834n, 236548n),
            new GfP2(924523n, 12954623n),
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
        e.exp(a, 4n).mod(e, p);

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
        let t = new GfP12()
        let resultX = new GfP6(new GfP2(11951074425567777564236029039896222338774648658250291865040489018946803642454n, 
        54892081592070714004140562431172134438914422279988122694327468951464209228823n), 
        new GfP2(55871656295660682778589169201506763040614850432363368324337538269245463106192n, 
        64891947365893780477746923039032691731224683261395203559505651799828661486727n), 
        new GfP2(13464889642955989182009508794408907850611767649866604862445875769449614297226n, 
        5640063634167691042520063438873018708638817292133147492781930735920127791477n))

        let resultY = new GfP6(new GfP2(28152323120607927190218192779910391152701941058916432859497304682776769991622n, 
        55734300093404421876748464705174980704432171729564016209090420481188089760034n), 
        new GfP2(6087667313783309146204506108016468116620164759228018777302115148330049661099n, 
        28517111945463571914995714328413613929254435216511068285093402171405872273928n), 
        new GfP2(-924523n, 
        12954623n))

        let result = new GfP12(resultX, resultY)
        expect(t.frobenius(a).equals(result)).toBeTruthy();

    });
    it('should frobeniusP2', () => {
        let t = new GfP12()
        let resultX = new GfP6(new GfP2(6247822650262726712026905200523361283255902223357314825951963468303087107462n, 
        11765762388506801491672576877257674857126465981126323377754601392893855886313n), 
        new GfP2(65000549695646603732796438742359905742825358107623003571877145026863255235260n, 
        65000549695646603732796438742359905742825358107623003571877145026864174215549n), 
        new GfP2(65000549694471777250882472278321960186857207668919984848612206659804971689203n, 
        65000549667584656547080064460481235808580712314369965919913637891762210164793n))

        let resultY = new GfP6(new GfP2(20880324707934861675111709993496910659323629708447681380972443893281733724888n, 
        59745073034512130396339095922579101980851635346106739609846673526361441225593n), 
        new GfP2(65000549219894717869473895674655062241550227993953194543624057059859986837929n, 
        65000549695645424355720274585268699768074305100859091643707987566122709306795n), 
        new GfP2(924523n, 
        12954623n))

        let result = new GfP12(resultX, resultY)

        expect(t.frobeniusP2(a).mod(t, p).equals(result)).toBeTruthy();
    });

    it('should mulScalar', () => {
        let multScalar = new GfP6(new GfP2(1n, 2n), 
        new GfP2(3n, 4n), 
        new GfP2(5n, 6n))

        let aX = new GfP6(new GfP2(1n, 2n), 
        new GfP2(3n, 4n), 
        new GfP2(5n, 6n))

        let aY = new GfP6(new GfP2(7n, 8n), 
        new GfP2(9n, 10n), 
        new GfP2(11n, 12n))

        let resultX = new GfP6(new GfP2(56n, 21n), 
        new GfP2(91n, 23n), 
        new GfP2(130n, 21n))

        let resultY = new GfP6(new GfP2(182n, 39n), 
        new GfP2(259n, 35n), 
        new GfP2(388n, 3n))

        let aa = new GfP12(aX, aY)
        let result = new GfP12(resultX, resultY)

        expect(aa.mulScalar(aa, multScalar).equals(result)).toBeTruthy();
    });

    it('should be ok', () => {
        let a1 = new GfP2(2n, 2n)
        let a2 = new GfP2(2n, 2n)
        let a3 = new GfP2(2n, 2n)

        let b1 = new GfP2(2n, 2n)
        let b2 = new GfP2(2n, 2n)
        let b3 = new GfP2(2n, 2n)

        let a_cp_x = new GfP6(a1, a2, a3)
        let b_cp_y = new GfP6(b1, b2, b3)

        let a_cp = new GfP12(a_cp_x, b_cp_y)

        let a = new GfP12()

        a.copy(a_cp)

        let r1x = new GfP2(2n, 2n)
        let r2x = new GfP2(2n, 2n)
        let r3x = new GfP2(2n, 2n)

        let r1y = new GfP2(2n, 2n)
        let r2y = new GfP2(2n, 2n)
        let r3y = new GfP2(2n, 2n)

        let result = new GfP12(new GfP6(r1x, r2x, r3x), new GfP6(r1y, r2y, r3y))

        a.neg(a).neg(a).conjugate(a).conjugate(a)
        expect(a.equals(result)).toBeTruthy()

        a.frobenius(a) 
        r1x = new GfP2(58214036976977759740636283536938818881727097191801885403170931162284826453877n, 
        11767085468398044347907163779855421383437327721981395691948678331998790755030n)
        
        r2x = new GfP2(24662724392558161314511115453324284125679458361773736787764352335698624000470n, 
        49325448785116322629022230906648568251358916723547473575528704671397248000940n)

        r3x = new GfP2(42343231802146788265143680498783111063982740454153814495232429343203638260975n, 
        57334837809834665186497517590590833713186595133570231288825326142793598253352n)

        r1y = new GfP2(61479572611929031958591943323323504954753224517927796502275731080760856923693n, 
        18060952746522072900622589492015272376015200971496255968244032394721483154635n)

        r2y = new GfP2(20333082938696529944666518337496278131972942519489589798370614331487014950688n, 
        19058506721568449448775213427477412750486761989313236939456322230699945645765n)

        r3y = new GfP2(-2n, 2n)

        result = new GfP12(new GfP6(r1x, r2x, r3x), new GfP6(r1y, r2y, r3y))
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)


        a.frobeniusP2(a) 
        r1x = new GfP2(648157314786975012248362146631102883971864815106868596978765572274638227104441657271124432967342842539405465836944789705533381769069180n, 
        648157314786975012248362146631102883971864815106868596978765572274638227104441657271124432967342842539405465836944789705533381769069180n)
        
        r2x = new GfP2(8450142921472447577020951234367735971403447788849905714894114215573728765879529074022919494479453595318418477548628284222210070812437051530075548064502512n, 
        8450142921472447577020951234367735971403447788849905714894114215573728765879529074022919494479453595318418477548628284222210070812437051530075548064502512n)

        r3x = new GfP2(130001099391293207455621310816101542963355243405896473316269566706606762875506n, 
        130001099391293207455621310816101542963355243405896473316269566706606762875506n)

        r1y = new GfP2(9971566668618268522295472809349533827484723347121605268060n, 
        9971566668618268522295472809349533827484723347121605268060n)

        r2y = new GfP2(130001099391293207455621310816101542963355243405896473316269566706606762875504n, 
        130001099391293207455621310816101542963355243405896473316269566706606762875504n)

        r3y = new GfP2(2n, 2n)

        result = new GfP12(new GfP6(r1x, r2x, r3x), new GfP6(r1y, r2y, r3y))
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.add(a, a).add(a,a).sub(a, a_cp).mod(a, 4n)
        expect(a.equals(a_cp)).toBeTruthy()

        a.mul(a,a).mulScalar(a, a_cp_x).mod(a, 650005496956466037327964387423599057428253581076230035718771450268641840n)
        r1x = new GfP2(384n, 71207n)
        r2x = new GfP2(480n, 70919n)
        r3x = new GfP2(544n, 70407n)
        r1y = new GfP2(432n, 71063n)
        r2y = new GfP2(512n, 70663n)
        r3y = new GfP2(560n, 70039n)
        result = new GfP12(new GfP6(r1x, r2x, r3x), new GfP6(r1y, r2y, r3y))
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

        a.exp(a, 2n).square(a).invert(a).mod(a, 3073225989610171424486615623738776343520782931328415608878351416870138622913n)
        r1x = new GfP2(0n, 0n)
        r2x = new GfP2(9n, 838507091073841188153074059776442784082447119588336746077215170846547974526n)
        r3x = new GfP2(9n, 838507091073841188153074059776442784082447119588336746077215170846547974526n)
        r1y = new GfP2(2420620470665879523009339378765482889862816335927880653016704880800422214835n, 
        1558388178953127324493794618848078740184237960630261510635754552019068813130n)
        r2y = new GfP2(2230818865554591440109573777637791965093766290253621482586823617321978797358n, 
        2278269266832413460834515177919714696286028801672186275194293933191589651734n)
        r3y = new GfP2(2420620470665879523009339378765482889862816335927880653016704880800422214835n, 
        1558388178953127324493794618848078740184237960630261510635754552019068813130n)
        result = new GfP12(new GfP6(r1x, r2x, r3x), new GfP6(r1y, r2y, r3y))
        expect(a.equals(result)).toBeTruthy()
        a.copy(a_cp)

    });

});

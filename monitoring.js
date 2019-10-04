
var button1 = document.getElementById("monitoring");
var button2 = document.getElementById("monitoring2");

button1.onclick = function() {
  for (let i = 0; i < 10; i++) {
    performance.mark("Begin test");
    var nist = kyber.curve.nist;
    var p256 = new nist.Curve(nist.Params.p256);

    var secret = p256.scalar().pick();
    var publicK = p256.point().mul(secret);

    var s = document.createTextNode("Scalar: " + secret.toString());
    var p = document.createTextNode("Point: " + publicK.toString());
    var pRef = document.getElementById("point").appendChild(p);
    var sRef = document.getElementById("scalar").appendChild(s);

    var bn256secret = new kyber.pairing.BN256Scalar().pick();
    var bn256public = new kyber.pairing.point.BN256G2Point(
      bn256secret.getValue()
    );

    var bn256s = document.createTextNode(
      "Scalar: " + bn256secret.getValue().toString()
    );
    var bn256p = document.createTextNode("Point: " + bn256public.toString());
    var bn256pRef = document.getElementById("bn256-point").appendChild(bn256p);
    var bn256sRef = document.getElementById("bn256-scalar").appendChild(bn256s);
    performance.mark("End test");
    performance.measure("Timing monitoring", "Begin test", "End test");
  }
  //monitoring values
  const myMeasure = performance.getEntriesByType("measure");
  var average = 0;
  var min = myMeasure[0].duration;
  var max = 0;
  for (let i = 0; i < myMeasure.length; i++) {
    let timeMeasure = myMeasure[i].duration;
    console.log("Monitoring with performance.mark is : " + timeMeasure);
    if (min > timeMeasure) min = timeMeasure;
    if (max < timeMeasure) max = timeMeasure;
    average += timeMeasure;
  }
  console.log(
    "Average: " + average / 10.0 + ", min : " + min + ", max : " + max
  );
  performance.clearMeasures();
};

button2.onclick = function() {
  /*  What to do: 1)Timing from beginning to the end of the test, might not be real value cause of in-testg
                  2)Timing for signing X signatures
                  3)Timing for verifying X signatures
                  4)Timing for one aggregation: see how long it is, in case it is too short, generate random aggregation to test 
                  5)Output Average, min, max, median, std dev
                  6)Look at the memory when the tests are working properly 
   */
  performance.mark("Begin signing");
  console.log("Signing");
  var signs = [];
  const msg = new Uint8Array("abc");
  for (let i = 0; i < 10; i++) {
    var bn256secret = new kyber.pairing.BN256Scalar().pick();
    var bn256public = new kyber.pairing.point.BN256G2Point(
      bn256secret.getValue()
    );
    var signature = kyber.sign.bdn.sign(msg, bn256secret); //Not working yet
    signs.push(signature);
  }
  performance.mark("End signing");
  performance.mark("Begin verifying");
  performance.measure("Timing signing", "Begin signing", "End signing");

  console.log("Verifying");
  var mask = new Uint8Array("0b1");
  for (let i = 0; i < 10; i++) {
    var verification = kyber.sign.bdn.verify(msg, mask, signs[i]);
  }
  performance.mark("End verifying");
  performance.measure("Timing verifying", "Begin verifying", "End verifying");

  performance.mark("Begin Aggreggation");
  console.log("Aggreggation");

  var aggreggation = aggregateSignatures(mask, signs);
  performance.mark("End Aggreggation");
  performance.measure(
    "Timing Aggreggation",
    "Begin Aggreggation",
    "End Aggreggation"
  );
  const myMeasure = performance.getEntriesByType("measure");
  var average = 0;
  var min = myMeasure[0].duration;
  var max = 0;
  for (let i = 0; i < myMeasure.length; i++) {
    let timeMeasure = myMeasure[i].duration;
    console.log("Monitoring with performance.mark is : " + timeMeasure);
    if (min > timeMeasure) min = timeMeasure;
    if (max < timeMeasure) max = timeMeasure;
    average += timeMeasure;
  }
  console.log(
    "Average: " + average / myMeasure.length + ", min : " + min + ", max : " + max
  );
  performance.clearMeasures();
};

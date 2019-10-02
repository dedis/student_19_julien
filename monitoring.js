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
  performance.mark("Begin signing");
  console.log("Signing");
  var signs = [];
  const msg = Buffer.from("abc"); // new uint8array 
  for (let i = 0; i < 10; i++) {
    var bn256secret = new kyber.pairing.BN256Scalar().pick();
    var bn256public = new kyber.pairing.point.BN256G2Point(
      bn256secret.getValue()
    );
    var signature = sign(msg, bn256secret);
    signs.push(signature);
  }
  performance.mark("End signing");
  performance.mark("Begin verifying");
  performance.measure("Timing signing", "Begin signing", "End signing");

  console.log("Verifying");
  var mask = Buffer.from([0b1]);
  for (let i = 0; i < 10; i++) {
    var verification = verify(msg, mask, signs[i]);
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

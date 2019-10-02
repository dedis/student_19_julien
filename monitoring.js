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

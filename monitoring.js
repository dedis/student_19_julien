
var button1 = document.getElementById("monitoring");
var button2 = document.getElementById("monitoring2");
const msg = new Uint8Array("abc");
var mask = [
  new Uint16Array([0b1]),
  new Uint16Array([0b11]),
  new Uint16Array([0b111]),
  new Uint16Array([0b1111]),
  new Uint16Array([0b11111])
];

button1.onclick = function() {
  for (let i = 0; i < 2; i++) {
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
  const myMeasure = performance.getEntriesByName("Timing monitoring");
  console.log(myMeasure);
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

function sign() {
  console.log("Signing");
  var signs = [];
  performance.mark("Begin test signing");
  for (let i = 0; i < 100; i++) { //650 is used to have a test of around 20 seconds
    performance.mark("Signing one key start");
    var bn256secret = new kyber.pairing.BN256Scalar().pick();
    var bn256public = new kyber.pairing.point.BN256G2Point(
      bn256secret.getValue()
    );
    var signature = kyber.sign.bdn.sign(msg, bn256secret); //Not working yet
    signs.push(signature);
    performance.mark("Signing one key end");
    performance.measure("Signing one key", "Signing one key start", "Signing one key end");
  }
  performance.mark("End test signing");
  performance.measure("Signing monitoring", "Begin test signing", "End test signing");
  const myMeasures = performance.getEntriesByName("Signing one key");
  const measureTotal = performance.getEntriesByName("Signing monitoring");
  console.log("Total time of the whole test: " + measureTotal[0].duration);
  monitoring("signing", myMeasures, 0);
  performance.clearMeasures();
  return signs;
}

function monitoring(title, myMeasure, printEveryLine) {
  var total = 0;
  var min = myMeasure[0].duration;
  var max = 0;
  var durations = []
  for (let i = 0; i < myMeasure.length; i++) {
    let timeMeasure = myMeasure[i].duration;
    if (printEveryLine) {
      console.log(
        "Monitoring of: " + title + " with performance.mark is : " + timeMeasure
      );
    }
    if (min > timeMeasure) min = timeMeasure;
    if (max < timeMeasure) max = timeMeasure;
    total += timeMeasure;
    durations.push(myMeasure[i].duration);
  }
  var average = total / myMeasure.length;
  console.log(
    "Average: " +
      average +
      ", min : " +
      min +
      ", max : " +
      max +
      ",  length:" +
      myMeasure.length +
      ", stddev : " +
      stddev(durations, average) +
      ", median : " +
      myMeasure[myMeasure.length / 2].duration
  );
}
function stddev(values, average) {
  var accumulator = 0;
  for (let i = 0; i < values.length; i++) {
    accumulator += values[i] * values[i] - average * average;
  }
  return Math.sqrt(accumulator / values.length);
}

function aggregate(signs, maxj) {
  var signaToBeAggregate = [];
  var aggregations =[]
  performance.mark("Aggregate all keys start");
  for (let j = 0; j < maxj; j++) { 
    for (let i = 0; i < 5; i++) { // the value 5 should not be increased
      signaToBeAggregate.push(signs[j*5 + i]);
      performance.mark("Aggregate keys start");
      aggregations.push(kyber.sign.bdn.aggregateSignatures(mask[i], signaToBeAggregate));
      performance.mark("Aggregate keys end");
      performance.measure("Aggregate keys", "Aggregate keys start", "Aggregate keys end");

    }
    signaToBeAggregate.splice(0, signaToBeAggregate.length);
  }
  performance.mark("Aggregate all keys end");
  performance.measure("Aggregate all keys", "Aggregate all keys start", "Aggregate all keys end");
  const myMeasures = performance.getEntriesByName("Aggregate all keys");
  const measureTotal = performance.getEntriesByName("Aggregate keys");
  console.log("Total time of the whole test: " + measureTotal[0].duration);
  monitoring("aggregation", myMeasures, 0);
  performance.clearMeasures();
  return aggregations
}

function verify(aggregations, maxj){
  var acc = 0;
  performance.mark("All verifications start");
  for (let j = 0; j < maxj; j++) { 
    for (let i = 0; i < 5; i++) {
      performance.mark("single verification start");
      acc += kyber.sign.bdn.verify(msg, mask[i], aggregations[j*5 + i])
      performance.mark("single verification start");
      performance.measure("single verification", "single verification start", "single verification end" );
    }
  }
  performance.mark("All verifications end");
  performance.measure("All verifications", "All verifications start", "All verifications end");
  console.log("Total successful aggregation : " + acc + " /"+ 5*j)
  const myMeasures = performance.getEntriesByName("single verification");
  const measureTotal = performance.getEntriesByName("All verifications");
  console.log("Total time of the whole test: " + measureTotal[0].duration);
  monitoring("verification", myMeasures, 0);
  performance.clearMeasures();
}

button2.onclick = function() {
  /*  What to do: 1)Timing from beginning to the end of the test, might not be real value cause of in-test /
                  2)Timing for signing X signatures 
                  3)Timing for verifying X signatures
                  4)Timing for one aggregation: see how long it is, in case it is too short, generate random aggregation to test 
                  5)Output Average, min, max, median, std dev
                  6)Look at the memory when the tests are working properly 
   */
  var maxj = 2;
  performance.mark("Test start");
  var signatures = sign();
  var aggregations = aggregate(signatures, maxj);
  verify(aggregations, maxj);
  performance.mark("Test end");
  performance.measureTotal("Test performance", "Test start", "Test end");
  const myMeasure = performance.getEntriesByName("Test performance");
  console.log("In total, the test was: " + myMeasure[0].duration);
};

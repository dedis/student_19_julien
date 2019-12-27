var button1 = document.getElementById("monitoring");
var button2 = document.getElementById("monitoring2");
const msg = new Uint8Array("abc");
var maskBuffer = [
  new Uint16Array([0b1]),
  new Uint16Array([0b11]),
  new Uint16Array([0b111]),
  new Uint16Array([0b1111]),
  new Uint16Array([0b11111])
];
var signingTotal = 0;
var verifyingTotal = 0;
var maxjs = [2, 10, 100, 500, 1000];
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

function sign(maxj) {
  console.log("Signing");
  var signs = [];
  var publics = [];
  performance.mark("Begin test signing");
  for (let i = 0; i < maxj; i++) {
    var bn256secret = new kyber.pairing.BN256Scalar().pick();
    var bn256public = new kyber.pairing.point.BN256G2Point(
      bn256secret.getValue()
    );
    performance.mark("Signing one key start");
    var signature = kyber.sign.bdn.sign(msg, bn256secret);
    performance.mark("Signing one key end");
    signs.push(signature);
    publics.push(bn256public);
    performance.measure(
      "Signing one key",
      "Signing one key start",
      "Signing one key end"
    );
  }
  performance.mark("End test signing");
  performance.measure(
    "Signing monitoring",
    "Begin test signing",
    "End test signing"
  );
  const myMeasures = performance.getEntriesByName("Signing one key");
  const measureTotal = performance.getEntriesByName("Signing monitoring");
  signingTotal = measureTotal[0].duration;
  console.log("Total time of the signing test: " + signingTotal);
  monitoring("signing", myMeasures, 0);
  performance.clearMeasures();
  return [signs, publics];
}

function monitoring(title, myMeasure, printEveryLine) {
  var total = 0;
  var min = myMeasure[0].duration;
  var max = 0;
  var durations = [];
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

function aggregate(signs, publics, maxj) {
  console.log("Aggregate");
  var signaToBeAggregate = [];
  var publicInAggregation = [];
  var aggregations = [];
  performance.mark("Aggregate all keys start");
  for (let j = 0; j < 20; j++) {
    for (let i = 0; i < 5; i++) {
      // the value i < 5 should not be increased
      signaToBeAggregate.push(signs[j * 5 + i]);
      publicInAggregation.push(publics[j * 5 + i]);
      var mask = new kyber.sign.Mask(publicInAggregation, maskBuffer[i]);
      performance.mark("Aggregate keys start");
      var aggregationKey = kyber.sign.bdn.aggregateSignatures(
        mask,
        signaToBeAggregate
      );
      performance.mark("Aggregate keys end");
      aggregations.push(aggregationKey);
      performance.measure(
        "Aggregate keys",
        "Aggregate keys start",
        "Aggregate keys end"
      );
    }
    signaToBeAggregate.splice(0, signaToBeAggregate.length);
    publicInAggregation.splice(0, publicInAggregation.length);
  }
  performance.mark("Aggregate all keys end");
  performance.measure(
    "Aggregate all keys",
    "Aggregate all keys start",
    "Aggregate all keys end"
  );
  const myMeasures = performance.getEntriesByName("Aggregate keys");
  const measureTotal = performance.getEntriesByName("Aggregate all keys");
  console.log("Total time of the aggregate test: " + measureTotal[0].duration);
  monitoring("aggregation", myMeasures, 0);
  performance.clearMeasures();
  return aggregations;
}

function verify(signatures, publics, maxj) {
  console.log("Verify");
  var acc = 0;
  var publicInVerify = [];
  performance.mark("All verifications start");
  for (let j = 0; j < maxj; j++) {
    publicInVerify.push(publics[j]);
    var mask = new kyber.sign.Mask(publicInVerify, maskBuffer[0]);
    var siga = kyber.sign.bdn.aggregateSignatures(mask, [signatures[j]]);
    performance.mark("single verification start");
    var accBool = kyber.sign.bdn.verify(msg, mask, siga.marshalBinary());
    performance.mark("single verification end");
    performance.measure(
      "single verification",
      "single verification start",
      "single verification end"
    );
    if (accBool) acc += 1;
    publicInVerify.pop();
  }
  performance.mark("All verifications end");
  performance.measure(
    "All verifications",
    "All verifications start",
    "All verifications end"
  );
  console.log("Total successful aggregation : " + acc + " /" + maxj);
  const myMeasures = performance.getEntriesByName("single verification");
  const measureTotal = performance.getEntriesByName("All verifications");
  verifyingTotal = measureTotal[0].duration;
  console.log("Total time of the verify test: " + verifyingTotal);
  monitoring("verification", myMeasures, 0);
  performance.clearMeasures();
}

button2.onclick = function() {
  for (let a = 0; a < maxjs.length; a++) {
    var maxj = maxjs[a];
    performance.mark("Test start");
    var values = sign(maxj);
    var signatures = values[0];
    var publics = values[1];
    //aggregate(signatures, publics, maxj);
    verify(signatures, publics, maxj);
    performance.mark("Test end");
    performance.measure("Test performance", "Test start", "Test end");
    const myMeasure = performance.getEntriesByName("Test performance");
    console.log("In total, the test was: " + myMeasure[0].duration);
    console.log(
      "Verifying is : " + verifyingTotal / signingTotal + " longer than signing"
    );
  }
};

//for 650 keys, verify is 5.17 x longer
//for 1000 keys, verify is 5.42 x longer
//for 100 keys, verify is 5.00 x longer

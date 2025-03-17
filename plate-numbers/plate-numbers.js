function generateLicensePlate(n) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  
  for (let i = 0; i < 6; i++) {
      result = chars[n % 36] + result;
      n = Math.floor(n / 36);
  }
  
  return result;
}

console.log(generateLicensePlate(0));        // 000000
console.log(generateLicensePlate(1));        // 000001
console.log(generateLicensePlate(999999));   // 999999
console.log(generateLicensePlate(1000000));  // 00000A
console.log(generateLicensePlate(36));       // 00001A
console.log(generateLicensePlate(1295));     // 0001AA
console.log(generateLicensePlate(1296));     // 0001AB
console.log(generateLicensePlate(46656));    // 000AAA
console.log(generateLicensePlate(1679615));  // ZZZZZZ

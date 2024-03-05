function mod(dividend, divisor) {
  if (dividend === 0) {
    return 0;
  }

  if (divisor === 0) {
	console.error("Devide by 0");
  }

  // Get the absolute values of dividend and divisor
  const absDividend = Math.abs(dividend);
  const absDivisor = Math.abs(divisor);

  // Perform floor division using Math.floor
  const quotient = Math.floor(absDividend / absDivisor);

  // Calculate the remainder (without the sign)
  const remainder = absDividend - (quotient * absDivisor);

  // Apply rollover for negative dividends and handle the special case of absDividend === absDivisor
  if (dividend < 0) {
    return (absDivisor - remainder) % absDivisor;
  } else {
    return remainder;
  }
}



//randint generator

function randInt(max){
    return Math.floor(Math.random() * max);
}
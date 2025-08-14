#!/usr/bin/env node

console.log('='.repeat(60));
console.log('MONTE CARLO PROJECTION - COMPREHENSIVE TEST SUITE');
console.log('='.repeat(60));

// ============================================================================
// TEST 1: MONTE CARLO CALCULATION VERIFICATION
// ============================================================================

console.log('\n1. MONTE CARLO CALCULATION VERIFICATION');
console.log('-'.repeat(40));

// Test 1.1: Verify Geometric Brownian Motion formula
function testGBM() {
    console.log('\n1.1 Testing Geometric Brownian Motion:');
    
    const S0 = 100; // Initial value
    const mu = 0.10; // 10% drift
    const sigma = 0.20; // 20% volatility
    const dt = 1; // 1 year
    const trials = 100000;
    
    let sum = 0;
    let sumLog = 0;
    
    for (let i = 0; i < trials; i++) {
        // Box-Muller transform for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        
        // GBM formula: S(t) = S0 * exp((μ - σ²/2)t + σ√t * Z)
        const drift = (mu - 0.5 * sigma * sigma) * dt;
        const diffusion = sigma * Math.sqrt(dt) * z;
        const St = S0 * Math.exp(drift + diffusion);
        
        sum += St;
        sumLog += Math.log(St / S0);
    }
    
    const meanValue = sum / trials;
    const expectedMean = S0 * Math.exp(mu * dt);
    const meanError = Math.abs(meanValue - expectedMean) / expectedMean * 100;
    
    const meanLogReturn = sumLog / trials;
    const expectedLogReturn = (mu - 0.5 * sigma * sigma) * dt;
    const logError = Math.abs(meanLogReturn - expectedLogReturn);
    
    console.log(`  Expected mean: ${expectedMean.toFixed(2)}`);
    console.log(`  Actual mean: ${meanValue.toFixed(2)}`);
    console.log(`  Error: ${meanError.toFixed(2)}%`);
    console.log(`  ✓ GBM mean within tolerance: ${meanError < 2 ? 'PASS' : 'FAIL'}`);
    
    console.log(`  Expected log return: ${expectedLogReturn.toFixed(4)}`);
    console.log(`  Actual log return: ${meanLogReturn.toFixed(4)}`);
    console.log(`  ✓ Log return correct: ${logError < 0.01 ? 'PASS' : 'FAIL'}`);
}

// Test 1.2: Verify withdrawal calculations (percentage-based)
function testWithdrawals() {
    console.log('\n1.2 Testing Percentage-Based Withdrawal Logic:');
    
    const initial = 100000;
    const growthRate = 1.10; // 10% deterministic growth
    const withdrawalRate = 0.04; // 4% withdrawal
    const withdrawalStartYear = 3;
    
    let value = initial;
    const results = [];
    
    for (let year = 1; year <= 5; year++) {
        // Apply growth
        value = value * growthRate;
        
        // Apply withdrawal if applicable
        let withdrawal = 0;
        if (year >= withdrawalStartYear) {
            withdrawal = value * withdrawalRate;
            value = value - withdrawal;
        }
        
        results.push({ year, value: value.toFixed(2), withdrawal: withdrawal.toFixed(2) });
    }
    
    console.log('  Year-by-year progression:');
    results.forEach(r => {
        console.log(`    Year ${r.year}: Value=$${r.value}, Withdrawal=$${r.withdrawal}`);
    });
    
    // Verify specific values
    const year3Expected = 121000 * 1.10 * (1 - 0.04); // 127776
    const year3Actual = parseFloat(results[2].value);
    const year3Match = Math.abs(year3Actual - year3Expected) < 1;
    
    console.log(`  ✓ Year 3 calculation correct: ${year3Match ? 'PASS' : 'FAIL'}`);
}

// Test 1.3: Verify fixed withdrawal with inflation
function testFixedWithdrawalWithInflation() {
    console.log('\n1.3 Testing Fixed Withdrawal with Inflation:');
    
    const initial = 1000000;
    const growthRate = 1.10; // 10% deterministic growth
    const fixedWithdrawalAmount = 40000;
    const inflationRate = 0.025; // 2.5%
    const withdrawalStartYear = 2;
    
    let value = initial;
    let currentWithdrawalAmount = fixedWithdrawalAmount;
    const results = [];
    
    console.log(`  Initial Portfolio: $${initial.toLocaleString()}`);
    console.log(`  Starting Withdrawal: $${fixedWithdrawalAmount.toLocaleString()}`);
    console.log(`  Inflation Rate: ${(inflationRate * 100)}%`);
    console.log(`  Withdrawal Start Year: ${withdrawalStartYear}\n`);
    
    for (let year = 1; year <= 5; year++) {
        // Apply growth
        value = value * growthRate;
        
        // Apply withdrawal if applicable
        let withdrawal = 0;
        if (year >= withdrawalStartYear) {
            if (year > withdrawalStartYear) {
                // Apply inflation for years after the first withdrawal
                currentWithdrawalAmount = currentWithdrawalAmount * (1 + inflationRate);
            }
            withdrawal = Math.min(currentWithdrawalAmount, value);
            value = Math.max(0, value - withdrawal);
        }
        
        results.push({ 
            year, 
            value: value.toFixed(2), 
            withdrawal: withdrawal.toFixed(2),
            actualRate: withdrawal > 0 ? ((withdrawal / (value + withdrawal)) * 100).toFixed(2) : '0.00'
        });
    }
    
    console.log('  Year-by-year progression:');
    results.forEach(r => {
        console.log(`    Year ${r.year}: Value=$${r.value}, Withdrawal=$${r.withdrawal}, Actual Rate=${r.actualRate}%`);
    });
    
    // Verify inflation adjustment
    const year3Withdrawal = parseFloat(results[2].withdrawal);
    const expectedYear3Withdrawal = fixedWithdrawalAmount * (1 + inflationRate);
    const inflationMatch = Math.abs(year3Withdrawal - expectedYear3Withdrawal) < 1;
    
    console.log(`  ✓ Inflation adjustment correct: ${inflationMatch ? 'PASS' : 'FAIL'}`);
}

// Test 1.4: Verify withdrawal limit (can't exceed portfolio value)
function testWithdrawalLimit() {
    console.log('\n1.4 Testing Withdrawal Limit:');
    
    const portfolioValue = 30000;
    const requestedWithdrawal = 40000;
    const actualWithdrawal = Math.min(requestedWithdrawal, portfolioValue);
    
    console.log(`  Portfolio: $${portfolioValue.toLocaleString()}`);
    console.log(`  Requested Withdrawal: $${requestedWithdrawal.toLocaleString()}`);
    console.log(`  Actual Withdrawal: $${actualWithdrawal.toLocaleString()}`);
    console.log(`  ✓ Withdrawal correctly limited to portfolio value: ${actualWithdrawal === portfolioValue ? 'PASS' : 'FAIL'}`);
}

// Test 1.5: Verify statistical percentile calculations
function testPercentiles() {
    console.log('\n1.5 Testing Percentile Calculations:');
    
    // Create test data with known distribution
    const data = [];
    for (let i = 1; i <= 100; i++) {
        data.push(i);
    }
    
    data.sort((a, b) => a - b);
    const n = data.length;
    
    const p5 = data[Math.floor(n * 0.05)];
    const p50 = data[Math.floor(n * 0.50)];
    const p95 = data[Math.floor(n * 0.95)];
    
    console.log(`  5th percentile: ${p5} (expected: ~5)`);
    console.log(`  50th percentile (median): ${p50} (expected: ~50)`);
    console.log(`  95th percentile: ${p95} (expected: ~95)`);
    
    console.log(`  ✓ Percentiles correct: ${p5 <= 6 && (p50 === 50 || p50 === 51) && p95 >= 95 ? 'PASS' : 'FAIL'}`);
}

// Test 1.6: Verify compound returns over multiple years
function testCompoundReturns() {
    console.log('\n1.6 Testing Compound Returns:');
    
    const initial = 10000;
    const annualReturn = 0.17; // 17% (VONG historical average)
    const years = 30;
    
    // Deterministic compound growth
    const finalValue = initial * Math.pow(1 + annualReturn, years);
    
    // Using continuous compounding (as in median path)
    const continuousValue = initial * Math.exp(annualReturn * years);
    
    console.log(`  Initial: $${initial}`);
    console.log(`  After ${years} years at ${annualReturn*100}%:`);
    console.log(`    Discrete compounding: $${finalValue.toFixed(0)}`);
    console.log(`    Continuous compounding: $${continuousValue.toFixed(0)}`);
    console.log(`    Multiple of initial: ${(finalValue/initial).toFixed(1)}x`);
    
    const expectedMultiple = Math.pow(1.17, 30);
    const actualMultiple = finalValue / initial;
    const multipleMatch = Math.abs(expectedMultiple - actualMultiple) < 0.1;
    
    console.log(`  ✓ Compound calculation correct: ${multipleMatch ? 'PASS' : 'FAIL'}`);
}

// Test 1.7: Verify Box-Muller normal distribution
function testBoxMuller() {
    console.log('\n1.7 Testing Box-Muller Transform:');
    
    const samples = 100000;
    let sum = 0;
    let sumSquared = 0;
    let countWithin1Sigma = 0;
    let countWithin2Sigma = 0;
    
    for (let i = 0; i < samples; i++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        
        sum += z;
        sumSquared += z * z;
        
        if (Math.abs(z) <= 1) countWithin1Sigma++;
        if (Math.abs(z) <= 2) countWithin2Sigma++;
    }
    
    const mean = sum / samples;
    const variance = sumSquared / samples - mean * mean;
    const stdDev = Math.sqrt(variance);
    
    const pct1Sigma = countWithin1Sigma / samples * 100;
    const pct2Sigma = countWithin2Sigma / samples * 100;
    
    console.log(`  Mean: ${mean.toFixed(4)} (expected: 0)`);
    console.log(`  Std Dev: ${stdDev.toFixed(4)} (expected: 1)`);
    console.log(`  Within 1σ: ${pct1Sigma.toFixed(1)}% (expected: ~68.3%)`);
    console.log(`  Within 2σ: ${pct2Sigma.toFixed(1)}% (expected: ~95.4%)`);
    
    const normalDistribution = 
        Math.abs(mean) < 0.01 && 
        Math.abs(stdDev - 1) < 0.01 &&
        Math.abs(pct1Sigma - 68.3) < 2 &&
        Math.abs(pct2Sigma - 95.4) < 1;
    
    console.log(`  ✓ Normal distribution correct: ${normalDistribution ? 'PASS' : 'FAIL'}`);
}

// Test 1.8: Verify Return Rate is within reasonable range
function testReturnRateRange() {
    console.log('\n1.8 Testing Return Rate Reasonable Range:');
    
    const mu = 0.26; // 26% expected return
    const sigma = 0.30; // 30% volatility
    const samples = 100000;
    
    const returnRates = [];
    let countWithin1Sigma = 0;
    let countWithin2Sigma = 0;
    let countWithin3Sigma = 0;
    let countExtreme = 0;
    
    console.log(`  Testing with μ=${(mu * 100)}%, σ=${(sigma * 100)}%`);
    
    for (let i = 0; i < samples; i++) {
        // Generate return using same method as in simulation
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        
        // Simple annual return model: return = mu + sigma * z
        const annualReturn = mu + sigma * z;
        returnRates.push(annualReturn);
        
        // Check if within standard deviation ranges
        const deviation = Math.abs(annualReturn - mu);
        if (deviation <= sigma) countWithin1Sigma++;
        if (deviation <= 2 * sigma) countWithin2Sigma++;
        if (deviation <= 3 * sigma) countWithin3Sigma++;
        
        // Check for extreme values (beyond reasonable range)
        // A return beyond -100% or +200% in a single year would be extreme
        if (annualReturn < -1.0 || annualReturn > 2.0) countExtreme++;
    }
    
    // Calculate statistics
    const actualMean = returnRates.reduce((a, b) => a + b, 0) / samples;
    const actualVariance = returnRates.reduce((sum, r) => sum + Math.pow(r - actualMean, 2), 0) / (samples - 1);
    const actualStdDev = Math.sqrt(actualVariance);
    
    const pct1Sigma = countWithin1Sigma / samples * 100;
    const pct2Sigma = countWithin2Sigma / samples * 100;
    const pct3Sigma = countWithin3Sigma / samples * 100;
    const pctExtreme = countExtreme / samples * 100;
    
    // Find min and max returns
    const minReturn = Math.min(...returnRates);
    const maxReturn = Math.max(...returnRates);
    
    console.log(`\n  Distribution Statistics:`);
    console.log(`    Mean Return: ${(actualMean * 100).toFixed(2)}% (expected: ${(mu * 100)}%)`);
    console.log(`    Std Dev: ${(actualStdDev * 100).toFixed(2)}% (expected: ${(sigma * 100)}%)`);
    console.log(`    Min Return: ${(minReturn * 100).toFixed(2)}%`);
    console.log(`    Max Return: ${(maxReturn * 100).toFixed(2)}%`);
    
    console.log(`\n  Range Analysis:`);
    console.log(`    Within 1σ [${((mu - sigma) * 100).toFixed(1)}%, ${((mu + sigma) * 100).toFixed(1)}%]: ${pct1Sigma.toFixed(1)}% (expected: ~68.3%)`);
    console.log(`    Within 2σ [${((mu - 2*sigma) * 100).toFixed(1)}%, ${((mu + 2*sigma) * 100).toFixed(1)}%]: ${pct2Sigma.toFixed(1)}% (expected: ~95.4%)`);
    console.log(`    Within 3σ [${((mu - 3*sigma) * 100).toFixed(1)}%, ${((mu + 3*sigma) * 100).toFixed(1)}%]: ${pct3Sigma.toFixed(1)}% (expected: ~99.7%)`);
    
    console.log(`\n  Extreme Values Check:`);
    console.log(`    Returns < -100%: ${returnRates.filter(r => r < -1.0).length} occurrences`);
    console.log(`    Returns > 200%: ${returnRates.filter(r => r > 2.0).length} occurrences`);
    console.log(`    Total extreme: ${pctExtreme.toFixed(4)}%`);
    
    // Verify the return rates are reasonable
    const meanCorrect = Math.abs(actualMean - mu) < 0.005; // Within 0.5%
    const stdDevCorrect = Math.abs(actualStdDev - sigma) < 0.005; // Within 0.5%
    const distributionCorrect = Math.abs(pct1Sigma - 68.3) < 2 && Math.abs(pct2Sigma - 95.4) < 1;
    const noExtremeValues = pctExtreme < 0.01; // Less than 0.01% extreme values
    
    const allTestsPass = meanCorrect && stdDevCorrect && distributionCorrect && noExtremeValues;
    
    console.log(`\n  Test Results:`);
    console.log(`    ✓ Mean correct: ${meanCorrect ? 'PASS' : 'FAIL'}`);
    console.log(`    ✓ Std Dev correct: ${stdDevCorrect ? 'PASS' : 'FAIL'}`);
    console.log(`    ✓ Distribution correct: ${distributionCorrect ? 'PASS' : 'FAIL'}`);
    console.log(`    ✓ No extreme values: ${noExtremeValues ? 'PASS' : 'FAIL'}`);
    console.log(`    ✓ Overall Return Rate Range Test: ${allTestsPass ? 'PASS' : 'FAIL'}`);
}

// Test 1.9: Symmetric Distribution Capping Test
function testSymmetricCapping() {
    console.log('\n1.9 Testing Symmetric Distribution Capping:');
    
    const mu = 0.3493; // 34.93% expected return
    const sigma = 0.6146; // 61.46% volatility
    const simulations = 100000;
    
    let countBelowLower = 0;
    let countAboveUpper = 0;
    let sumReturns = 0;
    let sumCappedReturns = 0;
    let minReturn = Infinity;
    let maxReturn = -Infinity;
    
    // Calculate symmetric bounds
    const zScore = Math.abs((-1 - mu) / sigma);
    const upperBound = mu + zScore * sigma;
    
    for (let i = 0; i < simulations; i++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        let annualReturn = mu + sigma * z;
        
        sumReturns += annualReturn;
        
        // Track extremes before capping
        if (annualReturn <= -1.0) countBelowLower++;
        if (annualReturn >= upperBound) countAboveUpper++;
        
        minReturn = Math.min(minReturn, annualReturn);
        maxReturn = Math.max(maxReturn, annualReturn);
        
        // Apply symmetric capping
        annualReturn = Math.max(-0.9999, Math.min(upperBound, annualReturn));
        sumCappedReturns += annualReturn;
    }
    
    const meanOriginal = sumReturns / simulations;
    const meanCapped = sumCappedReturns / simulations;
    const bias = Math.abs(meanCapped - meanOriginal);
    
    console.log(`  Lower bound: -99.99% (${Math.abs((-1 - mu) / sigma).toFixed(3)} σ below mean)`);
    console.log(`  Upper bound: ${(upperBound * 100).toFixed(2)}% (${zScore.toFixed(3)} σ above mean)`);
    console.log(`  Returns hitting lower cap: ${countBelowLower} (${(countBelowLower/simulations*100).toFixed(3)}%)`);
    console.log(`  Returns hitting upper cap: ${countAboveUpper} (${(countAboveUpper/simulations*100).toFixed(3)}%)`);
    console.log(`  Min return generated: ${(minReturn * 100).toFixed(2)}%`);
    console.log(`  Max return generated: ${(maxReturn * 100).toFixed(2)}%`);
    console.log(`  Original mean: ${(meanOriginal * 100).toFixed(3)}%`);
    console.log(`  Capped mean: ${(meanCapped * 100).toFixed(3)}%`);
    console.log(`  Bias introduced: ${(bias * 100).toFixed(4)}%`);
    
    // Check if distribution is reasonably symmetric
    const capRatio = countAboveUpper > 0 ? countBelowLower / countAboveUpper : 1;
    const isSymmetric = capRatio > 0.8 && capRatio < 1.25; // Within 25% of each other
    const lowBias = bias < 0.001; // Less than 0.1% bias
    
    console.log(`  Result: ${isSymmetric && lowBias ? 'PASS ✓' : 'FAIL ✗'} (symmetric capping with minimal bias)`);
}

// Test 1.10: Zero Withdrawal Depletion Test
function testZeroWithdrawalDepletion() {
    console.log('\n1.10 Testing Zero Withdrawal Depletion:');
    
    const initial = 10000;
    const mu = 0.3493; // 34.93% expected return
    const sigma = 0.6146; // 61.46% volatility
    const years = 30;
    const withdrawalRate = 0; // 0% withdrawal
    const simulations = 10000;
    
    let depletedCount = 0;
    let returnsBelow100Count = 0;
    let minReturnSeen = 0;
    
    for (let sim = 0; sim < simulations; sim++) {
        let value = initial;
        
        for (let year = 1; year <= years; year++) {
            // Box-Muller transform
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            
            // Annual return
            let annualReturn = mu + sigma * z;
            
            // Track if algorithm generates impossible returns
            if (annualReturn < -1.0) {
                returnsBelow100Count++;
                minReturnSeen = Math.min(minReturnSeen, annualReturn);
            }
            
            // Apply symmetric capping (same as main code)
            const zScore = Math.abs((-1 - mu) / sigma);
            const upperBound = mu + zScore * sigma;
            annualReturn = Math.max(-0.9999, Math.min(upperBound, annualReturn));
            
            // Apply returns
            value = value * (1 + annualReturn);
            
            // Apply withdrawal (should be 0)
            const withdrawal = value * withdrawalRate;
            value = Math.max(0, value - withdrawal);
            
            // Check if depleted
            if (value === 0) {
                depletedCount++;
                break;
            }
        }
    }
    
    const depletionRate = (depletedCount / simulations) * 100;
    
    console.log(`  Parameters: μ=${(mu*100).toFixed(2)}%, σ=${(sigma*100).toFixed(2)}%, withdrawal=${(withdrawalRate*100).toFixed(1)}%`);
    console.log(`  Algorithm generated ${returnsBelow100Count} returns worse than -100%`);
    if (returnsBelow100Count > 0) {
        console.log(`  Worst return generated: ${(minReturnSeen*100).toFixed(2)}% (impossible without leverage!)`);
    }
    console.log(`  Depletion rate: ${depletionRate.toFixed(2)}%`);
    console.log(`  Result: ${depletionRate === 0 ? 'PASS ✓' : 'FAIL ✗'} (should be 0% with 0% withdrawal)`);
    
    // Additional test with extreme volatility
    console.log('\n  Testing with extreme volatility (σ=100%):');
    let extremeDepletedCount = 0;
    let extremeReturnsBelow100 = 0;
    const extremeSigma = 1.0; // 100% volatility
    
    for (let sim = 0; sim < simulations; sim++) {
        let value = initial;
        
        for (let year = 1; year <= years; year++) {
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            
            let annualReturn = mu + extremeSigma * z;
            if (annualReturn < -1.0) {
                extremeReturnsBelow100++;
            }
            // Apply symmetric capping with extreme volatility
            const zScore = Math.abs((-1 - mu) / extremeSigma);
            const upperBound = mu + zScore * extremeSigma;
            annualReturn = Math.max(-0.9999, Math.min(upperBound, annualReturn));
            value = value * (1 + annualReturn);
            
            if (value === 0) {
                extremeDepletedCount++;
                break;
            }
        }
    }
    
    const extremeDepletionRate = (extremeDepletedCount / simulations) * 100;
    console.log(`  Algorithm generated ${extremeReturnsBelow100} returns worse than -100% with σ=100%`);
    console.log(`  Depletion rate with σ=100%: ${extremeDepletionRate.toFixed(2)}%`);
    console.log(`  Result: ${extremeDepletionRate === 0 ? 'PASS ✓' : 'FAIL ✗'} (should be 0% even with extreme volatility)`);
}

// ============================================================================
// TEST 2: HISTORICAL DATA STATISTICS
// ============================================================================

console.log('\n2. HISTORICAL DATA STATISTICS');
console.log('-'.repeat(40));

// S&P 500 historical annual returns (1926-2024, newest to oldest)
const historicalReturns = [
    // 2024-2020
    0.2502, 0.2629, -0.1811, 0.2871, 0.1840,
    // 2019-2015  
    0.3149, -0.0454, 0.2161, -0.0438, 0.0138,
    // 2014-2010
    0.1361, 0.3239, 0.1596, 0.0211, 0.1508,
    // 2009-2005
    0.2646, -0.3700, 0.0549, -0.0910, -0.1189,
    // 2004-2000
    0.1088, 0.0491, 0.1579, -0.2210, -0.1312,
    // 1999-1995
    0.2104, 0.2858, 0.3336, 0.2296, 0.3758,
    // 1994-1990
    0.0132, 0.1008, 0.0762, -0.0307, 0.3101,
    // 1989-1985
    0.3173, 0.0627, 0.2234, 0.2142, 0.1852,
    // 1984-1980
    0.0648, 0.3247, -0.0492, 0.2142, 0.3242,
    // 1979-1975
    0.1844, 0.0656, -0.0718, 0.2384, 0.3720,
    // 1974-1970
    -0.2647, -0.1466, 0.1898, 0.1431, 0.0401,
    // 1969-1965
    -0.0850, 0.1106, 0.2398, -0.1006, 0.1245,
    // 1964-1960
    0.1648, 0.2280, -0.0873, 0.2689, 0.0047,
    // 1959-1955
    0.1196, 0.4336, -0.1078, 0.0656, 0.3156,
    // 1954-1950
    0.5262, -0.0099, 0.1837, 0.2402, 0.3171,
    // 1949-1945
    0.1879, 0.0550, 0.0571, -0.0807, 0.3644,
    // 1944-1940
    0.1975, 0.2590, 0.2034, -0.1159, -0.0978,
    // 1939-1935
    -0.0041, 0.3112, -0.3503, 0.3392, 0.4767,
    // 1934-1930
    -0.0144, 0.5399, -0.0819, -0.4334, -0.2490,
    // 1929-1926
    -0.0842, 0.4361, 0.3749, 0.1162
];

function testHistoricalStats() {
    console.log('\n2.1 Full Historical Data (1926-2024):');
    console.log(`  Number of years: ${historicalReturns.length}`);
    
    // Calculate mean
    const mean = historicalReturns.reduce((a, b) => a + b, 0) / historicalReturns.length;
    console.log(`  Mean (percentage): ${(mean * 100).toFixed(1)}%`);
    
    // Calculate variance and standard deviation
    const variance = historicalReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (historicalReturns.length - 1);
    const stdDev = Math.sqrt(variance);
    console.log(`  Std Dev (percentage): ${(stdDev * 100).toFixed(1)}%`);
    
    // Verify some known values
    console.log('\n  Verifying specific years:');
    console.log(`    2024: ${(historicalReturns[0] * 100).toFixed(2)}% (expected: 25.02%)`);
    console.log(`    2008: ${(historicalReturns[16] * 100).toFixed(2)}% (expected: -37.00%)`);
    console.log(`    1926: ${(historicalReturns[historicalReturns.length - 1] * 100).toFixed(2)}% (expected: 11.62%)`);
}

function test15YearStats() {
    console.log('\n2.2 Recent 15 Years (2010-2024):');
    
    // Most recent 15 years
    const recent15Years = historicalReturns.slice(0, 15);
    console.log(`  Number of years: ${recent15Years.length}`);
    
    // Calculate mean
    const mean = recent15Years.reduce((a, b) => a + b, 0) / recent15Years.length;
    console.log(`  Mean (percentage): ${(mean * 100).toFixed(1)}%`);
    
    // Calculate standard deviation
    const variance = recent15Years.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (recent15Years.length - 1);
    const stdDev = Math.sqrt(variance);
    console.log(`  Std Dev (percentage): ${(stdDev * 100).toFixed(1)}%`);
    
    console.log('\n  Year-by-year breakdown:');
    const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];
    recent15Years.forEach((ret, i) => {
        console.log(`    ${years[i]}: ${(ret * 100).toFixed(2)}%`);
    });
}

// ============================================================================
// TEST 3: API FETCH TEST
// ============================================================================

console.log('\n3. API FETCH TEST');
console.log('-'.repeat(40));

async function testFetch() {
    console.log('\n3.1 Testing fetch from SlickCharts API:');
    
    try {
        const response = await fetch('https://www.slickcharts.com/sp500/returns/history.json');
        
        console.log(`  Response status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log(`  ✓ Successfully fetched data!`);
        console.log(`  Total years of data: ${data.length}`);
        
        // Show first 3 and last 3 years
        console.log('\n  First 3 years (most recent):');
        data.slice(0, 3).forEach(item => {
            console.log(`    ${item.year}: ${item.totalReturn}%`);
        });
        
        console.log('\n  Last 3 years (oldest):');
        data.slice(-3).forEach(item => {
            console.log(`    ${item.year}: ${item.totalReturn}%`);
        });
        
        // Try with CORS proxy
        console.log('\n3.2 Testing with CORS proxy:');
        const proxyUrl = 'https://corsproxy.io/?';
        const targetUrl = 'https://www.slickcharts.com/sp500/returns/history.json';
        const proxyResponse = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        
        if (proxyResponse.ok) {
            const proxyData = await proxyResponse.json();
            console.log(`  ✓ CORS proxy successful!`);
            console.log(`  Data retrieved: ${proxyData.length} years`);
        } else {
            console.log(`  ✗ CORS proxy failed with status: ${proxyResponse.status}`);
        }
        
    } catch (error) {
        console.log(`  ✗ Failed to fetch data: ${error.message}`);
        console.log('  Note: This is expected in browser due to CORS policy');
        console.log('  The app will use CORS proxy or fallback to hardcoded data');
    }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runAllTests() {
    // Run synchronous tests
    testGBM();
    testWithdrawals();
    testFixedWithdrawalWithInflation();
    testWithdrawalLimit();
    testPercentiles();
    testCompoundReturns();
    testBoxMuller();
    testReturnRateRange();
    testSymmetricCapping();
    testZeroWithdrawalDepletion();
    
    testHistoricalStats();
    test15YearStats();
    
    // Run async tests
    await testFetch();
    
    console.log('\n' + '='.repeat(60));
    console.log('ALL TESTS COMPLETED');
    console.log('='.repeat(60));
}

// Execute all tests
runAllTests();
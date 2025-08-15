// Chart instances
let histogramChart = null;
let pathsChart = null;

// Cache DOM elements
const DOM = {};
function initializeDOMCache() {
    DOM.initialInvestment = document.getElementById('initialInvestment');
    DOM.expectedReturn = document.getElementById('expectedReturn');
    DOM.volatility = document.getElementById('volatility');
    DOM.yearsProjection = document.getElementById('yearsProjection');
    DOM.withdrawalStartYear = document.getElementById('withdrawalStartYear');
    DOM.withdrawalRate = document.getElementById('withdrawalRate');
    DOM.fixedWithdrawalAmount = document.getElementById('fixedWithdrawalAmount');
    DOM.inflationRate = document.getElementById('inflationRate');
    DOM.loading = document.getElementById('loading');
    DOM.results = document.getElementById('results');
    DOM.median = document.getElementById('median');
    DOM.mean = document.getElementById('mean');
    DOM.best = document.getElementById('best');
    DOM.worst = document.getElementById('worst');
    DOM.annualWithdrawalRate = document.getElementById('annualWithdrawalRate');
    DOM.withdrawalStartYearDisplay = document.getElementById('withdrawalStartYearDisplay');
    DOM.depletionRate = document.getElementById('depletionRate');
    DOM.totalWithdrawn = document.getElementById('totalWithdrawn');
    DOM.medianTableBody = document.getElementById('medianTableBody');
    DOM.probabilityTableBody = document.getElementById('probabilityTableBody');
    DOM.histogramChart = document.getElementById('histogramChart');
    DOM.pathsChart = document.getElementById('pathsChart');
}

// S&P 500 historical annual returns (1926-2024, newest to oldest)
const historicalReturns = [
    0.2502, 0.2629, -0.1811, 0.2871, 0.1840,
    0.3149, -0.0454, 0.2161, -0.0438, 0.0138,
    0.1361, 0.3239, 0.1596, 0.0211, 0.1508,
    0.2646, -0.3700, 0.0549, -0.0910, -0.1189,
    0.1088, 0.0491, 0.1579, -0.2210, -0.1312,
    0.2104, 0.2858, 0.3336, 0.2296, 0.3758,
    0.0132, 0.1008, 0.0762, -0.0307, 0.3101,
    0.3173, 0.0627, 0.2234, 0.2142, 0.1852,
    0.0648, 0.3247, -0.0492, 0.2142, 0.3242,
    0.1844, 0.0656, -0.0718, 0.2384, 0.3720,
    -0.2647, -0.1466, 0.1898, 0.1431, 0.0401,
    -0.0850, 0.1106, 0.2398, -0.1006, 0.1245,
    0.1648, 0.2280, -0.0873, 0.2689, 0.0047,
    0.1196, 0.4336, -0.1078, 0.0656, 0.3156,
    0.5262, -0.0099, 0.1837, 0.2402, 0.3171,
    0.1879, 0.0550, 0.0571, -0.0807, 0.3644,
    0.1975, 0.2590, 0.2034, -0.1159, -0.0978,
    -0.0041, 0.3112, -0.3503, 0.3392, 0.4767,
    -0.0144, 0.5399, -0.0819, -0.4334, -0.2490,
    -0.0842, 0.4361, 0.3749, 0.1162
];

let returnsForCalculation = [];

// Fetch latest S&P 500 data from API
async function fetchLatestReturns() {
    try {
        const proxyUrl = 'https://corsproxy.io/?';
        const targetUrl = 'https://www.slickcharts.com/sp500/returns/history.json';
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                const allReturns = data.map(item => item.totalReturn / 100);
                returnsForCalculation = allReturns.slice(0, Math.min(15, allReturns.length));
                console.log(`Fetched ${returnsForCalculation.length} years of S&P 500 data`);
                return true;
            }
        }
    } catch (error) {
        console.log('API fetch failed, using fallback data');
    }
    
    returnsForCalculation = historicalReturns.slice(0, 15);
    return false;
}

// Calculate historical statistics
function calculateHistoricalStats() {
    if (returnsForCalculation.length === 0) {
        return { mean: 10, stdDev: 20 };
    }
    
    const n = returnsForCalculation.length;
    let sum = 0;
    for (let i = 0; i < n; i++) {
        sum += returnsForCalculation[i];
    }
    const mean = sum / n;
    
    let variance = 0;
    for (let i = 0; i < n; i++) {
        variance += Math.pow(returnsForCalculation[i] - mean, 2);
    }
    variance /= (n - 1);
    
    return {
        mean: mean * 100,
        stdDev: Math.sqrt(variance) * 100
    };
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format number inputs with commas
function setupNumberFormatting(input) {
    const formatInput = debounce(function(e) {
        const cursorPos = e.target.selectionStart;
        const val = e.target.value;
        
        const cleanVal = val.replace(/[,\D]/g, '');
        const formattedVal = cleanVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        e.target.value = formattedVal;
        
        const commasBefore = (val.substring(0, cursorPos).match(/,/g) || []).length;
        const commasAfter = (formattedVal.substring(0, cursorPos).match(/,/g) || []).length;
        let newPos = Math.min(Math.max(0, cursorPos + (commasAfter - commasBefore)), formattedVal.length);
        
        e.target.setSelectionRange(newPos, newPos);
    }, 50);
    
    input.addEventListener('input', formatInput);
}

// Initialize page
window.onload = async function() {
    initializeDOMCache();
    
    await fetchLatestReturns();
    
    const stats = calculateHistoricalStats();
    DOM.expectedReturn.value = stats.mean.toFixed(1);
    DOM.volatility.value = stats.stdDev.toFixed(1);
    
    setupNumberFormatting(DOM.initialInvestment);
    setupNumberFormatting(DOM.fixedWithdrawalAmount);
    
    // Withdrawal year validation with debouncing
    const validateWithdrawalYear = debounce(function() {
        let value = parseInt(DOM.withdrawalStartYear.value);
        if (isNaN(value) || value < 1) {
            DOM.withdrawalStartYear.value = 1;
            value = 1;
        }
        const maxYears = parseInt(DOM.yearsProjection.value);
        if (value > maxYears) {
            DOM.withdrawalStartYear.value = maxYears;
        }
    }, 300);
    
    DOM.withdrawalStartYear.addEventListener('input', validateWithdrawalYear);
    DOM.withdrawalStartYear.addEventListener('blur', validateWithdrawalYear);
    
    DOM.yearsProjection.addEventListener('change', function() {
        const maxYears = parseInt(this.value);
        DOM.withdrawalStartYear.max = maxYears;
        if (parseInt(DOM.withdrawalStartYear.value) > maxYears) {
            DOM.withdrawalStartYear.value = maxYears;
        }
    });
};

// Currency formatter with memoization
const formatCurrencyCache = new Map();
const CACHE_SIZE = 1000;

function formatCurrency(value) {
    // Check cache first
    if (formatCurrencyCache.has(value)) {
        return formatCurrencyCache.get(value);
    }
    
    let result;
    const thresholds = [
        { val: 1e21, div: 1e21, suffix: 'Sx' },
        { val: 1e18, div: 1e18, suffix: 'Qi' },
        { val: 1e15, div: 1e15, suffix: 'Qa' },
        { val: 1e12, div: 1e12, suffix: 'T' },
        { val: 1e9, div: 1e9, suffix: 'B' },
        { val: 1e6, div: 1e6, suffix: 'M' },
        { val: 1e3, div: 1e3, suffix: 'K' }
    ];
    
    const threshold = thresholds.find(t => value >= t.val);
    
    if (threshold) {
        const dividedValue = value / threshold.div;
        const decimals = threshold.suffix === 'K' && value >= 10000 ? 1 : 2;
        result = '$' + dividedValue.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }) + threshold.suffix;
    } else {
        result = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
    
    // Manage cache size
    if (formatCurrencyCache.size >= CACHE_SIZE) {
        const firstKey = formatCurrencyCache.keys().next().value;
        formatCurrencyCache.delete(firstKey);
    }
    
    formatCurrencyCache.set(value, result);
    return result;
}

// Box-Muller transform for normal distribution (optimized)
function generateNormalRandom(mu, sigma) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    let annualReturn = mu + sigma * z;
    
    // Apply symmetric caps
    const zScore = Math.abs((-1 - mu) / sigma);
    const upperBound = mu + zScore * sigma;
    return Math.max(-0.9999, Math.min(upperBound, annualReturn));
}

// Optimized Monte Carlo simulation
function monteCarloSimulation(initial, mu, sigma, years, withdrawalMethod, withdrawalRate, fixedAmount, inflationRate, withdrawalStartYear, simulations) {
    const finalValues = new Float64Array(simulations);
    const totalWithdrawals = new Float64Array(simulations);
    const samplePaths = [];
    const depleted = [];
    let medianPath = null;
    
    // Pre-calculate inflation multipliers
    const inflationMultipliers = new Float64Array(years + 1);
    inflationMultipliers[0] = 1;
    for (let i = 1; i <= years; i++) {
        inflationMultipliers[i] = inflationMultipliers[i - 1] * (1 + inflationRate);
    }
    
    // Run simulations
    const pathsToStore = [];
    
    for (let sim = 0; sim < simulations; sim++) {
        let value = initial;
        let depletedYear = null;
        let totalWithdrawn = 0;
        const yearlyData = [];
        
        for (let year = 1; year <= years; year++) {
            const annualReturn = generateNormalRandom(mu, sigma);
            value *= (1 + annualReturn);
            
            let withdrawal = 0;
            if (year >= withdrawalStartYear && value > 0) {
                if (withdrawalMethod === 'percentage') {
                    withdrawal = value * withdrawalRate;
                } else if (withdrawalMethod === 'fixed') {
                    const inflationAdjusted = fixedAmount * inflationMultipliers[year - withdrawalStartYear];
                    withdrawal = Math.min(inflationAdjusted, value);
                }
                totalWithdrawn += withdrawal;
                value = Math.max(0, value - withdrawal);
            }
            
            yearlyData.push({
                year,
                value,
                returnRate: annualReturn,
                withdrawal,
                totalWithdrawn
            });
            
            if (value === 0 && depletedYear === null) {
                depletedYear = year;
            }
        }
        
        finalValues[sim] = value;
        totalWithdrawals[sim] = totalWithdrawn;
        
        if (depletedYear !== null) {
            depleted.push(depletedYear);
        }
        
        // Store sample paths efficiently
        if (sim % 1000 === 0 && samplePaths.length < 100) {
            const path = new Float64Array(years + 1);
            path[0] = initial;
            for (let i = 0; i < yearlyData.length; i++) {
                path[i + 1] = yearlyData[i].value;
            }
            samplePaths.push(path);
        }
        
        // Store for median calculation
        if (sim === Math.floor(simulations / 2)) {
            pathsToStore.push({ finalValue: value, yearlyData });
        }
    }
    
    // Sort for statistics
    finalValues.sort();
    totalWithdrawals.sort();
    
    // Get median path
    if (pathsToStore.length > 0) {
        pathsToStore.sort((a, b) => a.finalValue - b.finalValue);
        medianPath = pathsToStore[0].yearlyData;
    }
    
    return {
        finalValues: Array.from(finalValues),
        totalWithdrawals: Array.from(totalWithdrawals),
        samplePaths: samplePaths.map(p => Array.from(p)),
        depletedCount: depleted.length,
        depletedYears: depleted,
        medianPath,
        stats: calculateStatisticsOptimized(finalValues),
        withdrawalStats: calculateStatisticsOptimized(totalWithdrawals),
        withdrawalMethod,
        withdrawalRate,
        fixedAmount,
        inflationRate
    };
}

// Optimized statistics calculation
function calculateStatisticsOptimized(values) {
    const n = values.length;
    
    // Values are already sorted
    const median = values[Math.floor(n * 0.5)];
    const percentiles = {
        5: values[Math.floor(n * 0.05)],
        25: values[Math.floor(n * 0.25)],
        75: values[Math.floor(n * 0.75)],
        95: values[Math.floor(n * 0.95)]
    };
    
    // Calculate mean efficiently
    let sum = 0;
    for (let i = 0; i < n; i += 4) {
        sum += values[i] + (values[i + 1] || 0) + (values[i + 2] || 0) + (values[i + 3] || 0);
    }
    const mean = sum / n;
    
    return {
        mean,
        median,
        percentile5: percentiles[5],
        percentile25: percentiles[25],
        percentile75: percentiles[75],
        percentile95: percentiles[95],
        min: values[0],
        max: values[n - 1]
    };
}

// Run simulation
function runSimulation() {
    const initialInvestment = parseFloat(DOM.initialInvestment.value.replace(/,/g, ''));
    const expectedReturn = parseFloat(DOM.expectedReturn.value) / 100;
    const volatility = parseFloat(DOM.volatility.value) / 100;
    const years = parseInt(DOM.yearsProjection.value);
    let withdrawalStartYear = parseInt(DOM.withdrawalStartYear.value);
    
    const withdrawalMethod = document.querySelector('input[name="withdrawalMethod"]:checked').value;
    let withdrawalRate = 0;
    let fixedWithdrawalAmount = 0;
    let inflationRate = 0;
    
    if (withdrawalMethod === 'percentage') {
        withdrawalRate = parseFloat(DOM.withdrawalRate.value) / 100;
    } else if (withdrawalMethod === 'fixed') {
        fixedWithdrawalAmount = parseFloat(DOM.fixedWithdrawalAmount.value.replace(/,/g, ''));
        inflationRate = parseFloat(DOM.inflationRate.value) / 100;
    }
    
    if (withdrawalStartYear < 1) {
        withdrawalStartYear = 1;
        DOM.withdrawalStartYear.value = 1;
    }
    
    const numSimulations = 100000;
    
    DOM.loading.style.display = 'block';
    DOM.results.style.display = 'none';
    
    // Use requestAnimationFrame for smooth UI updates
    requestAnimationFrame(() => {
        setTimeout(() => {
            const results = monteCarloSimulation(
                initialInvestment,
                expectedReturn,
                volatility,
                years,
                withdrawalMethod,
                withdrawalRate,
                fixedWithdrawalAmount,
                inflationRate,
                withdrawalStartYear,
                numSimulations
            );
            
            requestAnimationFrame(() => {
                displayResults(results, initialInvestment);
                DOM.loading.style.display = 'none';
                DOM.results.style.display = 'block';
            });
        }, 10);
    });
}

// Display results
function displayResults(results, initialInvestment) {
    const stats = results.stats;
    const withdrawalStartYear = parseInt(DOM.withdrawalStartYear.value);
    
    // Update statistics
    DOM.median.textContent = formatCurrency(stats.median);
    DOM.mean.textContent = formatCurrency(stats.mean);
    DOM.best.textContent = formatCurrency(stats.percentile95);
    DOM.worst.textContent = formatCurrency(stats.percentile5);
    
    // Display withdrawal information
    if (results.withdrawalMethod === 'percentage') {
        DOM.annualWithdrawalRate.textContent = (results.withdrawalRate * 100).toFixed(1) + '%';
        DOM.annualWithdrawalRate.style.color = results.withdrawalRate > 0.05 ? '#e74c3c' :
                                                results.withdrawalRate > 0.02 ? '#f39c12' : '#27ae60';
    } else if (results.withdrawalMethod === 'fixed') {
        DOM.annualWithdrawalRate.textContent = 
            formatCurrency(results.fixedAmount) + ' + ' + (results.inflationRate * 100).toFixed(1) + '% inflation';
        DOM.annualWithdrawalRate.style.color = '#3498db';
    }
    
    DOM.withdrawalStartYearDisplay.textContent = withdrawalStartYear;
    
    // Depletion rate
    const depletionRate = (results.depletedCount / results.finalValues.length * 100).toFixed(2);
    DOM.depletionRate.textContent = depletionRate + '%';
    DOM.depletionRate.style.color = depletionRate > 10 ? '#e74c3c' :
                                    depletionRate > 5 ? '#f39c12' : '#27ae60';
    
    // Total withdrawn
    if ((results.withdrawalRate > 0 || results.fixedAmount > 0) && results.withdrawalStats) {
        DOM.totalWithdrawn.textContent = formatCurrency(results.withdrawalStats.median);
    } else {
        DOM.totalWithdrawn.textContent = '$0';
    }
    
    // Create visualizations
    requestAnimationFrame(() => {
        createHistogramOptimized(results.finalValues);
        createPathsChart(results.samplePaths);
        createMedianTable(results.medianPath);
        createProbabilityTable(results.finalValues, initialInvestment);
    });
}

// Optimized histogram creation
function createHistogramOptimized(values) {
    const bins = 50;
    const min = values[0]; // Already sorted
    const max = values[values.length - 1];
    const binWidth = (max - min) / bins;
    
    const histogram = new Uint32Array(bins);
    const labels = new Array(bins);
    
    // Single pass through values
    let currentBin = 0;
    let binMax = min + binWidth;
    
    for (let i = 0; i < bins; i++) {
        labels[i] = formatCurrency(min + (i + 0.5) * binWidth);
    }
    
    for (const value of values) {
        while (value >= binMax && currentBin < bins - 1) {
            currentBin++;
            binMax += binWidth;
        }
        histogram[currentBin]++;
    }
    
    const ctx = DOM.histogramChart.getContext('2d');
    
    if (histogramChart) {
        histogramChart.destroy();
    }
    
    histogramChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frequency',
                data: Array.from(histogram),
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 500 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (context) => 'Value Range: ' + context[0].label,
                        label: (context) => {
                            const percentage = (context.parsed.y / values.length * 100).toFixed(2);
                            return 'Count: ' + context.parsed.y.toLocaleString() + ' (' + percentage + '%)';
                        }
                    }
                }
            },
            scales: {
                x: { display: false },
                y: {
                    title: { display: true, text: 'Frequency' },
                    ticks: { callback: (value) => value.toLocaleString() }
                }
            }
        }
    });
}

// Create paths chart
function createPathsChart(paths) {
    const years = paths[0].length - 1;
    const labels = Array.from({length: years + 1}, (_, i) => 'Year ' + i);
    
    const datasets = paths.map((path, index) => ({
        label: `Path ${index + 1}`,
        data: path,
        borderColor: `hsla(${250 + index * 3}, 70%, 60%, 0.3)`,
        backgroundColor: 'transparent',
        borderWidth: 1,
        pointRadius: 0,
        tension: 0.1
    }));
    
    const ctx = DOM.pathsChart.getContext('2d');
    
    if (pathsChart) {
        pathsChart.destroy();
    }
    
    pathsChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 500 },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: { title: { display: true, text: 'Time (Years)' } },
                y: {
                    title: { display: true, text: 'Portfolio Value ($)' },
                    ticks: { callback: (value) => formatCurrency(value) }
                }
            }
        }
    });
}

// Create median table
function createMedianTable(medianPath) {
    const fragment = document.createDocumentFragment();
    
    for (const yearData of medianPath) {
        const row = document.createElement('tr');
        
        const cells = [
            yearData.year,
            formatCurrency(yearData.value),
            (yearData.returnRate * 100).toFixed(2) + '%',
            formatCurrency(yearData.withdrawal),
            yearData.withdrawal > 0 ? 
                ((yearData.withdrawal / (yearData.value + yearData.withdrawal)) * 100).toFixed(2) + '%' : '-',
            formatCurrency(yearData.totalWithdrawn)
        ];
        
        cells.forEach(content => {
            const cell = document.createElement('td');
            cell.textContent = content;
            row.appendChild(cell);
        });
        
        fragment.appendChild(row);
    }
    
    DOM.medianTableBody.innerHTML = '';
    DOM.medianTableBody.appendChild(fragment);
}

// Create probability table
function createProbabilityTable(values, initialInvestment) {
    const multiples = [2, 5, 10, 20, 50, 100, 500, 1000, 5000, 10000];
    const fragment = document.createDocumentFragment();
    
    for (const multiple of multiples) {
        const target = initialInvestment * multiple;
        const probability = values.filter(v => v >= target).length / values.length;
        
        const row = document.createElement('tr');
        
        const targetCell = document.createElement('td');
        targetCell.innerHTML = formatCurrency(target);
        row.appendChild(targetCell);
        
        const probCell = document.createElement('td');
        probCell.innerHTML = `<span class="${probability >= 0.5 ? 'highlight' : ''}">${(probability * 100).toFixed(1)}%</span>`;
        row.appendChild(probCell);
        
        const multipleCell = document.createElement('td');
        multipleCell.textContent = multiple + 'x';
        row.appendChild(multipleCell);
        
        fragment.appendChild(row);
    }
    
    DOM.probabilityTableBody.innerHTML = '';
    DOM.probabilityTableBody.appendChild(fragment);
}

// Run initial simulation on load
window.addEventListener('load', () => {
    runSimulation();
});
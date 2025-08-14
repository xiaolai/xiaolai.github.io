let histogramChart = null;
let pathsChart = null;

// S&P 500 historical annual returns (1926-2024, newest to oldest)
// This serves as fallback data if API fetch fails
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

// Variable to store the data we'll use for calculations (15 most recent years)
let returnsForCalculation = [];

// Fetch latest S&P 500 data from API
async function fetchLatestReturns() {
    try {
        // Try using CORS proxy to fetch latest data
        const proxyUrl = 'https://corsproxy.io/?';
        const targetUrl = 'https://www.slickcharts.com/sp500/returns/history.json';
        const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
        
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                // Convert to decimals and take only the most recent 15 years
                const allReturns = data.map(item => item.totalReturn / 100);
                returnsForCalculation = allReturns.slice(0, Math.min(15, allReturns.length));
                console.log(`Successfully fetched ${returnsForCalculation.length} years of recent S&P 500 data from API`);
                return true;
            }
        }
    } catch (error) {
        console.log('Failed to fetch from API, using fallback data');
    }
    
    // If fetch fails, use the most recent 15 years from hardcoded data
    returnsForCalculation = historicalReturns.slice(0, 15);
    console.log('Using fallback data: most recent 15 years');
    return false;
}

// Calculate historical statistics using only recent 15 years
function calculateHistoricalStats() {
    if (returnsForCalculation.length === 0) {
        return { mean: 10, stdDev: 20 }; // Default values if no data
    }
    
    const mean = returnsForCalculation.reduce((a, b) => a + b, 0) / returnsForCalculation.length;
    const variance = returnsForCalculation.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returnsForCalculation.length - 1);
    const stdDev = Math.sqrt(variance);
    
    return {
        mean: mean * 100,  // Convert to percentage
        stdDev: stdDev * 100  // Convert to percentage
    };
}

// Helper function to format number inputs with commas
function setupNumberFormatting(inputId) {
    const input = document.getElementById(inputId);
    input.addEventListener('input', function(e) {
        // Save cursor position
        let cursorPos = e.target.selectionStart;
        let val = e.target.value;
        
        // Remove existing commas
        let cleanVal = val.replace(/,/g, '');
        
        // Remove non-digits
        cleanVal = cleanVal.replace(/\D/g, '');
        
        // Add commas back
        let formattedVal = cleanVal.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        // Update the input
        e.target.value = formattedVal;
        
        // Restore cursor position (accounting for added/removed commas)
        let commasBefore = (val.substring(0, cursorPos).match(/,/g) || []).length;
        let commasAfter = (formattedVal.substring(0, cursorPos).match(/,/g) || []).length;
        let newPos = cursorPos + (commasAfter - commasBefore);
        
        // Ensure position is within bounds
        newPos = Math.min(newPos, formattedVal.length);
        newPos = Math.max(0, newPos);
        
        e.target.setSelectionRange(newPos, newPos);
    });
}

// Set default values based on historical data
window.onload = async function() {
    // Try to fetch latest data first
    await fetchLatestReturns();
    
    // Calculate stats based on most recent 15 years
    const stats = calculateHistoricalStats();
    document.getElementById('expectedReturn').value = stats.mean.toFixed(1);
    document.getElementById('volatility').value = stats.stdDev.toFixed(1);
    
    console.log(`Using S&P 500 recent data (${returnsForCalculation.length} years): Mean=${stats.mean.toFixed(1)}%, StdDev=${stats.stdDev.toFixed(1)}%`);
    
    // Format number inputs with commas
    setupNumberFormatting('initialInvestment');
    setupNumberFormatting('fixedWithdrawalAmount');
    
    // Handle withdrawal method radio buttons
    const withdrawalMethodRadios = document.getElementsByName('withdrawalMethod');
    const withdrawalRateGroup = document.getElementById('withdrawalRateGroup');
    const fixedWithdrawalGroup = document.getElementById('fixedWithdrawalGroup');
    const inflationRateGroup = document.getElementById('inflationRateGroup');
    
    for (const radio of withdrawalMethodRadios) {
        radio.addEventListener('change', function() {
            if (this.value === 'percentage') {
                withdrawalRateGroup.style.display = '';
                fixedWithdrawalGroup.style.display = 'none';
                inflationRateGroup.style.display = 'none';
            } else if (this.value === 'fixed') {
                withdrawalRateGroup.style.display = 'none';
                fixedWithdrawalGroup.style.display = '';
                inflationRateGroup.style.display = '';
            }
        });
    }
    
    // Set up dynamic validation for withdrawal start year
    const yearsProjectionInput = document.getElementById('yearsProjection');
    const withdrawalStartYearInput = document.getElementById('withdrawalStartYear');
    
    // Validate withdrawal start year on input
    withdrawalStartYearInput.addEventListener('input', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 1) {
            this.value = 1;
        }
        const maxYears = parseInt(yearsProjectionInput.value);
        if (value > maxYears) {
            this.value = maxYears;
        }
    });
    
    // Also validate on blur (when user leaves the field)
    withdrawalStartYearInput.addEventListener('blur', function() {
        if (this.value === '' || parseInt(this.value) < 1) {
            this.value = 1;
        }
    });
    
    yearsProjectionInput.addEventListener('change', function() {
        const maxYears = parseInt(this.value);
        withdrawalStartYearInput.max = maxYears;
        if (parseInt(withdrawalStartYearInput.value) > maxYears) {
            withdrawalStartYearInput.value = maxYears;
        }
    });
};

function runSimulation() {
    const initialInvestment = parseFloat(document.getElementById('initialInvestment').value.replace(/,/g, ''));
    const expectedReturn = parseFloat(document.getElementById('expectedReturn').value) / 100;
    const volatility = parseFloat(document.getElementById('volatility').value) / 100;
    const years = parseInt(document.getElementById('yearsProjection').value);
    let withdrawalStartYear = parseInt(document.getElementById('withdrawalStartYear').value);
    
    // Get withdrawal method and related parameters
    const withdrawalMethod = document.querySelector('input[name="withdrawalMethod"]:checked').value;
    let withdrawalRate = 0;
    let fixedWithdrawalAmount = 0;
    let inflationRate = 0;
    
    if (withdrawalMethod === 'percentage') {
        withdrawalRate = parseFloat(document.getElementById('withdrawalRate').value) / 100;
    } else if (withdrawalMethod === 'fixed') {
        fixedWithdrawalAmount = parseFloat(document.getElementById('fixedWithdrawalAmount').value.replace(/,/g, ''));
        inflationRate = parseFloat(document.getElementById('inflationRate').value) / 100;
    }
    
    // Ensure withdrawal start year is at least 1
    if (withdrawalStartYear < 1) {
        withdrawalStartYear = 1;
        document.getElementById('withdrawalStartYear').value = 1;
    }
    
    const numSimulations = 100000;
    
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    // Use setTimeout to allow UI to update
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
        displayResults(results, initialInvestment);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('results').style.display = 'block';
    }, 100);
}

function monteCarloSimulation(initial, mu, sigma, years, withdrawalMethod, withdrawalRate, fixedAmount, inflationRate, withdrawalStartYear, simulations) {
    const finalValues = [];
    const totalWithdrawals = [];
    const samplePaths = [];
    const depleted = [];
    const allPaths = []; // Store all paths to find the true median path
    
    for (let sim = 0; sim < simulations; sim++) {
        let value = initial;
        const path = [value];
        let depletedYear = null;
        let totalWithdrawn = 0;
        const yearlyData = [];
        let currentWithdrawalAmount = fixedAmount; // For fixed withdrawal method
        
        for (let year = 1; year <= years; year++) {
            // Generate random normal distribution using Box-Muller transform
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            
            // Simple annual return model: return = mu + sigma * z
            // This gives us the annual return as a percentage
            const annualReturn = mu + sigma * z;
            
            // Apply returns first
            value = value * (1 + annualReturn);
            
            // Then apply withdrawal at end of year (only if we've reached the withdrawal start year)
            let withdrawal = 0;
            if (year >= withdrawalStartYear) {
                if (withdrawalMethod === 'percentage') {
                    // Percentage-based withdrawal
                    withdrawal = value * withdrawalRate;
                } else if (withdrawalMethod === 'fixed') {
                    // Fixed amount withdrawal with inflation adjustment
                    if (year > withdrawalStartYear) {
                        // Apply inflation for years after the first withdrawal
                        currentWithdrawalAmount = currentWithdrawalAmount * (1 + inflationRate);
                    }
                    withdrawal = Math.min(currentWithdrawalAmount, value); // Can't withdraw more than available
                }
                totalWithdrawn += withdrawal;
                value = Math.max(0, value - withdrawal);
            }
            
            path.push(value);
            yearlyData.push({
                year: year,
                value: value,
                returnRate: annualReturn,
                withdrawal: withdrawal,
                totalWithdrawn: totalWithdrawn
            });
            
            // Track if portfolio was depleted
            if (value === 0 && depletedYear === null) {
                depletedYear = year;
            }
        }
        
        finalValues.push(value);
        totalWithdrawals.push(totalWithdrawn);
        allPaths.push({
            finalValue: value,
            yearlyData: yearlyData
        });
        
        if (depletedYear !== null) {
            depleted.push(depletedYear);
        }
        
        // Save sample paths for visualization (every 1000th simulation)
        if (sim % 1000 === 0 && samplePaths.length < 100) {
            samplePaths.push(path);
        }
    }
    
    // Sort final values and withdrawals for percentile calculations
    finalValues.sort((a, b) => a - b);
    totalWithdrawals.sort((a, b) => a - b);
    
    // Find the actual median path from all simulations
    allPaths.sort((a, b) => a.finalValue - b.finalValue);
    const medianIndex = Math.floor(simulations / 2);
    const medianPath = allPaths[medianIndex].yearlyData;
    
    return {
        finalValues: finalValues,
        totalWithdrawals: totalWithdrawals,
        samplePaths: samplePaths,
        depletedCount: depleted.length,
        depletedYears: depleted,
        medianPath: medianPath,
        stats: calculateStatistics(finalValues),
        withdrawalStats: calculateStatistics(totalWithdrawals),
        withdrawalMethod: withdrawalMethod,
        withdrawalRate: withdrawalRate,
        fixedAmount: fixedAmount,
        inflationRate: inflationRate
    };
}

// This function is no longer needed - we now use the actual median path from simulations

function calculateStatistics(values) {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const median = values[Math.floor(n * 0.5)];
    const percentile5 = values[Math.floor(n * 0.05)];
    const percentile25 = values[Math.floor(n * 0.25)];
    const percentile75 = values[Math.floor(n * 0.75)];
    const percentile95 = values[Math.floor(n * 0.95)];
    const min = values[0];
    const max = values[n - 1];
    
    return {
        mean, median, percentile5, percentile25, percentile75, percentile95, min, max
    };
}

function formatCurrency(value) {
    if (value >= 1000000000000) {
        return '$' + (value / 1000000000000).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + 'T';
    } else if (value >= 1000000000) {
        return '$' + (value / 1000000000).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + 'B';
    } else if (value >= 1000000) {
        return '$' + (value / 1000000).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + 'M';
    } else if (value >= 10000) {
        return '$' + (value / 1000).toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1}) + 'K';
    } else if (value >= 1000) {
        return '$' + (value / 1000).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + 'K';
    } else {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
}

function displayResults(results, initialInvestment) {
    const stats = results.stats;
    const withdrawalStartYear = parseInt(document.getElementById('withdrawalStartYear').value);
    
    // Update statistics
    document.getElementById('median').textContent = formatCurrency(stats.median);
    document.getElementById('mean').textContent = formatCurrency(stats.mean);
    document.getElementById('best').textContent = formatCurrency(stats.percentile95);
    document.getElementById('worst').textContent = formatCurrency(stats.percentile5);
    document.getElementById('max').textContent = formatCurrency(stats.max);
    document.getElementById('min').textContent = formatCurrency(stats.min);
    
    // Display withdrawal information based on method
    if (results.withdrawalMethod === 'percentage') {
        document.getElementById('annualWithdrawalRate').textContent = (results.withdrawalRate * 100).toFixed(1) + '%';
        document.getElementById('annualWithdrawalRate').style.color = results.withdrawalRate > 0.05 ? '#e74c3c' : 
                                                                     results.withdrawalRate > 0.02 ? '#f39c12' : '#27ae60';
    } else if (results.withdrawalMethod === 'fixed') {
        // For fixed withdrawal, show the starting amount and inflation rate
        document.getElementById('annualWithdrawalRate').textContent = 
            formatCurrency(results.fixedAmount) + ' + ' + (results.inflationRate * 100).toFixed(1) + '% inflation';
        document.getElementById('annualWithdrawalRate').style.color = '#3498db';
    }
    
    // Display withdrawal start year
    document.getElementById('withdrawalStartYearDisplay').textContent = withdrawalStartYear;
    
    // Calculate and display depletion rate
    const depletionRate = (results.depletedCount / results.finalValues.length * 100).toFixed(2);
    document.getElementById('depletionRate').textContent = depletionRate + '%';
    document.getElementById('depletionRate').style.color = depletionRate > 10 ? '#e74c3c' : 
                                                             depletionRate > 5 ? '#f39c12' : '#27ae60';
    
    // Display median total withdrawn from actual simulations
    if ((results.withdrawalRate > 0 || results.fixedAmount > 0) && results.withdrawalStats) {
        document.getElementById('totalWithdrawn').textContent = formatCurrency(results.withdrawalStats.median);
    } else {
        document.getElementById('totalWithdrawn').textContent = '$0';
    }
    
    // Create histogram
    createHistogram(results.finalValues);
    
    // Create paths chart
    createPathsChart(results.samplePaths);
    
    // Create median outcome table
    createMedianTable(results.medianPath);
    
    // Create probability table
    createProbabilityTable(results.finalValues, initialInvestment);
}

function createHistogram(values) {
    const bins = 50;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / bins;
    
    const histogram = new Array(bins).fill(0);
    const labels = [];
    
    for (let i = 0; i < bins; i++) {
        const binMin = min + i * binWidth;
        const binMax = binMin + binWidth;
        labels.push(formatCurrency(binMin + binWidth / 2));
        
        for (const value of values) {
            if (value >= binMin && value < binMax) {
                histogram[i]++;
            }
        }
    }
    
    const ctx = document.getElementById('histogramChart').getContext('2d');
    
    if (histogramChart) {
        histogramChart.destroy();
    }
    
    histogramChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frequency',
                data: histogram,
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return 'Value Range: ' + context[0].label;
                        },
                        label: function(context) {
                            const percentage = (context.parsed.y / values.length * 100).toFixed(2);
                            return 'Count: ' + context.parsed.y.toLocaleString() + ' (' + percentage + '%)';
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    title: {
                        display: true,
                        text: 'Frequency'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

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
    
    const ctx = document.getElementById('pathsChart').getContext('2d');
    
    if (pathsChart) {
        pathsChart.destroy();
    }
    
    pathsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (Years)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Portfolio Value ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function createMedianTable(medianPath) {
    const tbody = document.getElementById('medianTableBody');
    tbody.innerHTML = '';
    
    for (const yearData of medianPath) {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = yearData.year;
        row.insertCell(1).textContent = formatCurrency(yearData.value);
        
        // Display the return rate for this year
        const returnRatePercent = yearData.returnRate * 100;
        row.insertCell(2).textContent = returnRatePercent.toFixed(2) + '%';
        
        row.insertCell(3).textContent = formatCurrency(yearData.withdrawal);
        
        // Calculate actual withdrawal rate
        // Need to add the withdrawal back to get the pre-withdrawal value
        const preWithdrawalValue = yearData.value + yearData.withdrawal;
        let actualRate = 0;
        if (preWithdrawalValue > 0 && yearData.withdrawal > 0) {
            actualRate = (yearData.withdrawal / preWithdrawalValue) * 100;
        }
        row.insertCell(4).textContent = actualRate > 0 ? actualRate.toFixed(2) + '%' : '-';
        
        row.insertCell(5).textContent = formatCurrency(yearData.totalWithdrawn);
    }
}

function createProbabilityTable(values, initialInvestment) {
    const targets = [
        initialInvestment * 2,
        initialInvestment * 5,
        initialInvestment * 10,
        initialInvestment * 20,
        initialInvestment * 50,
        initialInvestment * 100,
        initialInvestment * 500,
        initialInvestment * 1000,
        initialInvestment * 5000,
        initialInvestment * 10000
    ];
    
    const tbody = document.getElementById('probabilityTableBody');
    tbody.innerHTML = '';
    
    for (const target of targets) {
        const probability = values.filter(v => v >= target).length / values.length;
        const multiple = target / initialInvestment;
        
        const row = tbody.insertRow();
        row.insertCell(0).innerHTML = formatCurrency(target);
        row.insertCell(1).innerHTML = `<span class="${probability >= 0.5 ? 'highlight' : ''}">${(probability * 100).toFixed(1)}%</span>`;
        row.insertCell(2).textContent = multiple >= 1 ? multiple.toFixed(0) + 'x' : multiple.toFixed(2) + 'x';
    }
}

// Run initial simulation on load
window.addEventListener('load', () => {
    runSimulation();
});
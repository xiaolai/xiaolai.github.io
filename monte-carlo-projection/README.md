# Monte Carlo Investment Projection

A sophisticated web-based investment projection tool that uses Monte Carlo simulation to model potential portfolio outcomes over time. The application runs 100,000 simulations using a stochastic annual return model to provide probabilistic insights into investment growth and withdrawal scenarios.

## Features

- **100,000 Monte Carlo Simulations**: Provides statistically significant results for investment projections
- **Stochastic Annual Return Model**: Models realistic yearly portfolio returns with normally distributed variations
- **Flexible Withdrawal Planning**: Configure when withdrawals begin and at what rate
- **S&P 500 Historical Data**: Uses real market data (1926-2024) with automatic calculation of statistics from the most recent 15 years
- **Interactive Visualizations**: Distribution histograms and sample path charts using Chart.js
- **Comprehensive Statistics**: Shows percentiles, mean, median, best/worst cases, and depletion probabilities
- **Real-time Calculations**: Client-side JavaScript for instant results without server requirements

## Live Demo

Open `monte_carlo_projection.html` in any modern web browser. No installation required.

## Key Metrics Displayed

### Summary Statistics
- **Median Outcome**: 50th percentile of all simulations
- **Mean Outcome**: Average of all simulation results
- **Best Case**: 95th percentile (only 5% of simulations exceed this)
- **Worst Case**: 5th percentile (95% of simulations exceed this)
- **Portfolio Depletion Rate**: Percentage of simulations where portfolio reaches zero

### Detailed Analysis
- **Distribution Chart**: Histogram showing frequency of final portfolio values
- **Sample Paths**: Visualization of 100 random simulation paths
- **Median Path Details**: Year-by-year breakdown of the actual median simulation
- **Probability Analysis**: Likelihood of reaching various portfolio multiples

## Technical Implementation

### Mathematical Model
The simulation uses a stochastic annual return model with symmetric bounds:
```
R = μ + σ × Z
R_capped = max(-99.99%, min(R, R_upper))
V(t+1) = V(t) × (1 + R_capped)
```
Where:
- R = Annual return for the year
- V(t) = Portfolio value at year t
- μ = Expected annual return
- σ = Annual volatility (standard deviation)
- Z = Standard normal random variable (via Box-Muller transform)
- R_upper = μ + |(-1 - μ)/σ| × σ (symmetric upper bound)

#### Symmetric Return Capping
To prevent mathematically impossible returns (worse than -100% loss) while maintaining distribution symmetry:
- **Lower bound**: -99.99% (prevents complete depletion from market returns alone)
- **Upper bound**: Calculated dynamically to be equidistant from the mean as -100%
- This ensures equal probability mass is trimmed from both tails
- Preserves the expected value with minimal bias (typically < 0.1%)

### Withdrawal Logic
- Withdrawals begin at the end of the specified start year
- Annual returns are applied before withdrawals
- Withdrawal amount = Current Portfolio Value × Withdrawal Rate

### Default Parameters
- **Initial Investment**: $1,000,000
- **Expected Return**: 13.7% (based on S&P 500 recent 15-year average)
- **Volatility**: 15.2% (based on S&P 500 recent 15-year standard deviation)
- **Projection Period**: 30 years
- **Withdrawal Rate**: 3% annually
- **Withdrawal Start**: Year 6

## Files Structure

```
Monte-Carlo-projection/
├── monte_carlo_projection.html  # Main application HTML
├── script.js                     # Core simulation logic and calculations
├── styles.css                    # Application styling
├── test_monte_carlo.html        # Browser-based test suite
└── all_tests.js                  # Comprehensive Node.js test suite
```

## Historical Data

The application includes S&P 500 annual returns from 1926-2024. It attempts to fetch the latest data from SlickCharts API, falling back to hardcoded historical data if unavailable. Statistics are calculated using the most recent 15 years to better reflect current market conditions.

## Testing

### Browser Tests
Open `test_monte_carlo.html` in a browser to run visual tests.

### Node.js Tests
```bash
node all_tests.js
```

Tests verify:
- Annual return model implementation
- Box-Muller transform for normal distribution
- Symmetric return capping with distribution balance
- Zero withdrawal guarantees no depletion
- Withdrawal calculations and timing
- Statistical percentile calculations
- Historical data statistics
- Compound return calculations

## Browser Compatibility

Works on all modern browsers that support:
- ES6 JavaScript
- Canvas API
- Chart.js v4.4.0+

## Mathematical Validation

The simulation has been validated to ensure:
- Normal distribution generation is statistically correct (μ=0, σ=1)
- Annual return model properly applies expected returns with volatility
- Symmetric return capping prevents impossible returns while maintaining distribution balance
- Zero withdrawal rate guarantees zero portfolio depletion
- Percentile calculations accurately represent distribution
- Withdrawal sequencing follows proper order of operations

## Use Cases

- **Retirement Planning**: Model portfolio sustainability with regular withdrawals
- **FIRE Planning**: Test early retirement scenarios with extended time horizons
- **Investment Strategy**: Compare different return/volatility assumptions
- **Risk Assessment**: Understand probability of portfolio depletion
- **Wealth Projection**: Estimate likelihood of reaching financial goals

## Limitations

- Assumes constant annual return and volatility parameters
- Does not account for inflation in the base model (use real returns for inflation-adjusted projections)
- Supports both percentage-based and fixed dollar withdrawals with inflation adjustment
- Does not model taxes, fees, or transaction costs
- Market returns are assumed to follow log-normal distribution

## License

This project is open source and available for educational and personal use.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Acknowledgments

- Historical S&P 500 data compiled from public sources
- Uses Chart.js for data visualization
- Mathematical foundations based on modern portfolio theory and stochastic modeling
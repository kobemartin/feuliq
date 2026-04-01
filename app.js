// ===== HELPERS =====
const $ = (id) => document.getElementById(id);
const fmt = (n) => '$' + Math.round(n).toLocaleString();
const fmtDec = (n, d = 2) => '$' + n.toFixed(d);

// ===== AUTO-CALCULATE ON ANY INPUT CHANGE =====
document.querySelectorAll('input[type="number"]').forEach(el => {
  el.addEventListener('input', calculate);
});

const MOBILE_SLIDER_LINKS = [
  ['gas-price', 'gas-price-slider'],
  ['electricity-rate', 'electricity-rate-slider'],
  ['miles-per-year', 'miles-per-year-slider'],
  ['years', 'years-slider']
];

// ===== PRESETS =====
const GAS_PRESETS = {
  camry: { mpg: 32, purchase: 26420, maintenance: 800 },
  rav4: { mpg: 30, purchase: 28675, maintenance: 900 },
  f150: { mpg: 20, purchase: 36770, maintenance: 1100 }
};

const EV_PRESETS = {
  model3: { kwh: 0.24, purchase: 38990, maintenance: 400, incentive: 7500 },
  modely: { kwh: 0.28, purchase: 44990, maintenance: 450, incentive: 7500 },
  f150l: { kwh: 0.48, purchase: 49995, maintenance: 600, incentive: 7500 }
};

$('gas-preset').addEventListener('change', (e) => {
  const val = e.target.value;
  if (GAS_PRESETS[val]) {
    $('mpg').value = GAS_PRESETS[val].mpg;
    $('gas-purchase').value = GAS_PRESETS[val].purchase;
    $('gas-maintenance').value = GAS_PRESETS[val].maintenance;
    calculate();
  }
});

$('ev-preset').addEventListener('change', (e) => {
  const val = e.target.value;
  if (EV_PRESETS[val]) {
    const isMiKwh = $('ev-eff-unit').value === 'mi/kwh';
    const presetKwh = EV_PRESETS[val].kwh;
    $('ev-efficiency').value = isMiKwh ? (1 / presetKwh).toFixed(1) : presetKwh.toFixed(2);
    $('ev-purchase').value = EV_PRESETS[val].purchase;
    $('ev-maintenance').value = EV_PRESETS[val].maintenance;
    $('ev-incentive').value = EV_PRESETS[val].incentive;
    calculate();
  }
});

$('ev-eff-unit').addEventListener('change', (e) => {
  const val = parseFloat($('ev-efficiency').value);
  if (val && val > 0) {
    let newVal = 1 / val;
    $('ev-efficiency').value = e.target.value === 'mi/kwh' ? newVal.toFixed(1) : newVal.toFixed(2);
  }
  calculate();
});

// Reset to custom when user edits fields manually
['mpg', 'gas-purchase', 'gas-maintenance'].forEach(id => {
  $(id).addEventListener('input', () => { $('gas-preset').value = 'custom'; });
});
['ev-efficiency', 'ev-purchase', 'ev-maintenance', 'ev-incentive'].forEach(id => {
  $(id).addEventListener('input', () => { $('ev-preset').value = 'custom'; });
});

// ===== MODE TOGGLE =====
let isFuelOnly = true;

$('mode-fuel').addEventListener('click', () => {
  isFuelOnly = true;
  document.body.classList.add('fuel-mode');
  $('mode-fuel').classList.add('active');
  $('mode-tco').classList.remove('active');
  document.querySelectorAll('.tco-only').forEach(el => el.classList.add('hide'));
  document.querySelectorAll('.fuel-only').forEach(el => el.classList.remove('hide'));
  calculate();
});

$('mode-tco').addEventListener('click', () => {
  isFuelOnly = false;
  document.body.classList.remove('fuel-mode');
  $('mode-tco').classList.add('active');
  $('mode-fuel').classList.remove('active');
  document.querySelectorAll('.tco-only').forEach(el => el.classList.remove('hide'));
  document.querySelectorAll('.fuel-only').forEach(el => el.classList.add('hide'));
  calculate();
});

// ===== CHART INSTANCES =====
let cumulativeChart = null;
let breakdownChart = null;

// ===== CORE CALCULATION =====
function getInputs() {
  const effValue = parseFloat($('ev-efficiency').value) || 3.3;
  const isMiKwh = $('ev-eff-unit').value === 'mi/kwh';

  return {
    miles: parseFloat($('miles-per-year').value) || 12000,
    years: parseInt($('years').value) || 5,
    gasPrice: parseFloat($('gas-price').value) || 3.80,
    mpg: parseFloat($('mpg').value) || 30,
    gasMaintenance: parseFloat($('gas-maintenance').value) || 1200,
    gasPurchase: parseFloat($('gas-purchase').value) || 28000,
    electricRate: parseFloat($('electricity-rate').value) || 0.16,
    kwhPerMile: isMiKwh ? (1 / effValue) : effValue,
    evMaintenance: parseFloat($('ev-maintenance').value) || 500,
    evPurchase: parseFloat($('ev-purchase').value) || 40000,
    evIncentive: parseFloat($('ev-incentive').value) || 7500,
  };
}

function calculate() {
  const v = getInputs();

  // Per-mile costs (fuel only)
  const gasCostPerMile = v.gasPrice / v.mpg;
  const evCostPerMile = v.electricRate * v.kwhPerMile;

  // Annual fuel costs
  const annualGasFuel = gasCostPerMile * v.miles;
  const annualEvFuel = evCostPerMile * v.miles;

  // Effective EV purchase after incentive
  const evNetPurchase = Math.max(0, v.evPurchase - v.evIncentive);

  // Year-by-year cumulative
  const yearLabels = [];
  const gasCumulative = [];
  const evCumulative = [];

  for (let y = 0; y <= v.years; y++) {
    yearLabels.push(y === 0 ? 'Purchase' : `Year ${y}`);
    const gasCum = v.gasPurchase + y * (annualGasFuel + v.gasMaintenance);
    const evCum = evNetPurchase + y * (annualEvFuel + v.evMaintenance);
    gasCumulative.push(gasCum);
    evCumulative.push(evCum);
  }

  // Break-even
  const annualGasTotal = annualGasFuel + v.gasMaintenance;
  const annualEvTotal = annualEvFuel + v.evMaintenance;
  const purchaseDiff = evNetPurchase - v.gasPurchase;
  const annualSavings = annualGasTotal - annualEvTotal;

  let breakEvenText = 'Never';
  if (annualSavings <= 0) {
    breakEvenText = 'Never';
  } else if (purchaseDiff <= 0) {
    breakEvenText = 'Day 1';
  } else {
    const be = purchaseDiff / annualSavings;
    if (be < 1) {
      breakEvenText = `~${Math.round(be * 12)} months`;
    } else {
      const yr = Math.floor(be);
      const mo = Math.round((be - yr) * 12);
      breakEvenText = mo === 0 ? `${yr} year${yr !== 1 ? 's' : ''}` : `${yr}yr ${mo}mo`;
    }
  }

  // Total savings
  const totalGas = gasCumulative[v.years];
  const totalEV = evCumulative[v.years];
  const totalSavings = totalGas - totalEV;
  const fuelSavings = (annualGasFuel - annualEvFuel) * v.years;

  // Equivalent Rates
  const eqGasPrice = evCostPerMile * v.mpg;
  const eqElectricRate = gasCostPerMile / v.kwhPerMile;

  // Savings percentage (for verdict bar)
  const savingsPerMile = Math.abs(gasCostPerMile - evCostPerMile);
  const maxCpm = Math.max(gasCostPerMile, evCostPerMile);
  const savingsPct = maxCpm > 0 ? Math.round((savingsPerMile / maxCpm) * 100) : 0;

  // ===== UPDATE UI =====

  // Cost per mile
  const cpmGasFmt = '$' + gasCostPerMile.toFixed(3);
  const cpmEvFmt = '$' + evCostPerMile.toFixed(3);
  $('cpm-gas').textContent = cpmGasFmt;
  $('cpm-ev').textContent = cpmEvFmt;

  // Equivalent rates
  $('equiv-electric').textContent = fmtDec(eqElectricRate, 2) + ' / kWh';
  $('equiv-gas').textContent = fmtDec(eqGasPrice, 2) + ' / gal';

  // Verdict bar
  const verdictBar = $('verdict-bar');
  const evCheaper = evCostPerMile < gasCostPerMile;

  if (evCheaper) {
    verdictBar.classList.remove('gas-wins');
    $('verdict-icon').textContent = '⚡';
    $('verdict-text').innerHTML = `EV saves <strong class="verdict-highlight">${fmtDec(savingsPerMile, 3)}/mile</strong> — <strong class="verdict-highlight">${savingsPct}% cheaper</strong> to drive`;
  } else if (gasCostPerMile < evCostPerMile) {
    verdictBar.classList.add('gas-wins');
    $('verdict-icon').textContent = '⛽';
    $('verdict-text').innerHTML = `Gas saves <strong class="verdict-highlight">${fmtDec(savingsPerMile, 3)}/mile</strong> — <strong class="verdict-highlight">${savingsPct}% cheaper</strong> to drive`;
  } else {
    verdictBar.classList.remove('gas-wins');
    $('verdict-icon').textContent = '🤝';
    $('verdict-text').innerHTML = 'Both cost the same per mile';
  }

  // TCO-specific updates
  $('annual-gas').textContent = fmt(annualGasFuel);
  $('annual-ev').textContent = fmt(annualEvFuel);
  $('breakeven-display').textContent = breakEvenText;
  $('fuel-savings-display').textContent = fmt(Math.abs(fuelSavings));

  // Winner card
  const evWins = totalEV < totalGas;
  const winnerCard = $('winner-card');
  $('winner-title').textContent = evWins ? '⚡ Electric Vehicle' : '⛽ Gas Vehicle';
  $('winner-title').style.color = evWins ? 'var(--ev-primary)' : 'var(--gas-primary)';
  $('winner-savings').textContent = `Saves ${fmt(Math.abs(totalSavings))} total`;

  // Build table
  const tbody = $('table-body');
  tbody.innerHTML = '';
  for (let y = 1; y <= v.years; y++) {
    const gasCum = gasCumulative[y];
    const evCum = evCumulative[y];
    const diff = gasCum - evCum;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>Year ${y}</td>
      <td class="td-gas">${fmt(gasCum)}</td>
      <td class="td-ev">${fmt(evCum)}</td>
      <td class="${diff >= 0 ? 'td-diff-pos' : 'td-diff-neg'}">${diff >= 0 ? '+' : '-'}${fmt(Math.abs(diff))}</td>
    `;
    tbody.appendChild(tr);
  }

  // Charts
  renderCumulativeChart(yearLabels, gasCumulative, evCumulative);
  renderBreakdownChart(annualGasFuel, v.gasMaintenance, annualEvFuel, v.evMaintenance);
}

function syncMobileSlider(inputId, sliderId) {
  const input = $(inputId);
  const slider = $(sliderId);
  if (!input || !slider) return;

  const syncFromInput = () => {
    const n = parseFloat(input.value);
    if (!Number.isNaN(n)) slider.value = n;
  };

  const syncFromSlider = () => {
    input.value = slider.value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  input.addEventListener('input', syncFromInput);
  slider.addEventListener('input', syncFromSlider);
  syncFromInput();
}

// ===== CHART RENDERING =====
function chartDefaults() {
  return {
    color: 'rgba(255,255,255,0.6)',
    borderColor: 'rgba(255,255,255,0.08)',
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255,255,255,0.7)',
          font: { family: 'Inter', weight: '600', size: 12 },
          usePointStyle: true,
          pointStyleWidth: 10,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(6, 13, 26, 0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f0f4ff',
        bodyColor: '#8899bb',
        padding: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: 'rgba(255,255,255,0.4)',
          font: { family: 'Inter', size: 11 },
          callback: (v) => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)
        }
      }
    }
  };
}

function renderCumulativeChart(labels, gasData, evData) {
  const ctx = $('cumulative-chart').getContext('2d');
  if (cumulativeChart) cumulativeChart.destroy();

  const gasGrad = ctx.createLinearGradient(0, 0, 0, 280);
  gasGrad.addColorStop(0, 'rgba(249,115,22,0.25)');
  gasGrad.addColorStop(1, 'rgba(249,115,22,0.01)');

  const evGrad = ctx.createLinearGradient(0, 0, 0, 280);
  evGrad.addColorStop(0, 'rgba(34,211,238,0.20)');
  evGrad.addColorStop(1, 'rgba(34,211,238,0.01)');

  const defaults = chartDefaults();
  cumulativeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '⛽ Gas Vehicle',
          data: gasData,
          borderColor: '#f97316',
          backgroundColor: gasGrad,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#f97316',
          pointBorderColor: '#060d1a',
          pointBorderWidth: 2,
          tension: 0.35,
          fill: true,
        },
        {
          label: '⚡ Electric Vehicle',
          data: evData,
          borderColor: '#22d3ee',
          backgroundColor: evGrad,
          borderWidth: 2.5,
          pointRadius: 4,
          pointBackgroundColor: '#22d3ee',
          pointBorderColor: '#060d1a',
          pointBorderWidth: 2,
          tension: 0.35,
          fill: true,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      ...defaults,
    }
  });
}

function renderBreakdownChart(gasFuel, gasMaint, evFuel, evMaint) {
  const ctx = $('breakdown-chart').getContext('2d');
  if (breakdownChart) breakdownChart.destroy();

  const defaults = chartDefaults();
  breakdownChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['⛽ Gas', '⚡ Electric'],
      datasets: [
        {
          label: 'Fuel Cost',
          data: [gasFuel, evFuel],
          backgroundColor: ['rgba(249,115,22,0.8)', 'rgba(34,211,238,0.8)'],
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Maintenance',
          data: [gasMaint, evMaint],
          backgroundColor: ['rgba(249,115,22,0.3)', 'rgba(34,211,238,0.3)'],
          borderRadius: 6,
          borderSkipped: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        ...defaults.plugins,
        tooltip: {
          ...defaults.plugins.tooltip,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}/yr`
          }
        }
      },
      scales: {
        ...defaults.scales,
        x: { ...defaults.scales.x, stacked: true },
        y: { ...defaults.scales.y, stacked: true }
      }
    }
  });
}

// ===== INITIAL CALCULATION ON LOAD =====
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('fuel-mode');
  MOBILE_SLIDER_LINKS.forEach(([inputId, sliderId]) => syncMobileSlider(inputId, sliderId));
  calculate();
});

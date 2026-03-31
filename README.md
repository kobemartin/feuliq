# ⚡ FuelIQ — Gas vs Electric Cost Calculator

**[Live Demo: FuelIQ Site](https://kobemartin.github.io/feuliq/)**

A sleek, interactive web app that compares the true cost of driving a gas vehicle versus an electric vehicle. Built with vanilla HTML, CSS, and JavaScript.

![FuelIQ Screenshot](https://img.shields.io/badge/status-live-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🚀 Features

### Fuel Cost Comparison
- **Side-by-side comparison** of gas and EV cost per mile
- **Equivalent rate calculator** — see what gas price matches your electricity rate and vice versa
- **Instant verdict** showing which option is cheaper and by how much

### Total Cost of Ownership (TCO)
- **Purchase price** with EV tax credit support (up to $7,500)
- **Annual maintenance** costs factored in
- **Break-even analysis** — find exactly when the EV pays for itself
- **Cumulative cost chart** over your ownership period
- **Annual cost breakdown** (fuel vs maintenance, stacked bar chart)
- **Year-by-year summary table** with running totals

### Vehicle Presets
| Gas Vehicles       | Electric Vehicles    |
|--------------------|----------------------|
| Toyota Camry       | Tesla Model 3        |
| Toyota RAV4        | Tesla Model Y        |
| Ford F-150         | F-150 Lightning      |

### UX Details
- Real-time calculations — results update as you type
- Toggle between **mi/kWh** and **kWh/mi** for EV efficiency
- Responsive, dark-themed UI with glassmorphism design
- Smooth animations and hover effects throughout

---

## 📦 Tech Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| Structure | HTML5                                     |
| Styling   | Vanilla CSS (custom properties, grid)     |
| Logic     | Vanilla JavaScript (ES6+)                 |
| Charts    | [Chart.js 4.4](https://www.chartjs.org/)  |
| Fonts     | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |

No build step. No frameworks. Just open `index.html`.

---

## 🛠️ Getting Started

### Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/kobemartin/feuliq.git
   cd feuliq
   ```

2. **Open in browser**
   ```bash
   open index.html
   ```
   That's it — no install, no build, no dependencies to manage.

### Project Structure

```
.
├── index.html    # App markup and layout
├── style.css     # All styles, animations, and responsive design
├── app.js        # Calculation engine, charts, and interactivity
└── README.md
```

---

## 🧮 How It Works

### Fuel-Only Mode
Compares the raw cost per mile between gas and electric:

```
Gas cost/mile  = Gas Price ($) ÷ MPG
EV cost/mile   = Electricity Rate ($/kWh) × kWh/mile
```

### TCO Mode
Adds purchase price, maintenance, and tax credits for a full ownership picture:

```
Annual Gas Total  = (Gas Price ÷ MPG × Miles/Year) + Maintenance
Annual EV Total   = (Rate × kWh/Mile × Miles/Year) + Maintenance
Break-Even        = (EV Purchase − Incentive − Gas Purchase) ÷ Annual Savings
```

---

## 📄 License

MIT — free for personal and commercial use.

/* =========================================================
   EliteEstates — mortgage.js
   Full mortgage EMI calculator with Chart.js pie chart
   and amortization table
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initMortgageCalculator();
  initAffordabilityChecker();
});

/* ---------------------------------------------------------
   MAIN CALCULATOR
   --------------------------------------------------------- */
function initMortgageCalculator() {
  const loanAmount   = document.getElementById('loan-amount');
  const downPayment  = document.getElementById('down-payment');
  const interestRate = document.getElementById('interest-rate');
  const loanTenure   = document.getElementById('loan-tenure');
  if (!loanAmount) return;

  // Display elements
  const loanAmountDisplay   = document.getElementById('loan-amount-display');
  const downPaymentDisplay  = document.getElementById('down-payment-display');
  const interestRateDisplay = document.getElementById('interest-rate-display');
  const loanTenureDisplay   = document.getElementById('loan-tenure-display');

  const emiAmount       = document.getElementById('emi-amount');
  const totalInterest   = document.getElementById('total-interest');
  const totalPayment    = document.getElementById('total-payment');
  const principalAmount = document.getElementById('principal-amount');

  let chart = null;

  function calculate() {
    const principal  = parseFloat(loanAmount.value) || 0;
    const downPct    = parseFloat(downPayment.value) || 0;
    const annualRate = parseFloat(interestRate.value) || 0;
    const years      = parseInt(loanTenure.value) || 0;

    const loanPrincipal  = principal * (1 - downPct / 100);
    const monthlyRate    = annualRate / 100 / 12;
    const months         = years * 12;

    // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
    let emi = 0;
    if (monthlyRate > 0 && months > 0) {
      const factor = Math.pow(1 + monthlyRate, months);
      emi = loanPrincipal * monthlyRate * factor / (factor - 1);
    } else if (months > 0) {
      emi = loanPrincipal / months;
    }

    const totalPay = emi * months;
    const totalInt = totalPay - loanPrincipal;

    // Update displays
    if (loanAmountDisplay)   loanAmountDisplay.textContent   = '$' + fmt(principal);
    if (downPaymentDisplay)  downPaymentDisplay.textContent  = downPct + '% ($' + fmt(principal * downPct / 100) + ')';
    if (interestRateDisplay) interestRateDisplay.textContent = annualRate + '%';
    if (loanTenureDisplay)   loanTenureDisplay.textContent   = years + ' Years';

    if (emiAmount)       emiAmount.textContent       = '$' + fmt(emi.toFixed(0));
    if (totalInterest)   totalInterest.textContent   = '$' + fmt(totalInt.toFixed(0));
    if (totalPayment)    totalPayment.textContent     = '$' + fmt(totalPay.toFixed(0));
    if (principalAmount) principalAmount.textContent  = '$' + fmt(loanPrincipal.toFixed(0));

    updateChart(loanPrincipal, totalInt);
    buildAmortizationTable(loanPrincipal, monthlyRate, emi, months);
  }

  function updateChart(principal, interest) {
    const ctx = document.getElementById('mortgage-chart');
    if (!ctx) return;

    if (chart) chart.destroy();
    if (typeof Chart === 'undefined') return;

    chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Principal', 'Interest'],
        datasets: [{
          data: [principal.toFixed(0), Math.max(0, interest.toFixed(0))],
          backgroundColor: ['#1A3C5E', '#C8963E'],
          borderColor: ['#fff', '#fff'],
          borderWidth: 3,
          hoverOffset: 8,
        }]
      },
      options: {
        cutout: '68%',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 16,
              font: { family: "'DM Sans', sans-serif", size: 13 },
              color: '#1A1A2E',
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ' $' + fmt(parseFloat(ctx.raw).toFixed(0))
            }
          }
        }
      }
    });
  }

  function buildAmortizationTable(principal, monthlyRate, emi, months) {
    const tbody = document.getElementById('amortization-body');
    if (!tbody) return;

    let balance = principal;
    let html = '';
    let totalIntPaid = 0;
    let totalPrinPaid = 0;

    // Build year-by-year
    for (let year = 1; year <= months / 12 && year <= 30; year++) {
      let yearPrin = 0, yearInt = 0;
      for (let m = 0; m < 12 && balance > 0; m++) {
        const intPayment  = balance * monthlyRate;
        const prinPayment = Math.min(emi - intPayment, balance);
        yearInt  += intPayment;
        yearPrin += prinPayment;
        balance  -= prinPayment;
      }
      totalIntPaid  += yearInt;
      totalPrinPaid += yearPrin;

      html += `
        <tr>
          <td>${year}</td>
          <td>$${fmt(emi.toFixed(0))}/mo</td>
          <td>$${fmt(yearPrin.toFixed(0))}</td>
          <td>$${fmt(yearInt.toFixed(0))}</td>
          <td>$${fmt(Math.max(0, balance).toFixed(0))}</td>
        </tr>`;
    }

    tbody.innerHTML = html;
  }

  // Wire up sliders
  [loanAmount, downPayment, interestRate, loanTenure].forEach(slider => {
    if (slider) {
      slider.addEventListener('input', calculate);
      slider.addEventListener('change', calculate);
    }
  });

  // Inline calculator on detail page (prefilled price)
  const urlParams = new URLSearchParams(window.location.search);
  const priceParam = urlParams.get('price');
  if (priceParam && loanAmount) {
    loanAmount.value = parseFloat(priceParam);
  }

  // Initial calculation
  calculate();
}

/* ---------------------------------------------------------
   AFFORDABILITY CHECKER
   --------------------------------------------------------- */
function initAffordabilityChecker() {
  const calcBtn = document.getElementById('affordability-calc');
  if (!calcBtn) return;

  calcBtn.addEventListener('click', () => {
    const income   = parseFloat(document.getElementById('monthly-income')?.value) || 0;
    const expenses = parseFloat(document.getElementById('monthly-expenses')?.value) || 0;
    const savings  = parseFloat(document.getElementById('savings')?.value) || 0;
    const rate     = parseFloat(document.getElementById('aff-rate')?.value) || 7;
    const years    = parseInt(document.getElementById('aff-tenure')?.value) || 20;

    // Max EMI = 40% of (income - expenses)
    const maxEmi = (income - expenses) * 0.40;

    // Reverse EMI to find max loan
    const monthlyRate = rate / 100 / 12;
    const months      = years * 12;
    let maxLoan = 0;
    if (monthlyRate > 0 && maxEmi > 0) {
      const factor = Math.pow(1 + monthlyRate, months);
      maxLoan = maxEmi * (factor - 1) / (monthlyRate * factor);
    } else {
      maxLoan = maxEmi * months;
    }

    const maxBudget = maxLoan + savings;

    const resultEl = document.getElementById('affordability-result');
    const amountEl = document.getElementById('affordability-amount');
    if (resultEl) resultEl.style.display = 'block';
    if (amountEl) amountEl.textContent = '$' + fmt(maxBudget.toFixed(0));

    // Animate value
    if (typeof CountUp !== 'undefined' && amountEl) {
      const cu = new CountUp(amountEl, maxBudget, {
        startVal: 0, duration: 2, prefix: '$', separator: ','
      });
      cu.start();
    }
  });
}

/* ---------------------------------------------------------
   INLINE DETAIL PAGE CALCULATOR
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const detailCalc = document.getElementById('detail-mortgage-calc');
  if (!detailCalc) return;

  const priceInput = document.getElementById('detail-loan-price');
  const downInput  = document.getElementById('detail-down-pct');
  const rateInput  = document.getElementById('detail-rate');
  const tenureInput= document.getElementById('detail-tenure');
  const resultEl   = document.getElementById('detail-emi-result');

  function calcDetail() {
    const price  = parseFloat(priceInput?.value) || 0;
    const down   = parseFloat(downInput?.value) || 20;
    const rate   = parseFloat(rateInput?.value) || 7;
    const years  = parseInt(tenureInput?.value) || 20;
    const loan   = price * (1 - down / 100);
    const mr     = rate / 100 / 12;
    const n      = years * 12;
    const factor = Math.pow(1 + mr, n);
    const emi    = mr > 0 ? loan * mr * factor / (factor - 1) : loan / n;
    if (resultEl) resultEl.textContent = '$' + fmt(emi.toFixed(0)) + '/month';
  }

  [priceInput, downInput, rateInput, tenureInput].forEach(el => {
    if (el) el.addEventListener('input', calcDetail);
  });

  calcDetail();
});

/* ---------------------------------------------------------
   HELPER
   --------------------------------------------------------- */
function fmt(n) {
  return parseFloat(n).toLocaleString('en-US');
}

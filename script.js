const bondProfiles = [
  {
    id: 1,
    name: "ST014-T2 tenor 2 tahun",
    interestRate: 6.5, // Annual interest (%)
    tenure: 24, // Months
    minInvestment: 1000000, // Minimum USD
    tax: 0.1, // tax
  },
  {
    id: 2,
    name: "ST014-T4 tenor 4 tahun",
    interestRate: 6.0,
    tenure: 48,
    minInvestment: 1000000,
    tax: 0.1,
  },
];

const govBondTax = 0.9

// Populate bond options
const bondDropdown = document.getElementById("bondType");
bondProfiles.forEach((bond) => {
  const option = document.createElement("option");
  option.value = bond.id;
  option.textContent = bond.name;
  bondDropdown.appendChild(option);
});

let selectedBond = null;

// Update selected bond on dropdown change
bondDropdown.addEventListener("change", () => {
  const bondId = parseInt(bondDropdown.value);
  selectedBond = bondProfiles.find((bond) => bond.id === bondId);
  
  // Show minimum investment
  document.getElementById("minValue").textContent = selectedBond.minInvestment;
});

// Real-time validation
document.getElementById("investmentAmount").addEventListener("input", (e) => {
  if (!selectedBond) return;
  
  const amount = parseFloat(e.target.value);
  const minError = document.getElementById("minError");
  
  if (amount < selectedBond.minInvestment) {
    minError.style.display = "block";
  } else {
    minError.style.display = "none";
  }
});

document.getElementById("investmentForm").addEventListener("submit", (e) => {
  e.preventDefault();

  if (!selectedBond) {
    alert("Please select a bond!");
    return;
  }

  const amount = parseFloat(document.getElementById("investmentAmount").value);
  
  // Final validation
  if (amount < selectedBond.minInvestment) {
    document.getElementById("minError").style.display = "block";
    return;
  }

  // Calculate long coupun
  const longCouponA = Math.floor((amount * 1/12 * 17/30)) * (selectedBond.interestRate / 100)
  const longCouponB = Math.floor((amount * 1/12)) * (selectedBond.interestRate / 100)
  const initLongCoupon = Math.floor((longCouponA + longCouponB)) * govBondTax

  // Calculate total return
  const annualInterest = Math.floor((amount * 1/12 * (selectedBond.interestRate / 100)) * (selectedBond.tenure-2)) * govBondTax;
  total = amount + initLongCoupon + annualInterest;

  // Display result
  // console.log("longCoupunA: ", longCouponA)
  // console.log("longCoupunb: ", longCouponB)
  // console.log("initLongCoupun: ", initLongCoupon)
  // console.log("Annual Interest: ", annualInterest)
  // console.log("Total: ", total)

  document.getElementById("finalAmount").textContent = 
    `$${amount.toFixed(2)} → $${total.toFixed(2)} in ${selectedBond.tenure} months`;
  document.getElementById("result").style.display = "block";
});
const bondProfiles = [
  {
    id: 1,
    name: "ST014-T2 tenor 2 tahun",
    interestRate: 6.5, // Annual interest (%)
    tenure: 24, // Months
    minInvestment: 1000000, // Minimum IDR
    tax: 0.1, // tax
    unit: 0
  },
  {
    id: 2,
    name: "ST014-T4 tenor 4 tahun",
    interestRate: 6.6,
    tenure: 48,
    minInvestment: 1000000,
    tax: 0.1,
    unit: 0
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
  document.getElementById("minValue").textContent = formatNumber(selectedBond.minInvestment);
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
  unit = amount / selectedBond.minInvestment
  
  // Final validation
  if (amount < selectedBond.minInvestment) {
    document.getElementById("minError").style.display = "block";
    return;
  }

  // Calculate long coupun
  const longCouponA = Math.round((selectedBond.minInvestment * 1/12 * 17/30) * (selectedBond.interestRate / 100))
  const longCouponB = Math.round((selectedBond.minInvestment * 1/12) * (selectedBond.interestRate / 100))
  // const totalLongInitCoupon = (longCouponA + longCouponB) * unit
  const initLongCouponNett = Math.round((longCouponA + longCouponB) * unit * govBondTax)

  // Calculate total return
  const monthlyInterest = Math.round((selectedBond.minInvestment * 1/12 * (selectedBond.interestRate / 100))); 
  const monthlyInterestNett = (monthlyInterest * unit) - (monthlyInterest * unit * 0.1)
  const annualInterest = Math.round(monthlyInterestNett * (selectedBond.tenure-2));
  total = amount + initLongCouponNett + annualInterest;

  // Display result
  // console.log("longCoupunA: ", longCouponA)
  // console.log("longCoupunB: ", longCouponB)
  // console.log("initial longCoupunNett: ", initLongCouponNett)
  // console.log("Monthly Interest: ", monthlyInterest)
  // console.log("Monthly InterestAfterTax: ", monthlyInterestAfterTax)
  // console.log("Monthly InterestNett: ", monthlyInterestNett)
  // console.log("Annual Interest: ", annualInterest)
  // console.log("Total: ", total)

  document.getElementById("finalAmount").textContent = 
    `Rp`+formatNumber(amount)+` → Rp`+formatNumber(total)+` in ${selectedBond.tenure} months`;
  document.getElementById("result").style.display = "block";
});

function formatNumber(number){
  return number.toLocaleString('id-ID');
}
console.log(Math.round(54166.667))
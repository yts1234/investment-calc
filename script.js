/**
 * @typedef {Object} BondProfile
 * @property {number} id - The bond ID.
 * @property {string} name - The bond name.
 * @property {number} interestRate - The annual interest rate (%).
 * @property {number} tenure - The tenure in months.
 * @property {number} minInvestment - The minimum investment amount.
 * @property {number} tax - The tax rate.
 * @property {number} unit - The unit of the bond.
 */

// 1. CONFIGURATION
// All your constant values and settings
const CALCULATION_CONSTANTS = {
  LONG_COUPON_PRO_RATE_FACTOR: 17 / 30, // pro rate because the bond will start at specific date
  MONTHS_PER_YEAR: 12,
  INITIAL_MONTHS: 2 // Long coupon initial month that hold the returns
}

const CURRENCY_FORMAT = {
  CODE: 'Rp',
  LOCALE: 'id-ID'
}

const ERROR_MESSAGES = {
  NO_BOND_SELECTED: "Please select a bond first",
  INVALID_AMOUNT: "Please enter a valid number",
  MIN_INVESTMENT: `Minimum investment required: ${CURRENCY_FORMAT.CODE}`,
  CALCULATION_ERROR: "Error calculating returns. Please try again."
}

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

// 2. DOM ELEMENTS
// All your document.getElementById() calls
const bondDropdown = document.getElementById("bondType");
const investmentAmount = document.getElementById("investmentAmount");
const minError = document.getElementById("minError");
const minValue = document.getElementById("minValue");
const investmentForm = document.getElementById("investmentForm");
const finalAmount = document.getElementById("finalAmount");
const result = document.getElementById("result");
const interestRateDisplay = document.getElementById("interestRateDisplay");
const longCouponDisplay = document.getElementById("longCouponDisplay");
const monthlyInterestDisplay = document.getElementById("monthlyInterestDisplay");
const totalInterestDisplay = document.getElementById("totalInterestDisplay");
const resetButton = document.getElementById("resetButton");

// 3. STATE VARIABLES
// Variables that track the state of your application
let selectedBond = null;

// 4. INITIALIZATION
// Code that runs when the page loads
function initializeApp() {
  // Populate bond options
  bondProfiles.forEach((bond) => {
    const option = document.createElement("option");
    option.value = bond.id;
    option.textContent = bond.name;
    bondDropdown.appendChild(option);
  });

  //  Set up event listeners
  setupEventListeners();
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// 5. EVENT HANDLERS
// Functions that handle user interactions
function handleBondSelectionChange() {
  // Update selected bond on dropdown change
  const bondId = parseInt(bondDropdown.value);
  selectedBond = bondProfiles.find((bond) => bond.id === bondId);

  // Show minimum investment
  minValue.textContent = formatNumber(selectedBond.minInvestment);
}

function handleInvestmentAmountInput(e) {
  if (!selectedBond) return;
  const amount = parseFloat(e.target.value);
  // Real-time validation
  validateAmount(amount)
}

function handleFormSubmit(e) {
  e.preventDefault();

  if (!selectedBond) {
    alert(ERROR_MESSAGES.NO_BOND_SELECTED);
    return;
  }
  const amount = parseFloat(investmentAmount.value);
  if (!validateAmount(amount)) {
    return;
  }

  try {
    const unit = amount / selectedBond.minInvestment;
    const results = calculateReturns(amount, unit);
    displayResults(results);
  } catch (error) {
    console.error('Calculation error:', error);
    alert(ERROR_MESSAGES.CALCULATION_ERROR)
  }
}

function setupEventListeners() {
  bondDropdown.addEventListener("change", handleBondSelectionChange);
  investmentAmount.addEventListener("input", handleInvestmentAmountInput);
  investmentForm.addEventListener("submit", handleFormSubmit);
  resetButton.addEventListener("click", resetCalculator);
}

// 6. CALCULATIONS
// Functions that perform calculations
/**
 * Calculates investment returns for a bond
 * @param {number} amount - The investment amount in Rupiah
 * @param {number} unit - Number of units purchased
 * @returns {Object} Object containing all calculation results
 */
function calculateReturns(amount, unit) {
  // Calculate long coupun
  const longCouponA = Math.round(
    (selectedBond.minInvestment * 1 / CALCULATION_CONSTANTS.MONTHS_PER_YEAR * CALCULATION_CONSTANTS.LONG_COUPON_PRO_RATE_FACTOR)
    * (selectedBond.interestRate / 100));
  const longCouponB = Math.round(
    (selectedBond.minInvestment * 1 / CALCULATION_CONSTANTS.MONTHS_PER_YEAR) * (selectedBond.interestRate / 100));
  const initLongCouponNett = Math.round((longCouponA + longCouponB) * unit * govBondTax);

  // Calculate total return
  const monthlyInterest = Math.round((selectedBond.minInvestment * 1 / 12 * (selectedBond.interestRate / 100)));
  const monthlyInterestNett = (monthlyInterest * unit) - (monthlyInterest * unit * 0.1);
  const annualInterest = Math.round(monthlyInterestNett * (selectedBond.tenure - 2));
  const total = amount + initLongCouponNett + annualInterest;

  return {
    amount,
    longCouponA,
    longCouponB,
    initLongCouponNett,
    monthlyInterest,
    monthlyInterestNett,
    annualInterest,
    total,
    tenure: selectedBond.tenure,
    interestRate: selectedBond.interestRate
  }
}

// 7. HELPER FUNCTIONS
// Utility functions like formatting
/**
 * 
 * @param {number} number 
 * @returns {string} Return formated number with specifid format
 */
function formatNumber(number) {
  return number.toLocaleString('id-ID');
}

function displayResults(results) {
  // Display summary
  finalAmount.textContent =
    `${CURRENCY_FORMAT.CODE}${formatNumber(results.amount)} → ${CURRENCY_FORMAT.CODE}${formatNumber(results.total)} in ${results.tenure} months`;
  
  // Display detailed breakdown
  interestRateDisplay.textContent = `${results.interestRate}% per year`;
  longCouponDisplay.textContent = `${CURRENCY_FORMAT.CODE}${formatNumber(results.initLongCouponNett)}`;
  monthlyInterestDisplay.textContent = `${CURRENCY_FORMAT.CODE}${formatNumber(results.monthlyInterestNett)}`;
  totalInterestDisplay.textContent = `${CURRENCY_FORMAT.CODE}${formatNumber(results.total-results.amount)}`;
  
  // Show the result section
  result.style.display = "block";
}

/**
 * Validates the investment amount
 * @param {number} amount The amount to validate
 * @returns {boolean} True if amount is valid, false otherwise
 */
function validateAmount(amount) {
  if (isNaN(amount)) {
    alert(ERROR_MESSAGES.INVALID_AMOUNT);
    return false;
  }

  if (amount <= 0) {
    alert("Amount must be greater than zero!");
    return false;
  }

  if (amount < selectedBond.minInvestment) {
    minError.style.display = "block";
    return false;
  }

  minError.style.display = "none";
  return true;
}

/**
 * Reset the calculator to initial state
 * Clear all input values and results
 */
function resetCalculator(){
  investmentAmount.value='';
  result.style.display = "none";
  minError.style.display = "none";
  bondDropdown.selectedIndex = 0;
  selectedBond = null;
  bondDropdown.focus();
}
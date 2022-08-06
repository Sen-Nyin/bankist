"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const displayMovements = function (movements) {
  containerMovements.innerHTML = "";
  movements.forEach((mov, index) => {
    const type = mov > 0 ? "deposit" : "withdrawal";
    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type}</div>
          <div class="movements__value">€${Math.abs(mov)}</div>
        </div>`;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};
displayMovements(account1.movements);

// Generate usernames - lower case initials of each name.
// Loop over accounts array using forEach
// Map over the account.owner property value and create a new property, account.username to store the result

const createUsername = (accounts) => {
  accounts.forEach((account) => {
    account.username = account.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[[0]])
      .join("");
  });
};
createUsername(accounts);
// console.log(accounts);

// get the balance

const calcDisplayBalance = (acc) => {
  acc.balance = acc.movements.reduce((acc, trans) => acc + trans, 0);
  labelBalance.textContent = `€${acc.balance}`;
};

// get total of deposits

const calcDisplaySummary = (account) => {
  // Deposits
  labelSumIn.textContent = `€${account.movements
    .filter((movement) => movement > 0)
    .reduce((acc, curr) => (acc = curr))}`;

  // Credits
  labelSumOut.textContent = `€${Math.abs(
    account.movements
      .filter((movement) => movement < 0)
      .reduce((acc, curr) => acc + curr)
  )}`;

  // Interest - paid on deposit, if interest is at least 1
  labelSumInterest.textContent = `€${account.movements
    .filter((movement) => movement > 0)
    .map((deposit) => deposit * (account.interestRate / 100))
    .filter((interest) => interest >= 1)
    .reduce((acc, interest) => acc + interest)}`;
};

const updateUI = (currentAccount) => {
  displayMovements(currentAccount.movements);
  calcDisplayBalance(currentAccount);
  calcDisplaySummary(currentAccount);
};

// Login
// clear form, populate, and display ui, change welcome message
let currentAccount;
btnLogin.addEventListener("click", (e) => {
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) =>
      inputLoginUsername.value === acc.username &&
      Number(inputLoginPin.value) === acc.pin
  );

  if (currentAccount) {
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner
      .split(" ")
      .at(0)}`;
    containerApp.style.opacity = 100;
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();
    inputLoginUsername.blur();
    updateUI(currentAccount);
  }
});

// Money transfer

btnTransfer.addEventListener("click", (e) => {
  e.preventDefault();
  const recipientAccount = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  const transferAmount = Number(inputTransferAmount.value);

  if (
    recipientAccount &&
    transferAmount > 0 &&
    transferAmount <= currentAccount.balance &&
    recipientAccount.username !== currentAccount.username
  ) {
    recipientAccount.movements.push(transferAmount);
    currentAccount.movements.push(-transferAmount);
    updateUI(currentAccount);
  }
  inputTransferTo.value = inputTransferAmount.value = "";
  inputTransferTo.blur();
  inputTransferAmount.blur();
});

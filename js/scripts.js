'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2020-07-28T23:36:17.929Z',
    '2020-08-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const moves = sort ? movements.slice().sort((a, b) => a - b) : movements;

  moves.forEach((mov, index) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type}</div>
          <div class="movements__value">€${mov.toFixed(2)}</div>
        </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
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
      .split(' ')
      .map((name) => name[[0]])
      .join('');
  });
};
createUsername(accounts);
// console.log(accounts);

// get the balance

const calcDisplayBalance = (acc) => {
  acc.balance = acc.movements.reduce((acc, trans) => acc + trans, 0);
  labelBalance.textContent = `€${acc.balance.toFixed(2)}`;
};

// get total of deposits

const calcDisplaySummary = (account) => {
  // Deposits
  labelSumIn.textContent = `€${account.movements
    .filter((movement) => movement > 0)
    .reduce((acc, curr) => (acc = curr))
    .toFixed(2)}`;

  // Credits
  labelSumOut.textContent = `€${Math.abs(
    account.movements
      .filter((movement) => movement < 0)
      .reduce((acc, curr) => acc + curr)
  ).toFixed(2)}`;

  // Interest - paid on deposit, if interest is at least 1
  labelSumInterest.textContent = `€${account.movements
    .filter((movement) => movement > 0)
    .map((deposit) => deposit * (account.interestRate / 100))
    .filter((interest) => interest >= 1)
    .reduce((acc, interest) => acc + interest)
    .toFixed(2)}`;
};

const updateUI = (currentAccount) => {
  displayMovements(currentAccount.movements);
  calcDisplayBalance(currentAccount);
  calcDisplaySummary(currentAccount);
};

// Login
// clear form, populate, and display ui, change welcome message
let currentAccount;
btnLogin.addEventListener('click', (e) => {
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) =>
      inputLoginUsername.value === acc.username &&
      +inputLoginPin.value === acc.pin
  );

  if (currentAccount) {
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner
      .split(' ')
      .at(0)}`;
    containerApp.style.opacity = 100;
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    inputLoginUsername.blur();
    updateUI(currentAccount);
  }
});

// Money transfer

btnTransfer.addEventListener('click', (e) => {
  e.preventDefault();
  const recipientAccount = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  const transferAmount = +inputTransferAmount.value;

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
  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferTo.blur();
  inputTransferAmount.blur();
});

// Request a loan
// Rule: at least one deposit that is at least 10% of the requested loan amount.

btnLoan.addEventListener('click', (e) => {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some((movement) => movement >= amount * 0.1)
  ) {
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

// Delete Account

btnClose.addEventListener('click', (e) => {
  e.preventDefault();
  const closeUsername = inputCloseUsername.value;
  const closePin = +inputClosePin.value;
  if (
    closeUsername === currentAccount.username &&
    closePin === currentAccount.pin
  ) {
    const index = accounts.findIndex((acc) => (acc.username = closeUsername));
    accounts.splice(index, 1);
    console.log('Account Closed');
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
  inputClosePin.blur();
  inputCloseUsername.blur();
});

// Sort button
let sorted = false;
btnSort.addEventListener('click', (e) => {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

// Set the date

const dateToday = new Date();
const day = `${dateToday.getDate()}`.padStart(2, 0);
const month = `${dateToday.getMonth() + 1}`.padStart(2, 0);
const year = dateToday.getFullYear();
const hours = dateToday.getHours();
const minutes = dateToday.getMinutes();

labelDate.textContent = `As of ${day}/${month}/${year} at ${hours}:${minutes}`;

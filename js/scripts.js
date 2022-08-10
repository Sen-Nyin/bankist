'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Leon Lonsdale',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-08-05T17:01:17.194Z',
    '2022-08-09T23:36:17.929Z',
    '2022-08-10T10:51:36.790Z',
  ],
  currency: 'GBP',
  locale: 'en-GB',
};

const account2 = {
  owner: 'Random American',
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

const accounts = [account1, account2];

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

// Format Dates

const formatMovementDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) {
    return 'Today';
  } else if (daysPassed === 1) {
    return 'Yesterday';
  } else if (daysPassed <= 7) {
    return `${daysPassed} days ago`;
  }

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = (locale, currency, amount) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Display transactions

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';

  const moves = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  moves.forEach((mov, index) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(account.movementsDates[index]);
    const displayDate = formatMovementDate(date, account.locale);
    const formattedTransaction = formatCurrency(
      account.locale,
      account.currency,
      mov
    );
    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedTransaction}</div>
        </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

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
  const formattedBalance = formatCurrency(
    acc.locale,
    acc.currency,
    acc.balance
  );
  labelBalance.textContent = `${formattedBalance}`;
};

// get total of deposits

const calcDisplaySummary = (account) => {
  // Deposits
  const depositTotal = account.movements
    .filter((movement) => movement > 0)
    .reduce((acc, curr) => acc + curr);

  labelSumIn.textContent = formatCurrency(
    account.locale,
    account.currency,
    depositTotal
  );
  // Credits
  const credits = Math.abs(
    account.movements
      .filter((movement) => movement < 0)
      .reduce((acc, curr) => acc + curr)
  );
  labelSumOut.textContent = formatCurrency(
    account.locale,
    account.currency,
    credits
  );

  // Interest - paid on deposit, if interest is at least 1
  const interest = account.movements
    .filter((movement) => movement > 0)
    .map((deposit) => deposit * (account.interestRate / 100))
    .filter((interest) => interest >= 1)
    .reduce((acc, interest) => acc + interest);
  labelSumInterest.textContent = formatCurrency(
    account.locale,
    account.currency,
    interest
  );
};

const updateUI = (currentAccount) => {
  displayMovements(currentAccount);
  calcDisplayBalance(currentAccount);
  calcDisplaySummary(currentAccount);
};

// Logout Timer

const startLogOutTimer = () => {
  // set timer to 5 mins
  let time = 120;

  const ticker = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // print remaining time to ui each call
    labelTimer.textContent = `${min}:${sec}`;

    // when expired, stop timer & logout
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'You have been logged out due to inactivity';
      containerApp.style.opacity = 0;
    }
    // decrease 1s
    time--;
  };
  ticker();
  // call timer every second
  const timer = setInterval(ticker, 1000);

  // return the timer. Timer can then be set to variable to check if timer exists when switching accounts.
  // if timer exists, it can then be cleareed before a new timer is initiated for the new user
  return timer;
};

// Login
// clear form, populate, and display ui, change welcome message
let currentAccount, timer;
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
    // Set the date

    // const dateToday = new Date();
    // const day = `${dateToday.getDate()}`.padStart(2, 0);
    // const month = `${dateToday.getMonth() + 1}`.padStart(2, 0);
    // const year = dateToday.getFullYear();
    // const hours = dateToday.getHours();
    // const minutes = `${dateToday.getMinutes()}`.padStart(2, 0);
    // const locale = navigator.language;
    const now = new Date();
    const options = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    const formattedTime = Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    labelDate.textContent = `As of ${formattedTime}`;
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
  }
});

// Money transfer

btnTransfer.addEventListener('click', (e) => {
  e.preventDefault();
  // reset logout timer
  if (timer) clearInterval(timer);
  timer = startLogOutTimer();
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

    // transfer date
    recipientAccount.hasOwnProperty('movementsDates')
      ? recipientAccount.movementsDates.push(new Date().toISOString())
      : (recipientAccount.movementsDates = [new Date().toISOString()]);
    currentAccount.hasOwnProperty('movementsDates')
      ? currentAccount.movementsDates.push(new Date().toISOString())
      : (currentAccount.movementsDates = [new Date().toISOString()]);

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
  if (timer) clearInterval(timer);
  timer = startLogOutTimer();
  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some((movement) => movement >= amount * 0.1)
  ) {
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.hasOwnProperty('movementsDates')
        ? currentAccount.movementsDates.push(new Date().toISOString())
        : (currentAccount.movementsDates = [new Date().toISOString()]);
      updateUI(currentAccount);
    }, 3000);
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
  // reset logout timer
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
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

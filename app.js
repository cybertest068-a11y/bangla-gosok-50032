const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');

let currentInput = '0';
let previousInput = '';
let operator = null;
let resetDisplay = false;

// Bangla to English number mapping
const banglaToEnglish = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

// English to Bangla number mapping
const englishToBangla = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};

function translateNumber(numberString, toBangla = true) {
    return numberString.split('').map(char => {
        if (toBangla) {
            return englishToBangla[char] || char;
        } else {
            return banglaToEnglish[char] || char;
        }
    }).join('');
}

function updateDisplay(value) {
    // Ensure value is a string before checking length
    const stringValue = String(value);
    if (stringValue.length > 15) {
        display.textContent = translateNumber(parseFloat(stringValue).toPrecision(10));
    } else {
        display.textContent = translateNumber(stringValue);
    }
    // Auto-scroll to the end for long numbers
    display.scrollLeft = display.scrollWidth;
}

function clearAll() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    resetDisplay = false;
    updateDisplay(currentInput);
}

function deleteLastChar() {
    if (currentInput === 'Error') {
        clearAll();
        return;
    }
    if (currentInput.length === 1) {
        currentInput = '0';
    } else {
        currentInput = currentInput.slice(0, -1);
    }
    updateDisplay(currentInput);
}

function appendNumber(number) {
    if (currentInput === 'Error') {
        clearAll();
    }
    if (resetDisplay) {
        currentInput = String(number);
        resetDisplay = false;
    } else {
        if (currentInput === '0' && number !== '.') {
            currentInput = String(number);
        } else if (number === '.' && currentInput.includes('.')) {
            // Do nothing if decimal already exists
            return;
        } else {
            currentInput += String(number);
        }
    }
    updateDisplay(currentInput);
}

function chooseOperator(nextOperator) {
    if (currentInput === 'Error') {
        clearAll();
        return;
    }
    if (operator && previousInput !== '') {
        calculate();
    }
    previousInput = translateNumber(currentInput, false); // Store as English for calculation
    operator = nextOperator;
    resetDisplay = true;
}

function calculate() {
    let computation;
    const prev = parseFloat(previousInput);
    const current = parseFloat(translateNumber(currentInput, false)); // Convert current input to English for calculation

    if (isNaN(prev) || isNaN(current)) return;

    switch (operator) {
        case '+':
            computation = prev + current;
            break;
        case '-':
            computation = prev - current;
            break;
        case '*':
            computation = prev * current;
            break;
        case '/':
            if (current === 0) {
                computation = 'Error';
            } else {
                computation = prev / current;
            }
            break;
        case '%':
            computation = (prev / 100) * current;
            break;
        default:
            return;
    }

    if (computation === 'Error') {
        currentInput = 'Error';
    } else if (!Number.isFinite(computation)) {
        currentInput = 'Error'; // Handle division by zero leading to Infinity, etc.
    } else {
        currentInput = String(computation);
    }

    operator = null;
    previousInput = '';
    resetDisplay = true;
    updateDisplay(currentInput);
}

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const value = button.dataset.value;
        const action = button.dataset.action;

        if (action === 'clear') {
            clearAll();
        } else if (action === 'del') {
            deleteLastChar();
        } else if (action === 'calculate') {
            calculate();
        } else if (button.classList.contains('operator')) {
            chooseOperator(value);
        } else {
            appendNumber(value); // Numbers and decimal point
        }
    });
});

// Initialize display
updateDisplay(currentInput);

// Register service worker if supported
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}


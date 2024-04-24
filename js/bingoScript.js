// Define patterns as objects with name and grid properties
const patterns = {
  xPattern: [
    [true, false, false, false, true],
    [false, true, false, true, false],
    [false, false, true, false, false],
    [false, true, false, true, false],
    [true, false, false, false, true]
  ],
  blockParty: [
    [true, true, false, true, true],
    [true, true, false, true, true],
    [false, false, false, false, false],
    [true, true, false, true, true],
    [true, true, false, true, true]
  ],
  centSign: [
    [false, true, false, true, false],
    [true, false, true, false, true],
    [false, true, false, true, false],
    [true, false, true, false, true],
    [false, true, false, true, false]
  ],
  cloverLeaf: [
    [true, false, false, false, true],
    [false, false, false, false, false],
    [true, false, true, false, true],
    [false, false, false, false, false],
    [true, false, false, false, true]
  ],
  coverAll: [
    [true, true, true, true, true],
    [true, true, true, true, true],
    [true, true, true, true, true],
    [true, true, true, true, true],
    [true, true, true, true, true]
  ],
  crazyKite: [
    [false, false, true, false, false],
    [false, true, true, false, false],
    [true, true, true, true, true],
    [false, true, true, false, false],
    [false, false, true, false, false]
  ],
  crazyPyramid: [
    [true, true, true, true, true],
    [true, true, true, true, false],
    [true, true, true, false, false],
    [true, true, false, false, false],
    [true, false, false, false, false]
  ],
  TforTiki: [
    [true, true, true, true, true],
    [false, false, true, false, false],
    [false, false, true, false, false],
    [false, false, true, false, false],
    [false, false, true, false, false]
  ],
	hPattern: [
  [true, false, false, false, true],
  [true, false, false, false, true],
  [true, true, true, true, true],
  [true, false, false, false, true],
  [true, false, false, false, true]
],
	diagonalCross: [
  [true, false, false, false, true],
  [false, true, false, true, false],
  [false, false, true, false, false],
  [false, true, false, true, false],
  [true, false, false, false, true]
],
outerFrame: [
  [true, true, true, true, true],
  [true, false, false, false, true],
  [true, false, false, false, true],
  [true, false, false, false, true],
  [true, true, true, true, true]
],
insideDiamond: [
  [false, false, true, false, false],
  [false, true, true, true, false],
  [true, true, true, true, true],
  [false, true, true, true, false],
  [false, false, true, false, false]
],

  // Add additional patterns here...
};

// Accessing HTML elements that will hold the bingo board and display call history
const bingoBoard = document.getElementById('bingo-board');
const callHistoryDisplay = document.getElementById('call-history');
const titleElement = document.querySelector('h1');

let callHistory = [];

document.addEventListener('DOMContentLoaded', function() {
    generateBingoBoard();
    initializeThemeToggle();
    applySavedTheme();
    attachEventListeners();
	setupRandomPatternSelector();
});
function setupRandomPatternSelector() {
    document.getElementById('random-pattern').addEventListener('click', function() {
        const selectElement = document.getElementById('pattern-select');
        const options = selectElement.querySelectorAll('option:not(:disabled)');
        const randomIndex = Math.floor(Math.random() * options.length);
        selectElement.selectedIndex = randomIndex + 1; // +1 because first option is disabled
        selectElement.dispatchEvent(new Event('change')); // Trigger the change event
    });
}

function createBingoCell(letter, number, isHeader = false) {
    const cell = document.createElement('div');
    cell.classList.add('bingo-cell');
    if (isHeader) {
        cell.classList.add('header-cell');
        cell.textContent = letter;
    } else {
        cell.classList.add('number-cell');
        cell.textContent = number;
        cell.addEventListener('click', function() {
            let fullCall = `${letter}-${this.textContent}`;
            this.classList.toggle('selected');
            updateCallHistory(fullCall);
        });
    }
    return cell;
}

function updateCallHistory(fullCall) {
    const index = callHistory.indexOf(fullCall);
    if (index !== -1) {
        callHistory.splice(index, 1);
    } else {
        callHistory.unshift(fullCall);
        callHistory = callHistory.slice(0, 3);
    }
    callHistoryDisplay.textContent = callHistory.join(', ');
}

function generateBingoBoard() {
    const letters = ['B', 'I', 'N', 'G', 'O'];
    const numberRanges = { 'B': [1, 15], 'I': [16, 30], 'N': [31, 45], 'G': [46, 60], 'O': [61, 75] };

    letters.forEach(letter => {
        const row = document.createElement('div');
        row.classList.add('bingo-row');
        row.appendChild(createBingoCell(letter, '', true));
        for (let i = numberRanges[letter][0]; i <= numberRanges[letter][1]; i++) {
            row.appendChild(createBingoCell(letter, i));
        }
        bingoBoard.appendChild(row);
    });
}

function initializeThemeToggle() {
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

function applySavedTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

function attachEventListeners() {
    const patternSelect = document.getElementById('pattern-select');
    if (patternSelect) {
        patternSelect.addEventListener('change', function() {
            const selectedPattern = this.value;
            generatePatternBoard(patterns[selectedPattern]);
        });
    }
}

function generatePatternBoard(patternGrid) {
    const patternBoard = document.getElementById('pattern-board');
    patternBoard.innerHTML = '';
    patternGrid.forEach(row => {
        const patternRow = document.createElement('div');
        patternRow.classList.add('bingo-row');
        row.forEach(cell => {
            const patternCell = document.createElement('div');
            patternCell.classList.add('bingo-cell', 'border', 'bg-light', 'd-inline-block');
            if (cell) {
                patternCell.classList.add('pattern-cell');
            }
            patternRow.appendChild(patternCell);
        });
        patternBoard.appendChild(patternRow);
    });
}

// Responsive height adjustments
window.addEventListener('resize', adjustElementHeights);
function adjustElementHeights() {
    let headerHeight = document.querySelector('h1').offsetHeight;
    let controlsHeight = document.querySelector('.row').offsetHeight;
    let availableHeight = window.innerHeight - headerHeight - controlsHeight;
    document.getElementById('bingo-board').style.height = `${availableHeight}px`;
}

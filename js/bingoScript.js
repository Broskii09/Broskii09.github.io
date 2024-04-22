// Accessing HTML elements that will hold the bingo board and display call history.
const bingoBoard = document.getElementById('bingo-board');
const callHistoryDisplay = document.getElementById('call-history');
let callHistory = [];

// Creates a single bingo cell. This function is versatile for both header and number cells.
function createBingoCell(letter, number, isHeader = false) {
    const cell = document.createElement('div');
    cell.classList.add('bingo-cell');
    if (isHeader) {
        cell.classList.add('header-cell');
        cell.textContent = letter;
    } else {
        cell.classList.add('number-cell');
        cell.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
        cell.textContent = number;
    }
    return cell;
}



// Updates the display of the last three numbers called.
function updateCallHistory(call) {
  callHistory.unshift(call); // Insert the new call at the beginning of the history.
  callHistory = callHistory.slice(0, 3); // Keep only the last three entries.
  callHistoryDisplay.textContent = callHistory.join(', '); // Display these on the web page.
}

// Generates the full bingo board with headers and numbers based on predefined ranges.
function generateBingoBoard() {
  const letters = ['B', 'I', 'N', 'G', 'O']; // Headers for the bingo columns.
  const numberRanges = {
    'B': [1, 15],
    'I': [16, 30],
    'N': [31, 45],
    'G': [46, 60],
    'O': [61, 75]
  };

  letters.forEach(letter => {
    const row = document.createElement('div');
    row.classList.add('bingo-row');
    row.appendChild(createBingoCell(letter, '', true)); // Create and append the letter cell.
    for (let i = numberRanges[letter][0]; i <= numberRanges[letter][1]; i++) {
      row.appendChild(createBingoCell(letter, i)); // Create and append each number cell.
    }
    bingoBoard.appendChild(row); // Append the complete row to the bingo board.
  });
}

// Applies a visual pattern to the bingo board for easy recognition of the winning pattern.
function applyBingoPattern() {
  const rows = document.querySelectorAll('.bingo-row');
  rows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll('.bingo-cell:not(.fw-bold)');
    cells.forEach((cell, cellIndex) => {
      // Apply a diagonal pattern by adding a special class to these cells.
      if (rowIndex === cellIndex) { // This creates a diagonal from top left to bottom right.
        cell.classList.add('pattern-cell');
      }
    });
  });
}

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
};



// Generate the pattern board based on the selected pattern
function generatePatternBoard(patternGrid) {
    const patternBoard = document.getElementById('pattern-board');
    patternBoard.innerHTML = ''; // Clear the board

    patternGrid.forEach(row => {
        const patternRow = document.createElement('div');
        patternRow.classList.add('bingo-row');
        row.forEach(cell => {
            const patternCell = document.createElement('div');
            patternCell.classList.add('bingo-cell', 'border', 'bg-light', 'd-inline-block');
            // Check if the cell is part of the pattern
            if (cell) {
                patternCell.classList.add('pattern-cell'); // Style as an active cell in the pattern
            }
            patternRow.appendChild(patternCell);
        });
        patternBoard.appendChild(patternRow);
    });
}

// Adjust heights on load and when resizing the window
function adjustElementHeights() {
    let headerHeight = document.querySelector('h1').offsetHeight;
    let controlsHeight = document.querySelector('.row').offsetHeight;
    let availableHeight = window.innerHeight - headerHeight - controlsHeight;
    document.getElementById('bingo-board').style.height = `${availableHeight}px`;
}

// Event listener for the theme toggle button
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    // Save the current theme to localStorage
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// Check localStorage for a saved theme and apply it on page load
function applySavedTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Generate the bingo board and the initial pattern board
    generateBingoBoard();
    const initialPattern = document.getElementById('pattern-select').value;
    generatePatternBoard(patterns[initialPattern]);

    // Attach change event listener to pattern selector dropdown
    document.getElementById('pattern-select').addEventListener('change', function() {
        const selectedPattern = this.value;
        generatePatternBoard(patterns[selectedPattern]);
    });

    // Initialize theme toggle button
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }

    // Apply saved theme
    applySavedTheme();

    // Adjust element heights
    adjustElementHeights();
});

// Adjust heights when resizing the window
window.addEventListener('resize', adjustElementHeights);

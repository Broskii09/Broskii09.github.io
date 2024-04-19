// Accessing HTML elements that will hold the bingo board and display call history.
const bingoBoard = document.getElementById('bingo-board');
const callHistoryDisplay = document.getElementById('call-history');
let callHistory = [];

// Creates a single bingo cell. This function is versatile for both header and number cells.
function createBingoCell(letter, number, isHeader = false) {
    const cell = document.createElement('div');
    cell.classList.add('bingo-cell', 'p-2', 'border', 'bg-light', 'd-inline-block');
    if (isHeader) { // If it's a header (B, I, N, G, O), style it as bold.
        cell.classList.add('header-cell'); // Add the 'header-cell' class for B, I, N, G, O
    } else { // If it's not a header, add click functionality to toggle selection.
        cell.classList.add('number-cell'); // Add the 'number-cell' class for 1-75
        cell.addEventListener('click', function() {
            this.classList.toggle('selected'); // Toggle the 'selected' class to visually mark the cell.
            let cellValue = letter + number; // Create a value that represents this cell.
            updateCallHistory(cellValue); // Update the call history with this value.
        });
    }
    cell.textContent = isHeader ? letter : number; // Set the text content of the cell.
    return cell; // Return the complete HTML element.
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


// Listen for changes on the pattern selector dropdown
document.getElementById('pattern-select').addEventListener('change', function () {
  const selectedPattern = this.value;
  generatePatternBoard(patterns[selectedPattern]);
});

// Initialize the pattern board with the first pattern
window.addEventListener('DOMContentLoaded', () => {
  generateBingoBoard();
  const initialPattern = document.getElementById('pattern-select').value;
  generatePatternBoard(patterns[initialPattern]);
});

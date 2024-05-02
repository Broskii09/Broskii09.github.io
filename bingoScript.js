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
  fourCorners: [
    [true, false, false, false, true],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
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
(function() {
// Wait for the document to fully load before initializing
// Define patterns and other setup details here...

document.addEventListener('DOMContentLoaded', function() {
    initializeThemeToggle();
    applySavedTheme();
    generateBingoBoard();
    setupRandomPatternSelector();
    initializeCallHistory();
});

function createCallElement(call) {
    const callElement = document.createElement('div');
    callElement.classList.add('call-item');
    callElement.textContent = call;
    return callElement;
}

function addCallToHistory(call) {
    const callHistoryContainer = document.getElementById('call-history');
    let newCallElement = createCallElement(call);
    callHistoryContainer.appendChild(newCallElement);
    requestAnimationFrame(() => {
        Array.from(callHistoryContainer.children).forEach((child, index) => {
            child.style.transform = `translateX(-${100 * index}%)`;
        });
    });
    if (callHistoryContainer.children.length > 10) {
        removeOldestCall(callHistoryContainer);
    }
}

function removeOldestCall(container) {
    const oldestCall = container.firstChild;
    oldestCall.addEventListener('transitionend', function handler() {
        oldestCall.removeEventListener('transitionend', handler);
        container.removeChild(oldestCall);
    });
    oldestCall.style.transform = 'translateX(-200%)';
}

function initializeCallHistory() {
    // This could initialize or reset the call history
}

// Other functions related to theme toggle, pattern selection, etc...






function generateBingoBoard() {
  const bingoBoard = document.getElementById('bingo-board');
  const letters = ['B', 'I', 'N', 'G', 'O'];
  const numberRanges = { 'B': [1, 15], 'I': [16, 30], 'N': [31, 45], 'G': [46, 60], 'O': [61, 75] };

  letters.forEach(letter => {
    const row = document.createElement('div');
    row.classList.add('bingo-row');
    row.appendChild(createBingoCell(letter, '', true)); // Header cell
    for (let i = numberRanges[letter][0]; i <= numberRanges[letter][1]; i++) {
      row.appendChild(createBingoCell(letter, i));
    }
    bingoBoard.appendChild(row);
  });
}

function createBingoCell(letter, number, isHeader = false) {
  const cell = document.createElement('div');
  cell.classList.add('bingo-cell', isHeader ? 'header-cell' : 'number-cell');
  cell.textContent = number || letter;
  if (!isHeader) {
    cell.addEventListener('click', function () {
      let fullCall = `${letter}-${this.textContent}`;
      this.classList.toggle('selected');
      addCallToHistory(fullCall);
    });
  }
  return cell;
}

function initializeThemeToggle() {
  const themeToggleButton = document.getElementById('theme-toggle');
  themeToggleButton.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('theme-toggle').setAttribute('aria-pressed', isDark);
}


function applySavedTheme() {
    try {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    } catch (error) {
        console.error("Could not retrieve theme from localStorage:", error);
    }
}


function setupRandomPatternSelector() {
  const patternSelect = document.getElementById('pattern-select');
  patternSelect.addEventListener('change', function () {
    const selectedPattern = patterns[this.value];
    generatePatternBoard(selectedPattern);
  });

  document.getElementById('random-pattern').addEventListener('click', function () {
    const options = patternSelect.querySelectorAll('option:not(:disabled)');
    const randomIndex = Math.floor(Math.random() * options.length);
    patternSelect.selectedIndex = randomIndex + 1; // +1 to skip the disabled option
    patternSelect.dispatchEvent(new Event('change'));
  });
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
	})();

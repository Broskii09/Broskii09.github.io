// Replace YOUR_API_KEY with your API key
const apiKey = "AIzaSyBtAPbNaE5kGaunZrOwaM2I8KJSevD93aA"; // Placeholder
// Replace YOUR_SPREADSHEET_ID with the ID of your Google Sheets document
const SPREADSHEET_ID = '1iRPL4Nf9nRbe-fzxKaZZsxdCYIxParU2_J-9IjnYQBo';
// Replace YOUR_SHEET_NAME with the name of the sheet in the document that contains the data
const SHEET_NAME = 'Employee Data';

const groups = ['Group 1', 'Group 2'];
const departments = [
  'Management',
  'Traffic',
  'Creative Services',
  'Engineering & MCO',
  'Anchors And Reporters',
  'News',
  'Photographers And Editors',
  'Sales',
  'Guests'
];

let cache = null;
async function fetchData() {
  if (cache) {
    return cache;
  }

  try {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`);
    const data = await response.json();
    cache = data;
    return data;
  } catch (error) {
    console.error('Failed to fetch data', error);
    throw error;
  }
}

function getDataFromEmployees(containerId) {
  // Make an HTTP request to the Google Sheets API to retrieve the data from the document
  fetchData()
    .then(data => {
      console.log(); // Log the data to the console
      // Get the container element
      const container = document.getElementById(containerId);

      // Create the group container
      const groupContainer = document.createElement('div');
      groupContainer.classList.add('group-container');

      // Sort the data by group
      const rows = data.values.slice(1);
      rows.sort((a, b) => {
        const groupA = a[2];
        const groupB = b[2];
        if (departments.indexOf(groupA) < departments.indexOf(groupB)) {
          return -1;
        }
        if (departments.indexOf(groupA) > departments.indexOf(groupB)) {
          return 1;
        }
        return 0;
      });

      // Iterate over the rows of data and create the grid items for each group
      let currentGroup = null;
      let groupDiv = null;
      let makeUppercase = true;
      rows.forEach(row => {
        // Get the group for this row
        let group = row[2];
        // Replace underscores with spaces, because Google Sheets' "Named Ranged" format is fucking bullshit
        group = group.replace(/_/g, ' ');
        // If the group is different from the current group, create a new container for the group
        if (group !== currentGroup) {
          currentGroup = group;
          groupDiv = document.createElement('div');
          groupDiv.classList.add('group-div', 'row', 'col-3', 'g-0');
			// If the group is 'Guests', add a special class
    if (group === 'Guests') {
      groupDiv.classList.add('guests');
    }
          // Create the group header
          const groupHeader = document.createElement('h2');
          groupHeader.textContent = `${group}`;
          // Add the group header to the group container
          groupDiv.appendChild(groupHeader);
          // Create the group grid container
          const groupGridContainer = document.createElement('div');
          groupGridContainer.classList.add('group-grid-container');
          // Add the group grid container to the group container
          groupDiv.appendChild(groupGridContainer);
          // Add the group container to the container element
          container.appendChild(groupDiv);
          groupHeader.textContent = makeUppercase ? groupHeader.textContent.toUpperCase() : groupHeader.textContent;
        }

        // Get the image URL from the seventh column
        const imageUrl = row[6];
        // Create the grid item
        const gridItem = document.createElement('div');
        gridItem.classList.add('group-grid-item');
        gridItem.setAttribute('id', row[0]);
        // Create the image element
        const img = document.createElement('img');

        img.setAttribute('src', imageUrl);
        img.classList.add('img-fluid', 'img-with-overlay');
        // Add the image to the grid item
        gridItem.appendChild(img);
        // Create the employee name text element
        const employeeNameContainer = document.createElement('div');
        employeeNameContainer.classList.add('employeeName-container');
        gridItem.appendChild(employeeNameContainer);
        const employeeName = document.createElement('span');
        employeeName.textContent = row[1];
        employeeName.classList.add('employeeName-text');
        // Add the employeeName text element to the grid item
        employeeNameContainer.appendChild(employeeName);
        // Create the position text element
        const positionContainer = document.createElement('div');
        positionContainer.classList.add('position-container');
        gridItem.appendChild(positionContainer);
        const position = document.createElement('span');
        position.textContent = row[3];
        position.classList.add('position-text');
        // Add the position text element to the grid item
        positionContainer.appendChild(position);
        // Add the grid item to the group grid container
        groupDiv.querySelector('.group-grid-container').appendChild(gridItem);


        employeeName.textContent = makeUppercase ? employeeName.textContent.toUpperCase() : employeeName.textContent;
        position.textContent = makeUppercase ? position.textContent.toUpperCase() : position.textContent;

        // Check if the date in row[7] is today's date
        const birthday = new Date(row[7]);
        const today = new Date();

        //BIRTHDAY CODE --------------------------------------------------------------------
		  // Array of audio file paths
const audioFiles = [
  /*'music/birthday-Beatles.mp3'*/,
  // Add more paths as needed...
];

        if (
          birthday.getDate() === today.getDate()
          && birthday.getMonth() === today.getMonth()
        ) {
          gridItem.classList.add('birthdayFX');
          gridItem.setAttribute('id', 'birthday');

          // Create the badge
          const badge = document.createElement('img');
          badge.setAttribute('src', 'img/birthdayHat.png');
          badge.classList.add('birthday-badge');
          // Append the badge to the grid item
          gridItem.appendChild(badge);

          const confettiEffect = () => {
            // Fire confetti from the gridItem
            const rect = gridItem.getBoundingClientRect();
            confetti({
              particleCount: 100,
              startVelocity: 30,
              spread: 360,
              origin: {
                x: rect.x / window.innerWidth + rect.width / 2 / window.innerWidth,
                y: rect.y / window.innerHeight,
              },
            });
          };

          // Fire confetti immediately
          confettiEffect();
          // Then fire confetti every 30 seconds
          setInterval(confettiEffect, 10 * 1000);
			// Select a random audio file from the array
  const audioFilePath = audioFiles[Math.floor(Math.random() * audioFiles.length)];

  // Play the selected audio file
  const audio = new Audio(audioFilePath);
  audio.play();
        }
// END OF BIRTHDAY CODE ---------------------------------------------------------------------
		  
      });
    });
}


// Refresh data every hour
// setInterval(fetchData, 60 * 60 * 1000);

setInterval(function () {
  location.reload();
}, 60 * 60 * 1000); 


// Replace YOUR_API_KEY with your API key
const API_KEY = 'AIzaSyBtAPbNaE5kGaunZrOwaM2I8KJSevD93aA';
// Replace YOUR_SPREADSHEET_ID with the ID of your Google Sheets document
const SPREADSHEET_ID = '1iRPL4Nf9nRbe-fzxKaZZsxdCYIxParU2_J-9IjnYQBo';
// Replace YOUR_SHEET_NAME with the name of the sheet in the document that contains the data
const SHEET_NAME = 'Employee Data';

const departments = {
  'Management': 'Group 1',
  'Anchors and Reporters': 'Group 1',
  'News': 'Group 1',
  'Traffic': 'Group 2',
  'Photographers and Editors': 'Group 2',
  'Creative Services': 'Group 2',
  'Sales': 'Group 2',
  'Engineering and MCOs': 'Group 2'
};

function getDataFromSheets(containerId) {
  // Make an HTTP request to the Google Sheets API to retrieve the data from the document
  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      console.log(data); // Log the data to the console

      // Get the container element
      const container = document.getElementById(containerId);

      // Create the group container
      const groupContainer = document.createElement('div');
      groupContainer.classList.add('group-container');

      // Sort the data by group
      const rows = data.values.slice(1);
      rows.sort((a, b) => {
        const groupA = departments[a[2]];
        const groupB = departments[b[2]];
        if (groupA < groupB) {
          return -1;
        }
        if (groupA > groupB) {
          return 1;
        }
        return 0;
      });

      // Iterate over the rows of data and create the grid items for each group
      let currentGroup = null;
      let groupGridContainer = null;
      rows.forEach(row => {
        // Get the group for this row
        const group = departments[row[2]];
        // If the group is different from the current group, create a new grid container for the group
        if (group !== currentGroup) {
          currentGroup = group;
          groupGridContainer = document.createElement('div');
          groupGridContainer.classList.add('group-grid-container');
          // Add the group grid container to the group container
          groupContainer.appendChild(groupGridContainer);
        }
        // Get the image URL from the seventh column
        const imageUrl = row[6];
        // Create the grid item
        const gridItem = document.createElement('div');
        gridItem.classList.add('group-grid-item');
        // Create the image element
        const img = document.createElement('img');
        img.setAttribute('src', imageUrl);
//        img.setAttribute('width', '100');
//        img.setAttribute('height', '100');
        // Add the image to the grid item
        gridItem.appendChild(img);
        // Add the grid item to the group grid container
        groupGridContainer.appendChild(gridItem);
      });
      // Add the group container to the container element
      container.appendChild(groupContainer);
    });
}


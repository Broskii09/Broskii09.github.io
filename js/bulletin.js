// JavaScript Document// Replace YOUR_API_KEY with your API key
const API_KEY = 'AIzaSyBtAPbNaE5kGaunZrOwaM2I8KJSevD93aA';
// Replace YOUR_SPREADSHEET_ID with the ID of your Google Sheets document
const SPREADSHEET_ID = '1iRPL4Nf9nRbe-fzxKaZZsxdCYIxParU2_J-9IjnYQBo';
// Replace YOUR_SHEET_NAME with the name of the sheet in the document that contains the data
const SHEET_NAME = 'Employee Data';
// Replace YOUR_SHEET_NAME with the name of the sheet in the document that contains the data
const EVENT_SHEET_NAME = 'Events';

const groups = ['Group 1', 'Group 2'];
const departments = [
  'Management',
  'Anchors_And_Reporters',
  'News',
  'Traffic',
  'Photographers_And_Editors',
  'Creative_Services',
  'Sales',
  'Engineering_MCO',
  'New_Hire'
];

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
      rows.forEach(row => {
        // Get the group for this row
        let group = row[2];
        // Replace underscores with spaces, because Google Sheets' "Named Ranged" format is fucking bullshit
        group = group.replace(/_/g, ' ');
        // If the group is different from the current group, create a new container for the group
        if (group !== currentGroup) {
          currentGroup = group;
          groupDiv = document.createElement('div');
          groupDiv.classList.add('group-div', 'row', 'col-3');
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
        }

        // Get the image URL from the seventh column
        const imageUrl = row[6];
        // Create the grid item
        const gridItem = document.createElement('div');
        gridItem.classList.add('group-grid-item');
        // Create the image element
        const img = document.createElement('img');
        img.setAttribute('src', imageUrl);
        img.classList.add('photo', 'img-fluid');
        // Add the image to the grid item
        gridItem.appendChild(img);
        // Create the employee name text element
        const employeeName = document.createElement('p');
        employeeName.textContent = row[1];
        employeeName.classList.add('employeeName-text');
        // Add the employeeName text element to the grid item
        gridItem.appendChild(employeeName);
        // Create the position text element
        const position = document.createElement('p');
        position.textContent = row[3];
        position.classList.add('position-text');
        // Add the position text element to the grid item
        gridItem.appendChild(position);
        // Add the grid item to the group grid container
        groupDiv.querySelector('.group-grid-container').appendChild(gridItem);

        let makeUppercase = true;

        employeeName.textContent = makeUppercase ? employeeName.textContent.toUpperCase() : employeeName.textContent;
        position.textContent = makeUppercase ? position.textContent.toUpperCase() : position.textContent;
      });
    });
}

function getDataFromSheets(eventID) {
  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${EVENT_SHEET_NAME}!K2:P100?key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      console.log(data); // Log the data to the console

      // Get the container element
      const events = document.getElementById(eventID);

      // Loop through the rows of data
      for (let i = 0; i < data.values.length; i++) {
        const row = data.values[i];

        // Create an element for each event
        const eventElement = document.createElement('div');
        eventElement.classList.add('event');

        // Set the values from the corresponding columns as the content of the elements
        eventElement.innerHTML = `
          <div class="date">${row[0]}</div>
          <div class="time">${row[1]}</div>
          <div class="title">${row[2]}</div>
          <div class="description">${row[3]}</div>
          <div class="category">${row[4]}</div>
          <div class="location">${row[5]}</div>
        `;

        // Append the event element to the events
        events.appendChild(eventElement);
      }
    })
    .catch(error => {
      console.error(error);
    });
}

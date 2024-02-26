<<<<<<< HEAD
// Replace YOUR_SHEET_NAME with the name of the sheet in the document that contains the data
const EVENT_SHEET_NAME = 'Events';

// [currentRowIndex] is the starting point for the row range you're pulling from the Google Sheet. If it's set to 1, the script will begin pulling data from the second row in the sheet (since row indices start at 0).
// [totalNumberOfRows] defines how many rows of data the script should consider. If it's set to 9, it will stop fetching data after the ninth row.
// [rowLimit] controls how many rows of data should be appended to the HTML table per function call. If it's set to 9, it will add up to 9 rows (or fewer, if less than 9 rows are available) to the table each time getDataFromEvents() is called.

let currentRowIndex = 1;
let totalNumberOfRows = 9;
let rowLimit = 10;

function getDataFromEvents(eventID, rowLimit) {
  const startRow = currentRowIndex + 1;
  const endRow = startRow + totalNumberOfRows;
  //  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${EVENT_SHEET_NAME}!M2:U100?key=${API_KEY}`)
  console.log('endRow:', endRow);
  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${EVENT_SHEET_NAME}!M${startRow}:U${endRow}?key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      console.log('data:', data); // Log the data to the console
      // Get the container element
      const events = document.getElementById(eventID);

      // Create a table element
      const table = document.createElement('table');
      table.classList.add('table');

      // Create a header row element
      const headerRow = document.createElement('tr');

      // Set the column names as the content of the header cells
      const dateHeader = document.createElement('th');
      dateHeader.classList.add('text-center', 'align-middle', 'fs-5', 'events');
      dateHeader.innerHTML = 'Date';
      dateHeader.setAttribute('scope', 'col');
      headerRow.appendChild(dateHeader);

      const timeHeader = document.createElement('th');
      timeHeader.classList.add('text-center', 'align-middle', 'fs-5', 'events');
      timeHeader.innerHTML = 'Time';
      timeHeader.setAttribute('scope', 'col');
      headerRow.appendChild(timeHeader);

      const titleHeader = document.createElement('th');
      titleHeader.classList.add('text-center', 'align-middle', 'fs-5', 'events');
      titleHeader.innerHTML = 'Title';
      titleHeader.setAttribute('scope', 'col');
      headerRow.appendChild(titleHeader);

      const descriptionHeader = document.createElement('th');
      descriptionHeader.classList.add('text-center', 'align-middle', 'fs-5', 'events');
      descriptionHeader.innerHTML = 'Description';
      descriptionHeader.setAttribute('scope', 'col');
      headerRow.appendChild(descriptionHeader);

      const categoryHeader = document.createElement('th');
      categoryHeader.classList.add('text-center', 'align-middle', 'fs-5', 'events');
      categoryHeader.innerHTML = 'Category';
      categoryHeader.setAttribute('scope', 'col');
      headerRow.appendChild(categoryHeader);

      const locationHeader = document.createElement('th');
      locationHeader.classList.add('text-center', 'align-middle', 'fs-5', 'events');
      locationHeader.innerHTML = 'Location';
      locationHeader.setAttribute('scope', 'col');
      headerRow.appendChild(locationHeader);

      const imageHeader = document.createElement('th');
      imageHeader.classList.add('text-center', 'align-middle', 'fs-5', 'events');
      imageHeader.innerHTML = '';
      imageHeader.setAttribute('scope', 'col');
      headerRow.appendChild(imageHeader);

      // Create a thead element and append the header row element to it
      const tableHead = document.createElement('thead');
      tableHead.appendChild(headerRow);

      // Append the thead element to the table
      table.appendChild(tableHead);

      // Create a tbody element
      const tableBody = document.createElement('tbody');
      // Loop through the rows of data
      if (data.values) {
        for (let i = 0; i < data.values.length; i++) {
          const row = data.values[i];

          // Check if the row is empty or contains undefined values
          if (row.every(cell => cell === undefined || cell === '')) {
            continue;
          }

          // Create a row element
          const tableRow = document.createElement('tr');

          // Check if the "Special Request" column is set to "True"
          if (row[8] === 'True') {
            tableRow.classList.add('special-request'); // Add a CSS class for highlighting
          }

          // Set the values from the corresponding columns as the content of the cells
          const dateCell = document.createElement('td');
          dateCell.classList.add('text-center', 'align-middle', 'fs-5', 'events');

          const date = new Date(row[0]);

          if (isNaN(date.getTime())) {
            // If the date is invalid, display the cell content as it is
            dateCell.innerHTML = row[0];
          } else {
            // Split the date string into month and day components
            const month = date.toLocaleString('default', {
              month: 'short'
            });
            const day = date.getDate();

            // Create elements for the month and the day
            const monthDiv = document.createElement('div');
            monthDiv.classList.add('eventMonth-text');
            monthDiv.innerHTML = month;

            const dayDiv = document.createElement('div');
            dayDiv.classList.add('eventDate-text');
            dayDiv.innerHTML = day;

            // Append the month and day elements to the date cell
            dateCell.appendChild(monthDiv);
            dateCell.appendChild(dayDiv);
          }

          tableRow.appendChild(dateCell);

          const timeCell = document.createElement('td');
          timeCell.classList.add('text-center', 'align-middle', 'fs-5', 'events');
          timeCell.innerHTML = row[1];
          tableRow.appendChild(timeCell);

          const titleCell = document.createElement('td');
          titleCell.classList.add('text-center', 'align-middle', 'fs-5', 'events');
          titleCell.innerHTML = row[2];
          tableRow.appendChild(titleCell);

          const descriptionCell = document.createElement('td');
          descriptionCell.classList.add('text-center', 'align-middle', 'fs-5', 'events');
          descriptionCell.innerHTML = row[3];
          tableRow.appendChild(descriptionCell);

          const categoryCell = document.createElement('td');
          categoryCell.classList.add('text-center', 'align-middle', 'fs-5', 'events');
          categoryCell.innerHTML = row[4];
          tableRow.appendChild(categoryCell);

          const locationCell = document.createElement('td');
          locationCell.classList.add('text-center', 'align-middle', 'fs-5', 'events');
          locationCell.innerHTML = row[5];
          tableRow.appendChild(locationCell);

          // Add new cells for the imageName and imageType columns
          const imageCell = document.createElement('td');
          imageCell.classList.add('text-center', 'align-middle', 'fs-5', 'events');
          if (row[7] === 'webm') {
            imageCell.innerHTML = `
        <video width="150px" autoplay loop muted>
            <source src="img/events/${row[6]}.${row[7]}" type="video/webm">
            Your browser does not support the video tag.
        </video>
    `;
          } else {
            imageCell.innerHTML = `<img src="img/events/${row[6]}.${row[7]}" width="150px" height="auto">`;
          }

          tableRow.appendChild(imageCell);

          // Append the row element to the table body
          tableBody.appendChild(tableRow);
        }
      }

      // Add the  row at the end with 3 columns
      const birthdayRow = document.createElement('tr');

      const birthdayCell1 = document.createElement('td');
      birthdayCell1.innerHTML = 'Upcoming Birthdays'; // Replace with your value
      birthdayCell1.classList.add('text-center', 'align-middle', 'fs-1', 'events');
      birthdayCell1.setAttribute('colspan', '3');
      birthdayRow.appendChild(birthdayCell1);

      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${EVENT_SHEET_NAME}!P16:P16?key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
          const birthdayCell2 = document.createElement('td');
          birthdayCell2.innerHTML = data.values ? data.values[0][0] : 'No data'; // If there's no data in the cell, 'No data' will be displayed
          birthdayCell2.classList.add('text-center', 'align-middle', 'fs-5', 'events');
          birthdayCell2.setAttribute('colspan', '3');
          birthdayRow.appendChild(birthdayCell2);

          // Now we fetch the data for the birthdayCell3
          return fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${EVENT_SHEET_NAME}!S16:T16?key=${API_KEY}`);
        })
        .then(response => response.json())
        .then(data => {
          const birthdayCell3 = document.createElement('td');
          birthdayCell3.classList.add('text-center', 'align-middle', 'fs-5', 'events');
          birthdayCell3.setAttribute('colspan', '1');

          if (data.values && data.values[0].length === 2) {
            const imageName = data.values[0][0];
            const imageType = data.values[0][1];

            if (imageType === 'webm') {
              birthdayCell3.innerHTML = `
                    <video width="150px" autoplay loop muted>
                        <source src="img/events/${imageName}.${imageType}" type="video/webm">
                        Your browser does not support the video tag.
                    </video>
                `;
            } else {
              birthdayCell3.innerHTML = `<img src="img/events/${imageName}.${imageType}" width="150px" height="auto">`;
            }
          } else {
            birthdayCell3.innerHTML = 'No data'; // If there's no data in the cells, 'No data' will be displayed
          }

          birthdayRow.appendChild(birthdayCell3);

          // Append birthdayRow to tableBody here, after birthdayCell3 has been created and appended
          tableBody.appendChild(birthdayRow);
        })
        .catch(error => {
          console.error(error);
        });

      tableBody.appendChild(birthdayRow);

      if (currentRowIndex >= totalNumberOfRows) {
        currentRowIndex = 1;
      }

      // Append the table body to the table
      table.appendChild(tableBody);

      // Append the table element to the container element
      events.appendChild(table);

      currentRowIndex += rowLimit;
    })
    .catch(error => {
      console.error(error);
    });

}
=======
// Replace YOUR_SHEET_NAME with the name of the sheet in the document that contains the data
const EVENT_SHEET_NAME = 'Events';

// [currentRowIndex] is the starting point for the row range you're pulling from the Google Sheet. If it's set to 1, the script will begin pulling data from the second row in the sheet (since row indices start at 0).
// [totalNumberOfRows] defines how many rows of data the script should consider. If it's set to 9, it will stop fetching data after the ninth row.
// [rowLimit] controls how many rows of data should be appended to the HTML table per function call. If it's set to 9, it will add up to 9 rows (or fewer, if less than 9 rows are available) to the table each time getDataFromEvents() is called.

let currentRowIndex = 1;
let totalNumberOfRows = 9;
let rowLimit = 10;

function getDataFromEvents(eventID, rowLimit) {
  const startRow = currentRowIndex + 1;
  const endRow = startRow + totalNumberOfRows;
  //  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${EVENT_SHEET_NAME}!M2:U100?key=${API_KEY}`)
  console.log('endRow:', endRow);
  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${EVENT_SHEET_NAME}!M${startRow}:U${endRow}?key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      console.log('data:', data); // Log the data to the console
      // Get the container element
      const events = document.getElementById(eventID);

      // Create a table element
      const table = document.createElement('table');
      table.classList.add('table');

      // Create a header row element
      const headerRow = document.createElement('tr');

      // Set the column names as the content of the header cells
      const dateHeader = document.createElement('th');
      dateHeader.classList.add('text-center', 'align-middle', 'fs-5', 'events');
      dateHeader.innerHTML = 'Date';
      dateHeader.setAttribute('scope', 'col');
      headerRow.appendChild(dateHeader);

      const timeHeader = document.createElement('th');
      timeHeader.classList.add('text-center', 'align-middle', 'fs-5', 'events');
      timeHeader.innerHTML = 'Time';
      timeHeader.setAttribute('scope', 'col');
      headerRow.appendChild(timeHeader);

      const titleHeader = document.createElement('th');
      titleHeader.classList.add('text-center', 'align-middle', 'fs-5', 'events');
      titleHeader.innerHTML = 'Title';
      titleHeader.setAttribute('scope', 'col');
      headerRow.appendChild(titleHeader);

      const descriptionHeader = document.createElement('th');
      descriptionHeader.classList.add('text-center', 'align-middle', 'fs-5', 'events');
      descriptionHeader.innerHTML = 'Description';
      descriptionHeader.setAttribute('scope', 'col');
      headerRow.appendChild(descriptionHeader);

      const categoryHeader = document.createElement('th');
      categoryHeader.classList.add('text-center', 'align-middle', 'fs-5', 'events');
      categoryHeader.innerHTML = 'Category';
      categoryHeader.setAttribute('scope', 'col');
      headerRow.appendChild(categoryHeader);

      const locationHeader = document.createElement('th');
      locationHeader.classList.add('text-center', 'align-middle', 'fs-5', 'events');
      locationHeader.innerHTML = 'Location';
      locationHeader.setAttribute('scope', 'col');
      headerRow.appendChild(locationHeader);

      const imageHeader = document.createElement('th');
      imageHeader.classList.add('text-center', 'align-middle', 'fs-5', 'events');
      imageHeader.innerHTML = '';
      imageHeader.setAttribute('scope', 'col');
      headerRow.appendChild(imageHeader);

      // Create a thead element and append the header row element to it
      const tableHead = document.createElement('thead');
      tableHead.appendChild(headerRow);

      // Append the thead element to the table
      table.appendChild(tableHead);

      // Create a tbody element
      const tableBody = document.createElement('tbody');
      // Loop through the rows of data
      if (data.values) {
        for (let i = 0; i < data.values.length; i++) {
          const row = data.values[i];

          // Check if the row is empty or contains undefined values
          if (row.every(cell => cell === undefined || cell === '')) {
            continue;
          }

          // Create a row element
          const tableRow = document.createElement('tr');

          // Check if the "Special Request" column is set to "True"
          if (row[8] === 'True') {
            tableRow.classList.add('special-request'); // Add a CSS class for highlighting
          }

          // Set the values from the corresponding columns as the content of the cells
          const dateCell = document.createElement('td');
          dateCell.classList.add('text-center', 'align-middle', 'fs-5', 'events');

          const date = new Date(row[0]);

          if (isNaN(date.getTime())) {
            // If the date is invalid, display the cell content as it is
            dateCell.innerHTML = row[0];
          } else {
            // Split the date string into month and day components
            const month = date.toLocaleString('default', {
              month: 'short'
            });
            const day = date.getDate();

            // Create elements for the month and the day
            const monthDiv = document.createElement('div');
            monthDiv.classList.add('eventMonth-text');
            monthDiv.innerHTML = month;

            const dayDiv = document.createElement('div');
            dayDiv.classList.add('eventDate-text');
            dayDiv.innerHTML = day;

            // Append the month and day elements to the date cell
            dateCell.appendChild(monthDiv);
            dateCell.appendChild(dayDiv);
          }

          tableRow.appendChild(dateCell);

          const timeCell = document.createElement('td');
          timeCell.classList.add('text-center', 'align-middle', 'fs-5', 'events');
          timeCell.innerHTML = row[1];
          tableRow.appendChild(timeCell);

          const titleCell = document.createElement('td');
          titleCell.classList.add('text-center', 'align-middle', 'fs-5', 'events');
          titleCell.innerHTML = row[2];
          tableRow.appendChild(titleCell);

          const descriptionCell = document.createElement('td');
          descriptionCell.classList.add('text-center', 'align-middle', 'fs-5', 'events');
          descriptionCell.innerHTML = row[3];
          tableRow.appendChild(descriptionCell);

          const categoryCell = document.createElement('td');
          categoryCell.classList.add('text-center', 'align-middle', 'fs-5', 'events');
          categoryCell.innerHTML = row[4];
          tableRow.appendChild(categoryCell);

          const locationCell = document.createElement('td');
          locationCell.classList.add('text-center', 'align-middle', 'fs-5', 'events');
          locationCell.innerHTML = row[5];
          tableRow.appendChild(locationCell);

          // Add new cells for the imageName and imageType columns
          const imageCell = document.createElement('td');
          imageCell.classList.add('text-center', 'align-middle', 'fs-5', 'events');
          if (row[7] === 'webm') {
            imageCell.innerHTML = `
        <video width="150px" autoplay loop muted>
            <source src="img/events/${row[6]}.${row[7]}" type="video/webm">
            Your browser does not support the video tag.
        </video>
    `;
          } else {
            imageCell.innerHTML = `<img src="img/events/${row[6]}.${row[7]}" width="150px" height="auto">`;
          }

          tableRow.appendChild(imageCell);

          // Append the row element to the table body
          tableBody.appendChild(tableRow);
        }
      }

      // Add the  row at the end with 3 columns
      const birthdayRow = document.createElement('tr');

      const birthdayCell1 = document.createElement('td');
      birthdayCell1.innerHTML = 'Upcoming Birthdays'; // Replace with your value
      birthdayCell1.classList.add('text-center', 'align-middle', 'fs-1', 'events');
      birthdayCell1.setAttribute('colspan', '3');
      birthdayRow.appendChild(birthdayCell1);

      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${EVENT_SHEET_NAME}!P16:P16?key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
          const birthdayCell2 = document.createElement('td');
          birthdayCell2.innerHTML = data.values ? data.values[0][0] : 'No data'; // If there's no data in the cell, 'No data' will be displayed
          birthdayCell2.classList.add('text-center', 'align-middle', 'fs-5', 'events');
          birthdayCell2.setAttribute('colspan', '3');
          birthdayRow.appendChild(birthdayCell2);

          // Now we fetch the data for the birthdayCell3
          return fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${EVENT_SHEET_NAME}!S16:T16?key=${API_KEY}`);
        })
        .then(response => response.json())
        .then(data => {
          const birthdayCell3 = document.createElement('td');
          birthdayCell3.classList.add('text-center', 'align-middle', 'fs-5', 'events');
          birthdayCell3.setAttribute('colspan', '1');

          if (data.values && data.values[0].length === 2) {
            const imageName = data.values[0][0];
            const imageType = data.values[0][1];

            if (imageType === 'webm') {
              birthdayCell3.innerHTML = `
                    <video width="150px" autoplay loop muted>
                        <source src="img/events/${imageName}.${imageType}" type="video/webm">
                        Your browser does not support the video tag.
                    </video>
                `;
            } else {
              birthdayCell3.innerHTML = `<img src="img/events/${imageName}.${imageType}" width="150px" height="auto">`;
            }
          } else {
            birthdayCell3.innerHTML = 'No data'; // If there's no data in the cells, 'No data' will be displayed
          }

          birthdayRow.appendChild(birthdayCell3);

          // Append birthdayRow to tableBody here, after birthdayCell3 has been created and appended
          tableBody.appendChild(birthdayRow);
        })
        .catch(error => {
          console.error(error);
        });

      tableBody.appendChild(birthdayRow);

      if (currentRowIndex >= totalNumberOfRows) {
        currentRowIndex = 1;
      }

      // Append the table body to the table
      table.appendChild(tableBody);

      // Append the table element to the container element
      events.appendChild(table);

      currentRowIndex += rowLimit;
    })
    .catch(error => {
      console.error(error);
    });

}
>>>>>>> e1245f311ea92b7ef76e1ec31273bc73c4e20511

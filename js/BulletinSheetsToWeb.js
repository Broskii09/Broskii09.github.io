const apiKey = '{AIzaSyBtAPbNaE5kGaunZrOwaM2I8KJSevD93aA}';
const spreadsheetId = '{1iRPL4Nf9nRbe-fzxKaZZsxdCYIxParU2_J-9IjnYQBo}';

// First, retrieve the data from the Google Sheets document using the API
fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A2:G130?key=${apiKey}`)
  .then(response => {
    console.log(response.status);  // Log the status code
    return response.json();
  })
  .then(data => {
    // Create a map of tables, one for each department
    const tables = {
      'Management': document.querySelector('#management-table'),
      'Anchors and Reporters': document.querySelector('#anchors-and-reporters-table'),
      'News': document.querySelector('#news-table'),
      'Traffic': document.querySelector('#traffic-table'),
      'Photographers and Editors': document.querySelector('#photographers-and-editors-table'),
      'Creative Services': document.querySelector('#creative-services-table'),
      'Sales': document.querySelector('#sales-table'),
      'Engineering & MCO': document.querySelector('#engineering-and-mco-table'),
    };

    // Iterate through the rows of data
    for (let i = 0; i < data.values.length; i++) {
      const row = data.values[i];
      console.log('Row:', row);  // Print the entire row to the console

      // Get the employee ID, department, and image URL
      const id = row[0];
      console.log('ID:', id);  // Print the employee ID to the console
      const department = row[2];
      console.log('Department:', department);  // Print the department to the console
      const imageUrl = row[6];
      console.log('Image URL:', imageUrl);  // Print the image URL to the console

      // Find the table for this department
      const table = tables[department];

      // Create a new row and cell for the employee
      const tr = document.createElement('tr');
      const td = document.createElement('td');

      // Set the data-id attribute of the cell to the employee ID
      td.setAttribute('data-id', id);

      // Create an image element
      const img = document.createElement('img');
      img.src = imageUrl;

      // Add the image to the cell
      td.appendChild(img);

      // Add the cell to the row
      tr.appendChild(td);

      // Add the row to the table
      table.appendChild(tr);
    }
  });


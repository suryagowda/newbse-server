// Function to check server status and update the UI accordingly
async function checkServerStatus() {
    const serverStatusElement = document.getElementById('serverStatus');

    try {
        const response = await fetch('http://localhost:3000/top10stocks');
        const jsonData = await response.json();

        if (jsonData.length > 0) {
            // Server is ready, update UI to green
            serverStatusElement.style.backgroundColor = '#8aff8a'; // Green color
            serverStatusElement.textContent = 'Server is ready';
            serverStatusElement.style.color = '#1a1a1a'; // Dark text color
        } else {
            // Server response is empty, update UI to red
            serverStatusElement.style.backgroundColor = '#ff0000'; // Red color
            serverStatusElement.textContent = 'Server is not ready, Please select a date below and send request to the API endpoint to wake up the server';
            serverStatusElement.style.color = '#8aff8a'; // Light green text color
        }
    } catch (error) {
        // Error while fetching server status, update UI to red
        serverStatusElement.style.backgroundColor = '#ff0000'; // Red color
        serverStatusElement.textContent = 'Error checking server status';
        serverStatusElement.style.color = '#8aff8a'; // Light green text color
        console.error('Error checking server status:', error);
    }
}

// Call the checkServerStatus function when the page loads
window.onload = checkServerStatus;

// Function to fetch top 10 stocks and display in a table
async function getTopStocks() {
    const response = await fetch('http://localhost:3000/top10stocks');
    const data = await response.json();
    const topStocksBody = document.getElementById('topStocksBody');

    // Clear previous table rows
    topStocksBody.innerHTML = '';

    // Display data for debugging
    console.log('Data:', data);

    // Display each stock name and code in the table
    data.forEach(stock => {
        console.log('Stock:', stock); // Log each stock for further inspection
        const row = topStocksBody.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);

        // Create a span for the stock name
        const stockNameSpan = document.createElement('span');
        stockNameSpan.textContent = stock.name;

        // Create a copy icon for the stock name
        const copyNameIcon = createCopyIcon(stock.name);

        // Append the stock name and copy icon to the cell
        cell1.appendChild(stockNameSpan);
        cell1.appendChild(copyNameIcon);

        // Create a span for the stock code
        const stockCodeSpan = document.createElement('span');
        stockCodeSpan.textContent = ` (${stock.code})`;

        // Create a copy icon for the stock code
        const copyCodeIcon = createCopyIcon(stock.code);

        // Append the stock code and copy icon to the cell
        cell2.appendChild(stockCodeSpan);
        cell2.appendChild(copyCodeIcon);
    });
}

// Function to create a copy icon for a given text
function createCopyIcon(text) {
    const copyIcon = document.createElement('span');
    copyIcon.className = 'copy-icon';
    copyIcon.textContent = '📋'; // Unicode for clipboard icon

    // Add a click event listener to handle the copy action
    copyIcon.addEventListener('click', function () {
        copyTextToClipboardFallback(text);
    });

    // Ensure the cursor is set to pointer
    copyIcon.style.cursor = 'pointer';

    // Add a title attribute for accessibility
    copyIcon.title = 'Copy to Clipboard';

    return copyIcon;
}

// Function to copy text to clipboard using document.execCommand (fallback)
function copyTextToClipboardFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        showAlert('Copied to clipboard!', 'alert-success');
    } catch (err) {
        console.error('Unable to copy to clipboard', err);
        showAlert('Failed to copy to clipboard', 'alert-danger');
    } finally {
        document.body.removeChild(textarea);
    }
}

// Function to process equity Bhavcopy for a specific date
async function processEquityBhavcopyForDate() {
    const rawDateInput = document.getElementById('equityBhavcopyDateInput').value;

    // Validate the date format (yyyy-mm-dd)
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateFormat.test(rawDateInput)) {
        showAlert('Please enter a valid date in the format yyyy-mm-dd.', 'alert-danger');
        return;
    }

    // Convert the raw date input to "ddmmyy" format
    const dateObject = new Date(rawDateInput);
    const day = String(dateObject.getDate()).padStart(2, '0');
    const month = String(dateObject.getMonth() + 1).padStart(2, '0'); //Month is zero-based
    const year = String(dateObject.getFullYear()).slice(-2);
    const formattedDateInput = day + month + year;

    console.log(formattedDateInput);

    try {
        const response = await fetch('http://localhost:3000/processEquityBhavcopy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date: formattedDateInput }),
        });
    
        if (!response.ok) {
            if (response.status === 404) {
                showAlert('Invalid date. Please enter a valid date.', 'alert-danger');
                return;
            } else {
                throw new Error(`Failed to download CSV for the provided date. Status: ${response.status}.`);
            }
        }
    
        const result = await response.json();
        showAlert(result.message, 'alert-success');
    
        setTimeout(() => {
            location.reload();
        }, 1000);
    } catch (error) {
        showAlert(`Error: ${error.message}`, 'alert-danger');
        console.error('Error processing Equity Bhavcopy:', error);
    }
}

// Function to display an alert with a message and specified alert type
function showAlert(message, alertType) {
   
    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    
    const alertBox = document.createElement('div');
    alertBox.className = 'alert';
    alertBox.style.backgroundColor = '#1a1a1a'; // Dark background color
    alertBox.style.border = '1px solid #8aff8a'; // Light green border color
    alertBox.style.borderRadius = '8px'; // Rounded corners
    alertBox.style.color = '#8aff8a'; // Light green text color

    
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    alertBox.appendChild(messageElement);

    // Create a button within the alert box
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.backgroundColor = '#007bff'; // Blue button color
    closeButton.style.color = '#fff'; // White text color
    closeButton.style.border = 'none'; // No border
    closeButton.style.borderRadius = '4px'; // Rounded corners
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        
        document.body.removeChild(overlay);
    });
    alertBox.appendChild(closeButton);

    // Add the alert box to the overlay
    overlay.appendChild(alertBox);

    // Add the overlay to the document body
    document.body.appendChild(overlay);
}



// Function to search stocks by name and display the results in a table
async function searchStocks() {
    const stockName = document.getElementById('stockNameInput').value.toUpperCase();
    const response = await fetch(`http://localhost:3000/stocks/${stockName}`);
    const data = await response.json();
    const searchResultsBody = document.getElementById('searchResultsBody');

    searchResultsBody.innerHTML = ''; // Clear previous results

    if (data.length === 0) {
        // Display alert for invalid stock name
        showAlert('Invalid stock name. Please enter a valid stock name.', 'error');
    } else {
        // Display search results
        data.forEach(stock => {
            const row = searchResultsBody.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            const cell4 = row.insertCell(3);
            const cell5 = row.insertCell(4);
            const cell6 = row.insertCell(4);

            cell1.textContent = stock.name;
            cell2.textContent = stock.code;
            cell3.textContent = stock.open;
            cell4.textContent = stock.close;
            cell5.textContent = stock.high;
            cell6.textContent = stock.low;
        });
    }
}

// Function to add a stock to favorites
async function addToFavorites() {
    const nameInput = document.getElementById('favoriteNameInput').value.toUpperCase();
    const codeInput = document.getElementById('favoriteCodeInput').value;

    if (!nameInput || !codeInput) {
        showAlert('Both name and code are required.', 'alert-danger');
        return;
    }

    const response = await fetch('http://localhost:3000/addtofavorites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: nameInput, code: codeInput }),
    });

    const result = await response.json();

    if (response.ok) {
        showAlert(result.message, 'alert-success');

        // Fetch and display favorite stocks after adding
        getFavoriteStocks();
    } else {
        showAlert(result.error, 'alert-danger');
    }
}

// Function to fetch and display favorite stocks in a table
async function getFavoriteStocks() {
    const response = await fetch('http://localhost:3000/favoritestocks');
    const data = await response.json();
    const favoriteStocksBody = document.getElementById('favoriteStocksBody');

    // Clear previous table rows
    favoriteStocksBody.innerHTML = '';

    data.forEach(stock => {
        const row = favoriteStocksBody.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2); // New cell for remove button

        cell1.textContent = stock.name;
        cell2.textContent = stock.code;

        // Create a remove button with a red background
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-button'; // Add a class for styling
        removeButton.onclick = function() {
            removeFromFavorites(stock.code);
        };

        cell3.appendChild(removeButton);
    });
}

// Function to remove stock from favorites
async function removeFromFavorites(code) {
    const response = await fetch(`http://localhost:3000/removefromfavorites/${code}`, {
        method: 'DELETE',
    });

    const result = await response.json();
    showAlert(result.message, 'alert-success');

    // Fetch and display updated favorite stocks after removal
    getFavoriteStocks();
}

// Function to fetch and store stock data for a given stock name
async function fetchAndStoreStockDataa() {
    const stockNameForDataInput = document.getElementById('stockInput').value;

    if (!stockNameForDataInput) {
        showAlert('Please enter a stock name.', 'alert-danger');
        return; // Adding this line to exit the function
    }

    const stockName = stockNameForDataInput.trim().toUpperCase();

    try {
        const response = await fetch(`http://localhost:3000/fetchAndStoreStockData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stockName }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch and store data for ${stockName}.`);
        }

        const result = await response.json();
        showAlert(result.message, 'alert-success');

        fetchAndShowStockData();

        
        setTimeout(() => {
            // Reload the page
            location.reload();
        }, Math.floor(Math.random() * 1000) + 3000); 
    } catch (error) {
        showAlert(`Error: ${error.message}`, 'alert-danger');
        console.error(`Error fetching and storing data for ${stockName}:`, error);
    }
}

// Function to fetch and show historical stock data
async function fetchAndShowStockData() {
    try {
      const response = await fetch('http://localhost:3000/historicalStockData');
  
      if (!response.ok) {
        if (response.status === 404) {
          // Handle the case when the stock_data table is empty or the stock name is invalid
          showAlert('Invalid stock name or no historical data available.', 'alert-danger');
        } else {
          throw new Error(`Failed to fetch stock data. Status: ${response.status}`);
        }
      }
  
      const stockData = await response.json();
      // Process the retrieved stock data as needed
      console.log(stockData);

    } catch (error) {
      showAlert(`Error: ${error.message}`, 'alert-danger');
      console.error('Error fetching and showing stock data:', error);
    }
}


// Initialize the page by fetching top stocks and favorite stocks
document.addEventListener("DOMContentLoaded", function () {
    // Fetch JSON data from the provided URL
    fetch('http://localhost:3000/historicalStockData')
        .then(response => response.json())
        .then(data => {
            // Assuming the first entry in data contains the stockName information
            const firstEntry = data[0];
            const stockName = firstEntry ? firstEntry.name : 'Stock';

            // Process JSON data for CanvasJS
            const chartData = data.map(entry => ({
                x: new Date(entry.date),
                y: [entry.open, entry.high, entry.low, entry.close]
            }));

            // Create CanvasJS chart with hacker-like and classy styling
            const chart = new CanvasJS.Chart("chartContainer", {
                theme: "dark2", // Use a dark theme for the chart
                backgroundColor: "#1a1a1a", // Dark background color
                title: {
                    text: `Trade Graph - ${stockName}`, // Display stock name in the title
                    fontColor: "#8aff8a" // Light green text color
                },
                axisX: {
                    title: "Date",
                    valueFormatString: "DD-MMM-YYYY",
                    lineColor: "#8aff8a", // Light green axis line color
                    labelFontColor: "#8aff8a" // Light green axis label color
                },
                axisY: {
                    title: "Stock Price",
                    includeZero: false,
                    gridColor: "#333", // Dark grid color
                    lineColor: "#8aff8a", // Light green axis line color
                    labelFontColor: "#8aff8a" // Light green axis label color
                },
                data: [{
                    type: "candlestick",
                    risingColor: "#04b815", // Light green color for rising candles
                    fallingColor: "#ff0000", // Red color for falling candles
                    dataPoints: chartData
                }]
            });

            // Render the chart
            chart.render();
        })
        .catch(error => console.error('Error fetching data:', error));
});

// Fetch top stocks and favorite stocks on page load
getTopStocks();
getFavoriteStocks();
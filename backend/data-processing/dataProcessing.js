// dataProcessing.js
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../database/database');
const axios = require('axios');
const unzipper = require('unzipper');


async function processCSVFile(csvFilePath) {
  await new Promise((resolve, reject) => {
    db.run('DELETE FROM stocks', (err) => {
      if (err) {
        console.error('Error clearing stocks table:', err);
        reject(err);
      } else {
        console.log('Stocks table cleared.');
        resolve();
      }
    });
  });

  const stmt = db.prepare(`
    INSERT INTO stocks (code, name, open, high, low, close) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          if (row && row.SC_CODE && row.SC_NAME && row.OPEN && row.HIGH && row.LOW && row.CLOSE) {
            stmt.run(
              row.SC_CODE.trim(),
              row.SC_NAME.trim(),
              parseFloat(row.OPEN),
              parseFloat(row.HIGH),
              parseFloat(row.LOW),
              parseFloat(row.CLOSE),
            );
          } else {
            console.error('Skipping row:', row);
          }
        } catch (error) {
          console.error('Error processing row:', error);
          console.error('Problematic row:', row);
          reject(error);
        }
      })
      .on('end', () => {
        stmt.finalize();
        resolve();
      })
      .on('error', (error) => {
        console.error('Error during CSV processing:', error);
        reject(error);
      });
  });
}


async function processEquityBhavcopy(date) {
  const url = `https://www.bseindia.com/download/BhavCopy/Equity/EQ${date}_CSV.ZIP`;
  const zipFileName = 'equity_bhavcopy.zip';
  const extractionPath = 'extracted_data';

  try {
    const response = await axios.get(url, { responseType: 'stream' });
    response.data.pipe(fs.createWriteStream(zipFileName));

    await new Promise((resolve) => {
      response.data.on('end', resolve);
    });

    await fs.createReadStream(zipFileName)
      .pipe(unzipper.Extract({ path: extractionPath }))
      .promise();

    await processCSVFile(`${extractionPath}/EQ${date}.CSV`);

    console.log(`Data processing completed for ${date}.`);
    
    return { message: `Data processing completed for ${date}.` };
  } catch (error) {
    console.error('Error processing Equity Bhavcopy:', error);
    // Throw an error for invalid date
    if (error.response && error.response.status === 404) {
      throw new Error('invalidDate');
    }
    throw new Error('Internal Server Error');
  } finally {
    // Check if the file exists before unlinking
    if (fs.existsSync(zipFileName)) {
      fs.unlinkSync(zipFileName);
      console.log(`Deleted ${zipFileName}`);
    } else {
      console.log(`${zipFileName} does not exist.`);
    }
  }
}


async function downloadLast50DaysBhavcopy() {
  const bhavcopyFolder = 'bhavcopy_files';

  // Create a folder for storing Bhavcopy files
  if (!fs.existsSync(bhavcopyFolder)) {
    fs.mkdirSync(bhavcopyFolder);
  }

  // Calculate the date for the last 50 days
  const today = new Date();
  for (let i = 1; i <= 50; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Note: Month is zero-based
    const year = String(date.getFullYear()).slice(-2);
    const formattedDate = day + month + year;

    await downloadAndExtractBhavcopy(formattedDate, bhavcopyFolder);
  }
}

async function downloadAndExtractBhavcopy(date, destinationFolder) {
  const url = `https://www.bseindia.com/download/BhavCopy/Equity/EQ${date}_CSV.ZIP`;
  const zipFileName = `${destinationFolder}/EQ${date}_CSV.ZIP`;

  try {
    const response = await axios.get(url, { responseType: 'stream' });
    response.data.pipe(fs.createWriteStream(zipFileName));

    await new Promise((resolve) => {
      response.data.on('end', resolve);
    });

    await fs.createReadStream(zipFileName)
      .pipe(unzipper.Extract({ path: destinationFolder }))
      .promise();

    console.log(`Download and extraction completed for ${date}.`);
  } catch (error) {
    console.error(`Error downloading and extracting Bhavcopy for ${date}:`, error);
  } finally {
    // Check if the file exists before unlinking
    if (fs.existsSync(zipFileName)) {
      fs.unlinkSync(zipFileName);
      console.log(`Deleted ${zipFileName}`);
    } else {
      console.log(`${zipFileName} does not exist.`);
    }
  }
}


async function processCSVFileForStock(csvFilePath, stockName) {
  // Process the CSV file and extract data for the specified stock
  const stockData = [];

  return new Promise((resolve, reject) => {
    const readableStream = fs.createReadStream(csvFilePath);
    const csvParser = csv();

    readableStream
      .pipe(csvParser)
      .on('data', (row) => {
        try {
          if (row && row.SC_CODE && row.SC_NAME && row.OPEN && row.HIGH && row.LOW && row.CLOSE) {
            // Check if the stock name matches the specified stock
            if (row.SC_NAME.trim() === stockName) {
              stockData.push({
                code: row.SC_CODE.trim(),
                name: row.SC_NAME.trim(),
                open: parseFloat(row.OPEN),
                high: parseFloat(row.HIGH),
                low: parseFloat(row.LOW),
                close: parseFloat(row.CLOSE),
              });
            }
          } else {
            console.error('Skipping row:', row);
          }
        } catch (error) {
          console.error('Error processing row:', error);
          console.error('Problematic row:', row);
          reject(error);
        }
      })
      .on('end', () => {
        resolve(stockData);
      })
      .on('error', (error) => {
        console.error('Error during CSV processing:', error);
        reject(error);
      });
  });
}


async function insertStockDataIntoTable(stockDataList, date) {
  // Create a new table if it doesn't exist


  // Prepare the SQL statement for inserting data
  const insertStmt = db.prepare(`
    INSERT INTO stock_data (date, code, name, open, high, low, close)
    VALUES ( ?, ?, ?, ?, ?, ?, ?)
   
  `);

  //db.run('DROP TABLE IF EXISTS stock_data');

  // Insert data for each stock into the new table
  stockDataList.forEach(stockData => {
    insertStmt.run(date, stockData.code, stockData.name, stockData.open, stockData.high, stockData.low, stockData.close);
  });

  // Finalize the statement
  insertStmt.finalize();
  
}




async function fetchAndStoreStockData(stockName) {
  const bhavcopyFolder = 'bhavcopy_files';

  // Ensure the Bhavcopy files are downloaded and available

  // Prepare the SQL statement for clearing the stock_data table
const clearTableStmt = db.prepare('DELETE FROM stock_data');

// Clear the stock_data table
clearTableStmt.run();
clearTableStmt.finalize();
  

  // Loop through each CSV file in the folder
  const files = fs.readdirSync(bhavcopyFolder);

  for (const file of files) {
    const csvFilePath = `${bhavcopyFolder}/${file}`;
    const date = extractDateFromCsvFileName(file);

    // Process each CSV file for the specified stock
    const stockData = await processCSVFileForStock(csvFilePath, stockName);
    await insertStockDataIntoTable(stockData, date);
  }
}


function extractDateFromCsvFileName(fileName) {
  const regex = /EQ(\d{2})(\d{2})(\d{2})\.CSV/;
  const match = fileName.match(regex);

  if (match) {
    const day = match[1];
    const month = match[2];
    const year = `20${match[3]}`;
    
    console.log(`Matched: ${fileName} -> ${day}-${month}-${year}`);
    return `${year}-${month}-${day}`;
  } else {
    console.error('Error extracting date from CSV file name:', fileName);
    return null;
  }
}





module.exports = {
  processCSVFile,
  processEquityBhavcopy,
  downloadLast50DaysBhavcopy,
  fetchAndStoreStockData,
};
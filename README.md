### To see the live project, click [here](https://newbse.vercel.app/)

# BhavCopy Analyzer

## Overview

Welcome to BhavCopy Analyzer.This project aims to get the stock details by using BhavCopy provided by BSE India. It includes modules for handling CSV files, fetching stock data, and managing a SQLite database.

## Project details

1. **Database Initialization (database.js):**
   - Initializes an SQLite database with tables for storing stock information.

2. **Stock Data Processing (dataProcessing.js):**
   - Processes CSV files containing stock data and inserts it into the database.
   - Downloads and processes Bhavcopy files from the BSE website.

3. **API Routes (apiRoutes.js):**
   - Defines API routes for interacting with the stock data.
   - Supports retrieving top stocks, searching stocks by name, and managing favorite stocks.

4. **Server Setup (index.js):**
   - Sets up an Express server to handle API requests.
   - Enables CORS for cross-origin resource sharing.

## Behind The Scenes:
   ![DataFlow Diagram](/DataFLow.png)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   

2. Run the server:
    ```bash
    npm start

3. Access API endpoints:
    - Top 10 Stocks: GET /top10stocks
    - Search Stocks: GET /stocks/:name
    - Stock Price History: GET /stockpricehistory/:code
    - Add to Favorites: POST /addtofavorites
    - View Favorite Stocks: GET /favoritestocks
    - Remove from Favorites: DELETE /removefromfavorites/:code
    - Process Equity Bhavcopy: POST /processEquityBhavcopy
    - Last 50 days data of a stock: GET /historicalStockData
    - Fetching and storing stockdata: POST /fetchAndStoreStockData

5. Database Structure
    - The SQLite database consists of three tables: stocks, favorites, and stock_data. Each table serves a specific purpose in storing stock-related information.


### Feel free to contribute by opening issues or pull requests.

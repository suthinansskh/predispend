/**
 * Google Apps Script for Medical Error Reporting System
 * This is your actual working Google Apps Script code
 */

const SPREADSHEET_ID = "1UowKSMk6GLpof8GIJZWTn90JFpGcY3adqqBYBmMcIgo";
const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;

const SHEET_NAMES = {
  USERS: "User",
  MEDICINE: "Medicine",
  RECORDS: "Record",
  PLACE: "Place",
  PROCESS: "Process",
  CAUSE: "Cause"
};

const ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);

/**
 * Helper function for consistent JSON error responses.
 * @param {string} message - The error message.
 * @param {Error} [errorObj] - The actual error object for logging.
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function createErrorResponse(message, errorObj) {
  if (errorObj) {
    Logger.log(`Error: ${message}, Details: ${errorObj.message}, Stack: ${errorObj.stack}`);
  } else {
    Logger.log(`Error: ${message}`);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ status: "error", message: message }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles GET requests to the Apps Script web app.
 * Can serve an HTML file, fetch data from a Google Sheet, or add new records.
 * @param {GoogleAppsScript.Events.DoGet} e - The event object for a GET request.
 * @returns {GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput}
 */
function doGet(e) {
  // Validate parameters presence and type
  if (!e.parameter || typeof e.parameter !== 'object') {
    return createErrorResponse("Invalid or missing parameters in GET request.");
  }

  const action = e.parameter.action?.toLowerCase();

  // Serve the 'index.html' file if no action or 'index' action is specified
  if (!action || action === "index") {
    try {
      return HtmlService.createHtmlOutputFromFile('index');
    } catch (error) {
      return createErrorResponse(`Failed to load index page: ${error.message}`, error);
    }
  }

  // Process data retrieval or data addition actions
  try {
    let data;
    switch (action) {
      case 'getusers':
        data = getDataFromSheet(SHEET_NAMES.USERS);
        break;
      case 'getmedicines':
        data = getDataFromSheet(SHEET_NAMES.MEDICINE);
        break;
      case 'getrecords':
        data = getDataFromSheet(SHEET_NAMES.RECORDS);
        break;
      case 'getplaces':
        data = getDataFromSheet(SHEET_NAMES.PLACE);
        break;
      case 'getprocesses':
        data = getDataFromSheet(SHEET_NAMES.PROCESS);
        break;
      case 'getcauses':
        data = getDataFromSheet(SHEET_NAMES.CAUSE);
        break;      case 'addrecord': // Handle addrecord operation via GET request parameters
        // e.parameter contains all the data sent as query parameters
        addRecord(e.parameter); 
        return ContentService
            .createTextOutput(JSON.stringify({ status: "success", message: "Data saved successfully." }))
            .setMimeType(ContentService.MimeType.JSON);
      default:
        throw new Error("Invalid action specified for GET request.");
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", result: data }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Catch specific errors thrown by getDataFromSheet or invalid action
    return createErrorResponse(`An error occurred while processing action '${action}': ${error.message}`, error);
  }
}

/**
 * Retrieves all data from a specified Google Sheet.
 * The first row is treated as headers, and subsequent rows as data.
 * Dates are converted to ISO strings.
 * @param {string} sheetName - The name of the sheet to retrieve data from.
 * @returns {Array<Object>} An array of objects, where each object represents a row.
 * @throws {Error} If the specified sheet is not found.
 */
function getDataFromSheet(sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet with name "${sheetName}" not found.`);
  }

  const range = sheet.getDataRange();
  const values = range.getValues();

  // If there are no headers or no data rows, return an empty array
  if (values.length < 1) return [];

  const headers = values.shift().map(header => header.trim()); // Get headers from the first row

  // Map remaining rows to objects using headers
  return values.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      // Convert valid Date objects to ISO string format
      if (row[index] instanceof Date && !isNaN(row[index].getTime())) {
        obj[header] = row[index].toISOString();
      } else {
        // Treat empty strings as null for consistency
        obj[header] = row[index] === "" ? null : row[index];
      }
    });
    return obj;
  });
}

/**
 * Adds a new record to the "Record" sheet.
 * Generates a unique 'เลขที่รายงาน' (Report ID) and sets 'วันที่บันทึก' (Record Date).
 * @param {Object} recordData - The data for the new record (from e.parameter).
 * @param {string} recordData.วันที่เกิดเหตุการณ์ - The event date (required).
 * @throws {Error} If the "Record" sheet is not found, or required data is missing/invalid.
 */
function addRecord(recordData) {
  // Log the received data for debugging
  Logger.log('Received record data:', JSON.stringify(recordData));
  
  const sheet = ss.getSheetByName(SHEET_NAMES.RECORDS);
  if (!sheet) {
    throw new Error(`Sheet with name "${SHEET_NAMES.RECORDS}" not found.`);
  }

  // Validate and parse the event date
  if (!recordData.วันที่เกิดเหตุการณ์) {
    throw new Error("Missing required field: 'วันที่เกิดเหตุการณ์' (Event Date).");
  }
  const eventDate = new Date(recordData.วันที่เกิดเหตุการณ์);
  if (isNaN(eventDate.getTime())) { // Use .getTime() to check for valid date
    throw new Error("Invalid date format for 'วันที่เกิดเหตุการณ์' (Event Date). Please use a valid date string.");
  }

  const now = new Date();
  // Generate a unique report ID based on current timestamp
  const reportId = `R-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

  // Check if the generated ID already exists (simple check for small datasets)
  // For very large sheets, this might become inefficient.
  const existingIds = sheet.getDataRange().getValues().slice(1).map(row => row[0]);
  if (existingIds.includes(reportId)) {
    // In a real-world scenario, you might want to retry ID generation or add a counter.
    throw new Error("Generated report ID already exists. Please try again.");
  }

  // Get headers from the first row to ensure correct column order for appending
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  Logger.log('Sheet headers:', headers);

  // Map recordData to a new row array based on header order
  const newRow = headers.map(header => {
    switch(header) {
      case 'เลขที่รายงาน': return reportId;
      case 'วันที่บันทึก': return now;
      case 'วันที่เกิดเหตุการณ์': return eventDate;
      // Use recordData[header] which now directly contains the values from e.parameter
      default: return recordData[header] ?? null; 
    }
  });

  Logger.log('New row data:', newRow);
  sheet.appendRow(newRow); // Append the new row to the sheet
  Logger.log('Record successfully added to sheet');
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}


/**
 * Google Apps Script for Medical Error Reporting System
 * This is your actual working Google Apps Script code
 */

const SPREADSHEET_ID = "1hnluLUwyqtJMenP_xXarpsCbeRbEd46Kn-YOYUuMF-w";
const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;

const SHEET_NAMES = {
  USERS: "User",
  MEDICINE: "Medicine",
  RECORDS: "Record",
  PLACE: "Place",
  PROCESS: "Process",
  CAUSE: "Cause"
};

// Expected column structure for User sheet:
// ID13, Name, Position, Level, Password, PScode

// Expected column structure for Medicine sheet:
// Code, Name, HAD

// Expected column structure for Record sheet:
// เลขที่รายงาน, วันที่เกิดเหตุการณ์, เวร, สถานที่, ประเภทผู้ป่วย, กระบวนการ, ข้อผิดพลาด, รายการยาที่ถูกต้อง, รายการยาที่ผิด, HAD, สาเหตุ, รายละเอียด, วันที่บันทึก, ผู้บันทึก

// Expected column structure for Place sheet:
// Name

// Expected column structure for Process sheet:
// กระบวนการ, ข้อผิดพลาด

// Expected column structure for Cause sheet:
// สาเหตุ

const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

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
        break;
      case 'addrecord': // Handle addrecord operation via GET request parameters
        // e.parameter contains all the data sent as query parameters
        addRecord(e.parameter); 
        return ContentService
            .createTextOutput(JSON.stringify({ status: "success", message: "Data saved successfully." }))
            .setMimeType(ContentService.MimeType.JSON);
      case 'getlastrecord':
        const records = getDataFromSheet(SHEET_NAMES.RECORDS);
        data = records.length > 0 ? records[records.length - 1] : null;
        break;
      case 'getlastprocess':
        const processes = getDataFromSheet(SHEET_NAMES.PROCESS);
        data = processes.length > 0 ? processes[processes.length - 1] : null;
        break;
      case 'getlastcause':
        const causes = getDataFromSheet(SHEET_NAMES.CAUSE);
        data = causes.length > 0 ? causes[causes.length - 1] : null;
        break;
      case 'getlastuser':
        const users = getDataFromSheet(SHEET_NAMES.USERS);
        data = users.length > 0 ? users[users.length - 1] : null;
        break;
      case 'getlastmedicine':
        const medicines = getDataFromSheet(SHEET_NAMES.MEDICINE);
        data = medicines.length > 0 ? medicines[medicines.length - 1] : null;
        break;
      case 'getlastplace':
        const places = getDataFromSheet(SHEET_NAMES.PLACE);
        data = places.length > 0 ? places[places.length - 1] : null;
        break;
      case 'getprocessoptions':
        const processData = getDataFromSheet(SHEET_NAMES.PROCESS);
        data = processData.map(row => ({ 
          กระบวนการ: row['กระบวนการ'] || null,
          ข้อผิดพลาด: row['ข้อผิดพลาด'] || null
        }));
        break;
      case 'getprocessnames':
        const processNames = getDataFromSheet(SHEET_NAMES.PROCESS);
        data = processNames.map(row => row['กระบวนการ']).filter(name => name !== null && name !== '');
        break;
      case 'geterroroptions':
        const errorOptions = getDataFromSheet(SHEET_NAMES.PROCESS);
        data = errorOptions.map(row => row['ข้อผิดพลาด']).filter(error => error !== null && error !== '');
        break;
      default:
        throw new Error("Invalid action specified for GET request.");
    }

    let output = ContentService.createTextOutput(JSON.stringify({ status: "success", result: data }))
      .setMimeType(ContentService.MimeType.JSON);
    return output;

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
/**
 * Gets data from a specified sheet and returns it as an array of objects.
 * Expected sheet structures:
 * - User sheet: ID13, Name, Position, Level, Password, PScode
 * - Medicine sheet: Code, Name, HAD
 * - Record sheet: เลขที่รายงาน, วันที่เกิดเหตุการณ์, เวร, สถานที่, ประเภทผู้ป่วย, กระบวนการ, ข้อผิดพลาด, รายการยาที่ถูกต้อง, รายการยาที่ผิด, HAD, สาเหตุ, รายละเอียด, วันที่บันทึก, ผู้บันทึก
 * @param {string} sheetName - The name of the sheet to retrieve data from
 * @returns {Array} Array of objects representing the sheet data
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
  // Record sheet columns: เลขที่รายงาน, วันที่เกิดเหตุการณ์, เวร, สถานที่, ประเภทผู้ป่วย, กระบวนการ, ข้อผิดพลาด, รายการยาที่ถูกต้อง, รายการยาที่ผิด, HAD, สาเหตุ, รายละเอียด, วันที่บันทึก, ผู้บันทึก
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

  sheet.appendRow(newRow); // Append the new row to the sheet
}


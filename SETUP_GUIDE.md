# Google Sheets Integration Setup Guide

## Step 1: Prepare Your Google Sheets

Your Google Sheets should have the following structure with these exact sheet names:

### Required Sheets:

1. **User Sheet** - Contains user login information
   - Columns: ID13, Password, Name, Level, Email (optional)
   - Example:
   ```
   ID13          | Password | Name        | Level
   1234567890123 | admin123 | Admin User  | admin
   9876543210987 | user123  | Regular User| user
   ```

2. **Medicine Sheet** - Contains medicine information
   - Columns: ID, Name, Type, Strength (optional)
   - Example:
   ```
   ID    | Name              | Type      | Strength
   MED001| Paracetamol       | Tablet    | 500mg
   MED002| Aspirin           | Tablet    | 100mg
   ```

3. **Place Sheet** - Contains department/location information
   - Can be a simple single column list or structured data
   - Example:
   ```
   Place
   OPD
   IPD
   ICU
   ER
   Pharmacy
   ```

4. **Process Sheet** - Contains process types
   - Example:
   ```
   Process
   Prescribing
   Dispensing
   Administration
   Monitoring
   ```

5. **Cause Sheet** - Contains error cause types
   - Example:
   ```
   Cause
   Wrong Drug
   Wrong Dose
   Wrong Patient
   Wrong Time
   Wrong Route
   ```

6. **Record Sheet** - Contains error records
   - Columns: เลขที่รายงาน, วันที่บันทึก, วันที่เกิดเหตุการณ์, ผู้รายงาน, สถานที่, ประเภทข้อผิดพลาด, รายละเอียด, ยาที่เกี่ยวข้อง, ผู้ป่วย, ระดับความรุนแรง, การแก้ไข, สถานะ

## Step 2: Set Up Google Apps Script

1. Go to [https://script.google.com/](https://script.google.com/)
2. Click "New Project"
3. Replace the default code with the content from `GoogleAppsScript.js`
4. Update the `SPREADSHEET_ID` constant with your actual spreadsheet ID:
   ```javascript
   const SPREADSHEET_ID = '1hnluLUwyqtJMenP_xXarpsCbeRbEd46Kn-YOYUuMF-w';
   ```
5. Update the `SHEET_NAMES` object to match your actual sheet names:
   ```javascript
   const SHEET_NAMES = {
     USERS: "User",      // Your actual sheet name
     MEDICINE: "Medicine", // Your actual sheet name
     PLACE: "Place",      // Your actual sheet name
     PROCESS: "Process",  // Your actual sheet name
     CAUSE: "Cause",      // Your actual sheet name
     RECORDS: "Record"    // Your actual sheet name
   };
   ```

## Step 3: Deploy the Google Apps Script

1. Click "Deploy" → "New deployment"
2. Choose "Web app" as the type
3. Set the following options:
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
4. Click "Deploy"
5. Copy the web app URL (it should look like: `https://script.google.com/macros/s/AKfycbxxx.../exec`)

## Step 4: Update Your HTML Application

1. Open your `v2.html` file
2. Replace the `SCRIPT_URL` constant with your actual Google Apps Script URL:
   ```javascript
   const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID_HERE/exec";
   ```

## Step 5: Test the Integration

1. Open your `v2.html` file in a browser
2. Try logging in with credentials from your Users sheet
3. The application should now connect to your Google Sheets data

## Troubleshooting

### Common Issues:

1. **Sheet not found error**: Make sure the sheet names in your Google Sheets exactly match the `SHEET_NAMES` in the Apps Script

2. **Permission denied**: Make sure the Apps Script is deployed with "Execute as: Me" and "Who has access: Anyone"

3. **CORS errors**: The Apps Script includes CORS headers, but make sure you're accessing the correct deployment URL

4. **Data not loading**: Check the browser console for errors and verify your sheet structure matches the expected format

### Testing Your Setup:

You can test individual endpoints by visiting URLs like:
- `https://your-script-url/exec?action=getusers`
- `https://your-script-url/exec?action=getmedicines`

These should return JSON responses with your data.

## Security Notes

- The demo includes basic authentication, but for production use, consider implementing more robust security measures
- Consider using OAuth or other authentication methods for sensitive medical data
- Make sure your Google Sheets permissions are set appropriately for your organization's needs

## Data Format Notes

The system expects Thai language field names in some places. Make sure your Records sheet uses these column names:
- วันที่เกิดเหตุการณ์ (Date of incident)
- ผู้รายงาน (Reporter)
- สถานที่ (Location)
- ประเภทข้อผิดพลาด (Error type)
- รายละเอียด (Details)
- ยาที่เกี่ยวข้อง (Related medicine)
- ผู้ป่วย (Patient)
- ระดับความรุนแรง (Severity level)
- การแก้ไข (Correction)
- สถานะ (Status)

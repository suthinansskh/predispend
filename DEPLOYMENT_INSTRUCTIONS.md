# How to Deploy Your Google Apps Script and Get the URL

## 🚀 Step-by-Step Deployment Instructions:

### Step 1: Go to Google Apps Script
1. Open [https://script.google.com/](https://script.google.com/) in your browser
2. Make sure you're signed in with the same Google account that owns your spreadsheet

### Step 2: Create New Project
1. Click **"New Project"**
2. This will create a new untitled project with default code

### Step 3: Replace the Code
1. Delete all the default code in the editor
2. Copy ALL the code from your `GoogleAppsScript.js` file
3. Paste it into the Google Apps Script editor

### Step 4: Save the Project
1. Click the **Save** button (💾) or press `Ctrl+S`
2. Give your project a name like "Medical Error Reporting API"

### Step 5: Deploy as Web App
1. Click **"Deploy"** → **"New deployment"**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **"Web app"**
4. Fill in these settings:
   - **Description**: "Medical Error Reporting System API"
   - **Execute as**: **"Me"** (your email address)
   - **Who has access**: **"Anyone"**
5. Click **"Deploy"**

### Step 6: Authorize the Script
1. You'll see a dialog asking for permissions
2. Click **"Authorize access"**
3. Choose your Google account
4. You might see a warning "Google hasn't verified this app"
5. Click **"Advanced"** → **"Go to [Your Project Name] (unsafe)"**
6. Click **"Allow"**

### Step 7: Copy the Web App URL
1. After deployment, you'll see a dialog with your web app URL
2. It will look like: `https://script.google.com/macros/s/AKfycbxXXXXXXXXXX.../exec`
3. **COPY THIS URL** - this is your `SCRIPT_URL`!

### Step 8: Update Your HTML File
1. Open your `v2.html` file
2. Find this line:
   ```javascript
   const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec";
   ```
3. Replace `YOUR_SCRIPT_ID_HERE` with your actual script ID from the URL you copied
4. Save the file

## 🔧 Example:
If your web app URL is:
```
https://script.google.com/macros/s/AKfycbxABC123DEF456GHI789JKL/exec
```

Then update your HTML to:
```javascript
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxABC123DEF456GHI789JKL/exec";
```

## ✅ Test Your Setup:
1. After updating the URL, refresh your web page
2. Try logging in with demo credentials:
   - ID: `1234567890123`
   - Password: `admin123`
3. The app should now connect to your Google Sheets!

## 🚨 Troubleshooting:

### If you get "Script function not found" error:
- Make sure you copied ALL the code from GoogleAppsScript.js
- Make sure the function names match exactly

### If you get permission errors:
- Make sure "Execute as: Me" is selected
- Make sure "Who has access: Anyone" is selected
- Try redeploying the script

### If data doesn't load:
- Check that your sheet names match exactly: `User`, `Medicine`, `Record`, `Place`, `Process`, `Cause`
- Make sure your spreadsheet ID is correct in the Apps Script

## 📝 Quick Checklist:
- [ ] Created Google Apps Script project
- [ ] Pasted the complete code
- [ ] Deployed as web app with correct permissions
- [ ] Copied the deployment URL
- [ ] Updated SCRIPT_URL in v2.html
- [ ] Tested the connection

Once you complete these steps, your medical error reporting system should work perfectly with your Google Sheets!

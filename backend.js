// ==========================================
// 1. GET Request Handler (查詢之門)
// Used for fetching monthly transaction records
// ==========================================
function doGet(e) {
    // Check if required parameters are provided
    if (!e || !e.parameter || !e.parameter.year || !e.parameter.month) {
        let errorResponse = {
            status: "error",
            message: "Missing parameters: 'year' and 'month' are required."
        };
        return ContentService.createTextOutput(JSON.stringify(errorResponse))
            .setMimeType(ContentService.MimeType.JSON);
    }

    let targetYear = parseInt(e.parameter.year, 10);
    let targetMonth = parseInt(e.parameter.month, 10);

    // Connect to the specific Google Sheet
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Transactions");
    if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Sheet 'Transactions' not found." }))
            .setMimeType(ContentService.MimeType.JSON);
    }

    let data = sheet.getDataRange().getValues();
    let headers = data[0];
    let resultRecords = [];

    // Loop through rows to find matching year and month (Assuming Date is in Column B, index 1)
    for (let i = 1; i < data.length; i++) {
        let row = data[i];
        let recordDate = new Date(row[1]);

        if (recordDate.getFullYear() === targetYear && (recordDate.getMonth() + 1) === targetMonth) {
            let recordObject = {};
            for (let j = 0; j < headers.length; j++) {
                recordObject[headers[j]] = row[j];
            }
            resultRecords.push(recordObject);
        }
    }

    let successResponse = {
        status: "success",
        targetYear: targetYear,
        targetMonth: targetMonth,
        data: resultRecords
    };

    return ContentService.createTextOutput(JSON.stringify(successResponse))
        .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 2. POST Request Handler (異動總機)
// Routes the request based on the 'action' parameter
// ==========================================
function doPost(e) {
    let result = { status: "error", message: "Unknown error occurred." };

    try {
        // Parse the incoming JSON payload
        let payload = JSON.parse(e.postData.contents);
        let action = payload.action;

        let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Transactions");
        if (!sheet) {
            throw new Error("Sheet 'Transactions' not found.");
        }

        // Route to specific worker functions
        if (action === "post") {
            result = handlePost(sheet, payload.data);
        } else if (action === "put") {
            result = handlePut(sheet, payload.log_id, payload.updateData);
        } else if (action === "delete") {
            result = handleDelete(sheet, payload.log_id);
        } else {
            result.message = "Invalid action parameter. Use 'post', 'put', or 'delete'.";
        }
    } catch (error) {
        result.message = error.toString();
    }

    return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 3. Worker: Add New Records & Installments
// ==========================================
function handlePost(sheet, baseData) {
    let totalAmount = baseData.Amount;
    let periods = baseData.installment;
    let startDate = new Date(baseData.Date);

    // Calculate base amount per period and the remainder
    let baseInstallmentAmount = Math.floor(totalAmount / periods);
    let remainder = totalAmount % periods;

    // Generate a unique batch ID
    let batchId = "BATCH_" + new Date().getTime();

    for (let i = 0; i < periods; i++) {
        let currentAmount = baseInstallmentAmount;

        // Add remainder to the first installment
        if (i === 0) {
            currentAmount += remainder;
        }

        // Calculate future dates securely across months
        let currentDate = new Date(startDate.getTime());
        let targetMonth = currentDate.getMonth() + i;
        currentDate.setMonth(targetMonth);

        // Prevent date overflow (e.g., Jan 31 -> Feb 31 -> Mar 3)
        if (currentDate.getMonth() !== targetMonth % 12) {
            currentDate.setDate(0);
        }

        let recordId = batchId + "_" + (i + 1);
        let formattedDate = Utilities.formatDate(currentDate, "GMT+8", "yyyy-MM-dd");
        let itemName = periods > 1 ? baseData.Item + " (" + (i + 1) + "/" + periods + ")" : baseData.Item;

        // Append row: Log_ID, Date, Item, Category, Amount, note, Payer, Payment, installment
        sheet.appendRow([
            recordId,
            formattedDate,
            itemName,
            baseData.Category,
            currentAmount,
            baseData.note,
            baseData.Payer,
            baseData.Payment,
            periods
        ]);
    }

    return { status: "success", message: "Records added successfully", batch_id: batchId };
}

// ==========================================
// 4. Worker: Update a Specific Record
// ==========================================
function handlePut(sheet, logId, updateData) {
    let dataRange = sheet.getDataRange();
    let values = dataRange.getValues();
    let headers = values[0];

    // Find the exact Log_ID
    for (let i = 1; i < values.length; i++) {
        if (values[i][0] === logId) { // Log_ID must be in Column A (Index 0)
            let rowIndex = i + 1;

            // Update only the provided fields
            for (let key in updateData) {
                let columnIndex = headers.indexOf(key);
                if (columnIndex !== -1) {
                    sheet.getRange(rowIndex, columnIndex + 1).setValue(updateData[key]);
                }
            }
            return { status: "success", message: "Record updated successfully." };
        }
    }
    return { status: "error", message: "Log_ID not found." };
}

// ==========================================
// 5. Worker: Delete a Specific Record
// ==========================================
function handleDelete(sheet, logId) {
    let values = sheet.getDataRange().getValues();

    // Find and delete the matching row
    for (let i = 1; i < values.length; i++) {
        if (values[i][0] === logId) {
            let rowIndex = i + 1;
            sheet.deleteRow(rowIndex);
            return { status: "success", message: "Record deleted successfully." };
        }
    }
    return { status: "error", message: "Log_ID not found." };
}
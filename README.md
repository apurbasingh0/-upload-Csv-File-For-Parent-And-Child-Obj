"# -upload-Csv-File-For-Parent-And-Child-Obj" 
# 📊 Salesforce CSV Uploader for YTD Target & Achieved Data

This Salesforce Lightning Web Component (LWC) project enables users to **upload and import CSV files** to manage **YTD Target** and **YTD Achieved** records associated with custom `Target_Managment__c` objects. It handles both creation and upsertion of related records through Apex controllers.

---

## 🔧 Features

- Upload `.csv` files for both **YTD Target** and **YTD Achieved** data
- Dynamically creates `Target_Managment__c` records if they don’t exist (based on unique `Email`)
- Inserts associated `YTD_Target__c` and `YTD_Achieved__c` records
- Includes validation, versioning logic, and loading states
- Simple file size check (max 2MB)
- Customizable dropdown for selecting import type (Target or Achieved)
- Displays success/error messages with `ShowToastEvent`
- Automatically redirects users to the related list view after import

---

---

## 🛠️ Components Overview

### ⚙️ Apex Controller

#### `UploadTargetManagementCSVFileController.cls`

- **`inserttargetRecordsRecords(String targetLst)`**
  - Deserializes JSON data
  - Creates `Target_Managment__c` records (if new)
  - Inserts related `YTD_Target__c` records

- **`insertAchievedRecsFunction(String targetLst)`**
  - Links uploaded records to existing `Target_Managment__c` based on Email
  - Inserts related `YTD_Achieved__c` records

- **`OptionsWrapper` inner class**
  - Wrapper to deserialize JSON from LWC into Apex-typed data

### ⚡ Lightning Web Component

#### `uploadTargetManagementCSVFile`

- UI for file upload with a dropdown (Target / Achieved)
- Reads and parses `.csv` content
- Converts to JSON and calls appropriate Apex method
- Shows spinner and toast notifications
- Navigates back to `Target_Managment__c` list view on completion

---

## 📋 CSV Format

Your CSV must include headers matching the following structure:

| Name | AssignedUser | Email | EmployeeCode | FinalcialYear | Q1 | Q2 | Q3 | Q4 | TargetType | AchievedType |
|------|--------------|-------|--------------|----------------|----|----|----|----|------------|---------------|

- Use **`TargetType`** for YTD Target uploads
- Use **`AchievedType`** for YTD Achieved uploads


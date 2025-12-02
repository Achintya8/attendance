# Sample Data for Testing

This folder contains sample CSV files that you can use to test the Admin Upload feature.

## Files

1. **students.csv** - 7 additional students (S104-S110) in CSE and ECE departments
2. **teachers.csv** - 3 additional teachers (Jane Smith, Robert Brown, Sarah Johnson)
3. **timetable.csv** - Sample weekly timetable for CS101 and CS102

## How to Use

### Option 1: Open in Excel and Save as .xlsx
1. Open any CSV file in Microsoft Excel
2. Click File → Save As
3. Choose format: **Excel Workbook (*.xlsx)**
4. Upload the .xlsx file through the Admin Dashboard

### Option 2: Use CSV directly (if supported)
Some systems may accept CSV files directly. Try uploading the .csv file first.

## Upload via Admin Dashboard

1. Login with username `admin`, Role: ADMIN
2. Navigate to Admin Dashboard
3. Click "Upload Students", "Upload Teachers", or "Upload Timetable"
4. Select the corresponding .xlsx file
5. Click Upload

## Data Format

### Students Format
- rollNum, name, email, department, semester, section

### Teachers Format
- name, email, department

### Timetable Format
- day (MONDAY/TUESDAY/etc), period (1,2,3...), courseCode, teacherEmail, section

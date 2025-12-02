# 📤 Data Upload Guide

## What Files Can You Upload?

Your attendance system supports uploading **3 types of data files**:

1. **Students** - Add student records to the system
2. **Teachers** - Add teacher/faculty records
3. **Timetable** - Define class schedules for the semester

---

## 📋 File Formats Required

### 1. Students File (`students.xlsx`)

**Required Columns** (in exact order):
| Column | Description | Example |
|--------|-------------|---------|
| `rollNum` | Student roll number (unique) | S101 |
| `name` | Full name | John Doe |
| `email` | Email address | john@college.edu |
| `department` | Department code | CSE |
| `semester` | Current semester (number) | 3 |
| `section` | Section (A, B, C, etc.) | A |
| `admissionYear` | Year of admission | 2023 |
| `currentBatch` | Batch period | 2023-2027 |

**Sample Data:**
```
rollNum,name,email,department,semester,section,admissionYear,currentBatch
S104,David Wilson,david@college.edu,CSE,3,A,2023,2023-2027
S105,Emma Davis,emma@college.edu,CSE,3,A,2023,2023-2027
S106,Frank Miller,frank@college.edu,CSE,3,B,2023,2023-2027
```

---

### 2. Teachers File (`teachers.xlsx`)

**Required Columns:**
| Column | Description | Example |
|--------|-------------|---------|
| `name` | Full name | Dr. Jane Smith |
| `email` | Email address (unique) | jane@college.edu |
| `department` | Department code | CSE |

**Sample Data:**
```
name,email,department
Jane Smith,jane@college.edu,CSE
Robert Brown,robert@college.edu,ECE
Sarah Johnson,sarah@college.edu,CSE
```

---

### 3. Timetable File (`timetable.xlsx`)

**Required Columns:**
| Column | Description | Example |
|--------|-------------|---------|
| `day` | Day of week (UPPERCASE) | MONDAY |
| `period` | Period number (1-6) | 1 |
| `courseCode` | Course code | CS101 |
| `teacherEmail` | Teacher's email (must exist) | teacher@college.edu |
| `section` | Section (A, B, C, etc.) | A |

**Valid Days:** MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY
**Valid Periods:** 1-6 (as per configured time slots)

**Sample Data:**
```
day,period,courseCode,teacherEmail,section
MONDAY,1,CS101,teacher@college.edu,A
MONDAY,2,CS102,teacher@college.edu,A
TUESDAY,1,CS102,teacher@college.edu,A
```

---

## 🎯 How to Upload

### Step 1: Prepare Your File
1. Use the sample files in `sample_data/` folder as templates
2. Open the `.csv` file in **Microsoft Excel**
3. Fill in your data (or modify existing samples)
4. Click **File → Save As**
5. Choose format: **Excel Workbook (*.xlsx)**
6. Save the file

### Step 2: Login as Admin
1. Go to http://localhost:5173
2. Login with:
   - Username: `admin`
   - Password: `admin`

### Step 3: Upload
1. Click on the upload type (Students / Teachers / Timetable)
2. Click **Choose File** and select your `.xlsx` file
3. Click **Upload**
4. Wait for success message

---

## ✅ Sample Files Location

Ready-to-use sample files are available at:
```
attendance_app/sample_data/
├── students.csv    (Convert to .xlsx)
├── teachers.csv    (Convert to .xlsx)
├── timetable.csv   (Convert to .xlsx)
└── README.md
```

---

## 🚨 Common Errors & Solutions

### ❌ "Invalid file format"
- **Solution:** Make sure you saved as `.xlsx`, not `.csv` or `.xls`

### ❌ "Teacher not found"
- **Solution:** Upload teachers file BEFORE timetable
- Or ensure teacher email in timetable matches uploaded teachers

### ❌ "Duplicate roll number"
- **Solution:** Each student roll number must be unique

### ❌ "Invalid day"
- **Solution:** Day must be UPPERCASE (MONDAY, not Monday)

---

## 📝 Tips

✅ Upload order matters: **Teachers → Students → Timetable**
✅ Always use Excel format (`.xlsx`) not CSV
✅ Keep column headers exactly as specified
✅ Email addresses must be unique for teachers and students
✅ Period numbers: 1-6 only
✅ Sections are case-sensitive (use A, B, C... not a, b, c)

---

## 🎓 Quick Start Example

1. Download the 3 sample files from `sample_data/`
2. Open each in Excel
3. Save each as `.xlsx` format
4. Upload in this order:
   - `teachers.xlsx`
   - `students.xlsx`
   - `timetable.xlsx`
5. ✨ Done! Your data is now in the system

---

Need help? Check the application logs or contact support.

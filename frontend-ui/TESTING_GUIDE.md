# Complete CRUD Operations Testing Guide

## Quick Start Test

### Step 1: Admin Login
1. Go to login.html
2. Click on "Admin" tab
3. Use credentials:
   - Email: `admin@campusnexus.com`
   - Password: `admin123`
4. Click "Login" - should redirect to admin.html

### Step 2: Create Department (CREATE)
1. In admin.html, click "Departments" tab
2. Click "+ Create Department" button
3. Fill form:
   - Department Name: `Computer Science & Engineering`
   - Department Code: `CSE`
   - Description: `Department of Computer Science and Engineering`
4. Click "Create Department"
5. **Expected**: 
   - Toast success message
   - Department appears in Departments table
   - CSE appears in HOD form datalist

### Step 3: Assign HOD (CREATE)
1. Click "HODs" tab
2. Click "+ Assign HOD" button
3. Fill form:
   - Department: Type `CSE` (should show in datalist)
   - HOD Name: `Dr. Rajesh Verma`
   - HOD Email: `rajesh.verma@college.edu`
4. Click "Assign HOD"
5. **Expected**:
   - Toast success message
   - HOD appears in HODs table
   - Department table shows HOD name
   - Dropdown still shows CSE for future selections

### Step 4: Test Department Dropdown (READ)
1. Click "+ Assign HOD" button again
2. Click on the Department input field
3. **Expected**: Datalist shows `CSE` as an option
4. Type `ECE` to create new department on the fly
5. **Expected**: You can type and create new departments dynamically

### Step 5: Verify Data Persistence (READ)
1. Refresh the page (F5)
2. **Expected**:
   - Departments table still shows CSE department
   - HODs table still shows assigned HOD
   - Datalist still works

### Step 6: Create Additional Department (CREATE)
1. Click "+ Create Department" button
2. Fill form:
   - Department Name: `Electronics & Communication`
   - Department Code: `ECE`
   - Description: `Department of Electronics & Communication Engineering`
3. Click "Create Department"
4. **Expected**:
   - ECE appears in Departments table
   - ECE appears in HOD form datalist (now you have CSE and ECE options)

### Step 7: Delete Department (DELETE)
1. Find a department row in the Departments table
2. Click "Delete" button
3. Confirm deletion
4. **Expected**:
   - Toast success message
   - Department removed from table
   - Department removed from datalist
   - If HOD was assigned, HODs table updates

### Step 8: Test HOD Login with Teacher Creation

#### A. Create HOD Account (Admin)
1. In admin.html, create HOD for CSE department (if not already done):
   - Department: `CSE`
   - HOD Name: `Dr. Rajesh Verma`
   - HOD Email: `rajesh.verma@college.edu`

#### B. HOD Login
1. Go to login.html
2. Click "HOD" tab
3. Fill credentials:
   - Email: `rajesh.verma@college.edu`
   - Password: `hod123` (from mock database in login.html)
4. Click "Login"
5. **Expected**: Redirects to hod.html with HOD dashboard

#### C. Create Teacher Account (HOD)
1. In hod.html, click "Teachers" tab (should already be selected)
2. Click "+ Create Teacher Account" button
3. Modal opens with:
   - Teacher Name field (empty)
   - Email field (empty)
   - Password field (empty)
   - Department field (pre-filled with "Computer Science & Engineering" or CSE)
4. Fill form:
   - Teacher Name: `Prof. Suresh Kumar`
   - Email: `suresh.kumar@college.edu`
   - Password: `teacher123`
5. Click "Create Account"
6. **Expected**:
   - Toast success message
   - Teacher appears in Department Teachers table
   - Modal closes
   - Table shows teacher with status badge

### Step 9: Teacher List Verification (READ)
1. Look at the "Department Teachers" table
2. **Expected**: Shows all created teachers for that department
3. Columns should show:
   - Name
   - Email
   - Status (green badge "active")
   - Actions (Updates and Remove buttons)

### Step 10: Remove Teacher (DELETE)
1. Find teacher in Department Teachers table
2. Click "Remove" button
3. Confirm deletion
4. **Expected**:
   - Toast success message
   - Teacher removed from table
   - localStorage data updated

### Step 11: Data Persistence Test (READ after refresh)
1. Refresh hod.html page (F5)
2. Navigate to Teachers tab
3. **Expected**: All created teachers still appear in the table

### Step 12: Multiple Teachers (CREATE multiple)
1. Click "+ Create Teacher Account" multiple times
2. Create 3-4 different teachers
3. **Expected**:
   - All appear in the table
   - Department pre-fills automatically each time
   - Each has unique email

### Step 13: Edit Functions (FUTURE)
1. Click "Edit" button next to a teacher, department, or HOD
2. **Current Status**: Shows toast message "Editing..." (stub implementation)
3. **Future**: Will open edit modal

## Expected Behavior Summary

| Operation | Location | Expected Result |
|-----------|----------|-----------------|
| Create Department | Admin > Departments | Appears in table & datalist |
| Read Departments | Admin > Departments | Table shows all departments |
| Delete Department | Admin > Departments | Removed from table & datalist |
| Create HOD | Admin > HODs | Appears in table & updates department |
| Read HODs | Admin > HODs | Table shows all HOD assignments |
| Remove HOD | Admin > HODs | HOD unassigned but department remains |
| Create Teacher | HOD > Teachers | Appears in table |
| Read Teachers | HOD > Teachers | Table shows all teachers for department |
| Remove Teacher | HOD > Teachers | Removed from table |
| Department Datalist | Admin > HODs form | Shows all created departments |
| Manual Department | Admin > HODs form | Can type new department code |

## Data Location in Browser Storage

### localStorage keys to check:
- **departments**: Array of all departments created
- **teachers_CSE**: Array of teachers in CSE department (key changes based on department code)
- **teachers_ECE**: Array of teachers in ECE department (if created)
- **Session_SessionManager**: Current user session data

### How to check:
1. Open browser Developer Tools (F12)
2. Go to "Application" tab (or "Storage" in Firefox)
3. Click "Local Storage"
4. Click your domain/page
5. Look for keys starting with "departments" or "teachers_"

## Troubleshooting

### Teacher not appearing after creation:
- Check console (F12 > Console) for JavaScript errors
- Verify form has `name` attributes on inputs
- Check localStorage to see if teacher was saved
- Verify `renderTeachers()` function is being called

### Department not appearing in datalist:
- Refresh page after creating department
- Check that `updateDepartmentDropdown()` was called
- Verify department data in localStorage under "departments" key

### Modal won't close after creating teacher:
- Check that `closeTeacherModal()` is being called
- Verify modal HTML structure hasn't changed

### Data disappears on refresh:
- Check browser storage isn't in incognito/private mode
- Verify localStorage permissions aren't blocked
- Check that `StorageHelper.set()` is being called correctly

## Success Criteria

All CRUD operations are working correctly when:
- ✅ Departments can be created, displayed, and deleted
- ✅ HODs can be assigned to departments and removed
- ✅ Teachers can be created in HOD dashboard
- ✅ All data appears in correct tables
- ✅ Data persists after page refresh
- ✅ Datalist shows dynamically populated departments
- ✅ Forms reset after successful submission
- ✅ Toast notifications appear for all operations
- ✅ Delete operations ask for confirmation
- ✅ All modals open and close properly

# 🧪 Profile System - Testing Guide

## Quick Start Test (5 minutes)

### Test 1: Student Profile Photo Upload

**Steps:**
1. Open `login.html`
2. Create student account OR Login with existing account
3. Go to `profile.html` (student dashboard)
4. Click **"📋 Detailed Profile"** button
5. Click **"Upload Photo"** button
6. Select a JPG or PNG image (< 5MB)
7. Verify circular profile picture displays
8. Refresh page
9. ✅ Verify image still there

**Expected Result**: Profile picture displays, persists after refresh

---

### Test 2: Student Profile Data

**Steps:**
1. In `student-profile.html`, click **"About"** tab
2. Enter name: "Test Student"
3. Enter phone: "+91 9876543210"
4. Enter hometown: "Delhi"
5. Enter bio: "I am a test student"
6. Click **"Save Changes"**
7. ✅ Verify green "Profile information updated!" toast
8. Refresh page
9. ✅ Verify all fields still contain your data

**Expected Result**: Data saves and persists

---

### Test 3: Teacher Profile Upload

**Steps:**
1. Open `login.html`
2. Create teacher account with email/password
3. Go to `teacher.html` dashboard
4. Click **"👤 Profile"** button in navbar
5. Click **"Upload Photo"**
6. Select PNG image
7. ✅ Verify circular picture displays
8. Click **"Qualifications"** tab
9. Select "PhD" degree
10. Enter university: "IIT Delhi"
11. Click **"Save Qualifications"**
12. ✅ Verify success toast
13. Refresh page
14. ✅ Verify photo and qualifications persisted

**Expected Result**: Teacher profile works with image and data persistence

---

### Test 4: HOD Profile Full Test

**Steps:**
1. Open `login.html`
2. Create/Login HOD account
3. Go to `hod.html` dashboard
4. Click **"👤 My Profile"** button
5. Upload profile photo
6. Fill "About" tab (name, office location, years as HOD)
7. Click **"Save Changes"** → verify toast
8. Go to **"Qualifications"** tab
9. Fill education details
10. Click **"Save Qualifications"** → verify toast
11. Go to **"Experience"** tab
12. Fill career details
13. Click **"Save Experience"** → verify toast
14. Go to **"Achievements"** tab
15. Fill awards, research, department achievements
16. Click **"Save Achievements"** → verify toast
17. Refresh page
18. ✅ Verify all 4 tabs retain data
19. ✅ Verify profile photo still displays

**Expected Result**: HOD profile fully functional with all tabs saving

---

## Advanced Testing

### Test 5: Image Validation

**Steps:**

**Try invalid file size:**
1. In any profile page, click "Upload Photo"
2. Try to upload file > 5MB
3. ✅ Verify error toast: "Image size must be less than 5MB"

**Try invalid file type:**
1. Click "Upload Photo"
2. Try to upload .pdf or .txt file
3. ✅ Verify error toast: "Please upload a valid image file"

**Try valid formats:**
1. Upload .jpg → ✅ Should work
2. Upload .png → ✅ Should work

**Expected Result**: Proper validation with clear error messages

---

### Test 6: Form Reset Functionality

**Steps:**
1. Go to any profile page
2. Change some form values
3. Click **"Cancel"** button
4. ✅ Verify form reverts to last saved values
5. If nothing was saved, verify form clears

**Expected Result**: Cancel button properly resets form

---

### Test 7: Tab Navigation

**Steps - Student Profile:**
1. Click "About" tab → ✅ Content shows
2. Enter some data
3. Click "Academic" tab → ✅ Different content shows
4. Click "Interests" tab → ✅ Different content shows
5. Click "About" again → ✅ Your earlier data still there

**Expected Result**: Smooth tab switching without data loss

---

### Test 8: Session Validation

**Steps:**
1. Open `student-profile.html` directly in URL bar
2. If not logged in → ✅ Redirects to `login.html`
3. Login as student
4. Click "Detailed Profile"
5. ✅ Student profile opens
6. Logout
7. Open `hod-profile.html`
8. If logged out → ✅ Redirects to login
9. Login as teacher (not HOD)
10. Try to open `hod-profile.html`
11. ✅ Redirects to login (wrong role)

**Expected Result**: Proper role-based access control

---

### Test 9: Navigation Between Pages

**Steps:**

**From Student Profile:**
1. Click **"← Dashboard"** button
2. ✅ Goes back to `profile.html`
3. Click **"📋 Detailed Profile"**
4. ✅ Returns to `student-profile.html`

**From Teacher Profile:**
1. Click **"← Dashboard"** button
2. ✅ Goes to `teacher.html`
3. Click **"👤 Profile"** button
4. ✅ Returns to `teacher-profile.html`

**From HOD Profile:**
1. Click **"← Dashboard"** button
2. ✅ Goes to `hod.html`
3. Click **"👤 My Profile"** button
4. ✅ Returns to `hod-profile.html`

**Expected Result**: Smooth navigation between profile and dashboard

---

### Test 10: Logout Functionality

**Steps - Any Profile:**
1. In profile page, click **"Logout"** button (red)
2. Confirm in dialog
3. ✅ Redirects to `login.html`
4. Session cleared

**Expected Result**: Proper logout behavior

---

### Test 11: Multiple User Profiles

**Steps:**
1. Login as Student A
2. Go to `student-profile.html`
3. Upload photo for Student A
4. Fill "John Doe" as name
5. Save and note localStorage key
6. Logout
7. Login as Student B (different account)
8. Go to `student-profile.html`
9. Upload different photo
10. Fill "Jane Smith" as name
11. Save
12. ✅ Verify Student B has different photo
13. Logout
14. Login as Student A again
15. Go to `student-profile.html`
16. ✅ Verify Student A's original photo and name there
17. ✅ Verify localStorage has separate keys for each user

**Expected Result**: Each user has isolated profile data

---

## Responsive Design Testing

### Test 12: Mobile Responsiveness

**Desktop (1920px):**
1. Open profile page
2. ✅ Two-column layout
3. Profile picture on left, info on right
4. ✅ Form in grid (2 columns)

**Tablet (768px):**
1. Resize to 768px
2. ✅ Layout adjusts
3. ✅ Profile header stacks
4. ✅ Forms in single column

**Mobile (375px):**
1. Resize to 375px
2. ✅ Profile header fully stacked (vertical)
3. ✅ All forms single column
4. ✅ Buttons full width
5. ✅ Text readable
6. ✅ Touch targets > 44px

**Expected Result**: Proper responsive design at all breakpoints

---

## Data Persistence Testing

### Test 13: Cross-Session Persistence

**Steps:**
1. Login and go to profile page
2. Upload photo
3. Fill all form fields
4. Save
5. Close browser tab
6. Reopen site
7. Login again
8. ✅ Go to profile - photo still there
9. ✅ All data still there

**Expected Result**: Data persists across sessions

---

### Test 14: localStorage Inspection

**Steps:**
1. Login to profile page
2. Open browser DevTools (F12)
3. Go to "Application" → "Storage" → "localStorage"
4. Look for keys like:
   - `profile_student_[id]`
   - `profile_teacher_[id]`
   - `profile_hod_[id]`
5. ✅ Verify contains profile data
6. ✅ Verify `profilePhoto` contains `data:image/...`
7. ✅ Verify other fields present

**Expected Result**: Proper localStorage structure and content

---

## User Experience Testing

### Test 15: Toast Notifications

**Steps:**
1. Fill form and click Save
2. ✅ Green success toast appears
3. Toast auto-dismisses after 3 seconds
4. Try uploading invalid file
5. ✅ Red error toast appears
6. Toast auto-dismisses
7. Click outside modal without filling required field
8. ✅ Validation error toast appears

**Expected Result**: Clear, timely feedback for all actions

---

### Test 16: Form Validation

**Steps - Student Profile:**
1. Leave "Full Name" empty
2. Try to save
3. ✅ Verify nothing saves (required field)
4. Note: In current version, other fields optional
5. Fill "Full Name"
6. Save
7. ✅ Now saves successfully

**Expected Result**: Required fields enforced, optional fields allowed

---

## Performance Testing

### Test 17: Image Loading Performance

**Steps:**
1. Upload 5MB image
2. Measure page load time
3. Refresh multiple times
4. ✅ Should be fast (image cached in localStorage)
5. Upload 2MB image
6. ✅ Noticeably faster
7. Upload 500KB image
8. ✅ Very fast

**Expected Result**: Smaller images load faster

---

## Accessibility Testing

### Test 18: Keyboard Navigation

**Steps:**
1. Open profile page
2. Press Tab multiple times
3. ✅ Can navigate between all form fields
4. ✅ Can focus buttons
5. ✅ Can focus tabs
6. Press Enter on button
7. ✅ Button activates

**Expected Result**: Full keyboard navigation support

---

## Error Handling Testing

### Test 19: Error Scenarios

**Steps:**

**localStorage Full:**
1. Fill very large data
2. Try to save
3. Monitor console for errors
4. ✅ Should handle gracefully

**Session Expired:**
1. Login to profile
2. Clear localStorage manually
3. Try to interact with page
4. ✅ Should redirect to login

**Missing Required Data:**
1. Clear localStorage
2. Open profile directly
3. ✅ Should redirect or show empty form

**Expected Result**: Graceful error handling

---

## Checklist Summary

- [ ] Image upload works (JPG, PNG)
- [ ] Image persists after refresh
- [ ] Invalid files rejected
- [ ] Form data saves
- [ ] Form data persists
- [ ] Tab navigation works
- [ ] Navigation between pages works
- [ ] Logout works
- [ ] Session validation works
- [ ] Role-based access works
- [ ] Mobile responsive
- [ ] Toast notifications appear
- [ ] Form validation works
- [ ] Multiple users have separate data
- [ ] keyboard navigation works

---

## Test Accounts

### Student
```
Email: student@college.edu
Password: student123
```

### Teacher
```
Email: teacher@college.edu
Password: teacher123
```

### HOD
```
Email: hod@college.edu
Password: hod123
```

### Admin
```
Email: admin@college.edu
Password: admin123
```

---

## Troubleshooting Guide

### Profile Picture Not Displaying

**Check:**
1. File format is JPG or PNG ✓
2. File size < 5MB ✓
3. Browser supports localStorage ✓
4. Check browser console for errors

**Fix:**
1. Clear browser cache
2. Try smaller image
3. Try different browser

### Data Not Saving

**Check:**
1. Clicked "Save Changes" button ✓
2. Success toast appeared ✓
3. No error toast ✓
4. localStorage not full ✓

**Fix:**
1. Refresh and try again
2. Check browser console
3. Enable localStorage
4. Try in private/incognito mode

### Redirected to Login

**Check:**
1. Correct role for page ✓
2. Still logged in ✓
3. Session not expired ✓

**Fix:**
1. Login again
2. Close tab and reopen
3. Check localStorage

---

**Test Date**: ___________  
**Tested By**: ___________  
**Status**: ✅ All tests passed / ⚠️ Issues found  
**Notes**: 

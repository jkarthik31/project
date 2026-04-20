# Dynamic Data System - Implementation Guide

## Overview
The dashboard now displays real-time data based on user actions across the platform. All values update automatically as students interact with the system.

---

## How It Works

### 1. **UserDataManager** (New Module)
A JavaScript module in `js/main.js` that manages all user-specific data using localStorage.

**Key Methods:**
- `UserDataManager.getUserData(email)` - Get all data for a user
- `UserDataManager.addApplication(email, jobTitle, company, position, status)` - Track job applications
- `UserDataManager.updateProfileItem(email, itemIndex, progress, complete)` - Update profile completion
- `UserDataManager.getApplications(email)` - Get all applications
- `UserDataManager.getProfileCompletion(email)` - Get profile completion percentage
- `UserDataManager.getProfileItems(email)` - Get profile items with completion status

**Data Structure:**
```javascript
userData = {
    'student@college.edu': {
        email: 'student@college.edu',
        applications: [
            {
                company: 'TCS',
                position: 'Software Engineer',
                status: 'applied', // or 'shortlisted', 'selected', 'rejected'
                appliedDate: '2026-01-20',
                statusIcon: '💼'
            }
        ],
        profileCompletion: 40,
        profileItems: [
            { label: 'Personal Information', progress: '100%', complete: true },
            { label: 'Education Details', progress: '50%', complete: false },
            // ... more items
        ]
    }
}
```

---

## Real-Time Data Flow

### Dashboard Values Update Based On:

#### 1. **Jobs Applied Count**
- **Source:** UserDataManager.applications array
- **Updates When:** Student clicks "Apply Now" in jobs.html
- **Display:** dashboard.html widget

#### 2. **Shortlisted Count**
- **Source:** Count of applications with `status: 'shortlisted'`
- **Updates When:** Admin changes status (simulated) or from user actions
- **Display:** dashboard.html widget

#### 3. **Offers Received**
- **Source:** Count of applications with `status: 'selected'`
- **Updates When:** Admin marks application as selected
- **Display:** dashboard.html widget

#### 4. **Upcoming Interviews**
- **Source:** Equals shortlisted count (interviews scheduled after shortlisting)
- **Updates When:** Student gets shortlisted
- **Display:** dashboard.html widget

#### 5. **Profile Completion Percentage**
- **Source:** Calculated from profileItems completion status
- **Updates When:** User updates profile.html
- **Display:** dashboard.html progress bar
- **Formula:** (completed items / total items) × 100

#### 6. **Recent Applications List**
- **Source:** UserDataManager.applications array
- **Updates When:** Student applies for jobs
- **Display:** dashboard.html applications section

---

## Integration Points

### jobs.html - Apply Job Button
```javascript
function applyJob(jobTitle) {
    const currentUser = SessionManager.getCurrentUser();
    const parts = jobTitle.split(' at ');
    const position = parts[0];
    const company = parts[1];
    
    const added = UserDataManager.addApplication(
        currentUser.email, 
        jobTitle, 
        company, 
        position, 
        'applied'
    );
    
    if (added) {
        Toast.success('Application tracked in dashboard!');
    }
}
```

**Flow:**
1. User clicks "Apply Now" on a job card
2. Application is saved to localStorage via UserDataManager
3. Dashboard automatically reflects the new count when visited
4. If user goes back to dashboard, the new application appears

### profile.html - Profile Updates
Profile updates automatically track completion:
```javascript
// When user submits academic form
UserDataManager.updateProfileItem(
    currentUser.email, 
    1,              // item index
    '100%',         // progress
    true            // complete
);

// Profile completion % recalculates automatically
// Dashboard shows updated progress when refreshed
```

### dashboard.html - Real-Time Display
Dashboard reads from UserDataManager on load:
```javascript
const applications = UserDataManager.getApplications(currentUser.email);
const profileCompletion = UserDataManager.getProfileCompletion(currentUser.email);
const profileItems = UserDataManager.getProfileItems(currentUser.email);

// All widgets update based on this data
document.getElementById('jobs-applied').textContent = applications.length;
document.getElementById('shortlisted-count').textContent = 
    applications.filter(app => app.status === 'shortlisted').length;
// ... etc
```

---

## Testing the System

### Test Case 1: Apply for a Job
1. Login as `student@college.edu` / `password`
2. Go to **Jobs** page
3. Click "Apply Now" on any job card
4. See success toast: "Application tracked in dashboard!"
5. Go to **Dashboard**
6. Verify **Jobs Applied** count increased by 1
7. Check **Recent Applications** section to see the new job

### Test Case 2: Profile Completion
1. Login as `student@college.edu`
2. Go to **Profile** page
3. Update "Personal Information" section and submit
4. Fill in "Education Details" and submit
5. Add skills and submit
6. Go to **Dashboard**
7. Verify **Complete Your Profile** progress bar increased
8. Check profile items show updated completion status

### Test Case 3: Multiple Applications
1. Apply for 3 different jobs from jobs.html
2. Go to dashboard
3. Verify:
   - Jobs Applied = 3
   - Recent Applications shows all 3 with correct companies/positions
   - Applied dates match today's date

### Test Case 4: Multiple Users
1. Logout and login as `teacher@college.edu`
2. They should see their own separate data (0 applications, 20% profile completion)
3. Go to jobs.html and apply
4. Go to dashboard - see 1 application
5. Logout and login as `student@college.edu`
6. Dashboard should show their original applications
7. Teacher's applications don't appear

---

## Data Persistence

All data is stored in **localStorage** under the key `userData`:
- **Location:** Browser's local storage (F12 → Application → Local Storage)
- **Persistence:** Data remains even after page refresh or closing browser
- **Scope:** Per email address (different users have different data)
- **Clearing:** Data persists until user clears browser data or we call `StorageHelper.clear()`

### View Stored Data (Browser Console)
```javascript
// View all user data
console.log(JSON.parse(localStorage.getItem('userData')));

// View specific user data
const userData = JSON.parse(localStorage.getItem('userData'));
console.log(userData['student@college.edu']);

// Clear all data
localStorage.removeItem('userData');
```

---

## Status Values

Applications can have these statuses:
- **applied** (💼) - Initial application submitted
- **shortlisted** (⭐) - Candidate selected for interview
- **selected** (✅) - Offer received
- **rejected** (❌) - Application rejected

The dashboard automatically:
- Counts each status
- Displays appropriate icon
- Updates all related widgets
- Shows applications in the correct card styling

---

## Future Enhancements

1. **Backend Integration**
   - Replace localStorage with API calls
   - Track applications on server
   - Enable data sync across devices

2. **Status Updates**
   - Admin panel to change application status
   - Email notifications when status changes
   - Interview schedule tracking

3. **Advanced Analytics**
   - Application success rate
   - Time to shortlist metrics
   - Skill-based job recommendations

4. **Data Export**
   - Export application history as PDF/CSV
   - Download profile completion report
   - Share portfolio with companies

---

## Troubleshooting

### Dashboard Shows 0 for All Values
**Solution:** User hasn't performed any actions yet. This is normal for new users. The initial state shows 20% profile completion and empty applications list.

### Application Not Appearing After Clicking Apply
**Solution:** 
- Clear browser cache and refresh
- Check browser console for errors
- Verify localStorage is enabled

### Different Values When Switching Users
**Solution:** This is correct behavior. Each user's data is stored separately by email. Make sure you're logged in as the correct user.

### Profile Completion Not Updating
**Solution:** 
- Ensure the form submission handler is triggered
- Check browser console for JavaScript errors
- Verify UserDataManager methods are being called

---

## API Reference

### UserDataManager Methods

#### `getUserData(email)`
Returns user data object with applications, profile items, and completion percentage.

#### `addApplication(email, jobTitle, company, position, status)`
Adds a new application. Returns `true` if added, `false` if already applied.

#### `getCountByStatus(email, status)`
Returns count of applications with specific status (applied, shortlisted, selected, rejected).

#### `getApplications(email)`
Returns array of all applications for the user.

#### `getProfileCompletion(email)`
Returns profile completion percentage (0-100).

#### `getProfileItems(email)`
Returns array of profile items with completion status.

#### `updateProfileItem(email, itemIndex, progress, complete)`
Updates a profile item and recalculates overall completion percentage.

---

**Last Updated:** January 29, 2026
**Status:** ✅ Production Ready

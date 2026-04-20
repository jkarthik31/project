/* ===================================
   Student Placement Portal - Global JavaScript
   =================================== */

// ==================
// Form Validation Module
// ==================

const FormValidator = {
  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number
  isValidPhone: (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Validate password strength
  getPasswordStrength: (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[\W_]/.test(password)) strength++;
    return strength;
  },

  // Get password strength label
  getPasswordStrengthLabel: (strength) => {
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return labels[strength] || 'Weak';
  },

  // Validate required field
  isRequired: (value) => {
    return value.trim().length > 0;
  },

  // Validate minimum length
  minLength: (value, min) => {
    return value.length >= min;
  },

  // Validate maximum length
  maxLength: (value, max) => {
    return value.length <= max;
  },

  // Validate number range
  isInRange: (value, min, max) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  // Validate future date
  isFutureDate: (dateString) => {
    const date = new Date(dateString);
    return date > new Date();
  },

  // Validate file size (in MB)
  isValidFileSize: (file, maxMB) => {
    const maxBytes = maxMB * 1024 * 1024;
    return file.size <= maxBytes;
  },

  // Validate file type
  isValidFileType: (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
  }
};

// ==================
// Toast Notification Module
// ==================

const Toast = {
    show(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${this.getBackground(type)};
            color: white;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 600;
            max-width: 400px;
            word-wrap: break-word;
            animation: slideInRight 0.4s ease;
        `;
        
        // Add animation keyframes if not exists
        if (!document.getElementById('toastStyles')) {
            const style = document.createElement('style');
            style.id = 'toastStyles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(450px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(450px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    getBackground(type) {
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        return colors[type] || colors.info;
    },

    success(message) { this.show(message, 'success'); },
    error(message) { this.show(message, 'error'); },
    warning(message) { this.show(message, 'warning'); },
    info(message) { this.show(message, 'info'); }
};

// ==================
// Modal Module
// ==================

const Modal = {
  open: (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  close: (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  },

  closeAll: () => {
    document.querySelectorAll('.modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
  }
};

// ==================
// DOM Helpers
// ==================

const DOMHelpers = {
  // Add error to input
  addError: (inputElement, errorMessage) => {
    inputElement.classList.add('input-error');
    let errorDiv = inputElement.nextElementSibling;
    
    if (!errorDiv || !errorDiv.classList.contains('form-error')) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'form-error';
      inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
    }
    
    errorDiv.textContent = errorMessage;
  },

  // Remove error from input
  removeError: (inputElement) => {
    inputElement.classList.remove('input-error');
    const errorDiv = inputElement.nextElementSibling;
    
    if (errorDiv && errorDiv.classList.contains('form-error')) {
      errorDiv.remove();
    }
  },

  // Add success to input
  addSuccess: (inputElement) => {
    inputElement.classList.add('input-success');
    inputElement.classList.remove('input-error');
  },

  // Clear form
  clearForm: (formElement) => {
    formElement.reset();
    formElement.querySelectorAll('input, textarea').forEach(element => {
      DOMHelpers.removeError(element);
      element.classList.remove('input-success', 'input-error');
    });
  },

  // Hide element
  hide: (element) => {
    element.classList.add('hidden');
  },

  // Show element
  show: (element) => {
    element.classList.remove('hidden');
  },

  // Toggle element
  toggle: (element) => {
    element.classList.toggle('hidden');
  }
};

// ==================
// Sidebar Navigation Module
// ==================

const SidebarNav = {
  init: () => {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
      });

      // Close sidebar when clicking outside
      document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
          sidebar.classList.remove('active');
        }
      });
    }

    // Set active menu item based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
};

// ==================
// Local Storage Helper
// ==================

const StorageHelper = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage error:', e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Storage error:', e);
        }
    },

    clear() {
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Storage error:', e);
        }
    }
};

// ==================
// User Session Management
// ==================

const SessionManager = {
    login(email, password, role, name = 'User', department = null) {
        const user = {
            email: email,
            role: role,
            name: name,
            department: department,
            loginTime: new Date().toISOString()
        };
        StorageHelper.set('currentUser', user);
        StorageHelper.set('isLoggedIn', true);
        return user;
    },

    logout() {
        StorageHelper.remove('currentUser');
        StorageHelper.remove('isLoggedIn');
        window.location.href = 'index.html';
    },

    isLoggedIn() {
        return StorageHelper.get('isLoggedIn', false);
    },

    getCurrentUser() {
        return StorageHelper.get('currentUser', null);
    },

    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    },

    isStudent() {
        const user = this.getCurrentUser();
        return user && user.role === 'student';
    },

    isTeacher() {
        const user = this.getCurrentUser();
        return user && user.role === 'teacher';
    },

    isHOD() {
        const user = this.getCurrentUser();
        return user && user.role === 'hod';
    },

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    getDepartment() {
        const user = this.getCurrentUser();
        return user ? user.department : null;
    }
};

// ==================
// User Data Manager (Tracks student applications and profile)
// ==================

const UserDataManager = {
    // Get user data from localStorage
    getUserData(email) {
        const allData = StorageHelper.get('userData', {});
        if (!allData[email]) {
            allData[email] = {
                email: email,
                applications: [],
                profileCompletion: 20,
                profileItems: [
                    { label: 'Personal Information', progress: '100%', complete: true },
                    { label: 'Education Details', progress: '50%', complete: false },
                    { label: 'Skills & Experience', progress: '0%', complete: false },
                    { label: 'Resume Upload', progress: '0%', complete: false },
                    { label: 'Projects', progress: '0%', complete: false }
                ]
            };
            StorageHelper.set('userData', allData);
        }
        return allData[email];
    },

    // Add job application
    addApplication(email, jobTitle, company, position, status = 'applied') {
        const allData = StorageHelper.get('userData', {});
        if (!allData[email]) {
            this.getUserData(email);
            allData = StorageHelper.get('userData', {});
        }
        
        // Check if already applied
        const alreadyApplied = allData[email].applications.some(
            app => app.company === company && app.position === position
        );
        
        if (!alreadyApplied) {
            allData[email].applications.push({
                company: company,
                position: position,
                status: status,
                appliedDate: new Date().toISOString().split('T')[0],
                statusIcon: this.getStatusIcon(status)
            });
            StorageHelper.set('userData', allData);
            return true;
        }
        return false;
    },

    // Get status icon
    getStatusIcon(status) {
        const icons = {
            'applied': '💼',
            'shortlisted': '⭐',
            'selected': '✅',
            'rejected': '❌'
        };
        return icons[status] || '💼';
    },

    // Update profile completion
    updateProfileItem(email, itemIndex, progress, complete) {
        const allData = StorageHelper.get('userData', {});
        if (allData[email] && allData[email].profileItems[itemIndex]) {
            allData[email].profileItems[itemIndex].progress = progress;
            allData[email].profileItems[itemIndex].complete = complete;
            
            // Recalculate overall completion
            const completedItems = allData[email].profileItems.filter(p => p.complete).length;
            allData[email].profileCompletion = Math.round((completedItems / allData[email].profileItems.length) * 100);
            
            StorageHelper.set('userData', allData);
        }
    },

    // Get applications count by status
    getCountByStatus(email, status) {
        const userData = this.getUserData(email);
        return userData.applications.filter(app => app.status === status).length;
    },

    // Get all applications
    getApplications(email) {
        const userData = this.getUserData(email);
        return userData.applications;
    },

    // Get profile completion percentage
    getProfileCompletion(email) {
        const userData = this.getUserData(email);
        return userData.profileCompletion;
    },

    // Get profile items
    getProfileItems(email) {
        const userData = this.getUserData(email);
        return userData.profileItems;
    }
    ,
    // Remove an application
    removeApplication(email, company, position) {
      const allData = StorageHelper.get('userData', {});
      if (allData[email]) {
        allData[email].applications = allData[email].applications.filter(a => !(a.company === company && a.position === position));
        StorageHelper.set('userData', allData);
        return true;
      }
      return false;
    },

    // Update application status
    updateApplicationStatus(email, company, position, status) {
      const allData = StorageHelper.get('userData', {});
      if (allData[email]) {
        const app = allData[email].applications.find(a => a.company === company && a.position === position);
        if (app) {
          app.status = status;
          app.statusIcon = this.getStatusIcon(status);
          StorageHelper.set('userData', allData);
          return true;
        }
      }
      return false;
    }
};

// ==================
// Utility Functions
// ==================

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Format date time
const formatDateTime = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Get days remaining
const getDaysRemaining = (dateString) => {
  const today = new Date();
  const deadline = new Date(dateString);
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Capitalize string
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Truncate string
const truncate = (str, length) => {
  if (str.length <= length) return str;
  return str.substr(0, length) + '...';
};

// Generate mock data
const generateMockId = () => {
  return 'ID' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// ==================
// Movement Animation Module
// ==================

const MovementAnimator = {
  // Track animated elements
  animatedElements: [],
  isArrowKeyActive: false,
  scrollThreshold: 50,
  
  // Initialize background elements for animation - SELECTIVE PROFESSIONAL APPROACH
  initAnimations: () => {
    // Only animate important/required places professionally
    const importantSelectors = [
      '.hero',                      // Hero sections
      '.banner',                    // Banner sections
      '.cta-section',               // Call-to-action sections
      '.stats-section',             // Statistics sections
      '[data-animate="true"]',      // Explicitly marked elements
      '.background-animated',       // Explicitly marked backgrounds
      '.feature-card',              // Feature cards (limit to first 6)
      '.job-card',                  // Job cards (limit to first 4)
      '.recruiter-grid > div',      // Recruiter items (limit)
      'main > section'              // Major sections
    ];
    
    // Get all important elements to animate
    const elementsToAnimate = new Set();
    
    importantSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach((el, index) => {
        // Limit animations: only animate first few items of each type
        const limit = selector.includes('card') || selector.includes('recruiter') ? 6 : null;
        if (!limit || index < limit) {
          // Skip if element is hidden or very small
          if (el.offsetHeight > 0 && el.offsetParent !== null) {
            elementsToAnimate.add(el);
            el.classList.add('animated-div');
          }
        }
      });
    });
    
    MovementAnimator.animatedElements = Array.from(elementsToAnimate);
  },
  
  // Animate on scroll
  onScroll: () => {
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    
    MovementAnimator.animatedElements.forEach((div, index) => {
      const rect = div.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isInViewport && !MovementAnimator.isArrowKeyActive) {
        // Subtle animation - only 5-15px movement
        const offset = (index % 3) * 8;
        const moveY = (scrollY * 0.05 + offset) % 15;
        const moveX = (scrollX * 0.02) % 8;
        
        div.style.transform = `translate(${moveX}px, ${moveY}px)`;
        div.style.opacity = Math.min(1, 0.85 + (scrollY / 2000));
      }
    });
  },
  
  // Animate on arrow key press
  onArrowKey: (direction) => {
    if (MovementAnimator.animatedElements.length === 0) return;
    
    MovementAnimator.isArrowKeyActive = true;
    
    let translateX = 0;
    let translateY = 0;
    
    switch(direction) {
      case 'ArrowUp':
        translateY = -15;
        break;
      case 'ArrowDown':
        translateY = 15;
        break;
      case 'ArrowLeft':
        translateX = -20;
        break;
      case 'ArrowRight':
        translateX = 20;
        break;
    }
    
    MovementAnimator.animatedElements.forEach((div, index) => {
      const staggerDelay = index * 15;
      setTimeout(() => {
        div.style.transform = `translate(${translateX}px, ${translateY}px)`;
        
        // Smooth return
        setTimeout(() => {
          div.style.transform = 'translate(0, 0)';
        }, 250);
      }, staggerDelay);
    });
    
    // Reset flag after animation
    setTimeout(() => {
      MovementAnimator.isArrowKeyActive = false;
    }, 400);
  },
  
  // Mouse move parallax effect - subtle for important elements only
  onMouseMove: (e) => {
    if (MovementAnimator.animatedElements.length === 0 || MovementAnimator.isArrowKeyActive) return;
    
    const mouseX = (e.clientX / window.innerWidth) - 0.5;
    const mouseY = (e.clientY / window.innerHeight) - 0.5;
    
    // Only apply to ~30% of important elements for professional look
    MovementAnimator.animatedElements.forEach((div, index) => {
      if (index % 3 === 0) { // Apply to every 3rd element
        const depth = (index % 2) + 1;
        const moveX = mouseX * 6 * depth;
        const moveY = mouseY * 6 * depth;
        
        div.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    });
  }
};

// ==================
// Admin management and department reporting utilities
// ==================

const AdminManager = {
    // Create HOD user (UI should call this; admin-only)
    // user: { name, email, password, department }
    async createHOD(user) {
        if (!user || !user.email || !user.name || !user.password || !user.department) {
            return { ok: false, message: 'All fields are required.' };
        }
        if (!FormValidator.isValidEmail(user.email)) {
            return { ok: false, message: 'Invalid email.' };
        }
        // Gather existing accounts across known keys
        const hods = StorageHelper.get('hods', []);
        const teachers = StorageHelper.get('teachers', []);
        const students = StorageHelper.get('students', []);
        const admins = StorageHelper.get('admins', []);
        const exists = (arr) => arr.some(a => a.email === user.email);
        if (exists(hods) || exists(teachers) || exists(students) || exists(admins)) {
            return { ok: false, message: 'Email already in use.' };
        }

        // Create HOD record (UI-only credentials stored client-side as mock)
        const newHod = {
            id: Date.now(),
            name: user.name,
            email: user.email,
            password: user.password, // client-side mock only
            department: user.department,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        hods.push(newHod);
        StorageHelper.set('hods', hods);

        // optional: keep an admin-created-log
        const adminLogs = StorageHelper.get('adminLogs', []);
        adminLogs.push({ action: 'createHOD', by: AdminManager._currentAdminEmail(), email: user.email, time: new Date().toISOString(), department: user.department });
        StorageHelper.set('adminLogs', adminLogs);

        return { ok: true, message: 'HOD account created.', hod: newHod };
    },

    listHODs() {
        return StorageHelper.get('hods', []);
    },

    removeHOD(email) {
        if (!email) return { ok: false, message: 'Email required' };
        let hods = StorageHelper.get('hods', []);
        const idx = hods.findIndex(h => h.email === email);
        if (idx === -1) return { ok: false, message: 'HOD not found' };
        const removed = hods.splice(idx, 1)[0];
        StorageHelper.set('hods', hods);
        const adminLogs = StorageHelper.get('adminLogs', []);
        adminLogs.push({ action: 'removeHOD', by: AdminManager._currentAdminEmail(), email, time: new Date().toISOString() });
        StorageHelper.set('adminLogs', adminLogs);
        return { ok: true, message: 'HOD removed', hod: removed };
    },

    // Helper to get current admin email from session (if any)
    _currentAdminEmail() {
        const user = SessionManager.getCurrentUser();
        return user && user.role === 'admin' ? user.email : 'system';
    },

    // Build a department report from stored students/applications/jobs
    // returns { meta: { department, totalStudents, verifiedByTeacher, approvedByHOD, placed }, rows: [...] }
    getDepartmentReport(department) {
        const students = StorageHelper.get('students', []);
        const applications = StorageHelper.get('applications', []);
        // Filter by department
        const deptStudents = students.filter(s => s.department === department);
        const total = deptStudents.length;
        const verifiedByTeacher = deptStudents.filter(s => s.teacherVerified === true).length;
        const approvedByHOD = deptStudents.filter(s => s.hodApproved === true).length;
        const placed = deptStudents.filter(s => s.placed === true || s.status === 'placed').length;

        // Build rows for export
        const rows = deptStudents.map(s => ({
            name: s.name || '',
            email: s.email || '',
            rollNo: s.rollNo || '',
            status: s.status || '',
            teacherVerified: !!s.teacherVerified,
            hodApproved: !!s.hodApproved,
            placed: !!s.placed,
            appliedJobs: (applications.filter(a => a.studentEmail === s.email).length)
        }));

        return {
            meta: {
                department,
                totalStudents: total,
                verifiedByTeacher,
                approvedByHOD,
                placed
            },
            rows
        };
    },

    // Export CSV (Excel-compatible) for a department
    exportDepartmentCSV(department, filename) {
        const report = AdminManager.getDepartmentReport(department);
        const rows = report.rows;
        if (!rows.length) {
            return { ok: false, message: 'No data for department.' };
        }
        const headers = Object.keys(rows[0]);
        const csvLines = [];
        csvLines.push(headers.join(','));
        rows.forEach(r => {
            const line = headers.map(h => {
                let val = r[h];
                if (val === null || val === undefined) val = '';
                // escape quotes
                if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
                    val = '"' + val.replace(/"/g, '""') + '"';
                }
                return val;
            }).join(',');
            csvLines.push(line);
        });
        const csvContent = csvLines.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const fname = filename || `department-${department}-report-${new Date().toISOString().slice(0,10)}.csv`;
        // download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', fname);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return { ok: true, message: 'CSV exported', filename: fname };
    },

    // Export PDF by opening a printable window containing the report table
    exportDepartmentPDF(department, filename) {
        const report = AdminManager.getDepartmentReport(department);
        const rows = report.rows;
        if (!rows.length) {
            return { ok: false, message: 'No data for department.' };
        }
        // build HTML
        let html = `<html><head><title>Department ${department} Report</title>
        <style>
            body{font-family: Arial, Helvetica, sans-serif; padding:20px; color:#222}
            table{width:100%;border-collapse:collapse}
            th,td{padding:8px;border:1px solid #ddd;text-align:left;font-size:12px}
            th{background:#f5f7fb}
            h2{margin-top:0}
            .meta{margin-bottom:12px}
        </style>
        </head><body>`;
        html += `<h2>Department Report: ${department}</h2>`;
        html += `<div class="meta">Total Students: ${report.meta.totalStudents} &nbsp; | &nbsp; Teacher Verified: ${report.meta.verifiedByTeacher} &nbsp; | &nbsp; HOD Approved: ${report.meta.approvedByHOD} &nbsp; | &nbsp; Placed: ${report.meta.placed}</div>`;
        html += `<table><thead><tr>`;
        const headers = Object.keys(rows[0]);
        headers.forEach(h => html += `<th>${h}</th>`);
        html += `</tr></thead><tbody>`;
        rows.forEach(r => {
            html += '<tr>';
            headers.forEach(h => html += `<td>${String(r[h] ?? '')}</td>`);
            html += '</tr>';
        });
        html += `</tbody></table>`;
        html += `<script>window.onload = function(){ setTimeout(()=>{ window.print(); }, 300); };</script>`;
        html += `</body></html>`;

        const w = window.open('', '_blank', 'noopener');
        if (!w) return { ok: false, message: 'Popup blocked' };
        w.document.open();
        w.document.write(html);
        w.document.close();
        return { ok: true, message: 'PDF window opened', filename: filename || `department-${department}-report.pdf` };
    },

    // Unified download helper: format = 'csv'|'pdf'
    downloadDepartmentReport(department, format = 'csv') {
        if (!department) return { ok: false, message: 'Department required' };
        if (format === 'csv') return AdminManager.exportDepartmentCSV(department);
        if (format === 'pdf') return AdminManager.exportDepartmentPDF(department);
        return { ok: false, message: 'Unsupported format' };
    }
};

// ==================
// Global Initialization
// ==================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize sidebar navigation
  SidebarNav.init();

  // Initialize movement animations
  MovementAnimator.initAnimations();

  // Scroll event listener with throttle
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      MovementAnimator.onScroll();
    }, 10);
  }, { passive: true });

  // Arrow key event listener
  document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      MovementAnimator.onArrowKey(e.key);
    }
  });

  // Mouse move parallax effect
  document.addEventListener('mousemove', (e) => {
    MovementAnimator.onMouseMove(e);
  }, { passive: true });

  // Close modal when clicking outside
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });

  // Close alert buttons
  document.querySelectorAll('.alert-close').forEach(btn => {
    btn.addEventListener('click', function() {
      this.parentElement.style.display = 'none';
    });
  });

  // Close modal buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() {
      Modal.close(this.closest('.modal').id);
    });
  });
});

// Export functions for use in HTML
window.FormValidator = FormValidator;
window.Toast = Toast;
window.Modal = Modal;
window.DOMHelpers = DOMHelpers;
window.SessionManager = SessionManager;
window.UserDataManager = UserDataManager;
window.StorageHelper = StorageHelper;
window.SidebarNav = SidebarNav;
window.MovementAnimator = MovementAnimator;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.getDaysRemaining = getDaysRemaining;
window.capitalize = capitalize;
window.truncate = truncate;
window.generateMockId = generateMockId;
// Expose AdminManager to global scope for UI pages
window.AdminManager = AdminManager;

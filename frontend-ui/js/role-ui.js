// Role-based UI Control Utilities

const RoleUI = {
    // Check if element should be visible for current user
    isAccessible(requiredRole) {
        const user = SessionManager.getCurrentUser();
        if (!user) return false;
        
        if (requiredRole === 'admin') return SessionManager.isAdmin();
        if (requiredRole === 'teacher') return SessionManager.isTeacher();
        if (requiredRole === 'hod') return SessionManager.isHOD();
        if (requiredRole === 'student') return SessionManager.isStudent();
        
        return false;
    },

    // Hide/show element based on role
    conditionalDisplay(elementId, requiredRole) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = this.isAccessible(requiredRole) ? 'block' : 'none';
        }
    },

    // Disable action based on role
    conditionalDisable(elementId, requiredRole) {
        const element = document.getElementById(elementId);
        if (element) {
            element.disabled = !this.isAccessible(requiredRole);
        }
    },

    // Get department scope
    isDepartmentScoped(userDept, targetDept) {
        const user = SessionManager.getCurrentUser();
        if (!user) return false;
        
        // Admin can access all departments
        if (SessionManager.isAdmin()) return true;
        
        // Teacher/HOD can only access own department
        return user.department === targetDept;
    },

    // Filter list by department
    filterByDepartment(items) {
        const user = SessionManager.getCurrentUser();
        if (!user) return [];
        
        if (SessionManager.isAdmin()) {
            return items;
        }
        
        return items.filter(item => item.department === user.department);
    },

    // Check if user can perform action
    canPerformAction(action, resourceDept) {
        const user = SessionManager.getCurrentUser();
        if (!user) return false;
        
        // Admin can do everything
        if (SessionManager.isAdmin()) return true;
        
        // Teacher/HOD can only act within own department
        if (SessionManager.isTeacher() || SessionManager.isHOD()) {
            return user.department === resourceDept;
        }
        
        // Students have specific restrictions
        if (SessionManager.isStudent()) {
            if (action === 'viewJobs') return true;
            if (action === 'applyJob') return true;
            if (action === 'editProfile') return true;
            return false;
        }
        
        return false;
    }
};

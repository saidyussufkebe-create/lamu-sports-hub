/**
 * Handles all navigation between app sections.
 * @param {string} sectionId - The ID of the section to display.
 */
function showSection(sectionId) {
    // 1. Comprehensive list of all app sections
    const sections = [
        'dashboard', 
        'feed', 
        'profile', 
        'registration', 
        'facilities', 
        'admin-panel', 
        'teams', 
        'about', 
        'settings'
    ];

    // 2. Hide every section and reset visibility
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
        }
    });

    // 3. Show the target section
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove('hidden');
    } else {
        console.warn(`Section "${sectionId}" not found in DOM.`);
    }

    // 4. Update Bottom Navigation UI styling
    document.querySelectorAll('.nav-tab').forEach(tab => {
        // Reset all tabs to inactive state
        tab.classList.remove('active', 'text-orange-400');
        tab.classList.add('text-gray-500');
    });

    // 5. Highlight the active tab if triggered by a click event
    if (window.event && window.event.currentTarget && window.event.currentTarget.classList.contains('nav-tab')) {
        const activeTab = window.event.currentTarget;
        activeTab.classList.add('active', 'text-orange-400');
        activeTab.classList.remove('text-gray-500');
    }

    // 6. Smooth scroll to top for better user experience on long pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Handles Admin Access Verification
 */
function verifyAdmin() {
    const codeField = document.getElementById('adminCode');
    const code = codeField ? codeField.value : '';
    
    // Official Access Code: 2540
    if (code === "2540") {
        showSection('admin-panel');
        // Clear field for security
        if(codeField) codeField.value = ''; 
    } else {
        alert("Access Denied: Invalid Official Code");
    }
      }

/* ============================================================================
   SAFETY TRAINING PAGE LOADER - DETERMINISTIC AND RELIABLE
   ============================================================================ */

(function() {
    'use strict';
    
    let isLoaded = false;
    
    function hideLoader() {
        if (isLoaded) return;
        isLoaded = true;
        
        const loader = document.getElementById('page-loader');
        if (loader) {
            // Smooth fade out
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.3s ease-out';
            
            setTimeout(function() {
                loader.style.display = 'none';
                document.body.classList.add('is-loaded');
            }, 300);
        }
    }
    
    // Multiple reliable triggers to ensure loader dismissal
    function initLoader() {
        // Minimum display time
        setTimeout(hideLoader, 800);
        
        // Failsafe maximum time
        setTimeout(hideLoader, 3000);
        
        // When DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(hideLoader, 300);
            });
        } else {
            setTimeout(hideLoader, 100);
        }
        
        // When page is fully loaded
        if (document.readyState !== 'complete') {
            window.addEventListener('load', function() {
                setTimeout(hideLoader, 200);
            });
        }
    }
    
    // Start immediately
    initLoader();
})();
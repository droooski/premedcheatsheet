// Debug script to add to your project - logs modal actions
// Place this in a new file src/utils/modalDebug.js

// Log modal actions to help identify any issues with closing modals
export const setupModalDebugging = () => {
  // Add this script to any page where you're having modal issues
  console.log("Modal debugging enabled");
  
  // Set up global event listeners for modal actions
  document.addEventListener('click', (e) => {
    // Check if this is a modal close button
    if (e.target.classList.contains('close-button') || 
        e.target.closest('.close-button')) {
      console.log('Modal close button clicked', {
        target: e.target,
        stopPropagation: e.isPropagationStopped ? e.isPropagationStopped() : 'unknown',
        defaultPrevented: e.defaultPrevented
      });
    }
    
    // Check if this is a modal overlay
    if (e.target.classList.contains('auth-modal-overlay') || 
        e.target.classList.contains('login-modal-overlay')) {
      console.log('Modal overlay clicked', {
        target: e.target,
        currentTarget: e.currentTarget,
        stopPropagation: e.isPropagationStopped ? e.isPropagationStopped() : 'unknown',
        defaultPrevented: e.defaultPrevented
      });
    }
  }, true); // Use capture phase to log before stopPropagation
  
  // Monitor React state changes
  const originalSetState = React.Component.prototype.setState;
  React.Component.prototype.setState = function(...args) {
    const componentName = this.constructor.name;
    if (componentName.includes('Modal')) {
      console.log(`setState called in ${componentName}`, args[0]);
    }
    return originalSetState.apply(this, args);
  };
  
  return () => {
    // Function to disable debugging
    React.Component.prototype.setState = originalSetState;
    console.log("Modal debugging disabled");
  };
};

// Helper functions to identify modal issues
export const checkModalVisibility = () => {
  const modals = [
    ...document.querySelectorAll('.auth-modal-overlay'),
    ...document.querySelectorAll('.login-modal-overlay')
  ];
  
  console.log(`Found ${modals.length} modal overlays on page`);
  
  modals.forEach((modal, index) => {
    console.log(`Modal #${index + 1}:`, {
      display: window.getComputedStyle(modal).display,
      visibility: window.getComputedStyle(modal).visibility,
      opacity: window.getComputedStyle(modal).opacity,
      zIndex: window.getComputedStyle(modal).zIndex,
      classList: Array.from(modal.classList),
      parent: modal.parentElement?.tagName
    });
  });
  
  return modals.length > 0;
};

// Function to force close any visible modals
export const forceCloseModals = () => {
  const modals = [
    ...document.querySelectorAll('.auth-modal-overlay'),
    ...document.querySelectorAll('.login-modal-overlay')
  ];
  
  modals.forEach(modal => {
    modal.style.display = 'none';
    console.log("Force closed modal:", modal);
  });
  
  return modals.length;
};

export default {
  setupModalDebugging,
  checkModalVisibility,
  forceCloseModals
};
//tracks the basic firebase analytics events

import {logEvent} from 'firebase/analytics';
import { analytics } from '../firebase/config';

//Generate page titles based on the path (update this if there are more pages added in the future)
const getPageTitle = (pagePath) => {
    //remove query parameters
  const cleanPath = pagePath.split('?')[0];
  
  const titleMap = {
    '/': 'Home - Premed Cheatsheet',
    '/profile': 'Profile - Premed Cheatsheet',
    '/about': 'About - Premed Cheatsheet',
    '/checkout': 'Checkout - Premed Cheatsheet',
    '/signup': 'Sign Up - Premed Cheatsheet',
    '/login': 'Login - Premed Cheatsheet',
    '/pricing': 'Pricing - Premed Cheatsheet',
    '/account': 'Account - Premed Cheatsheet',
    '/account/payment-methods': 'Payment Methods - Premed Cheatsheet',
    '/account/addresses': 'Addresses - Premed Cheatsheet',
    '/admin': 'Admin Panel - Premed Cheatsheet',
    '/guest-preview': 'Guest Preview - Premed Cheatsheet',
    '/premed-cheatsheet-plus': 'Premed Cheatsheet Plus - Premed Cheatsheet',
    '/application-cheatsheet': 'Application Cheatsheet - Premed Cheatsheet',
    '/reset-password': 'Reset Password - Premed Cheatsheet',
    '/verify-email': 'Verify Email - Premed Cheatsheet',
    '/contact': 'Contact - Premed Cheatsheet',
    '/privacy': 'Privacy - Premed Cheatsheet',
    '/terms': 'Terms - Premed Cheatsheet'
  };

  if (cleanPath.startsWith('/school/')) {
    return 'School Profile - Premed Cheatsheet';
  }
    //return title or default premed cheatsheet
  return titleMap[cleanPath] || `${cleanPath} - Premed Cheatsheet`;
};

export const trackPageView = (pagePath, customTitle = null) => {
    if(analytics){
        const pageTitle = customTitle || getPageTitle(pagePath);
        logEvent(analytics, 'page_view', {
            page_title: pageTitle,
            page_location: window.location.href,
            page_path: pagePath
        });
    }
};


//tracks the basic firebase analytics events

import { logEvent } from "firebase/analytics";
import { analytics } from "../firebase/config";

//Generate page titles based on the path (update this if there are more pages added in the future)
const getPageTitle = (pagePath) => {
  //remove query parameters
  const cleanPath = pagePath.split("?")[0];

  const titleMap = {
    "/": "Home - Premed Profiles",
    "/profile": "Profile - Premed Profiles",
    "/about": "About - Premed Profiles",
    "/checkout": "Checkout - Premed Profiles",
    "/signup": "Sign Up - Premed Profiles",
    "/login": "Login - Premed Profiles",
    "/pricing": "Pricing - Premed Profiles",
    "/account": "Account - Premed Profiles",
    "/account/payment-methods": "Payment Methods - Premed Profiles",
    "/account/addresses": "Addresses - Premed Profiles",
    "/admin": "Admin Panel - Premed Profiles",
    "/guest-preview": "Guest Preview - Premed Profiles",
    "/premed-cheatsheet-plus": "Premed Profiles Plus - Premed Profiles",
    "/application-cheatsheet": "Application Cheatsheet - Premed Profiles",
    "/reset-password": "Reset Password - Premed Profiles",
    "/verify-email": "Verify Email - Premed Profiles",
    "/contact": "Contact - Premed Profiles",
    "/privacy": "Privacy - Premed Profiles",
    "/terms": "Terms - Premed Profiles",
  };

  if (cleanPath.startsWith("/school/")) {
    return "School Profile - Premed Profiles";
  }
  //return title or default premed profiles
  return titleMap[cleanPath] || `${cleanPath} - Premed Profiles`;
};

export const trackPageView = (pagePath, customTitle = null) => {
  if (analytics) {
    const pageTitle = customTitle || getPageTitle(pagePath);
    logEvent(analytics, "page_view", {
      page_title: pageTitle,
      page_location: window.location.href,
      page_path: pagePath,
    });
  }
};

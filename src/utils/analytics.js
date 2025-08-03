//tracks the basic firebase analytics events

import {logEvent} from 'firebase/analytics';
import { analytics } from '../firebase/config';

export const trackPageView = (pagePath) => {
    if(analytics){
        logEvent(analytics, 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: pagePath
        });
    }
};

export const trackEvent = (eventName, parameters = {}) => {
    if(analytics){
        logEvent(analytics, eventName, parameters);
    }
};
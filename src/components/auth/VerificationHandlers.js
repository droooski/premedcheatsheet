// src/components/auth/VerificationHandlers.js
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../../firebase/authService';

/**
 * This component handles URL-based email verification.
 * It listens for verification action codes in the URL and processes them.
 */
export const EmailVerificationHandler = ({ onSuccess, onError }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Extract verification parameters from URL
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode');
    const actionCode = searchParams.get('oobCode');
    
    // Only process if this is a verification request
    if (mode === 'verifyEmail' && actionCode) {
      const handleVerification = async () => {
        try {
          const result = await verifyEmail(actionCode);
          
          if (result.success) {
            // Call success callback if provided
            if (onSuccess) {
              onSuccess();
            }
            
            // Remove query parameters from URL for cleaner UX
            navigate(location.pathname, { replace: true });
          } else {
            // Call error callback with error details
            if (onError) {
              onError(result.error);
            }
          }
        } catch (error) {
          console.error('Error handling verification:', error);
          if (onError) {
            onError({ 
              message: 'An unexpected error occurred during verification.' 
            });
          }
        }
      };
      
      handleVerification();
    }
  }, [location, navigate, onSuccess, onError]);
  
  // This is a utility component - it doesn't render anything
  return null;
};

export default EmailVerificationHandler;
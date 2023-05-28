// Validate email function
export const validateEmail = (email) => {
    // Regular expression to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Check if the email matches the regex pattern
    return emailRegex.test(email);
  };
  
  // Validate password function
 export  const validatePassword = (password) => {
    // Regular expression to validate password format
    // At least 8 characters long, containing a combination of letters, numbers, and special characters
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  
    // Check if the password matches the regex pattern
    return passwordRegex.test(password);
  };
  
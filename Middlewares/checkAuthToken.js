// Import necessary dependencies
import jwt from 'jsonwebtoken';

// Define the middleware function
const checkAuthToken = (req, res, next) => {
  // Get the authorization token from the request headers
  const token = req.headers.authorization;

  // Check if the token exists
  if (!token) {
    return res.status(401).json({ message: 'Authorization token not found' });
  }

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.secret);

    // Add the decoded token to the request object for further use
    req.decodedToken = decodedToken;

    // Call the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid authorization token' });
  }
};

export default checkAuthToken;

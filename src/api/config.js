// Base URL for all API calls
// In production this will be replaced by the Render backend URL via REACT_APP_API_URL env var

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default BASE_URL;

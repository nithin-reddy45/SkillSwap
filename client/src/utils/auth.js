export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("authChanged"));
};

export const handleAuthError = (response, navigate) => {
  if (response && (response.status === 401 || response.status === 403)) {
    clearAuthSession();
    if (navigate) {
      navigate("/login");
    }
    return true;
  }
  return false;
};

export const formatApiError = (err) => {
  if (!err) return "An unexpected error occurred.";
  const msg = typeof err === "string" ? err : err.message || "";
  if (
    msg === "Failed to fetch" ||
    msg.toLowerCase().includes("failed to fetch") ||
    msg.toLowerCase().includes("networkerror") ||
    msg.toLowerCase().includes("load failed") ||
    msg.toLowerCase().includes("connection refused")
  ) {
    return "Backend server is unreachable. Please ensure the backend server is running on http://localhost:5000.";
  }
  return msg || "Unable to connect to the server.";
};

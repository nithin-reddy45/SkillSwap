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

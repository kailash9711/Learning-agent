export const getError = (error) =>
  error?.response?.data?.error || error?.response?.data?.message || error.message || "Request failed";

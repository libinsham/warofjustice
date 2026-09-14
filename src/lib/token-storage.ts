let accessToken: string | null =
  typeof window !== "undefined"
    ? localStorage.getItem("accessToken")
    : null;

export const TokenStore = {
  getAccess: () => {
    if (typeof window !== "undefined" && !accessToken) {
      accessToken = localStorage.getItem("accessToken");
    }

    return accessToken;
  },

  setAccess: (token: string | null) => {
    accessToken = token;

    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("accessToken", token);
      } else {
        localStorage.removeItem("accessToken");
      }
    }
  },

  clear: () => {
    accessToken = null;

    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }
  },
};
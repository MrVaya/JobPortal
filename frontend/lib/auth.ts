export const getUserRole = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("role");
};

export const isLoggedIn = () => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
};
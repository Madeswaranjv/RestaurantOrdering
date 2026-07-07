import toast from "react-hot-toast";

const baseStyle = {
  background: "#111111",
  color: "#ffffff",
  border: "1px solid rgba(255, 87, 51, 0.35)",
  borderRadius: "14px",
  padding: "14px 18px",
  fontSize: "14px",
  boxShadow: "0 10px 30px rgba(255, 87, 51, 0.15)",
};

export const showSuccess = (message) => {
  toast.success(message, {
    duration: 3500,
    style: {
      ...baseStyle,
      borderLeft: "4px solid #FF5733",
    },
    iconTheme: {
      primary: "#FF5733",
      secondary: "#ffffff",
    },
  });
};

export const showError = (message) => {
  toast.error(message, {
    duration: 4500,
    style: {
      ...baseStyle,
      borderLeft: "4px solid #dc2626",
    },
    iconTheme: {
      primary: "#dc2626",
      secondary: "#ffffff",
    },
  });
};

export const showInfo = (message) => {
  toast(message, {
    duration: 3500,
    icon: "🍽️",
    style: {
      ...baseStyle,
      borderLeft: "4px solid #FF5733",
    },
  });
};
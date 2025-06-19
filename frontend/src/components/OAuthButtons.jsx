import React from "react";
import { BACKEND_URL } from '../config';

export default function OAuthButtons() {
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/login/google`;
  };

  return (
    <div style={{ margin: "16px 0" }}>
      <button
        onClick={handleGoogleLogin}
        style={{
          background: "#fff",
          color: "#444",
          border: "1px solid #ccc",
          borderRadius: 4,
          padding: "10px 20px",
          margin: "8px 0",
          cursor: "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        Войти через Google
      </button>
    </div>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { handleLoginCallback } = useApp();

  useEffect(() => {
    const finishLogin = async () => {
      try {
        await handleLoginCallback();
        
        navigate("/dashboard");
      } catch (err) {
        console.error("❌ OAuth failed:", err);
        navigate("/login");
      }
    };

    finishLogin();
  }, [navigate, handleLoginCallback]);

  return <p className="text-center mt-20">Authenticating…</p>;
};

export default OAuthCallbackPage;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Логика сброса пароля объединена в /forgot-password
const ResetPassword = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate("/forgot-password", { replace: true }); }, [navigate]);
  return null;
};

export default ResetPassword;

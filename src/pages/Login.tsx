import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { authApi, ApiException } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IconMail, IconLock, IconEye, IconEyeOff } from "@tabler/icons-react";
import { AuthCard, LabelInputContainer } from "@/components/auth/AuthCard";
import { useTranslation } from "react-i18next";

const Login = () => {
  const navigate = useNavigate();
  const { user, setAuthData } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate("/catalog", { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      setAuthData(data.user, data.access_token, data.refresh_token);
      navigate("/catalog");
    } catch (err) {
      if (err instanceof ApiException) {
        const errCode = err.error?.code;
        if (errCode === "email_not_verified") {
          toast.error(t("auth.login.errorVerify"));
          navigate(`/register?verify=${encodeURIComponent(email)}`);
        } else if (errCode === "too_many_requests") {
          toast.error(t("auth.login.errorLocked"));
        } else if (errCode === "invalid_credentials") {
          setFormError(t("auth.login.errorCredentials"));
        } else if (errCode === "validation_error") {
          setFormError(err.error?.message || t("auth.login.errorCredentials"));
        } else {
          toast.error(err.error?.message || t("auth.login.errorCredentials"));
        }
      } else {
        toast.error(t("auth.login.errorConnection"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    try {
      const data = await authApi.loginWithGoogle(credential);
      setAuthData(data.user, data.access_token, data.refresh_token);
      navigate("/catalog");
    } catch {
      toast.error(t("auth.login.errorGoogle"));
    }
  };

  return (
    <AuthCard
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
      footer={
        <>
          {t("auth.login.noAccount")}{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            {t("auth.login.registerLink")}
          </Link>
        </>
      }
    >
      <div className="flex justify-center mb-6">
        <GoogleLogin
          onSuccess={(res) => handleGoogleSuccess(res.credential!)}
          onError={() => toast.error(t("auth.login.errorGoogle"))}
          theme="outline"
          size="large"
          text="signin_with"
        />
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">{t("auth.or")}</span>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <LabelInputContainer>
          <Label htmlFor="email">{t("auth.login.emailLabel")}</Label>
          <div className="relative">
            <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
            <Input id="email" type="email" placeholder="mail@example.com" className="pl-10" value={email} onChange={(e) => { setEmail(e.target.value); setFormError(null); }} required />
          </div>
        </LabelInputContainer>

        <LabelInputContainer>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("auth.login.passwordLabel")}</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">{t("auth.login.forgotPassword")}</Link>
          </div>
          <div className="relative">
            <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`pl-10 pr-10 ${formError ? "border-red-400 focus-visible:ring-red-400/30" : ""}`}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFormError(null); }}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? t("auth.login.hidePassword") : t("auth.login.showPassword")}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {formError && (
            <p className="text-xs text-red-500 mt-0.5">{formError}</p>
          )}
        </LabelInputContainer>

        <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
          {loading ? t("auth.login.loading") : t("auth.login.submit")}
        </Button>
      </form>
    </AuthCard>
  );
};

export default Login;

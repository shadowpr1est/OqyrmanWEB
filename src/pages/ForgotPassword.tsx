import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, ApiException } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IconMail, IconLock, IconEye, IconEyeOff } from "@tabler/icons-react";
import { AuthCard, LabelInputContainer } from "@/components/auth/AuthCard";
import { useTranslation } from "react-i18next";

type Step = "email" | "reset";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("email");

  useEffect(() => {
    if (user) navigate("/catalog", { replace: true });
  }, [user, navigate]);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep("reset");
      toast.success(t("auth.forgot.successSent"));
    } catch {
      setStep("reset");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      toast.success(t("auth.forgot.successReset"));
      navigate("/login");
    } catch (err) {
      if (err instanceof ApiException) {
        const errCode = err.error?.code;
        if (errCode === "invalid_code") toast.error(t("auth.forgot.errorInvalidCode"));
        else toast.error(err.error?.message || t("auth.forgot.errorInvalidCode"));
      } else {
        toast.error(t("auth.forgot.errorConnection"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.resendResetCode(email);
      toast.success(t("auth.verify.successResent"));
    } catch {
      toast.error(t("auth.forgot.errorResend"));
    }
  };

  return (
    <AuthCard
      title={t("auth.forgot.title")}
      subtitle={
        step === "email"
          ? t("auth.forgot.subtitleEmail")
          : t("auth.forgot.subtitleCode", { email })
      }
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          {t("auth.forgot.backToLogin")}
        </Link>
      }
    >
      {step === "email" ? (
        <form onSubmit={handleSendCode} className="space-y-5">
          <LabelInputContainer>
            <Label htmlFor="email">{t("auth.forgot.emailLabel")}</Label>
            <div className="relative">
              <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
              <Input id="email" type="email" placeholder="mail@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </LabelInputContainer>
          <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
            {loading ? t("auth.forgot.loading") : t("auth.forgot.submit")}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-5">
          <LabelInputContainer>
            <Label htmlFor="code">{t("auth.forgot.codeLabel")}</Label>
            <Input
              id="code"
              placeholder="123456"
              className="text-center text-lg tracking-widest"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label htmlFor="password">{t("auth.forgot.newPasswordLabel")}</Label>
            <div className="relative">
              <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.forgot.newPasswordPlaceholder")}
                className="pl-10 pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                aria-label={showPassword ? t("auth.forgot.hidePassword") : t("auth.forgot.showPassword")}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
              >
                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </LabelInputContainer>

          <Button type="submit" className="w-full h-10 font-medium" disabled={loading || code.length !== 6 || newPassword.length < 8}>
            {loading ? t("auth.forgot.saving") : t("auth.forgot.savePassword")}
          </Button>
          <Button type="button" variant="ghost" className="w-full text-sm" onClick={handleResend}>
            {t("auth.forgot.resend")}
          </Button>
        </form>
      )}
    </AuthCard>
  );
};

export default ForgotPassword;

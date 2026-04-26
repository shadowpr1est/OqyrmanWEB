import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { authApi, ApiException } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IconMail, IconLock, IconUser, IconPhone, IconEye, IconEyeOff } from "@tabler/icons-react";
import { AuthCard, LabelInputContainer } from "@/components/auth/AuthCard";
import { useTranslation } from "react-i18next";

type Step = "form" | "verify";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setAuthData } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) navigate("/catalog", { replace: true });
  }, [user, navigate]);

  const verifyEmail = searchParams.get("verify");
  const [step, setStep] = useState<Step>(verifyEmail ? "verify" : "form");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(verifyEmail || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const calcCooldown = useCallback(() => {
    const until = Number(localStorage.getItem("resend_code_until") || "0");
    return Math.max(0, Math.ceil((until - Date.now()) / 1000));
  }, []);

  useEffect(() => {
    setResendCooldown(calcCooldown());
    const id = setInterval(() => {
      const left = calcCooldown();
      setResendCooldown(left);
      if (left <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [step, calcCooldown]);

  const startCooldown = () => {
    const until = Date.now() + 60_000;
    localStorage.setItem("resend_code_until", String(until));
    setResendCooldown(60);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPhoneError(null);
    setLoading(true);
    try {
      await authApi.register({ name, surname, phone, email, password });
      setStep("verify");
      startCooldown();
      toast.success(t("auth.register.successCode"));
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.status === 409) {
          const errCode = err.error?.code;
          if (errCode === "email_already_taken") setEmailError(t("auth.register.errorEmailTaken"));
          else if (errCode === "phone_taken") setPhoneError(t("auth.register.errorPhoneTaken"));
          else if (errCode === "registration_pending") {
            setStep("verify");
            if (resendCooldown <= 0) startCooldown();
            toast.error(t("auth.register.errorCodeSent"));
          } else toast.error(err.error?.message || t("auth.register.errorConnection"));
        } else {
          toast.error(err.error?.message || t("auth.register.errorConnection"));
        }
      } else {
        toast.error(t("auth.register.errorConnection"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.verifyEmail(email, code);
      setAuthData(data.user, data.access_token, data.refresh_token);
      toast.success(t("auth.verify.successVerified"));
      navigate("/catalog");
    } catch (err) {
      if (err instanceof ApiException) {
        const errCode = err.error?.code;
        if (errCode === "already_verified") {
          toast.error(t("auth.verify.errorAlreadyVerified"));
          navigate("/login");
        } else if (errCode === "not_found") {
          toast.error(t("auth.verify.errorNotFound"));
        } else if (errCode === "invalid_code") {
          setCodeError(t("auth.verify.errorInvalidCode"));
        } else {
          toast.error(err.error?.message || t("auth.verify.errorConnection"));
        }
      } else {
        toast.error(t("auth.verify.errorConnection"));
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
      toast.error(t("auth.register.errorGoogle"));
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await authApi.resendCode(email);
      startCooldown();
      toast.success(t("auth.verify.successResent"));
    } catch (err) {
      if (err instanceof ApiException) {
        const errCode = err.error?.code;
        if (errCode === "already_verified") {
          toast.error(t("auth.verify.errorAlreadyVerified"));
          navigate("/login");
        } else if (errCode === "not_found") {
          toast.error(t("auth.verify.errorNotFound"));
        } else {
          toast.error(err.error?.message || t("auth.verify.errorConnection"));
        }
      } else {
        toast.error(t("auth.verify.errorConnection"));
      }
    }
  };

  return (
    <AuthCard
      title={step === "form" ? t("auth.register.title") : t("auth.verify.title")}
      subtitle={
        step === "form"
          ? t("auth.register.subtitle")
          : t("auth.verify.subtitle", { email })
      }
      footer={
        <>
          {t("auth.register.haveAccount")}{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            {t("auth.register.loginLink")}
          </Link>
        </>
      }
    >
      {step === "form" ? (
        <>
          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={(res) => handleGoogleSuccess(res.credential!)}
              onError={() => toast.error(t("auth.register.errorGoogle"))}
              theme="outline"
              size="large"
              text="signup_with"
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

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LabelInputContainer>
                <Label htmlFor="name">{t("auth.register.nameLabel")}</Label>
                <div className="relative">
                  <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
                  <Input id="name" placeholder="Әлішер" className="pl-10" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="surname">{t("auth.register.surnameLabel")}</Label>
                <div className="relative">
                  <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
                  <Input id="surname" placeholder="Арғынбек" className="pl-10" value={surname} onChange={(e) => setSurname(e.target.value)} required />
                </div>
              </LabelInputContainer>
            </div>

            <LabelInputContainer>
              <Label htmlFor="phone">{t("auth.register.phoneLabel")}</Label>
              <div className="relative">
                <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+77001234567"
                  className={`pl-10 ${phoneError ? "border-red-400 focus-visible:ring-red-400/30" : ""}`}
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setPhoneError(null); }}
                  required
                />
              </div>
              {phoneError && <p className="text-xs text-red-500 mt-0.5">{phoneError}</p>}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="email">{t("auth.register.emailLabel")}</Label>
              <div className="relative">
                <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  className={`pl-10 ${emailError ? "border-red-400 focus-visible:ring-red-400/30" : ""}`}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                  required
                />
              </div>
              {emailError && <p className="text-xs text-red-500 mt-0.5">{emailError}</p>}
            </LabelInputContainer>

            <LabelInputContainer>
              <Label htmlFor="password">{t("auth.register.passwordLabel")}</Label>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder={t("auth.register.passwordPlaceholder")} className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                <button
                  type="button"
                  aria-label={showPassword ? t("auth.register.hidePassword") : t("auth.register.showPassword")}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                >
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </LabelInputContainer>

            <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
              {loading ? t("auth.register.loading") : t("auth.register.submit")}
            </Button>
          </form>
        </>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          <LabelInputContainer>
            <Label htmlFor="code">{t("auth.verify.codeLabel")}</Label>
            <Input
              id="code"
              placeholder="123456"
              className={`text-center text-lg tracking-widest ${codeError ? "border-red-400 focus-visible:ring-red-400/30" : ""}`}
              maxLength={6}
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setCodeError(null); }}
              required
            />
            {codeError && <p className="text-xs text-red-500 mt-0.5">{codeError}</p>}
          </LabelInputContainer>
          <Button type="submit" className="w-full h-10 font-medium" disabled={loading || code.length !== 6}>
            {loading ? t("auth.verify.loading") : t("auth.verify.submit")}
          </Button>
          <Button type="button" variant="ghost" className="w-full text-sm" onClick={handleResend} disabled={resendCooldown > 0}>
            {resendCooldown > 0 ? t("auth.verify.resendIn", { seconds: resendCooldown }) : t("auth.verify.resend")}
          </Button>
          <button
            type="button"
            onClick={() => {
              if (verifyEmail) {
                navigate("/login");
              } else {
                setStep("form");
                setCode("");
              }
            }}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            {t("auth.verify.back")}
          </button>
        </form>
      )}
    </AuthCard>
  );
};

export default Register;

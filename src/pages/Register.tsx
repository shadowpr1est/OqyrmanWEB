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

type Step = "form" | "verify";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setAuthData } = useAuth();

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
      toast.success("Код подтверждения отправлен на ваш email");
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.status === 409) {
          const errCode = err.error?.code;
          if (errCode === "email_already_taken") setEmailError("Этот email уже зарегистрирован");
          else if (errCode === "phone_taken") setPhoneError("Этот номер телефона уже зарегистрирован");
          else if (errCode === "registration_pending") {
            setStep("verify");
            if (resendCooldown <= 0) startCooldown();
            toast.error("Код уже отправлен. Проверьте email или подождите 3 минуты");
          } else toast.error(err.error?.message || "Ошибка регистрации");
        } else {
          toast.error(err.error?.message || "Ошибка регистрации");
        }
      } else {
        toast.error("Ошибка соединения с сервером");
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
      toast.success("Email подтверждён! Добро пожаловать");
      navigate("/catalog");
    } catch (err) {
      if (err instanceof ApiException) {
        const errCode = err.error?.code;
        if (errCode === "already_verified") {
          toast.error("Email уже подтверждён. Войдите в аккаунт");
          navigate("/login");
        } else if (errCode === "not_found") {
          toast.error("Пользователь не найден");
        } else if (errCode === "invalid_code") {
          setCodeError("Неверный или устаревший код. Попробуйте ещё раз");
        } else {
          toast.error(err.error?.message || "Ошибка подтверждения");
        }
      } else {
        toast.error("Ошибка соединения с сервером");
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
      toast.error("Ошибка входа через Google");
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await authApi.resendCode(email);
      startCooldown();
      toast.success("Код повторно отправлен на ваш email");
    } catch (err) {
      if (err instanceof ApiException) {
        const errCode = err.error?.code;
        if (errCode === "already_verified") {
          toast.error("Email уже подтверждён. Войдите в аккаунт");
          navigate("/login");
        } else if (errCode === "not_found") {
          toast.error("Пользователь не найден");
        } else {
          toast.error(err.error?.message || "Не удалось отправить код");
        }
      } else {
        toast.error("Ошибка соединения с сервером");
      }
    }
  };

  return (
    <AuthCard
      title={step === "form" ? "Создать аккаунт" : "Подтвердите email"}
      subtitle={
        step === "form"
          ? "Присоединяйтесь к читателям Казахстана"
          : `Введите 6-значный код, отправленный на ${email}`
      }
      footer={
        <>
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Войти
          </Link>
        </>
      }
    >
      {step === "form" ? (
        <>
          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={(res) => handleGoogleSuccess(res.credential!)}
              onError={() => toast.error("Ошибка входа через Google")}
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
              <span className="bg-white px-2 text-muted-foreground">или</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LabelInputContainer>
                <Label htmlFor="name">Имя</Label>
                <div className="relative">
                  <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
                  <Input id="name" placeholder="Алишер" className="pl-10" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              </LabelInputContainer>
              <LabelInputContainer>
                <Label htmlFor="surname">Фамилия</Label>
                <div className="relative">
                  <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
                  <Input id="surname" placeholder="Иванов" className="pl-10" value={surname} onChange={(e) => setSurname(e.target.value)} required />
                </div>
              </LabelInputContainer>
            </div>

            <LabelInputContainer>
              <Label htmlFor="phone">Телефон</Label>
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
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Минимум 8 символов" className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                <button
                  type="button"
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                >
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </LabelInputContainer>

            <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </Button>
          </form>
        </>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          <LabelInputContainer>
            <Label htmlFor="code">Код подтверждения</Label>
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
            {loading ? "Проверяем..." : "Подтвердить"}
          </Button>
          <Button type="button" variant="ghost" className="w-full text-sm" onClick={handleResend} disabled={resendCooldown > 0}>
            {resendCooldown > 0 ? `Повторно через ${resendCooldown} сек` : "Отправить код повторно"}
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
            ← Назад
          </button>
        </form>
      )}
    </AuthCard>
  );
};

export default Register;

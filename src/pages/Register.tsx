import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { authApi, ApiException } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IconMail, IconLock, IconUser, IconPhone, IconEye, IconEyeOff } from "@tabler/icons-react";

type Step = "form" | "verify";

const Register = () => {
  const navigate = useNavigate();
  const { setAuthData } = useAuth();

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register({ name, surname, phone, email, password });
      setStep("verify");
      toast.success("Код подтверждения отправлен на ваш email");
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.status === 409) {
          const errCode = err.error?.code;
          if (errCode === "email_already_taken") toast.error("Этот email уже зарегистрирован");
          else if (errCode === "phone_taken") toast.error("Этот номер телефона уже зарегистрирован");
          else if (errCode === "registration_pending") toast.error("Код уже отправлен. Проверьте email или подождите 3 минуты");
          else toast.error(err.error?.message || "Ошибка регистрации");
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
      navigate("/");
    } catch (err) {
      if (err instanceof ApiException) {
        toast.error("Неверный или устаревший код. Попробуйте ещё раз");
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
      navigate("/");
    } catch {
      toast.error("Ошибка входа через Google");
    }
  };

  const handleResend = async () => {
    try {
      await authApi.resendCode(email);
      toast.success("Код повторно отправлен на ваш email");
    } catch {
      toast.error("Не удалось отправить код. Попробуйте позже");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full border border-border/60 shadow-sm bg-white/80 backdrop-blur-sm">
            <img src="https://api.oqyrman.app/minio/oqyrman/static/logo_circle.png" alt="Oqyrman" className="h-9 w-9 ring-1 ring-border/40 rounded-full" />
            <span className="text-xl font-bold text-primary">Oqyrman</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {step === "form" ? "Создать аккаунт" : "Подтвердите email"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {step === "form"
              ? "Присоединяйтесь к читателям Казахстана"
              : `Введите 6-значный код, отправленный на ${email}`}
          </p>
        </div>

        <div className="rounded-2xl p-6 md:p-8 shadow-lg bg-white border border-border">
          {step === "form" ? (
            <>
              <div className="flex justify-center mb-6">
                <GoogleLogin
                  onSuccess={(res) => handleGoogleSuccess(res.credential!)}
                  onError={() => toast.error("Ошибка входа через Google")}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  locale="ru"
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
                <div className="grid grid-cols-2 gap-4">
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
                    <Input id="phone" type="tel" placeholder="+77001234567" className="pl-10" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </LabelInputContainer>

                <LabelInputContainer>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
                    <Input id="email" type="email" placeholder="mail@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </LabelInputContainer>

                <LabelInputContainer>
                  <Label htmlFor="password">Пароль</Label>
                  <div className="relative">
                    <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Минимум 8 символов" className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10">
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
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </LabelInputContainer>
              <Button type="submit" className="w-full h-10 font-medium" disabled={loading || code.length !== 6}>
                {loading ? "Проверяем..." : "Подтвердить"}
              </Button>
              <Button type="button" variant="ghost" className="w-full text-sm" onClick={handleResend}>
                Отправить код повторно
              </Button>
              <button
                type="button"
                onClick={() => { setStep("form"); setCode(""); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                ← Назад
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Войти</Link>
        </p>
      </div>
    </div>
  );
};

const LabelInputContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-2">{children}</div>
);

export default Register;

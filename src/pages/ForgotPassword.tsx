import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, ApiException } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { IconMail, IconLock, IconEye, IconEyeOff } from "@tabler/icons-react";

type Step = "email" | "reset";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
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
      toast.success("Если этот email зарегистрирован, код отправлен");
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
      toast.success("Пароль успешно изменён");
      navigate("/login");
    } catch (err) {
      if (err instanceof ApiException) {
        const errCode = err.error?.code;
        if (errCode === "invalid_code") toast.error("Неверный или устаревший код");
        else if (errCode === "validation_error") toast.error(err.error?.message || "Пароль должен содержать минимум 8 символов, заглавную букву и цифру");
        else toast.error(err.error?.message || "Ошибка сброса пароля");
      } else {
        toast.error("Ошибка соединения с сервером");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.resendResetCode(email);
      toast.success("Код повторно отправлен");
    } catch {
      toast.error("Не удалось отправить код");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full border border-border/60 shadow-sm bg-white/80 backdrop-blur-sm">
            <img src="https://api.oqyrman.app/minio/oqyrman/static/logo_circle.png" alt="Oqyrman" className="h-9 w-9 ring-1 ring-border/40 rounded-full" />
            <span className="text-xl font-bold text-primary">Oqyrman</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Восстановить пароль</h1>
          <p className="text-muted-foreground mt-2">
            {step === "email"
              ? "Введите email — мы отправим код подтверждения"
              : `Введите код из письма на ${email}`}
          </p>
        </div>

        <div className="rounded-2xl p-6 md:p-8 shadow-lg bg-white border border-border">
          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-5">
              <LabelInputContainer>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
                  <Input id="email" type="email" placeholder="mail@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </LabelInputContainer>
              <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
                {loading ? "Отправляем..." : "Отправить код"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <LabelInputContainer>
                <Label htmlFor="code">Код из письма</Label>
                <Input id="code" placeholder="123456" className="text-center text-lg tracking-widest" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="password">Новый пароль</Label>
                <div className="relative">
                  <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Минимум 8 символов" className="pl-10 pr-10" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10">
                    {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                  </button>
                </div>
              </LabelInputContainer>

              <Button type="submit" className="w-full h-10 font-medium" disabled={loading || code.length !== 6 || newPassword.length < 8}>
                {loading ? "Сохраняем..." : "Сохранить пароль"}
              </Button>
              <Button type="button" variant="ghost" className="w-full text-sm" onClick={handleResend}>
                Отправить код повторно
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/login" className="text-primary font-medium hover:underline">Вернуться ко входу</Link>
        </p>
      </div>
    </div>
  );
};

const LabelInputContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-2">{children}</div>
);

export default ForgotPassword;

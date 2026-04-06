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

const Login = () => {
  const navigate = useNavigate();
  const { user, setAuthData } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/catalog", { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      setAuthData(data.user, data.access_token, data.refresh_token);
      navigate("/catalog");
    } catch (err) {
      if (err instanceof ApiException) {
        const errCode = err.error?.code;
        if (errCode === "email_not_verified") {
          toast.error("Подтвердите email перед входом");
          navigate(`/register?verify=${encodeURIComponent(email)}`);
        }
        else if (errCode === "too_many_requests") toast.error("Аккаунт заблокирован. Попробуйте через 15 минут");
        else if (errCode === "invalid_credentials") toast.error("Неверный email или пароль");
        else if (errCode === "validation_error") toast.error(err.error?.message || "Проверьте введённые данные");
        else toast.error(err.error?.message || "Ошибка входа");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full border border-border/60 shadow-sm bg-white/80 backdrop-blur-sm">
            <img src="https://api.oqyrman.app/minio/oqyrman/static/logo_circle.png" alt="Oqyrman" className="h-9 w-9 ring-1 ring-border/40 rounded-full" />
            <span className="text-xl font-bold text-primary">Oqyrman</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Войти в аккаунт</h1>
          <p className="text-muted-foreground mt-2">Добро пожаловать обратно</p>
        </div>

        <div className="rounded-2xl p-6 md:p-8 shadow-lg bg-white border border-border">
          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={(res) => handleGoogleSuccess(res.credential!)}
              onError={() => toast.error("Ошибка входа через Google")}
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
              <span className="bg-white px-2 text-muted-foreground">или</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <LabelInputContainer>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
                <Input id="email" type="email" placeholder="mail@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </LabelInputContainer>

            <LabelInputContainer>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Пароль</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Забыли пароль?</Link>
              </div>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={18} />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10">
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </LabelInputContainer>

            <Button type="submit" className="w-full h-10 font-medium" disabled={loading}>
              {loading ? "Входим..." : "Войти"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Нет аккаунта?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

const LabelInputContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-2">{children}</div>
);

export default Login;

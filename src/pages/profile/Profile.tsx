import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  IconUser,
  IconChartBar,
  IconQrcode,
  IconLock,
  IconCamera,
  IconBook,
  IconStar,
  IconClock,
  IconFileText,
} from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const tabs = [
  { id: "info", label: "Профиль", icon: IconUser },
  { id: "stats", label: "Статистика", icon: IconChartBar },
  { id: "qr", label: "QR-билет", icon: IconQrcode },
  { id: "password", label: "Пароль", icon: IconLock },
] as const;

type TabId = (typeof tabs)[number]["id"];

const Profile = () => {
  const { user, setAuthData } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>("info");

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-foreground mb-8"
      >
        Мой профиль
      </motion.h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === t.id
                ? "bg-primary text-white"
                : "text-foreground/60 hover:bg-muted/60"
            }`}
          >
            <t.icon size={16} stroke={1.5} />
            {t.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "info" && <ProfileInfo user={user} setAuthData={setAuthData} qc={qc} />}
        {activeTab === "stats" && <ProfileStats />}
        {activeTab === "qr" && <QrSection />}
        {activeTab === "password" && <ChangePassword />}
      </motion.div>
    </div>
  );
};

// ─── Info Tab ─────────────────────────────────────────────────────────────────

function ProfileInfo({
  user,
  setAuthData,
  qc,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  setAuthData: ReturnType<typeof useAuth>["setAuthData"];
  qc: ReturnType<typeof useQueryClient>;
}) {
  const [name, setName] = useState(user.name);
  const [surname, setSurname] = useState(user.surname);
  const fileRef = useRef<HTMLInputElement>(null);

  const updateMutation = useMutation({
    mutationFn: () => userApi.updateMe({ name, surname }),
    onSuccess: (updated) => {
      const at = localStorage.getItem("access_token") || "";
      const rt = localStorage.getItem("refresh_token") || "";
      setAuthData(updated, at, rt);
      toast.success("Профиль обновлён");
    },
    onError: () => toast.error("Ошибка обновления"),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: (updated) => {
      const at = localStorage.getItem("access_token") || "";
      const rt = localStorage.getItem("refresh_token") || "";
      setAuthData(updated, at, rt);
      qc.invalidateQueries({ queryKey: ["user"] });
      toast.success("Аватар обновлён");
    },
    onError: () => toast.error("Ошибка загрузки"),
  });

  const initials = `${user.name[0]}${user.surname[0]}`.toUpperCase();

  return (
    <div className="max-w-lg">
      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8">
        <div className="relative group">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-border"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
          >
            <IconCamera size={22} className="text-white" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) avatarMutation.mutate(file);
            }}
          />
        </div>
        <div>
          <p className="font-semibold text-foreground">
            {user.name} {user.surname}
          </p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Имя</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Фамилия</Label>
            <Input value={surname} onChange={(e) => setSurname(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user.email} disabled className="opacity-60" />
        </div>
        <Button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending || (name === user.name && surname === user.surname)}
        >
          {updateMutation.isPending ? "Сохраняем..." : "Сохранить"}
        </Button>
      </div>
    </div>
  );
}

// ─── Stats Tab ────────────────────────────────────────────────────────────────

function ProfileStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["user", "stats"],
    queryFn: () => userApi.getStats(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse h-28 rounded-xl bg-muted/40" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { icon: IconBook, label: "Книг прочитано", value: data.books_read, color: "from-emerald-500 to-teal-600" },
    { icon: IconFileText, label: "Страниц", value: data.pages_read, color: "from-teal-500 to-cyan-600" },
    { icon: IconClock, label: "Часов чтения", value: data.reading_time_hours, color: "from-cyan-500 to-blue-500" },
    { icon: IconStar, label: "Отзывов", value: data.reviews_count, color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-xl border border-border p-5 bg-white"
        >
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
            <s.icon size={20} className="text-white" stroke={1.5} />
          </div>
          <p className="text-2xl font-bold text-foreground">{s.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── QR Tab ───────────────────────────────────────────────────────────────────

function QrSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["user", "qr"],
    queryFn: () => userApi.getQr(),
  });

  return (
    <div className="max-w-sm mx-auto text-center">
      <div className="rounded-2xl border border-border p-8 bg-white">
        {isLoading ? (
          <div className="w-48 h-48 mx-auto rounded-xl bg-muted/40 animate-pulse" />
        ) : data?.qr_url ? (
          <img src={data.qr_url} alt="QR код" className="w-48 h-48 mx-auto" />
        ) : (
          <div className="w-48 h-48 mx-auto rounded-xl bg-muted/20 flex items-center justify-center">
            <IconQrcode size={48} className="text-muted-foreground/30" />
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-4">
          Покажите этот QR-код в библиотеке для идентификации
        </p>
      </div>
    </div>
  );
}

// ─── Password Tab ─────────────────────────────────────────────────────────────

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => userApi.changePassword(oldPassword, newPassword),
    onSuccess: () => {
      toast.success("Пароль изменён");
      setOldPassword("");
      setNewPassword("");
    },
    onError: () => toast.error("Неверный текущий пароль"),
  });

  return (
    <div className="max-w-sm space-y-5">
      <div className="space-y-2">
        <Label>Текущий пароль</Label>
        <Input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Новый пароль</Label>
        <Input
          type="password"
          placeholder="Минимум 8 символов"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
        />
      </div>
      <Button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || oldPassword.length < 1 || newPassword.length < 8}
      >
        {mutation.isPending ? "Сохраняем..." : "Изменить пароль"}
      </Button>
    </div>
  );
}

export default Profile;

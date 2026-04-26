import { useState, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { IconCamera, IconLock, IconTrash, IconAlertTriangle } from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { userApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  let d = digits;
  if (d[0] === "8") d = "7" + d.slice(1);
  if (d[0] !== "7") d = "7" + d;
  d = d.slice(0, 11);

  let result = "+7";
  if (d.length > 1) result += " (" + d.slice(1, 4);
  if (d.length >= 4) result += ") " + d.slice(4, 7);
  if (d.length >= 7) result += "-" + d.slice(7, 9);
  if (d.length >= 9) result += "-" + d.slice(9, 11);
  return result;
}

function phoneToRaw(formatted: string): string {
  const digits = formatted.replace(/\D/g, "");
  return digits.length >= 11 ? "+" + digits : "";
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const qc = useQueryClient();
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <div className="container mx-auto max-w-2xl px-4 lg:px-8 py-8">
      <PageHeader title={t("profile.title")} />

      <div className="space-y-8">
        <ProfileSection user={user} qc={qc} />

        {user.has_password && (
          <>
            <div className="border-t border-border" />
            <ChangePassword />
          </>
        )}

        <div className="border-t border-border" />
        <DeleteAccount signOut={signOut} />
      </div>
    </div>
  );
};

// ─── Profile Section ──────────────────────────────────────────────────────────

function ProfileSection({
  user,
  qc,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  qc: ReturnType<typeof useQueryClient>;
}) {
  const { t } = useTranslation();
  const { updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [surname, setSurname] = useState(user.surname);
  const [phone, setPhone] = useState(user.phone ? formatPhone(user.phone) : "");
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  }, []);

  const updateMutation = useMutation({
    mutationFn: () =>
      userApi.updateMe({
        name,
        surname,
        phone: phoneToRaw(phone) || undefined,
      }),
    onSuccess: (updated) => {
      updateUser(updated);
      toast.success(t("profile.updateSuccess"));
    },
    onError: () => toast.error(t("profile.updateError")),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: (updated) => {
      updateUser(updated);
      qc.invalidateQueries({ queryKey: ["user"] });
      toast.success(t("profile.avatarSuccess"));
    },
    onError: () => toast.error(t("profile.avatarError")),
  });

  const initials = `${user.name[0]}${user.surname[0]}`.toUpperCase();

  const isDirty =
    name !== user.name ||
    surname !== user.surname ||
    phoneToRaw(phone) !== (user.phone ?? "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
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
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-2xl font-bold">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("profile.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("profile.surname")}</Label>
            <Input value={surname} onChange={(e) => setSurname(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("profile.email")}</Label>
          <Input value={user.email} disabled className="opacity-60" />
        </div>
        <div className="space-y-2">
          <Label>{t("profile.phone")}</Label>
          <Input
            value={phone}
            onChange={handlePhoneChange}
            placeholder="+7 (___) ___-__-__"
            inputMode="tel"
          />
        </div>
        <Button
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending || !isDirty}
        >
          {updateMutation.isPending ? t("profile.saving") : t("profile.save")}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Change Password ──────────────────────────────────────────────────────────

function ChangePassword() {
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => userApi.changePassword(oldPassword, newPassword),
    onSuccess: () => {
      toast.success(t("profile.passwordSuccess"));
      setOldPassword("");
      setNewPassword("");
    },
    onError: () => toast.error(t("profile.passwordWrong")),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.05 }}
    >
      <div className="flex items-center gap-2 mb-5">
        <IconLock size={18} stroke={1.5} className="text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">{t("profile.changePasswordTitle")}</h2>
      </div>
      <div className="max-w-sm space-y-5">
        <div className="space-y-2">
          <Label>{t("profile.currentPassword")}</Label>
          <Input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("profile.newPassword")}</Label>
          <Input
            type="password"
            placeholder={t("profile.passwordPlaceholder")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
          />
        </div>
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || oldPassword.length < 1 || newPassword.length < 8}
        >
          {mutation.isPending ? t("profile.saving") : t("profile.changePassword")}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Delete Account ───────────────────────────────────────────────────────────

function DeleteAccount({ signOut }: { signOut: () => Promise<void> }) {
  const { t } = useTranslation();
  const [confirmText, setConfirmText] = useState("");
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: () => userApi.deleteMe(),
    onSuccess: async () => {
      toast.success(t("profile.deleteSuccess"));
      await signOut();
    },
    onError: () => toast.error(t("profile.deleteConfirmDesc")),
  });

  const deleteWord = t("profile.deleteWord");
  const confirmed = confirmText === deleteWord;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <IconTrash size={18} stroke={1.5} className="text-destructive" />
        <h2 className="text-lg font-semibold text-foreground">{t("profile.deleteAccount")}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        {t("profile.deleteAccountDesc2")}
      </p>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
            {t("profile.deleteAccount")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <IconAlertTriangle size={24} className="text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">{t("profile.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t("profile.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-2">
            <Label className="text-sm text-muted-foreground">
              {t("profile.deleteConfirmLabel", { word: deleteWord })}
            </Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={deleteWord}
              autoComplete="off"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmText("")}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={!confirmed || mutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {mutation.isPending ? t("profile.deleting") : t("profile.deletePermanent")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

export default Profile;

import { useQuery } from "@tanstack/react-query";
import { IconQrcode, IconPhone } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const LOGO_URL = "https://api.oqyrman.app/minio/oqyrman/static/logo_circle.png";

interface ReaderCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReaderCard({ open, onOpenChange }: ReaderCardProps) {
  const { user } = useAuth();

  const hasPhone = !!user?.phone;

  const { data: qrData, isLoading: qrLoading } = useQuery({
    queryKey: ["user", "qr"],
    queryFn: () => userApi.getQr(),
    enabled: open && hasPhone,
  });

  if (!user) return null;

  const initials = `${user.name[0]}${user.surname[0]}`.toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <DialogTitle className="sr-only">Читательский билет</DialogTitle>

        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary-light px-6 pt-6 pb-10 text-center relative">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={LOGO_URL} alt="Oqyrman" className="w-8 h-8 rounded-full" />
            <span className="text-lg font-bold text-white tracking-wide">
              Oqyrman
            </span>
          </div>
          <p className="text-xs text-white/70 uppercase tracking-widest">
            Читательский билет
          </p>
        </div>

        {/* Avatar — overlapping header and body */}
        <div className="flex justify-center -mt-8 relative z-10">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xl font-bold ring-4 ring-white shadow-lg">
              {initials}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-3 text-center">
          <h3 className="text-lg font-semibold text-foreground">
            {user.name} {user.surname}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
          {hasPhone && (
            <p className="text-sm text-muted-foreground">{user.phone}</p>
          )}

          {/* Divider */}
          <div className="my-4 border-t border-dashed border-border" />

          {hasPhone ? (
            <div className="flex flex-col items-center">
              {qrLoading ? (
                <div className="w-40 h-40 rounded-xl bg-muted/40 animate-pulse" />
              ) : qrData?.qr_code ? (
                <div className="bg-white p-3 rounded-xl shadow-sm border">
                  <QRCodeSVG value={qrData.qr_code} size={148} level="M" />
                </div>
              ) : (
                <div className="w-40 h-40 rounded-xl bg-muted/20 flex items-center justify-center">
                  <IconQrcode size={48} className="text-muted-foreground/30" />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                Покажите QR-код для получения книги
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <IconPhone size={28} className="text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Укажите номер телефона
              </p>
              <p className="text-xs text-muted-foreground mb-4 max-w-[240px]">
                Для активации читательского билета необходимо добавить номер телефона в профиле
              </p>
              <Button asChild size="sm" onClick={() => onOpenChange(false)}>
                <Link to="/profile">Перейти в профиль</Link>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

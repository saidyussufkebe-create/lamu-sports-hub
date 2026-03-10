import { Button } from "@/components/ui/button";
import {
  type LocalNotification,
  deleteLocalNotification,
  getLocalNotifications,
  getReadNotifIds,
  markAllNotifsRead,
  markNotifRead,
} from "@/utils/localStore";
import {
  AlertCircle,
  Bell,
  CheckCheck,
  Clock,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type NotifType = "alert" | "reminder" | "message";

function NotifIcon({ type }: { type: NotifType }) {
  const map = {
    alert: <AlertCircle className="w-4 h-4 text-accent" />,
    reminder: <Clock className="w-4 h-4 text-primary" />,
    message: <MessageSquare className="w-4 h-4 text-secondary" />,
  };
  return map[type] || <Bell className="w-4 h-4 text-muted-foreground" />;
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function NotificationsPage() {
  // Load local notifications + persist read state separately
  const [notifications, setNotifications] = useState<LocalNotification[]>(
    () => {
      const all = getLocalNotifications();
      const readIds = getReadNotifIds();
      return all.map((n) => ({
        ...n,
        isRead: n.isRead || readIds.includes(n.notificationId),
      }));
    },
  );

  const reload = () => {
    const all = getLocalNotifications();
    const readIds = getReadNotifIds();
    setNotifications(
      all.map((n) => ({
        ...n,
        isRead: n.isRead || readIds.includes(n.notificationId),
      })),
    );
  };

  const markAllRead = () => {
    const allIds = notifications.map((n) => n.notificationId);
    markAllNotifsRead(allIds);
    reload();
    toast.success("All notifications marked as read");
  };

  const markOneRead = (notifId: string) => {
    markNotifRead(notifId);
    reload();
  };

  const handleDelete = (notifId: string) => {
    deleteLocalNotification(notifId);
    reload();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div data-ocid="notifications.page" className="min-h-screen pb-24 pt-14">
      {/* Header */}
      <div
        className="px-4 py-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.14 0.06 252) 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1 className="font-display font-black text-2xl text-foreground flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              Notifications
              {unreadCount > 0 && (
                <span className="bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </h1>
          </motion.div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary hover:text-primary/80"
              onClick={markAllRead}
              data-ocid="notifications.mark_read.button"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 pt-4">
        {notifications.length === 0 ? (
          <div
            className="text-center py-16"
            data-ocid="notifications.empty_state"
          >
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">
              No notifications yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Officials can send notifications from the Admin Panel.
            </p>
          </div>
        ) : (
          <div className="space-y-2" data-ocid="notifications.list">
            {notifications.map((notif, i) => (
              <motion.div
                key={notif.notificationId}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                data-ocid={`notifications.item.${i + 1}`}
                onClick={() => {
                  if (!notif.isRead) markOneRead(notif.notificationId);
                }}
                className={`rounded-xl p-4 border transition-all cursor-pointer active:scale-[0.99] ${
                  notif.isRead
                    ? "bg-card border-border opacity-70"
                    : "bg-card border-primary/30 ring-1 ring-primary/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.type === "alert"
                        ? "bg-accent/20"
                        : notif.type === "reminder"
                          ? "bg-primary/20"
                          : "bg-secondary/20"
                    }`}
                  >
                    <NotifIcon type={notif.type as NotifType} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${notif.isRead ? "text-muted-foreground" : "text-foreground font-medium"}`}
                    >
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimestamp(notif.timestamp)}
                      </span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full capitalize"
                        style={{
                          backgroundColor:
                            notif.type === "alert"
                              ? "oklch(0.6 0.22 24 / 0.2)"
                              : notif.type === "reminder"
                                ? "oklch(0.55 0.18 252 / 0.2)"
                                : "oklch(0.82 0.08 82 / 0.2)",
                          color:
                            notif.type === "alert"
                              ? "oklch(0.6 0.22 24)"
                              : notif.type === "reminder"
                                ? "oklch(0.55 0.18 252)"
                                : "oklch(0.82 0.08 82)",
                        }}
                      >
                        {notif.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6 text-muted-foreground hover:text-red-400 flex-shrink-0"
                      data-ocid={`notifications.delete_button.${i + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notif.notificationId);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { PageHeader } from "@/components/shared";
import { useAuth } from "@/contexts/AuthContext";
import {
  useTheme,
  ACCENTS,
  type ThemeMode,
  type Accent,
} from "@/contexts/ThemeContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sun, Moon, Monitor, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProfileForm } from "./forms/ProfileForm";
import { ChangePasswordForm } from "./forms/ChangePasswordForm";

export function ProfilePage() {
  const { user } = useAuth();
  const { mode, accent, setMode, setAccent, reset } = useTheme();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Settings"
        description="Manage your account, security and appearance preferences."
      />

      <Tabs defaultValue="info">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="info">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <ProfileForm
              initialName={user?.name || ""}
              email={user?.email || ""}
            />
            <ChangePasswordForm />
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <Card className="rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border-none max-w-full">
            <CardHeader className="px-10 pt-10 pb-4">
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Choose how QMS looks for you</CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-10 space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Theme</h4>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      { v: "light", icon: Sun, label: "Light" },
                      { v: "dark", icon: Moon, label: "Dark" },
                      { v: "system", icon: Monitor, label: "System" },
                    ] as { v: ThemeMode; icon: any; label: string }[]
                  ).map((o) => (
                    <button
                      key={o.v}
                      onClick={() => setMode(o.v)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition flex flex-col items-center gap-2",
                        mode === o.v
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-border hover:bg-muted",
                      )}
                    >
                      <o.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{o.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Accent Colour</h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.value}
                      onClick={() => setAccent(a.value as Accent)}
                      className={cn(
                        "p-3 rounded-lg border-2 transition flex flex-col items-center gap-2",
                        accent === a.value
                          ? "border-primary"
                          : "border-border hover:border-muted-foreground",
                      )}
                    >
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `hsl(${a.hsl})` }}
                      >
                        {accent === a.value && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <span className="text-xs font-medium">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Preview</h4>
                <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Primary</Button>
                    <Button size="sm" variant="outline">
                      Outline
                    </Button>
                    <Button size="sm" variant="secondary">
                      Secondary
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Badge>Badge</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => toast.success("Appearance saved")}
                  className="rounded-full"
                >
                  Save preferences
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    reset();
                    toast.success("Reset to defaults");
                  }}
                  className="rounded-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card className="rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border-none max-w-full">
            <CardHeader className="px-10 pt-10 pb-4">
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-10 pb-10 space-y-2 text-sm">
              {[
                "Logged in from Chrome on macOS — Today, 09:12",
                "Downloaded user Handbook.pdf — Today, 09:50",
                "Previewed Quality Manual v3.docx — Yesterday, 14:20",
                "Updated profile — 3 days ago",
              ].map((t, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-muted text-muted-foreground"
                >
                  {t}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

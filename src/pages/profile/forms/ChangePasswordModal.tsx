import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface ChangePasswordModalProps {
  open: boolean;
  onPasswordChanged: () => void;
}

export function ChangePasswordModal({ open, onPasswordChanged }: ChangePasswordModalProps) {
  const { user, logout } = useAuth();
  
  // Use passwordChangeRequired from user object to determine if it's a forced change
  const isForced = user?.passwordChangeRequired === true;

  return (
    <Dialog open={open} onOpenChange={(val) => {
      // Prevent closing if it's a forced change
      if (!val && isForced) return;
    }}>
      <DialogContent 
        className={cn(
          "sm:max-w-[500px] p-0 border-none bg-transparent shadow-none gap-0",
          isForced && "[&>button]:hidden" // Hide close button if forced
        )}
        onPointerDownOutside={(e) => isForced && e.preventDefault()}
        onEscapeKeyDown={(e) => isForced && e.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            {isForced ? "You must change your password before continuing." : "Update your account password."}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <ChangePasswordForm onSuccess={onPasswordChanged} />
          
          {isForced && (
            <div className="flex justify-center mt-6">
              <button 
                onClick={logout}
                className="text-white/60 hover:text-white underline text-sm transition-colors font-medium focus:outline-none"
              >
                Logout and change later
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

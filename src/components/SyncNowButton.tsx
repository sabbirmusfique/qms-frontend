import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { startPermissionSync, getSyncJobStatus, type SyncJobStatus } from "@/services/permissionService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SyncState = "idle" | "pending" | "done" | "error";

interface Props {
  variant?: "default" | "compact";
  onComplete?: (result: NonNullable<SyncJobStatus["result"]>) => void;
}

export default function SyncNowButton({ variant = "default", onComplete }: Props) {
  const [state, setState] = useState<SyncState>("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<SyncJobStatus["result"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function stopPolling() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  async function startSync() {
    setState("pending");
    setJobId(null);
    setResult(null);
    setError(null);

    try {
      const { jobId: id } = await startPermissionSync();
      setJobId(id);
      startPolling(id);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        toast.error("A sync is already running. Please wait for it to complete.");
      } else {
        toast.error("Failed to start sync. Please try again.");
      }
      setState("idle");
    }
  }

  function startPolling(id: string) {
    intervalRef.current = setInterval(async () => {
      try {
        const statusData = await getSyncJobStatus(id);

        if (statusData.status === "completed") {
          stopPolling();
          setResult(statusData.result ?? null);
          setState("done");
          if (statusData.result) onComplete?.(statusData.result);
        } else if (statusData.status === "failed") {
          stopPolling();
          setError(statusData.error ?? "Unknown error");
          setState("error");
        }
      } catch {
        stopPolling();
        setState("idle");
      }
    }, 5000);
  }

  if (variant === "compact") {
    return (
      <div className="space-y-2">
        {state === "idle" && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={startSync}
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Sync Now
          </Button>
        )}

        {state === "pending" && (
          <Button variant="outline" size="sm" className="w-full mt-2" disabled>
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            Syncing...
          </Button>
        )}

        {state === "done" && result && (
          <div className="mt-2 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1 text-success">
              <CheckCircle2 className="h-3 w-3" />
              <span>Sync completed</span>
            </div>
            <div>{result.foldersScanned} folders scanned</div>
            <div>
              <span className="text-success">+{result.added}</span>
              {" / "}
              <span className="text-destructive">-{result.removed}</span>
              {" permissions"}
            </div>
            <div>Took {(result.durationMs / 1000).toFixed(1)}s</div>
          </div>
        )}

        {state === "error" && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-1 text-xs text-destructive">
              <AlertTriangle className="h-3 w-3" />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={startSync}>
              <RefreshCw className="h-3 w-3 mr-2" />
              Retry
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
        onClick={startSync}
        disabled={state === "pending"}
        className={cn(state === "done" && "border-success/50")}
      >
        {state === "pending" ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Syncing...</>
        ) : state === "done" ? (
          <><CheckCircle2 className="h-4 w-4 mr-2 text-success" />Sync Now</>
        ) : (
          <><RefreshCw className="h-4 w-4 mr-2" />Sync Now</>
        )}
      </Button>

      {state === "done" && result && (
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="font-medium text-foreground">Last sync result:</div>
          <div>• {result.foldersScanned} folders scanned</div>
          <div>• <span className="text-success">+{result.added} added</span></div>
          <div>• <span className="text-destructive">-{result.removed} removed</span></div>
          <div>• {(result.durationMs / 1000).toFixed(1)}s duration</div>
        </div>
      )}

      {state === "error" && (
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={startSync}>
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}

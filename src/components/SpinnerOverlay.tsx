import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface SpinnerOverlayProps {
  isLoading: boolean;
  title?: string;
  subtitle?: string;
  showAlert?: boolean;
  alertTitle?: string;
  alertDescription?: string;
}

export function SpinnerOverlay({
  isLoading,
  title = "Ładowanie...",
  subtitle = "To może potrwać kilka chwil.",
  showAlert = false,
  alertTitle = "Trwa przetwarzanie",
  alertDescription = "Proszę czekać na zakończenie operacji.",
}: SpinnerOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
      data-testid="spinner-overlay"
    >
      <div className="bg-background p-6 rounded-lg shadow-xl flex flex-col items-center max-w-md">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-muted-foreground mt-2">{subtitle}</p>
          {showAlert && (
            <Alert className="mt-4">
              <AlertTitle>{alertTitle}</AlertTitle>
              <AlertDescription>
                {alertDescription}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}

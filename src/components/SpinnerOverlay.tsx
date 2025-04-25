import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface SpinnerOverlayProps {
  isLoading: boolean;
}

export function SpinnerOverlay({ isLoading }: SpinnerOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-background p-6 rounded-lg shadow-xl flex flex-col items-center max-w-md">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium">Analizowanie tekstu...</h3>
          <p className="text-muted-foreground mt-2">To może potrwać kilka chwil.</p>
          <Alert className="mt-4">
            <AlertTitle>Trwa analiza</AlertTitle>
            <AlertDescription>
              Twój tekst jest obecnie analizowany pod kątem zgodności z GDPR. Wyniki zostaną wyświetlone po zakończeniu
              analizy.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface AnalyseButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export function AnalyseButton({ onClick, disabled, isLoading }: AnalyseButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full sm:w-auto px-6 py-2 mt-4"
      data-test-id="analyze-button"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analizowanie...
        </>
      ) : (
        "Analizuj"
      )}
    </Button>
  );
}

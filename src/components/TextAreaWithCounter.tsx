import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";

interface TextAreaWithCounterProps {
  value: string;
  onChange: (newValue: string) => void;
  maxLength: number;
  minLength: number;
  placeholder?: string;
  "aria-label"?: string;
}

export function TextAreaWithCounter({
  value,
  onChange,
  maxLength,
  minLength,
  placeholder = "Wprowadź tekst do analizy...",
  "aria-label": ariaLabel = "Pole tekstowe do wprowadzenia tekstu do analizy",
}: TextAreaWithCounterProps) {
  const isOverLimit = value.length > maxLength;
  const counterColor = isOverLimit ? "text-red-500" : "text-gray-500";

  return (
    <div className="relative space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`min-h-[300px] ${isOverLimit ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500" : ""}`}
      />
      <div className={`text-sm flex justify-end ${counterColor}`}>
        <span>
          {value.length} / {maxLength} znaków
        </span>
      </div>
      {isOverLimit && (
        <Alert variant="destructive">
          <AlertDescription>
            Przekroczono limit {maxLength} znaków. Tekst zostanie obcięty podczas analizy.
          </AlertDescription>
        </Alert>
      )}
      {value.length < minLength && value.length > 0 && (
        <Alert variant="default">
          <AlertDescription>Tekst powinien zawierać co najmniej {minLength} znaków.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { IssueCategory } from "@/types";

interface FilterControlsProps {
  availableCategories: IssueCategory[];
  selectedCategories: IssueCategory[];
  onFilterChange: (newFilters: IssueCategory[]) => void;
}

export function FilterControls({ availableCategories, selectedCategories, onFilterChange }: FilterControlsProps) {
  const handleCheckboxChange = (category: IssueCategory, isChecked: boolean) => {
    if (isChecked) {
      onFilterChange([...selectedCategories, category]);
    } else {
      onFilterChange(selectedCategories.filter((c) => c !== category));
    }
  };

  const getCategoryColors = (category: IssueCategory) => {
    const isSelected = selectedCategories.includes(category);

    const baseStyles = "border rounded-md px-3 py-2 transition-all duration-200";
    let variantStyles = "";

    switch (category) {
      case "critical":
        variantStyles = isSelected
          ? "bg-destructive/10 border-destructive/50"
          : "hover:bg-destructive/5 hover:border-destructive/30";
        break;
      case "important":
        variantStyles = isSelected
          ? "bg-amber-500/10 border-amber-500/50"
          : "hover:bg-amber-500/5 hover:border-amber-500/30";
        break;
      case "minor":
        variantStyles = isSelected
          ? "bg-secondary/20 border-secondary/50"
          : "hover:bg-secondary/5 hover:border-secondary/30";
        break;
    }

    return `${baseStyles} ${variantStyles}`;
  };

  return (
    <div className="space-y-3 mb-6 p-4 border rounded-lg bg-card shadow-sm">
      <h3 className="font-medium">Filtruj problemy według kategorii:</h3>
      <div className="flex flex-wrap gap-3">
        {availableCategories.map((category) => (
          <div key={category} className={getCategoryColors(category)}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`filter-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => handleCheckboxChange(category, checked as boolean)}
              />
              <label
                htmlFor={`filter-${category}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
              >
                {category}
              </label>
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground pt-1">
        {selectedCategories.length === 0
          ? "Wszystkie kategorie są widoczne"
          : `Aktywne filtry: ${selectedCategories.map((c) => c).join(", ")}`}
      </div>
    </div>
  );
}

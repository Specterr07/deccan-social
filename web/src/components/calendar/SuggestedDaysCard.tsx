"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SuggestedDay } from "@/data/suggestedDays";

type Props = { suggestions: SuggestedDay[]; onAdd: (suggestion: SuggestedDay) => void; onDismiss: (suggestion: SuggestedDay) => void };

// "Suggested days": festivals and food days for this month from the checked list, each with Add and Dismiss.
export function SuggestedDaysCard({ suggestions, onAdd, onDismiss }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested days</CardTitle>
        <CardDescription>From the official holiday list and UN food days.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.length === 0 && <p className="text-sm text-muted-foreground">Nothing left to suggest this month.</p>}
        {suggestions.map((suggestion) => (
          <div key={`${suggestion.date}-${suggestion.title}`} className="space-y-1.5 text-sm">
            <p><span className="text-muted-foreground">{suggestion.date.slice(8)} · </span><strong>{suggestion.title}</strong></p>
            {suggestion.note && <p className="text-xs text-muted-foreground">{suggestion.note}</p>}
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onAdd(suggestion)}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => onDismiss(suggestion)}>Dismiss</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

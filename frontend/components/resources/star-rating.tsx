/*
  StarRating – interactive star rating component.
  Can be read-only (for display) or interactive (for leaving a review).
*/

"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  onRate?: (rating: number) => void
  size?: "sm" | "md" | "lg"
  readonly?: boolean
}

export function StarRating({ rating, onRate, size = "md", readonly = false }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hovered || rating)
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onRate?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={cn(
              "transition-transform",
              !readonly && "cursor-pointer hover:scale-110",
              readonly && "cursor-default"
            )}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                isFilled ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/30"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

import { StarIcon } from "@/components/icons"

type RatingStarsProps = {
  value: number
}

export const RatingStars = ({ value }: RatingStarsProps) => {
  const filled = Math.round(Math.min(10, Math.max(0, value)) / 2)

  return (
    <div className="flex items-center gap-0.5 text-gold" aria-label={`Nota ${value ? value.toFixed(1) : "indisponível"}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <StarIcon key={index} filled={index < filled} />
      ))}
    </div>
  )
}

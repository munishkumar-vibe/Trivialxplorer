"use client";

interface CharCounterProps {
  current: number;
  max: number;
  label?: string;
}

export function CharCounter({ current, max, label }: CharCounterProps) {
  const isOver = current > max;
  const isNearLimit = current > max * 0.9;

  return (
    <span
      className={`char-counter${isOver ? " char-counter--over" : isNearLimit ? " char-counter--warn" : ""}`}
      aria-live="polite"
      aria-label={label ?? `${current} of ${max} characters`}
    >
      {current}/{max}
    </span>
  );
}

interface WordCounterProps {
  count: number;
  min?: number;
  max?: number;
}

export function WordCounter({ count, min = 500, max = 1500 }: WordCounterProps) {
  const isUnder = count < min;
  const isOver = count > max;
  const isGood = count >= min && count <= max;
  const over = count - max;

  let state: "gray" | "green" | "red" = "gray";
  if (isGood) state = "green";
  if (isOver) state = "red";

  return (
    <span className={`word-counter word-counter--${state}`} aria-live="polite">
      {count.toLocaleString()} / {max.toLocaleString()} words
      {isOver && <span className="word-counter-over"> ({over} over limit)</span>}
      {isUnder && count > 0 && (
        <span className="word-counter-under"> ({min - count} more needed)</span>
      )}
    </span>
  );
}

export function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

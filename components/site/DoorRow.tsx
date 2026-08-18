"use client";

import Link from "next/link";

export type Door = {
  label: string;
  who: string;
  detail: string;
  href: string;
};

export function DoorRow({
  doors,
  label,
  onChoose,
}: {
  doors: Door[];
  label: string;
  onChoose?: (href: string) => void;
}) {
  return (
    <nav className="doors" aria-label={label}>
      {doors.map((door, i) => (
        <Link
          key={door.href}
          className="door"
          href={door.href}
          onClick={() => onChoose?.(door.href)}
        >
          <span className="door__n" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="door__label">
            {door.label}
            <span className="arw" aria-hidden="true">
              →
            </span>
          </span>
          <span className="door__who">{door.who}</span>
          <span className="door__detail">{door.detail}</span>
        </Link>
      ))}
    </nav>
  );
}

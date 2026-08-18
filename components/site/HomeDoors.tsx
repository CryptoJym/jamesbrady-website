"use client";

import { DoorRow, type Door } from "./DoorRow";
import { ThisVisit } from "./ThisVisit";
import type { VisitDoor } from "@/lib/content/visits";
import { chooseVisitDoor } from "@/lib/visit/storage";

export function HomeDoors({
  doors,
  visitDoors,
}: {
  doors: Door[];
  visitDoors: VisitDoor[];
}) {
  return (
    <>
      <section className="doorway doorway--lead" aria-labelledby="doorway-h">
        <div className="wrap">
          <h2 className="doorway__h" id="doorway-h">
            What did you come here to do?
          </h2>
          <DoorRow
            label="Choose a starting point"
            doors={doors}
            onChoose={(href) => {
              const door = visitDoors.find((d) => d.href === href);
              if (door) chooseVisitDoor(door.id);
            }}
          />
        </div>
      </section>
      <ThisVisit doors={visitDoors} />
    </>
  );
}

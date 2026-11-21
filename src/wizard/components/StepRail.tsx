import { STEPS, STEP_IDS, firstIncomplete, href } from "../domain/steps";
import type { Data, StepId } from "../domain/types";

/**
 * Steps up to the first one with missing answers can be opened; later ones are locked.
 */
export default function StepRail({ step, data }: { step: StepId; data: Data }) {
  const missing = firstIncomplete(data);
  const reachable = STEP_IDS.indexOf(missing ?? "review");
  const current = STEP_IDS.indexOf(step);
  return (
    <nav aria-label="Booking steps" class="rail-nav">
      <ol class="rail" style={`--progress: ${current / (STEPS.length - 1)}`}>
        {STEPS.map(({ id, label }, index) => {
          const state =
            index === current
              ? "current"
              : index > reachable
                ? "locked"
                : id === missing
                  ? "todo"
                  : "done";
          const content = (
            <>
              <span class="rail-dot">{state === "done" ? "✓" : index + 1}</span>
              <span class="rail-label">{label}</span>
            </>
          );
          return (
            <li class={`rail-${state}`}>
              {state === "locked" ? (
                <span>{content}</span>
              ) : (
                <a href={href(id)} aria-current={state === "current" ? "step" : undefined}>
                  {content}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

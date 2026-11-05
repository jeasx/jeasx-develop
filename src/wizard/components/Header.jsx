import { SLUGS } from "../domain/constants";
import Progress from "./Progress";

const groups = [
  { label: "Start", links: [SLUGS.START, SLUGS.DAMAGE_TYPES] },
  {
    label: "Claim report",
    links: [SLUGS.CLAIM_REPORT, SLUGS.CLAIMANT, SLUGS.INJURED_PARTY, SLUGS.PERPETRATOR],
  },
  {
    label: "Damage details",
    links: [
      SLUGS.DAMAGE_DETAILS,
      SLUGS.DAMAGE_DETAILS_FOREIGN_VEHICLE,
      SLUGS.DAMAGE_DETAILS_OWN_VEHICLE,
      SLUGS.DAMAGE_DETAILS_ANIMAL_OR_OBJECT,
      SLUGS.DAMAGE_DETAILS_PERSON,
    ],
  },
  { label: "Legal notice", links: [SLUGS.LEGAL_NOTICE] },
  { label: "Thank you", links: [SLUGS.THANK_YOU] },
];

export default function Header({ path, data }) {
  const currentStep = groups.findIndex(({ links }) => links.includes(path));
  // On the last page all steps are completed, so "Thank you" is shown as done, too.
  const doneSteps = currentStep === groups.length - 1 ? groups.length : currentStep;

  return (
    <header class="wizard-header">
      <h1>Report a car insurance claim</h1>
      <nav aria-label="Steps">
        <ol class="wizard-steps">
          {/* Reached steps are links; later steps are shown, but can't be skipped to. */}
          {groups.map(({ label, links }, index) => (
            <li class={index < doneSteps ? "done" : index === currentStep ? "current" : ""}>
              {index <= currentStep ? (
                <a href={links[0]} aria-current={index === currentStep ? "step" : undefined}>
                  <span class="wizard-step-dot">{index < doneSteps ? "✓" : index + 1}</span>
                  <span class="wizard-step-label">{label}</span>
                </a>
              ) : (
                <span>
                  <span class="wizard-step-dot">{index + 1}</span>
                  <span class="wizard-step-label">{label}</span>
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <Progress url={path} data={data} />
    </header>
  );
}

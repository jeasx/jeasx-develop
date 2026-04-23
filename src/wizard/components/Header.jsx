import { SLUGS } from "../domain/constants";
import Progress from "./Progress";

const groups = [
  { label: "Start", links: [SLUGS.DAMAGE_TYPES] },
  {
    label: "Claim Report",
    links: [SLUGS.CLAIM_REPORT, SLUGS.CLAIMANT, SLUGS.INSURED, SLUGS.PERPETRATOR],
  },
  {
    label: "Damage Details",
    links: [
      SLUGS.DAMAGE_DETAILS,
      SLUGS.DAMAGE_DETAILS_FOREIGN_VEHICLE,
      SLUGS.DAMAGE_DETAILS_OWN_VEHICLE,
      SLUGS.DAMAGE_DETAILS_ANIMAL_OR_OBJECT,
      SLUGS.DAMAGE_DETAILS_PERSON,
    ],
  },
  { label: "Legal Notice", links: [SLUGS.LEGAL_NOTICE] },
  { label: "Thank You", links: [SLUGS.THANK_YOU] },
];

export default function Header({ path, data }) {
  const currentStep = groups.findIndex(({ links }) => links?.includes(path));

  return (
    <header>
      <h1>Your Car Insurance Claim Form</h1>
      <nav aria-label="breadcrumb">
        <ul>
          {groups.slice(0, currentStep + 1).map(({ label, links }) => (
            <li>
              <a href={links[0]}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <Progress url={path} data={data} />
    </header>
  );
}

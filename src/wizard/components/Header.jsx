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
  const currentStep = groups.findIndex(({ links }) => links?.includes(path));

  return (
    <header>
      <h1>Your car insurance claim form</h1>
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

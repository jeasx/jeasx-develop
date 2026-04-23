import flow from "../domain/flow";

export default function Progress({ data, url }) {
  const steps = flow(data);
  const currentStep = steps.findIndex((path) => path === url);

  return currentStep > 0 && <progress value={currentStep + 1} max={steps.length - 1} />;
}

import DefaultLayout from "../Layout";
import Summary from "./components/Summary";
import ErrorSummary from "./components/ErrorSummary";
import StepRail from "./components/StepRail";
import { STEPS } from "./domain/steps";
import type { Data, Errors, StepId } from "./domain/types";

/**
 * The frame of every step: the step rail on top, the form on the left, the boarding pass on
 * the right. The form carries the answers of the other steps, so the browser can validate
 * rules across steps (e.g. passports against the return date) without asking the server.
 */
export default function Layout({
  step,
  data,
  errors = {},
  children,
}: {
  step: StepId;
  data: Data;
  errors?: Errors;
  children: JSX.Element | JSX.Element[];
}) {
  const { title } = STEPS.find((s) => s.id === step);
  const { [step]: _, ...others } = data;
  return (
    <DefaultLayout
      title={`${title} - Trip booking`}
      description="Book a trip in four steps: a server-rendered wizard with validation across steps, shared by server and browser."
      css="/wizard/index.css"
      script="/wizard/index.js"
    >
      <div class="wizard">
        <header class="wizard-head">
          <p class="wizard-eyebrow">Jeasx Air · Booking</p>
          <h1>{title}</h1>
        </header>
        <StepRail step={step} data={data} />
        <div class="wizard-grid">
          <form
            method="post"
            class="wizard-form"
            novalidate
            data-step={step}
            data-state={JSON.stringify(others)}
          >
            <ErrorSummary errors={errors} />
            {children}
          </form>
          <Summary data={data} />
        </div>
      </div>
    </DefaultLayout>
  );
}

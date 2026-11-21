import DefaultLayout from "../Layout";
import { href } from "./domain/steps";

export default function () {
  return (
    <DefaultLayout title="Error 404 - Trip booking" css="/wizard/index.css">
      <div class="wizard">
        <header class="wizard-head">
          <p class="wizard-eyebrow">Jeasx Air · Lost luggage</p>
          <h1>This gate doesn't exist</h1>
          <p>
            <a href={href("trip")}>Back to your booking</a>
          </p>
        </header>
      </div>
    </DefaultLayout>
  );
}

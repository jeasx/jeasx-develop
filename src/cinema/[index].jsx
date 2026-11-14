import Layout from "../Layout";
import SeatMap from "./SeatMap";
import Summary from "./Summary";

export default function () {
  return (
    <Layout
      title="Cinema seat booking"
      description="Async JSX components render a seat map on the server and in the browser."
      css="/cinema/index.css"
      script="/cinema/index.js"
    >
      <h1>Cinema seat booking</h1>
      <p>
        Every row of seats and the booking summary are <strong>async</strong> components built with{" "}
        <a href="https://github.com/jeasx/jsx-async-runtime">jsx-async-runtime</a>, which load their
        data from <code>this.store</code>. The server renders the page with a store that reads a
        cookie. After a click, the browser re-renders only the parts which changed with the same
        components and a store that fetches the API. Other guests keep booking seats, so the browser
        refreshes the seats every 20 seconds.
      </p>
      <p>
        Without JavaScript, every seat is a button in a plain form, and the server renders the whole
        page.
      </p>
      <div class="cinema">
        <SeatMap />
        <Summary />
      </div>
    </Layout>
  );
}

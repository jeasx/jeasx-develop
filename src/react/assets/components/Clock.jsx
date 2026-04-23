// Code taken from https://medium.com/@dimterion/clock-with-reactjs-css-c2b56fbabd2c
import { useEffect, useRef } from "react";

function Clock() {
  const secondsRef = useRef(null);
  const minutesRef = useRef(null);
  const hoursRef = useRef(null);

  useEffect(() => {
    function setTime() {
      const now = new Date();

      const seconds = now.getSeconds();
      const secondsDegrees = (seconds / 60) * 360 + 90;
      secondsRef.current.style.transform = `rotate(${secondsDegrees}deg)`;

      const minutes = now.getMinutes();
      const minutesDegrees = (minutes / 60) * 360 + (seconds / 60) * 6 + 90;
      minutesRef.current.style.transform = `rotate(${minutesDegrees}deg)`;

      const hours = now.getHours();
      const hoursDegrees = (hours / 12) * 360 + (minutes / 60) * 30 + 90;
      hoursRef.current.style.transform = `rotate(${hoursDegrees}deg)`;
    }

    setTime();
    const intervalId = setInterval(setTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="clock">
      <section>
        <span ref={secondsRef}></span>
        <span ref={minutesRef}></span>
        <span ref={hoursRef}></span>
      </section>
    </div>
  );
}

export default Clock;

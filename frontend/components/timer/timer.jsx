import React, { useState, useEffect } from "react";

// Returns the time left until the event datetime
const getTimeLeft = (eventDate) => {
  const timeLeft = new Date(eventDate).getTime() - new Date().getTime();
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24)); 
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
};

const Timer = ({ eventDate }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(eventDate));

  useEffect(() => {
    // Updates the time left every second    
    const interval = setInterval(() => {
    setTimeLeft(getTimeLeft(eventDate));
  }, 1000);

  // Clean up the interval on unmount
  return () => clearInterval(interval);
}, [eventDate]);

return (
  <div>
    <p>
      {timeLeft.days} days, {timeLeft.hours} hours, {timeLeft.minutes}{" "}
      minutes, {timeLeft.seconds} seconds
    </p>
  </div>
);
};

export default Timer;
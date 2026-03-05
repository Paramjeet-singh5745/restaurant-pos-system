import React, { useEffect, useState, useMemo } from "react";

const Greeting = () => {
  const [dateTime, setDateTime] = useState(new Date());

  /* ===============================
     LIVE CLOCK
  ================================*/
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ===============================
     FORMATTING USING INTL
  ================================*/
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateTime);
  }, [dateTime]);

  const formattedTime = useMemo(() => {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(dateTime);
  }, [dateTime]);

  /* ===============================
     GREETING LOGIC
  ================================*/
  const currentHour = dateTime.getHours();

  const greetingData = useMemo(() => {
    if (currentHour < 12) {
      return { text: "Good Morning", icon: "🌅" };
    }
    if (currentHour < 18) {
      return { text: "Good Afternoon", icon: "🌞" };
    }
    return { text: "Good Evening", icon: "🌙" };
  }, [currentHour]);

  /* ===============================
     COMPONENT UI
  ================================*/
  return (
    <div className="bg-[#242424] rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

      {/* LEFT SIDE */}
      <div className="flex flex-col">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          {greetingData.icon} {greetingData.text}, Paramjeet
        </h1>

        <p className="text-gray-400 text-sm sm:text-base mt-2">
          Let’s give your best service today 🚀
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col items-start md:items-end">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide">
          {formattedTime}
        </h2>

        <p className="text-gray-400 text-sm sm:text-base mt-2">
          {formattedDate}
        </p>
      </div>
    </div>
  );
};

export default Greeting;
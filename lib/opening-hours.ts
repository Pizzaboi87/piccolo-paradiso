const OPEN_MINUTES = 9 * 60; // 12:00
const CLOSE_MINUTES_WEEKDAY = 22 * 60; // 22:00 (Hétfő-Szombat)
const CLOSE_MINUTES_SUNDAY = 21 * 60; // 21:00 (Vasárnap)

const getBudapestParts = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Budapest",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");

  return {
    weekday,
    minutesOfDay: hour * 60 + minute,
  };
};

export const isRestaurantOpen = (date: Date = new Date()) => {
  const { weekday, minutesOfDay } = getBudapestParts(date);
  const isSunday = weekday === "Sun";
  const closeMinutes = isSunday ? CLOSE_MINUTES_SUNDAY : CLOSE_MINUTES_WEEKDAY;

  return minutesOfDay >= OPEN_MINUTES && minutesOfDay < closeMinutes;
};


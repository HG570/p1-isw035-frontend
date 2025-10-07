import dayjs from "dayjs";

export function formatDate(isoString) {
  if (!isoString) return "";
  return dayjs(isoString).format("DD/MM/YYYY");
}

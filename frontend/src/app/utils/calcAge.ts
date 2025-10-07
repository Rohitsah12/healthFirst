export function calcAge(dobIso?: string | null) {
  if (!dobIso) return "-";
  const dob = new Date(dobIso);
  if (isNaN(dob.getTime())) return "-";
  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const m = now.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < dob.getUTCDate())) age--;
  return age;
}

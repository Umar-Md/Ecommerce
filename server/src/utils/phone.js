// Store Indian mobile numbers consistently so +91 and local input identify one account.
exports.normalizePhone = (value) => {
  if (typeof value !== "string") return null;
  let phone = value.trim().replace(/[\s()-]/g, "");
  if (phone.startsWith("+91")) phone = phone.slice(3);
  else if (phone.length === 12 && phone.startsWith("91")) phone = phone.slice(2);
  else if (phone.length === 11 && phone.startsWith("0")) phone = phone.slice(1);
  return /^[6-9]\d{9}$/.test(phone) ? phone : null;
};

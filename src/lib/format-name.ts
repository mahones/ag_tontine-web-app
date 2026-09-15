// Display convention for person names across the app: last name in full caps,
// first name(s) capitalized (handles compound/hyphenated prénoms) — e.g. "jean-pierre" /
// "DUPONT" (as typed) both render as "Jean-Pierre DUPONT".

function capitalizeWords(value: string): string {
  return value
    .toLocaleLowerCase("fr-FR")
    .split(/([\s-])/)
    .map((part) => (part === " " || part === "-" ? part : part.charAt(0).toLocaleUpperCase("fr-FR") + part.slice(1)))
    .join("");
}

export function formatFirstName(firstName: string): string {
  return capitalizeWords(firstName.trim());
}

export function formatLastName(lastName: string): string {
  return lastName.trim().toLocaleUpperCase("fr-FR");
}

export function formatPersonName(firstName: string, lastName: string): string {
  return `${formatFirstName(firstName)} ${formatLastName(lastName)}`;
}

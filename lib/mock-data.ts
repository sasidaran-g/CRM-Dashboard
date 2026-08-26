import type { Customer } from "./types";

const FIRST_NAMES = [
  "Alice", "Bob", "Charlie", "Diana", "Eleanor", "Frank", "Grace", "Henry",
  "Isla", "Jack", "Kara", "Liam", "Mia", "Noah", "Olivia", "Priya",
  "Quinn", "Rosa", "Sam", "Tara",
];

const LAST_NAMES = [
  "Green", "Ross", "Davis", "Henderson", "Chen", "Patel", "Nguyen", "Smith",
  "Baker", "Reyes", "Fischer", "Ito", "Okafor", "Silva", "Kim", "Novak",
];

const COMPANIES = [
  "Acme Corp", "Globex", "Stark Industries", "Innovate Solutions Inc.",
  "Initech", "Umbrella Corp", "Hooli", "Wayne Enterprises",
];

function mulberry32(seed: number) {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20260826);

function pick<T>(items: T[]): T {
  return items[Math.floor(random() * items.length)];
}

function generateCustomers(count: number): Customer[] {
  const customers: Customer[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const company = pick(COMPANIES);
    const status: Customer["status"] = random() > 0.3 ? "Active" : "Inactive";
    const daysAgo = Math.floor(random() * 365);
    const lastContactDate = new Date(
      Date.now() - daysAgo * 24 * 60 * 60 * 1000
    ).toISOString();
    const areaCode = 300 + Math.floor(random() * 700);
    const exchange = 100 + Math.floor(random() * 900);
    const line = 1000 + Math.floor(random() * 9000);

    customers.push({
      id: `cust-${i + 1}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${company
        .toLowerCase()
        .replace(/[^a-z]/g, "")}.com`,
      phone: `+1 (${areaCode}) ${exchange}-${line}`,
      company,
      status,
      lastContactDate,
    });
  }
  return customers;
}

export const mockCustomers: Customer[] = generateCustomers(150);

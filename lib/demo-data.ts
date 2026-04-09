export interface SurveyPoint {
  id: string;
  n: number;
  e: number;
  el: number;
}

export const DEMO_POINTS: SurveyPoint[] = [
  { id: "PN1", n: 5824.53, e: 55123.42, el: 12.34 },
  { id: "PN2", n: 5824.68, e: 55123.11, el: 12.51 },
  { id: "PN3", n: 5824.43, e: 55122.9, el: 11.89 },
  { id: "PN4", n: 5824.28, e: 55123.21, el: 12.12 },
];

export const RW5_LINES = [
  "SP,PN1,N 5824.530,E 55123.420,EL 12.34,--",
  "SP,PN2,N 5824.680,E 55123.110,EL 12.51,--",
  "SP,PN3,N 5824.430,E 55122.900,EL 11.89,--",
  "SP,PN4,N 5824.280,E 55123.210,EL 12.12,--",
];

export const DEMO_RESULTS = {
  area: "1.247 m²",
  perimeter: "142.8 m",
  traverse: "1:8.520 ✓",
  dimensions: ["42.15 m", "31.80 m", "38.92 m", "29.75 m"],
} as const;

export const DEMO_STEPS = [
  { num: 1, label: "Upload" },
  { num: 2, label: "Plot" },
  { num: 3, label: "Teken" },
  { num: 4, label: "Export" },
] as const;

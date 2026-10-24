export type Group = "previos" | "m1" | "m2" | "m3" | "m4" | "meta";

export interface Example {
  title: string;
  explanation: string;
  language: "c" | "pseudocode" | "text";
  code: string;
  output?: string;
}

export interface Topic {
  id: string;
  group: Group;
  title: string;
  requires: string[];
  summary: string;
  prior: string;
  why: string;
  examples: Example[];
}

export interface GroupColor {
  light: string;
  dark: string;
}

export interface GroupDefinition {
  id: Group;
  name: string;
  color: GroupColor;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  groups: GroupDefinition[];
  topics: Topic[];
}

export type TopicStatus = "completed" | "available" | "pending";

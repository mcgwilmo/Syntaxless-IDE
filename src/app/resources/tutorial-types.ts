export type Example = {
  id: string;
  strict: string[];
  standard: string[];
  abstraction: string[];
  pseudocode: string[];
};

export type Topic = {
  id: string;
  title: string;
  definition: string;
  howAndWhy: string;
  examples: Example[];
};

export type Lesson = {
  id: string;
  number: number;
  title: string;
  overview: string;
  topics: Topic[];
};

export type TabId = "operators" | "data-structures-algorithms";

export type TutorialTab = {
  id: TabId;
  title: string;
  shortTitle: string;
  description: string;
  status: "ready" | "planned";
};

export function example(
  id: string,
  strict: string[],
  standard: string[],
  abstraction: string[],
  pseudocode: string[]
): Example {
  return { id, strict, standard, abstraction, pseudocode };
}

export function topic(
  id: string,
  title: string,
  definition: string,
  howAndWhy: string,
  examples: Example[]
): Topic {
  return { id, title, definition, howAndWhy, examples };
}

export function lesson(
  id: string,
  number: number,
  title: string,
  overview: string,
  topics: Topic[]
): Lesson {
  return { id, number, title, overview, topics };
}

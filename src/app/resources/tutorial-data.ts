import { TAB_ONE_LESSONS_PART_1 } from "./tutorial-lessons-part1";
import { TAB_ONE_LESSONS_PART_2 } from "./tutorial-lessons-part2";
import { TAB_ONE_LESSONS_PART_3 } from "./tutorial-lessons-part3";
import { TAB_ONE_LESSONS_PART_4 } from "./tutorial-lessons-part4";
import { TAB_TWO_LESSONS } from "./tutorial-lessons-tab2";
import type { Example, Lesson, TabId, TutorialTab } from "./tutorial-types";

export type {
  Example,
  Lesson,
  TabId,
  Topic,
  TutorialTab,
} from "./tutorial-types";

function normalizeWhitespace(line: string) {
  return line.trim().replace(/\s+/g, " ");
}

function lowerStrictAllCaps(line: string) {
  return line.replace(/\b[A-Z]{2,}(?: [A-Z]{2,})*\b/g, (match) =>
    match.toLowerCase()
  );
}

function inferInitializationKind(name: string, expression?: string) {
  const normalizedName = name.toLowerCase();
  const normalizedExpression = expression?.toLowerCase() ?? "";

  if (
    normalizedExpression.startsWith("[") ||
    normalizedExpression.startsWith("{") ||
    normalizedExpression.startsWith("(") ||
    normalizedExpression.includes("empty list") ||
    normalizedExpression.includes("empty map") ||
    normalizedExpression.includes("empty array") ||
    normalizedExpression.includes("empty set") ||
    normalizedExpression.includes("empty dictionary") ||
    normalizedExpression.includes("table ") ||
    normalizedExpression.includes("array ") ||
    normalizedExpression.includes("linkedlist") ||
    normalizedExpression.includes("list()") ||
    normalizedExpression.includes("dict") ||
    normalizedExpression.includes("map")
  ) {
    return "data structure";
  }

  if (
    /(?:list|queue|heap|tree|graph|table|array|map|set|bucket|visited|parent|distance|order|result|scores|tasks|values|subjects|grades|colors|names|items|activities|dp)$/i.test(
      normalizedName
    )
  ) {
    return "data structure";
  }

  return "variable";
}

function makeInitializationLine(
  name: string,
  expression?: string,
  scope: "local" | "global" = "local"
) {
  const kind = inferInitializationKind(name, expression);

  if (scope === "global") {
    return `Make a global ${kind} named ${name}.`;
  }

  return `Make a ${kind} named ${name}.`;
}

function normalizeNonStrictAssignment(line: string) {
  let match = line.match(
    /^Set ([A-Za-z_][\w]*) to (.+) and set ([A-Za-z_][\w]*) to (.+)\.$/i
  );

  if (match) {
    return `Assign ${match[2]} to ${match[1]} and ${match[4]} to ${match[3]}.`;
  }

  match = line.match(
    /^Set ([A-Za-z_][\w]*) to (.+) and ([A-Za-z_][\w]*) to (.+)\.$/i
  );

  if (match) {
    return `Assign ${match[2]} to ${match[1]} and ${match[4]} to ${match[3]}.`;
  }

  match = line.match(
    /^Make a variable called ([A-Za-z_][\w]*) and set it to (.+)\.$/i
  );

  if (match) {
    return `Assign ${match[2]} to ${match[1]}.`;
  }

  match = line.match(
    /^Create a global variable called ([A-Za-z_][\w]*) and set it to (.+)\.$/i
  );

  if (match) {
    return `Assign ${match[2]} to the global variable ${match[1]}.`;
  }

  match = line.match(/^Set the global variable ([A-Za-z_][\w]*) to (.+)\.$/i);

  if (match) {
    return `Assign ${match[2]} to the global variable ${match[1]}.`;
  }

  match = line.match(/^Set the key (.+?) in ([A-Za-z_][\w]*) to (.+)\.$/i);

  if (match) {
    return `Assign ${match[3]} to the key ${match[1]} in ${match[2]}.`;
  }

  match = line.match(/^Set item (.+?) of ([A-Za-z_][\w]*) to (.+)\.$/i);

  if (match) {
    return `Assign ${match[3]} to item ${match[1]} of ${match[2]}.`;
  }

  match = line.match(/^Set ([A-Za-z_][\w]*(?:\[[^\]]+\])+) to (.+)\.$/i);

  if (match) {
    return `Assign ${match[2]} to ${match[1]}.`;
  }

  match = line.match(
    /^Set ([A-Za-z_][\w]*(?:\.[A-Za-z_][\w]*(?:\[[^\]]+\])*)+) to (.+)\.$/i
  );

  if (match) {
    return `Assign ${match[2]} to ${match[1]}.`;
  }

  match = line.match(
    /^Set ([A-Za-z_][\w]*(?:\.[A-Za-z_][\w]*)+) to (.+)\.$/i
  );

  if (match) {
    return `Assign ${match[2]} to ${match[1]}.`;
  }

  match = line.match(/^Set ([^.]*) to (.+)\.$/i);

  if (match) {
    return `Assign ${match[2]} to ${match[1]}.`;
  }

  match = line.match(
    /^Set ([A-Za-z_][\w]*(?:\.[A-Za-z_][\w]*)*) when (.+)\.$/i
  );

  if (match) {
    return `Update ${match[1]} when ${match[2]}.`;
  }

  return line;
}

function normalizeNonStrictLines(lines: string[]) {
  return lines
    .map((line) => normalizeWhitespace(line))
    .map((line) => normalizeNonStrictAssignment(line))
    .filter((line) => line.length > 0);
}

function normalizeStrictLines(lines: string[]) {
  const initialized = new Set<string>();
  const normalized: string[] = [];

  function pushLine(line: string) {
    normalized.push(lowerStrictAllCaps(normalizeWhitespace(line)));
  }

  function registerParameters(text: string) {
    for (const token of text
      .split(",")
      .flatMap((part) => part.split(" and "))
      .map((part) => part.trim())
      .filter(Boolean)) {
      const match = token.match(/[A-Za-z_][\w]*/);

      if (match) {
        initialized.add(match[0]);
      }
    }
  }

  for (const rawLine of lines) {
    const line = normalizeWhitespace(rawLine);

    if (!line) {
      continue;
    }

    let match = line.match(/that takes (.+)\.$/i);

    if (match) {
      registerParameters(match[1]);
      pushLine(line);
      continue;
    }

    match = line.match(/^Initialize a variable called ([A-Za-z_][\w]*)\.$/i);

    if (match) {
      initialized.add(match[1]);
      pushLine(makeInitializationLine(match[1]));
      continue;
    }

    match = line.match(/^Initialize a variable named ([A-Za-z_][\w]*)\.$/i);

    if (match) {
      initialized.add(match[1]);
      pushLine(makeInitializationLine(match[1]));
      continue;
    }

    match = line.match(/^Let ([A-Za-z_][\w]*) = (.+)\.$/i);

    if (match) {
      if (!initialized.has(match[1])) {
        initialized.add(match[1]);
        pushLine(makeInitializationLine(match[1], match[2]));
      }

      pushLine(`Assign ${match[2]} to ${match[1]}.`);
      continue;
    }

    match = line.match(/^Make ([A-Za-z_][\w]*) equal (.+)\.$/i);

    if (match) {
      if (!initialized.has(match[1])) {
        initialized.add(match[1]);
        pushLine(makeInitializationLine(match[1], match[2]));
      }

      pushLine(`Assign ${match[2]} to ${match[1]}.`);
      continue;
    }

    match = line.match(/^Create empty ([A-Za-z_][\w]*) list\.$/i);

    if (match) {
      if (!initialized.has(match[1])) {
        initialized.add(match[1]);
        pushLine(makeInitializationLine(match[1], "empty list"));
      }

      pushLine(`Assign an empty list to ${match[1]}.`);
      continue;
    }

    match = line.match(/^Create empty ([A-Za-z_][\w]*)\.$/i);

    if (match) {
      if (!initialized.has(match[1])) {
        initialized.add(match[1]);
        pushLine(makeInitializationLine(match[1], "empty value"));
      }

      pushLine(`Assign an empty value to ${match[1]}.`);
      continue;
    }

    match = line.match(/^Create table ([A-Za-z_][\w]*)(.*)\.$/i);

    if (match) {
      if (!initialized.has(match[1])) {
        initialized.add(match[1]);
        pushLine(makeInitializationLine(match[1], "table"));
      }

      pushLine(`Assign a table${match[2]} to ${match[1]}.`);
      continue;
    }

    match = line.match(/^Create array ([A-Za-z_][\w]*)(\[[^\]]+\])?(.*)\.$/i);

    if (match) {
      if (!initialized.has(match[1])) {
        initialized.add(match[1]);
        pushLine(makeInitializationLine(match[1], "array"));
      }

      const arrayDetails = `${match[2] ?? ""}${match[3] ?? ""}`.trim();
      pushLine(
        arrayDetails
          ? `Assign an array ${arrayDetails} to ${match[1]}.`
          : `Assign an empty array to ${match[1]}.`
      );
      continue;
    }

    match = line.match(/^Create new ([A-Za-z_][\w]*) with (.+)\.$/i);

    if (match) {
      if (!initialized.has(match[1])) {
        initialized.add(match[1]);
        pushLine(makeInitializationLine(match[1], match[2]));
      }

      pushLine(`Assign a new value with ${match[2]} to ${match[1]}.`);
      continue;
    }

    match = line.match(/^Create ([A-Za-z_][\w]*) as (.+)\.$/i);

    if (match) {
      if (!initialized.has(match[1])) {
        initialized.add(match[1]);
        pushLine(makeInitializationLine(match[1], match[2]));
      }

      pushLine(`Assign ${match[2]} to ${match[1]}.`);
      continue;
    }

    match = line.match(/^Create ([A-Za-z_][\w]*) using (.+)\.$/i);

    if (match) {
      if (!initialized.has(match[1])) {
        initialized.add(match[1]);
        pushLine(makeInitializationLine(match[1], match[2]));
      }

      pushLine(`Assign ${match[2]} to ${match[1]}.`);
      continue;
    }

    match = line.match(/^Create ([A-Za-z_][\w]*) of (.+)\.$/i);

    if (match) {
      if (!initialized.has(match[1])) {
        initialized.add(match[1]);
        pushLine(makeInitializationLine(match[1], match[2]));
      }

      pushLine(`Assign ${match[2]} to ${match[1]}.`);
      continue;
    }

    match = line.match(/^Create ([A-Za-z_][\w]*) with (.+)\.$/i);

    if (match) {
      if (!initialized.has(match[1])) {
        initialized.add(match[1]);
        pushLine(makeInitializationLine(match[1], match[2]));
      }

      pushLine(`Assign ${match[2]} to ${match[1]}.`);
      continue;
    }

    match = line.match(/^Create ([A-Za-z_][\w]*)\.$/i);

    if (
      match &&
      !/^(?:a|an|the)$/i.test(match[1]) &&
      !/^(?:class|function|generator)$/i.test(match[1])
    ) {
      if (!initialized.has(match[1])) {
        initialized.add(match[1]);
        pushLine(makeInitializationLine(match[1]));
      }

      continue;
    }

    match = line.match(/^Create a class called (.+)\.$/i);

    if (match) {
      pushLine(`Create a class named ${match[1]}.`);
      continue;
    }

    match = line.match(/^Set the global variable ([A-Za-z_][\w]*) to (.+)\.$/i);

    if (match) {
      if (!initialized.has(match[1])) {
        initialized.add(match[1]);
        pushLine(makeInitializationLine(match[1], match[2], "global"));
      }

      pushLine(`Assign ${match[2]} to the global variable ${match[1]}.`);
      continue;
    }

    match = line.match(/^Set the key (.+?) in ([A-Za-z_][\w]*) to (.+)\.$/i);

    if (match) {
      pushLine(`Assign ${match[3]} to the key ${match[1]} in ${match[2]}.`);
      continue;
    }

    match = line.match(/^Set item (.+?) of ([A-Za-z_][\w]*) to (.+)\.$/i);

    if (match) {
      pushLine(`Assign ${match[3]} to item ${match[1]} of ${match[2]}.`);
      continue;
    }

    match = line.match(/^Set ([A-Za-z_][\w]*(?:\[[^\]]+\])+) to (.+)\.$/i);

    if (match) {
      const baseMatch = match[1].match(/^([A-Za-z_][\w]*)\[/);

      if (baseMatch && !initialized.has(baseMatch[1])) {
        initialized.add(baseMatch[1]);
        pushLine(makeInitializationLine(baseMatch[1], "data structure"));
      }

      pushLine(`Assign ${match[2]} to ${match[1]}.`);
      continue;
    }

    match = line.match(
      /^Set ([A-Za-z_][\w]*(?:\.[A-Za-z_][\w]*(?:\[[^\]]+\])*)+) to (.+)\.$/i
    );

    if (match) {
      pushLine(`Assign ${match[2]} to ${match[1]}.`);
      continue;
    }

    match = line.match(
      /^Set ([A-Za-z_][\w]*(?:\.[A-Za-z_][\w]*)+) to (.+)\.$/i
    );

    if (match) {
      pushLine(`Assign ${match[2]} to ${match[1]}.`);
      continue;
    }

    match = line.match(/^Set ([A-Za-z_][\w]*) to (.+)\.$/i);

    if (match) {
      if (!initialized.has(match[1])) {
        initialized.add(match[1]);
        pushLine(makeInitializationLine(match[1], match[2]));
      }

      pushLine(`Assign ${match[2]} to ${match[1]}.`);
      continue;
    }

    pushLine(line);
  }

  return normalized;
}

function normalizeExample(example: Example): Example {
  return {
    ...example,
    strict: normalizeStrictLines(example.strict),
    standard: normalizeNonStrictLines(example.standard),
    abstraction: normalizeNonStrictLines(example.abstraction),
  };
}

function normalizeLessons(lessons: Lesson[]): Lesson[] {
  return lessons.map((lesson) => ({
    ...lesson,
    topics: lesson.topics.map((topic) => ({
      ...topic,
      examples: topic.examples.map(normalizeExample),
    })),
  }));
}

export const TUTORIAL_TABS: TutorialTab[] = [
  {
    id: "operators",
    title: "Operators, Primitives and Logic Structures",
    shortTitle: "Operators, Primitives and Logic Structures",
    description:
      "Start with values, operators, collections, logic, and program structure. The goal is learning how to express computational ideas clearly in Strict, Standard, and Abstraction mode, then connect them to structured pseudocode.",
    status: "ready",
  },
  {
    id: "data-structures-algorithms",
    title: "Data Structures and Algorithms",
    shortTitle: "Data Structures and Algorithms",
    description:
      "Learn core data structures as designed objects and core algorithms as reusable strategies, each shown in Strict, Standard, and Abstraction mode before being mirrored in structured pseudocode.",
    status: "ready",
  },
];

export const TAB_ONE_LESSONS = normalizeLessons([
  ...TAB_ONE_LESSONS_PART_1,
  ...TAB_ONE_LESSONS_PART_2,
  ...TAB_ONE_LESSONS_PART_3,
  ...TAB_ONE_LESSONS_PART_4,
]);

export const LESSONS_BY_TAB: Record<TabId, Lesson[]> = {
  operators: TAB_ONE_LESSONS,
  "data-structures-algorithms": normalizeLessons(TAB_TWO_LESSONS),
};

export function getLessonsForTab(tabId: TabId) {
  return LESSONS_BY_TAB[tabId];
}

export function getFirstTopicId(tabId: TabId, lessonId?: string) {
  const lessons = LESSONS_BY_TAB[tabId];

  if (lessonId) {
    const lesson = lessons.find((item) => item.id === lessonId);
    return lesson?.topics[0]?.id ?? lessons[0]?.topics[0]?.id ?? "";
  }

  return lessons[0]?.topics[0]?.id ?? "";
}

export function findTopicById(tabId: TabId, id: string) {
  const lessons = LESSONS_BY_TAB[tabId];

  for (const lesson of lessons) {
    const topic = lesson.topics.find((item) => item.id === id);

    if (topic) {
      return { lesson, topic };
    }
  }

  const fallbackLesson = lessons[0]!;
  return {
    lesson: fallbackLesson,
    topic: fallbackLesson.topics[0]!,
  };
}

export function isTabId(value: string): value is TabId {
  return value === "operators" || value === "data-structures-algorithms";
}

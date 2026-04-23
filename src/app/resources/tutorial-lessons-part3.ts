import { example, lesson, topic, type Lesson } from "./tutorial-types";

export const TAB_ONE_LESSONS_PART_3: Lesson[] = [
  lesson(
    "tuples-and-tuple-operations",
    8,
    "Tuples and tuple operations",
    "A tuple is an ordered collection like a list, but it is meant to stay fixed after creation. Tuples are useful for grouped values that belong together and should not be changed casually.",
    [
      topic(
        "creating-tuples",
        "Creating tuples",
        "Creating a tuple means storing a fixed group of values together.",
        "This is used for coordinates, date parts, color values, and any bundle that should behave like one unit.",
        [
              example(
                "creating-tuples-example",
                [
                  "Set point to (4, 9).",
                  "Print point."
                ],
                [
                  "Create a tuple point with 4 and 9, then print it."
                ],
                [
                  "Print the tuple (4, 9)."
                ],
                [
                  "SET point TO (4, 9)",
                  "PRINT point"
                ]
              )
            ]
      ),
      topic(
        "accessing-tuple-items",
        "Accessing tuple items",
        "Tuple items can be accessed by position just like list items.",
        "This is used when the grouped values have predictable meaning by order.",
        [
              example(
                "accessing-tuple-items-example",
                [
                  "Set point to (4, 9).",
                  "Set x_value to ITEM 0 OF point.",
                  "Print x_value."
                ],
                [
                  "Set point to (4, 9).",
                  "Print item 0 of point."
                ],
                [
                  "Print the first item of (4, 9)."
                ],
                [
                  "SET point TO (4, 9)",
                  "SET x_value TO ITEM 0 OF point",
                  "PRINT x_value"
                ]
              )
            ]
      ),
      topic(
        "unpacking-tuples",
        "Unpacking tuples",
        "Unpacking means taking the separate values from a tuple and storing them in separate variables.",
        "This makes grouped output easier to reuse in later calculations.",
        [
              example(
                "unpacking-tuples-example",
                [
                  "Set point to (4, 9).",
                  "Set x to FIRST ITEM OF point.",
                  "Set y to SECOND ITEM OF point.",
                  "Print x.",
                  "Print y."
                ],
                [
                  "Set point to (4, 9).",
                  "Unpack it into x and y, then print both."
                ],
                [
                  "Print the two unpacked values from (4, 9)."
                ],
                [
                  "SET point TO (4, 9)",
                  "SET x TO FIRST ITEM OF point",
                  "SET y TO SECOND ITEM OF point",
                  "PRINT x",
                  "PRINT y"
                ]
              )
            ]
      ),
      topic(
        "length-and-membership",
        "Length and membership",
        "Tuples support checks like length and membership even though they are fixed.",
        "These operations are useful when the tuple is used like a protected list of options or values.",
        [
              example(
                "length-and-membership-example",
                [
                  "Set point to (4, 9).",
                  "Set has_nine to 9 IS IN point.",
                  "Print has_nine."
                ],
                [
                  "Set point to (4, 9).",
                  "Check whether 9 is in point and print the result."
                ],
                [
                  "Print whether 9 appears in (4, 9)."
                ],
                [
                  "SET point TO (4, 9)",
                  "SET has_nine TO 9 IS IN point",
                  "PRINT has_nine"
                ]
              )
            ]
      ),
    ]
  ),
  lesson(
    "sets-and-set-operations",
    9,
    "Sets and set operations",
    "A set is an unordered collection of unique values. Sets are useful when duplicates do not matter and the main goal is fast membership, uniqueness, or set-style comparison.",
    [
      topic(
        "creating-sets",
        "Creating sets",
        "Creating a set means storing unique values together without caring about order.",
        "Sets are used for tags, categories, permissions, and duplicate removal.",
        [
              example(
                "creating-sets-example",
                [
                  "Set subjects to {\"math\", \"science\", \"history\"}.",
                  "Print subjects."
                ],
                [
                  "Create a set subjects with math, science, and history, then print it."
                ],
                [
                  "Print the set {\"math\", \"science\", \"history\"}."
                ],
                [
                  "SET subjects TO {\"math\", \"science\", \"history\"}",
                  "PRINT subjects"
                ]
              )
            ]
      ),
      topic(
        "adding-items",
        "Adding items",
        "Adding inserts a value into the set if it is not already present.",
        "This is used to build a unique collection over time.",
        [
              example(
                "adding-items-example",
                [
                  "Set subjects to {\"math\", \"science\"}.",
                  "Add \"art\" to subjects.",
                  "Print subjects."
                ],
                [
                  "Set subjects to {\"math\", \"science\"}.",
                  "Add \"art\" and print subjects."
                ],
                [
                  "Print subjects after adding \"art\"."
                ],
                [
                  "SET subjects TO {\"math\", \"science\"}",
                  "ADD \"art\" TO subjects",
                  "PRINT subjects"
                ]
              )
            ]
      ),
      topic(
        "removing-items",
        "Removing items",
        "Removing deletes a value from the set.",
        "This is used when access, labels, or categories change.",
        [
              example(
                "removing-items-example",
                [
                  "Set subjects to {\"math\", \"science\", \"art\"}.",
                  "Remove \"science\" from subjects.",
                  "Print subjects."
                ],
                [
                  "Set subjects to {\"math\", \"science\", \"art\"}.",
                  "Remove \"science\" and print subjects."
                ],
                [
                  "Print subjects after removing \"science\"."
                ],
                [
                  "SET subjects TO {\"math\", \"science\", \"art\"}",
                  "REMOVE \"science\" FROM subjects",
                  "PRINT subjects"
                ]
              )
            ]
      ),
      topic(
        "membership-in-sets",
        "Membership in sets",
        "Membership checks test whether a value is part of the set.",
        "This is one of the main reasons sets exist because membership checks are simple and meaningful.",
        [
              example(
                "membership-in-sets-example",
                [
                  "Set subjects to {\"math\", \"science\", \"art\"}.",
                  "Set has_math to \"math\" IS IN subjects.",
                  "Print has_math."
                ],
                [
                  "Set subjects to {\"math\", \"science\", \"art\"}.",
                  "Check whether \"math\" is in subjects and print the result."
                ],
                [
                  "Print whether \"math\" is in the subjects set."
                ],
                [
                  "SET subjects TO {\"math\", \"science\", \"art\"}",
                  "SET has_math TO \"math\" IS IN subjects",
                  "PRINT has_math"
                ]
              )
            ]
      ),
      topic(
        "union",
        "Union",
        "A union combines all unique values from two sets.",
        "This is used when two groups must be merged without duplicates.",
        [
              example(
                "union-example",
                [
                  "Set group_a to {\"Ava\", \"Noah\"}.",
                  "Set group_b to {\"Noah\", \"Liam\"}.",
                  "Set everyone to UNION OF group_a AND group_b.",
                  "Print everyone."
                ],
                [
                  "Set group_a to {\"Ava\", \"Noah\"} and group_b to {\"Noah\", \"Liam\"}.",
                  "Find their union and print everyone."
                ],
                [
                  "Print the union of {\"Ava\", \"Noah\"} and {\"Noah\", \"Liam\"}."
                ],
                [
                  "SET group_a TO {\"Ava\", \"Noah\"}",
                  "SET group_b TO {\"Noah\", \"Liam\"}",
                  "SET everyone TO UNION OF group_a AND group_b",
                  "PRINT everyone"
                ]
              )
            ]
      ),
      topic(
        "intersection",
        "Intersection",
        "An intersection keeps only the values that appear in both sets.",
        "It is used to find overlap, shared permissions, or common interests.",
        [
              example(
                "intersection-example",
                [
                  "Set club_a to {\"Ava\", \"Noah\", \"Liam\"}.",
                  "Set club_b to {\"Noah\", \"Liam\", \"Maya\"}.",
                  "Set shared_students to INTERSECTION OF club_a AND club_b.",
                  "Print shared_students."
                ],
                [
                  "Set club_a to {\"Ava\", \"Noah\", \"Liam\"} and club_b to {\"Noah\", \"Liam\", \"Maya\"}.",
                  "Find their intersection and print shared_students."
                ],
                [
                  "Print the shared students in both clubs."
                ],
                [
                  "SET club_a TO {\"Ava\", \"Noah\", \"Liam\"}",
                  "SET club_b TO {\"Noah\", \"Liam\", \"Maya\"}",
                  "SET shared_students TO INTERSECTION OF club_a AND club_b",
                  "PRINT shared_students"
                ]
              )
            ]
      ),
      topic(
        "difference",
        "Difference",
        "A difference keeps the values that appear in the first set but not in the second.",
        "This is used to find what is missing, what remains, or what belongs only to one group.",
        [
              example(
                "difference-example",
                [
                  "Set club_a to {\"Ava\", \"Noah\", \"Liam\"}.",
                  "Set club_b to {\"Noah\", \"Maya\"}.",
                  "Set only_a to DIFFERENCE OF club_a AND club_b.",
                  "Print only_a."
                ],
                [
                  "Set club_a to {\"Ava\", \"Noah\", \"Liam\"} and club_b to {\"Noah\", \"Maya\"}.",
                  "Find what is only in club_a and print it."
                ],
                [
                  "Print the values that appear only in club_a."
                ],
                [
                  "SET club_a TO {\"Ava\", \"Noah\", \"Liam\"}",
                  "SET club_b TO {\"Noah\", \"Maya\"}",
                  "SET only_a TO DIFFERENCE OF club_a AND club_b",
                  "PRINT only_a"
                ]
              )
            ]
      ),
      topic(
        "subset-checks",
        "Subset checks",
        "A subset check asks whether every value in one set also appears in another.",
        "This is useful for permission systems, requirement checks, and category containment.",
        [
              example(
                "subset-checks-example",
                [
                  "Set required_skills to {\"python\", \"sql\"}.",
                  "Set student_skills to {\"python\", \"sql\", \"excel\"}.",
                  "Set qualifies to required_skills IS SUBSET OF student_skills.",
                  "Print qualifies."
                ],
                [
                  "Set required_skills to {\"python\", \"sql\"} and student_skills to {\"python\", \"sql\", \"excel\"}.",
                  "Check whether required_skills is a subset and print the result."
                ],
                [
                  "Print whether {\"python\", \"sql\"} is a subset of the student skills."
                ],
                [
                  "SET required_skills TO {\"python\", \"sql\"}",
                  "SET student_skills TO {\"python\", \"sql\", \"excel\"}",
                  "SET qualifies TO required_skills IS SUBSET OF student_skills",
                  "PRINT qualifies"
                ]
              )
            ]
      ),
    ]
  ),
  lesson(
    "dictionaries-and-dictionary-operations",
    10,
    "Dictionaries and dictionary operations",
    "A dictionary stores key-value pairs. A key is the label used to look up a value. Dictionaries are used whenever information is naturally described by name.",
    [
      topic(
        "creating-dictionaries",
        "Creating dictionaries",
        "Creating a dictionary means linking keys to values.",
        "Dictionaries are used when lookup by name matters more than lookup by position.",
        [
              example(
                "creating-dictionaries-example",
                [
                  "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                  "Print grades."
                ],
                [
                  "Create a dictionary grades with Ava and Noah, then print it."
                ],
                [
                  "Print the dictionary {\"Ava\": 92, \"Noah\": 88}."
                ],
                [
                  "SET grades TO {\"Ava\": 92, \"Noah\": 88}",
                  "PRINT grades"
                ]
              )
            ]
      ),
      topic(
        "accessing-values-by-key",
        "Accessing values by key",
        "Accessing by key means retrieving a value using its label.",
        "This is used because the key describes what the value means.",
        [
              example(
                "accessing-values-by-key-example",
                [
                  "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                  "Set ava_grade to VALUE FOR KEY \"Ava\" IN grades.",
                  "Print ava_grade."
                ],
                [
                  "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                  "Look up \"Ava\" and print the value."
                ],
                [
                  "Print the value stored for key \"Ava\"."
                ],
                [
                  "SET grades TO {\"Ava\": 92, \"Noah\": 88}",
                  "SET ava_grade TO VALUE FOR KEY \"Ava\" IN grades",
                  "PRINT ava_grade"
                ]
              )
            ]
      ),
      topic(
        "adding-or-updating-keys",
        "Adding or updating keys",
        "Adding or updating means assigning a value to a key whether that key is new or already exists.",
        "This is used when data changes over time or new entries are added.",
        [
              example(
                "adding-or-updating-keys-example",
                [
                  "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                  "Set the key Maya in grades to 95.",
                  "Set the key Noah in grades to 90.",
                  "Print grades."
                ],
                [
                  "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                  "Add Maya with 95, update Noah to 90, and print grades."
                ],
                [
                  "Print grades after adding Maya and updating Noah."
                ],
                [
                  "SET grades TO {\"Ava\": 92, \"Noah\": 88}",
                  "SET KEY \"Maya\" IN grades TO 95",
                  "SET KEY \"Noah\" IN grades TO 90",
                  "PRINT grades"
                ]
              )
            ]
      ),
      topic(
        "removing-keys",
        "Removing keys",
        "Removing deletes a key and its value from the dictionary.",
        "This is used when data is no longer needed or is no longer valid.",
        [
              example(
                "removing-keys-example",
                [
                  "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                  "Remove key \"ava\" from grades.",
                  "Print grades."
                ],
                [
                  "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                  "Remove key \"Ava\" and print grades."
                ],
                [
                  "Print grades after removing key \"Ava\"."
                ],
                [
                  "SET grades TO {\"Ava\": 92, \"Noah\": 88}",
                  "REMOVE KEY \"Ava\" FROM grades",
                  "PRINT grades"
                ]
              )
            ]
      ),
      topic(
        "checking-keys",
        "Checking keys",
        "Checking keys means testing whether a certain label exists in the dictionary.",
        "This prevents lookup errors and supports safe validation.",
        [
              example(
                "checking-keys-example",
                [
                  "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                  "Set has_maya to KEY \"Maya\" EXISTS IN grades.",
                  "Print has_maya."
                ],
                [
                  "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                  "Check whether key \"Maya\" exists and print the result."
                ],
                [
                  "Print whether the dictionary contains key \"Maya\"."
                ],
                [
                  "SET grades TO {\"Ava\": 92, \"Noah\": 88}",
                  "SET has_maya TO KEY \"Maya\" EXISTS IN grades",
                  "PRINT has_maya"
                ]
              )
            ]
      ),
      topic(
        "keys-values-and-items",
        "Keys, values, and items",
        "A dictionary can expose all of its keys, all of its values, or all key-value pairs.",
        "This is useful for iteration, summaries, and reporting.",
        [
              example(
                "keys-values-and-items-example",
                [
                  "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                  "Set student_names to ALL KEYS OF grades.",
                  "Set score_values to ALL VALUES OF grades.",
                  "Print student_names.",
                  "Print score_values."
                ],
                [
                  "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                  "Get the keys and values, then print both."
                ],
                [
                  "Print the keys and values from the grades dictionary."
                ],
                [
                  "SET grades TO {\"Ava\": 92, \"Noah\": 88}",
                  "SET student_names TO ALL KEYS OF grades",
                  "SET score_values TO ALL VALUES OF grades",
                  "PRINT student_names",
                  "PRINT score_values"
                ]
              )
            ]
      ),
      topic(
        "looping-through-dictionaries",
        "Looping through dictionaries",
        "Looping through a dictionary means visiting each key or each key-value pair.",
        "This is used when the program must process all records one by one.",
        [
              example(
                "looping-through-dictionaries-example",
                [
                  "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                  "For each student, score in grades.",
                  "Print student.",
                  "Print score."
                ],
                [
                  "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                  "Loop through each student and score, then print both."
                ],
                [
                  "Print each student and score in the grades dictionary."
                ],
                [
                  "SET grades TO {\"Ava\": 92, \"Noah\": 88}",
                  "FOR EACH student, score IN grades",
                  "PRINT student",
                  "PRINT score"
                ]
              )
            ]
      ),
    ]
  ),
  lesson(
    "if-else-logic",
    11,
    "If else logic",
    "If else logic lets a program choose between actions based on conditions. It is the simplest way to make a program behave differently in different situations.",
    [
      topic(
        "basic-if",
        "Basic if",
        "An if statement runs a block only when its condition is true.",
        "It is used to guard actions so they happen only when a rule is satisfied.",
        [
              example(
                "basic-if-example",
                [
                  "Set score to 72.",
                  "If score >= 50, then.",
                  "Print \"Pass\"."
                ],
                [
                  "Set score to 72.",
                  "If score >= 50.",
                  "Print \"Pass\"."
                ],
                [
                  "Print \"Pass\" if score is at least 50."
                ],
                [
                  "SET score TO 72",
                  "IF score >= 50 THEN",
                  "PRINT \"Pass\""
                ]
              )
            ]
      ),
      topic(
        "if-else",
        "If else",
        "If else chooses between two paths.",
        "It is used when both success and failure behavior matter.",
        [
              example(
                "if-else-example",
                [
                  "Set score to 42.",
                  "If score >= 50, then.",
                  "Print \"Pass\".",
                  "Otherwise.",
                  "Print \"Fail\"."
                ],
                [
                  "Set score to 42.",
                  "If score >= 50.",
                  "Print \"Pass\".",
                  "Otherwise, print \"Fail\"."
                ],
                [
                  "Print \"Pass\" if score is at least 50, otherwise print \"Fail\"."
                ],
                [
                  "SET score TO 42",
                  "IF score >= 50 THEN",
                  "PRINT \"Pass\"",
                  "ELSE",
                  "PRINT \"Fail\""
                ]
              )
            ]
      ),
      topic(
        "if-elif-else",
        "If elif else",
        "This form handles several cases in order.",
        "It is used for grade bands, menu logic, and category selection.",
        [
              example(
                "if-elif-else-example",
                [
                  "Set score to 84.",
                  "If score >= 90, then.",
                  "Print \"A\".",
                  "Otherwise, if score >= 80, then.",
                  "Print \"B\".",
                  "Otherwise.",
                  "Print \"C\"."
                ],
                [
                  "Set score to 84.",
                  "If score >= 90.",
                  "Print \"A\".",
                  "Otherwise, if score >= 80, print \"B\".",
                  "Otherwise, print \"C\"."
                ],
                [
                  "Print A for 90+, B for 80+, otherwise C."
                ],
                [
                  "SET score TO 84",
                  "IF score >= 90 THEN",
                  "PRINT \"A\"",
                  "ELSE IF score >= 80 THEN",
                  "PRINT \"B\"",
                  "ELSE",
                  "PRINT \"C\""
                ]
              )
            ]
      ),
    ]
  ),
];

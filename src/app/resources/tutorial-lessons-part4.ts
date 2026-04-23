import { example, lesson, topic, type Lesson } from "./tutorial-types";

export const TAB_ONE_LESSONS_PART_4: Lesson[] = [
  lesson(
    "case-or-match-logic",
    12,
    "Case or match logic",
    "Case logic compares one value against several possible exact options. It is cleaner than many repeated if statements when the program is choosing between named cases.",
    [
      topic(
        "case-selection",
        "Case selection",
        "Case logic selects one branch based on the value of a variable.",
        "It is used in menus, role selection, command processing, and category dispatch.",
        [
              example(
                "case-selection-example",
                [
                  "Set day to \"Monday\".",
                  "Match day.",
                  "If the case is \"Monday\", then print \"start of week\".",
                  "If the case is \"Friday\", then print \"end of week\".",
                  "In the default case, print \"middle of week\"."
                ],
                [
                  "Set day to \"Monday\".",
                  "Match day.",
                  "If the value is \"Monday\", print \"start of week\".",
                  "If the value is \"Friday\", print \"end of week\".",
                  "Otherwise, print \"middle of week\"."
                ],
                [
                  "Match day and print the message for Monday, Friday, or the default case."
                ],
                [
                  "SET day TO \"Monday\"",
                  "MATCH day CASE \"Monday\": PRINT \"Start of week\" CASE \"Friday\": PRINT \"End of week\" DEFAULT:",
                  "PRINT \"Middle of week\""
                ]
              )
            ]
      ),
    ]
  ),
  lesson(
    "while-loops",
    13,
    "While loops",
    "A while loop repeats as long as a condition stays true. It is useful when the number of repetitions is not known in advance.",
    [
      topic(
        "basic-while-loop",
        "Basic while loop",
        "A while loop checks the condition before each repetition.",
        "Use it for counting, retrying, waiting, and repeated processing until a state changes.",
        [
              example(
                "basic-while-loop-example",
                [
                  "Set count to 1.",
                  "While count <= 3.",
                  "Print count.",
                  "Set count to count + 1."
                ],
                [
                  "Set count to 1.",
                  "Repeat while count <= 3, printing count and increasing it each time."
                ],
                [
                  "Print the numbers 1 through 3 with a while loop."
                ],
                [
                  "SET count TO 1",
                  "WHILE count <= 3 DO",
                  "PRINT count",
                  "SET count TO count + 1"
                ]
              )
            ]
      ),
    ]
  ),
  lesson(
    "for-loops",
    14,
    "For loops",
    "A for loop repeats over a sequence or over a known range of values. It is often the clearest loop when you already know what collection or count you want to iterate over.",
    [
      topic(
        "for-each-item",
        "For each item",
        "This form loops through every item in a collection.",
        "It is used to process lists, tuples, sets, dictionaries, and strings.",
        [
              example(
                "for-each-item-example",
                [
                  "Set names to [\"Ava\", \"Noah\", \"Liam\"].",
                  "For each name in names.",
                  "Print name."
                ],
                [
                  "Set names to [\"Ava\", \"Noah\", \"Liam\"].",
                  "Loop through each name and print it."
                ],
                [
                  "Print each name in [\"Ava\", \"Noah\", \"Liam\"]."
                ],
                [
                  "SET names TO [\"Ava\", \"Noah\", \"Liam\"]",
                  "FOR EACH name IN names",
                  "PRINT name"
                ]
              )
            ]
      ),
      topic(
        "for-with-index",
        "For with index",
        "Some loops need both the item and its position.",
        "This is useful when numbering output or updating a collection by index.",
        [
              example(
                "for-with-index-example",
                [
                  "Set tasks to [\"study\", \"eat\", \"sleep\"].",
                  "For each index from 0 to length of tasks - 1.",
                  "Print index.",
                  "Print ITEM index OF tasks."
                ],
                [
                  "Set tasks to [\"study\", \"eat\", \"sleep\"].",
                  "Loop through the indexes, then print each index and its task."
                ],
                [
                  "Print each index with its matching task."
                ],
                [
                  "SET tasks TO [\"study\", \"eat\", \"sleep\"]",
                  "FOR EACH index FROM 0 TO LENGTH OF tasks - 1",
                  "PRINT index",
                  "PRINT ITEM index OF tasks"
                ]
              )
            ]
      ),
    ]
  ),
  lesson(
    "functions",
    15,
    "Functions",
    "A function is a reusable block of instructions that performs one clear job. Functions help programs stay organized because instead of repeating the same steps many times, the program can define those steps once and call them whenever needed.",
    [
      topic(
        "defining-a-function",
        "Defining a function",
        "Defining a function gives a name to a block of reusable instructions.",
        "This is used to organize repeated logic into one place.",
        [
              example(
                "defining-a-function-example",
                [
                  "Define a function named welcome.",
                  "Print \"Welcome\"."
                ],
                [
                  "Define a function welcome that prints \"Welcome\"."
                ],
                [
                  "Define welcome to print \"Welcome\"."
                ],
                ["DEFINE FUNCTION welcome PRINT \"Welcome\""]
              )
            ]
      ),
      topic(
        "calling-a-function",
        "Calling a function",
        "Calling a function means running the instructions inside it.",
        "This is how reuse actually happens.",
        [
              example(
                "calling-a-function-example",
                ["Call welcome."],
                ["Run the welcome function."],
                ["Invoke welcome."],
                ["CALL welcome"]
              )
            ]
      ),
      topic(
        "function-arguments",
        "Function arguments",
        "Arguments are input values passed into a function.",
        "They make one function reusable for many different values instead of only one fixed case.",
        [
              example(
                "function-arguments-example",
                [
                  "Define a function named greet that takes name.",
                  "Print \"Hello \" + name.",
                  "Call greet(\"Ava\")."
                ],
                [
                  "Define a function greet that takes name.",
                  "Call greet(\"Ava\") to print the greeting."
                ],
                [
                  "Call greet with \"Ava\" to print a greeting."
                ],
                ["DEFINE FUNCTION greet(name) PRINT \"Hello \" + name CALL greet(\"Ava\")"]
              )
            ]
      ),
      topic(
        "return-values",
        "Return values",
        "A return value is the result sent back by a function.",
        "Functions return values when later steps need to use the result in another calculation.",
        [
              example(
                "return-values-example",
                [
                  "Define a function named double that takes number.",
                  "Return number * 2.",
                  "Set answer to CALL double(6).",
                  "Print answer."
                ],
                [
                  "Define a function double that returns number * 2.",
                  "Call it with 6, store the answer, and print it."
                ],
                [
                  "Print the value returned by double(6)."
                ],
                ["DEFINE FUNCTION double(number) RETURN number * 2 SET answer TO CALL double(6) PRINT answer"]
              )
            ]
      ),
      topic(
        "function-scope",
        "Function scope",
        "Scope describes where a variable can be seen and used.",
        "This matters because variables created inside a function are usually meant to stay local to that function.",
        [
              example(
                "function-scope-example",
                [
                  "Define a function named show_score.",
                  "Set score to 100.",
                  "Print score.",
                  "Call show_score."
                ],
                [
                  "Define show_score so score is set and printed inside the function.",
                  "Call show_score."
                ],
                [
                  "Call show_score to print its local score."
                ],
                ["DEFINE FUNCTION show_score SET score TO 100 PRINT score CALL show_score"]
              )
            ]
      ),
      topic(
        "recursion",
        "Recursion",
        "Recursion means a function calls itself on a smaller version of the same problem.",
        "It is used for repeating structures such as factorials, tree-like data, and divide-and-conquer logic.",
        [
              example(
                "recursion-example",
                [
                  "Define a function named factorial that takes n.",
                  "If n <= 1, then.",
                  "Return 1.",
                  "Otherwise.",
                  "Return n * CALL factorial(n - 1)."
                ],
                [
                  "Define factorial(n).",
                  "Return 1 when n <= 1, otherwise return n * CALL factorial(n - 1)."
                ],
                [
                  "Define factorial recursively with a base case of 1."
                ],
                ["DEFINE FUNCTION factorial(n) IF n <= 1 THEN RETURN 1 ELSE RETURN n * CALL factorial(n - 1)"]
              )
            ]
      ),
      topic(
        "generators",
        "Generators",
        "A generator produces values one at a time instead of building the whole result at once.",
        "This is useful when a sequence may be large or when values should be produced only when needed.",
        [
              example(
                "generators-example",
                [
                  "Define generator count_to_three.",
                  "Yield 1.",
                  "Yield 2.",
                  "Yield 3."
                ],
                [
                  "Define generator count_to_three that yields 1, 2, and 3."
                ],
                [
                  "Yield 1, 2, and 3 from count_to_three."
                ],
                ["DEFINE GENERATOR count_to_three YIELD 1 YIELD 2 YIELD 3"]
              )
            ]
      ),
    ]
  ),
  lesson(
    "range",
    16,
    "Range",
    "A range represents a sequence of numbers, often used for counting loops.",
    [
      topic(
        "using-a-range",
        "Using a range",
        "A range gives start, stop, and sometimes step information for repeated iteration.",
        "It is useful when the loop is about positions or counts rather than about items already stored in a collection.",
        [
              example(
                "using-a-range-example",
                [
                  "For number from 1 to 5.",
                  "Print number."
                ],
                [
                  "Loop from 1 to 5 and print each number."
                ],
                [
                  "Print each number from 1 to 5."
                ],
                [
                  "FOR number FROM 1 TO 5",
                  "PRINT number"
                ]
              )
            ]
      ),
      topic(
        "using-a-step",
        "Using a step",
        "A step changes how much the loop variable increases each time.",
        "This is useful for skipping values or moving through a sequence in regular jumps.",
        [
              example(
                "using-a-step-example",
                [
                  "For number from 2 to 10 step 2.",
                  "Print number."
                ],
                [
                  "Loop from 2 to 10 in steps of 2 and print each number."
                ],
                [
                  "Print every second number from 2 to 10."
                ],
                [
                  "FOR number FROM 2 TO 10 STEP 2",
                  "PRINT number"
                ]
              )
            ]
      ),
    ]
  ),
  lesson(
    "types-of-errors",
    17,
    "Types of errors",
    "Errors are problems that stop a program from working correctly. Learning error types helps students debug more calmly because they can identify what kind of mistake happened.",
    [
      topic(
        "syntax-errors",
        "Syntax errors",
        "A syntax error means the program structure is written in an invalid way.",
        "This prevents the program from running at all because the instructions cannot be parsed correctly.",
        [
              example(
                "syntax-errors-example",
                [
                  "If, then.",
                  "Print \"Hello\"."
                ],
                [
                  "If.",
                  "Print \"Hello\"."
                ],
                [
                  "Show an incomplete if statement, then try to print \"Hello\"."
                ],
                [
                  "IF THEN",
                  "PRINT \"Hello\""
                ]
              )
            ]
      ),
      topic(
        "runtime-errors",
        "Runtime errors",
        "A runtime error happens while the program is executing.",
        "The program may start correctly but crash when it hits an invalid action such as dividing by zero or looking up a missing value.",
        [
              example(
                "runtime-errors-example",
                [
                  "Set value to 10 / 0.",
                  "Print value."
                ],
                [
                  "Divide 10 by 0, store it in value, and try to print it."
                ],
                [
                  "Show a divide-by-zero runtime error."
                ],
                [
                  "SET value TO 10 / 0",
                  "PRINT value"
                ]
              )
            ]
      ),
      topic(
        "logic-errors",
        "Logic errors",
        "A logic error means the program runs, but it produces the wrong result.",
        "These are often the hardest errors because nothing crashes. The idea is simply wrong.",
        [
              example(
                "logic-errors-example",
                [
                  "Set total to 80 + 90.",
                  "Set average to total / 3.",
                  "Print average."
                ],
                [
                  "Set total to 80 + 90.",
                  "Divide by 3 instead of 2 and print the average."
                ],
                [
                  "Print an incorrect average caused by the wrong divisor."
                ],
                [
                  "SET total TO 80 + 90",
                  "SET average TO total / 3",
                  "PRINT average"
                ]
              )
            ]
      ),
    ]
  ),
  lesson(
    "try-except",
    18,
    "Try except",
    "Try except logic allows a program to attempt an action and respond gracefully if something goes wrong.",
    [
      topic(
        "basic-try-except",
        "Basic try except",
        "The try block contains risky code. The except block explains what to do if an error occurs.",
        "This is used for safer programs and for user-friendly failure handling.",
        [
              example(
                "basic-try-except-example",
                [
                  "Set text_value to \"abc\".",
                  "Try.",
                  "Set number_value to CONVERT text_value TO NUMBER.",
                  "Print number_value.",
                  "Except.",
                  "Print \"Conversion failed\"."
                ],
                [
                  "Set text_value to \"abc\".",
                  "Try converting it to a number and print it.",
                  "If conversion fails, print \"Conversion failed\"."
                ],
                [
                  "Try to convert \"abc\" to a number, otherwise print \"Conversion failed\"."
                ],
                [
                  "SET text_value TO \"abc\"",
                  "TRY SET number_value TO CONVERT text_value TO NUMBER PRINT number_value EXCEPT PRINT",
                  "\"Conversion failed\""
                ]
              )
            ]
      ),
    ]
  ),
  lesson(
    "oop",
    19,
    "OOP",
    "Object-oriented programming organizes code around objects that bundle together data and behavior. Beginners should see OOP as a way to model real entities such as students, bank accounts, or game characters.",
    [
      topic(
        "classes",
        "Classes",
        "A class is a blueprint that describes what data and behavior an object should have.",
        "Use a class when many objects should share the same structure.",
        [
              example(
                "classes-example",
                [
                  "Define a class named Student.",
                  "Store name.",
                  "Store score."
                ],
                [
                  "Define a class Student that stores name and score."
                ],
                [
                  "Define Student to store name and score."
                ],
                ["DEFINE CLASS Student STORE name STORE score"]
              )
            ]
      ),
      topic(
        "objects",
        "Objects",
        "An object is a specific instance created from a class.",
        "Objects are used when the program must represent many concrete entities of the same kind.",
        [
              example(
                "objects-example",
                ["Create student object ava with name = \"ava\" and score = 95."],
                ["Create a Student object ava with name = \"Ava\" and score = 95."],
                ["Instantiate Student as ava with name \"Ava\" and score 95."],
                ["CREATE Student OBJECT ava WITH name = \"Ava\" AND score = 95"]
              )
            ]
      ),
      topic(
        "init-methods",
        "Init methods",
        "An initialization method sets up the object's starting data when it is created.",
        "This ensures every new object starts with a valid internal state.",
        [
              example(
                "init-methods-example",
                [
                  "Define a class named Student.",
                  "Define the initialization method that takes name, score.",
                  "Set self.name to name.",
                  "Set self.score to score."
                ],
                [
                  "Define a class Student with an initializer that stores name and score."
                ],
                [
                  "Initialize Student objects with name and score."
                ],
                ["DEFINE CLASS Student DEFINE INIT(name, score) SET self.name TO name SET self.score TO score"]
              )
            ]
      ),
      topic(
        "self-parameter",
        "Self parameter",
        "The self parameter refers to the current object inside its own methods.",
        "It is used so the object can read or update its own data.",
        [
              example(
                "self-parameter-example",
                [
                  "Define a class named Student.",
                  "Define a method named show_name that takes self.",
                  "Print self.name."
                ],
                [
                  "Define a class Student.",
                  "Define show_name to print self.name."
                ],
                [
                  "Use self to print the object's name."
                ],
                ["DEFINE CLASS Student DEFINE METHOD show_name(self) PRINT self.name"]
              )
            ]
      ),
      topic(
        "class-properties",
        "Class properties",
        "Class properties are the data stored on each object.",
        "They describe the state of each object and allow different objects to hold different values.",
        [
              example(
                "class-properties-example",
                [
                  "Define a class named BankAccount.",
                  "Define the initialization method that takes balance.",
                  "Set self.balance to balance."
                ],
                [
                  "Define a class BankAccount with an initializer that stores balance."
                ],
                [
                  "Store balance as a BankAccount property."
                ],
                ["DEFINE CLASS BankAccount DEFINE INIT(balance) SET self.balance TO balance"]
              )
            ]
      ),
      topic(
        "class-methods",
        "Class methods",
        "Class methods are behaviors that objects of the class can perform.",
        "They are used to keep related actions close to the data they affect.",
        [
              example(
                "class-methods-example",
                [
                  "Define a class named BankAccount.",
                  "Define a method named deposit that takes self, amount.",
                  "Set self.balance to self.balance + amount."
                ],
                [
                  "Define a class BankAccount.",
                  "Define deposit to add amount to self.balance."
                ],
                [
                  "Use deposit to increase the account balance."
                ],
                [
                  "DEFINE CLASS BankAccount DEFINE METHOD deposit(self, amount) SET self.balance TO self.balance +",
                  "amount"
                ]
              )
            ]
      ),
      topic(
        "class-inheritance",
        "Class inheritance",
        "Inheritance lets one class build on another class so shared behavior does not need to be rewritten.",
        "It is used when one object type is a more specific version of another.",
        [
              example(
                "class-inheritance-example",
                [
                  "Define a class named GraduateStudent that extends Student.",
                  "Define the initialization method that takes name, score, research_topic.",
                  "Set self.name to name.",
                  "Set self.score to score.",
                  "Set self.research_topic to research_topic."
                ],
                [
                  "Define GraduateStudent as a class that extends Student.",
                  "Initialize it with name, score, and research_topic."
                ],
                [
                  "Extend Student with GraduateStudent and add research_topic."
                ],
                [
                  "DEFINE CLASS GraduateStudent EXTENDS Student DEFINE INIT(name, score, research_topic) SET",
                  "self.name TO name SET self.score TO score SET self.research_topic TO research_topic"
                ]
              )
            ]
      ),
    ]
  ),
];

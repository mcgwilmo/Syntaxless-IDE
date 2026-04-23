import { example, lesson, topic, type Lesson } from "./tutorial-types";

export const TAB_ONE_LESSONS_PART_2: Lesson[] = [
  lesson(
    "booleans",
    5,
    "Booleans",
    "A boolean is a value that is either true or false. Booleans let programs represent decisions, conditions, tests, and logical checks.",
    [
      topic(
        "boolean-values",
        "Boolean values",
        "A boolean stores whether something is true or false.",
        "Use booleans whenever the program needs to remember the result of a check, such as whether a user is logged in or whether a number is even.",
        [
              example(
                "boolean-values-example",
                [
                  "Set is_greater to 8 > 5.",
                  "Print is_greater."
                ],
                [
                  "Set is_greater to whether 8 is greater than 5.",
                  "Print is_greater."
                ],
                [
                  "Print whether 8 is greater than 5."
                ],
                [
                  "SET is_greater TO 8 > 5",
                  "PRINT is_greater"
                ]
              )
            ]
      ),
      topic(
        "truthiness-and-falsiness",
        "Truthiness and falsiness",
        "Some values naturally behave like true or false when checked in a condition. Empty values often act false, and present values often act true.",
        "This is useful for concise checks such as testing whether a list has items or whether a string is empty.",
        [
              example(
                "truthiness-and-falsiness-example",
                [
                  "Set message to \"\".",
                  "If message is EMPTY, then.",
                  "Print FALSE.",
                  "Otherwise.",
                  "Print TRUE."
                ],
                [
                  "Set message to \"\".",
                  "If message is EMPTY.",
                  "Print FALSE.",
                  "Otherwise, print TRUE."
                ],
                [
                  "Print FALSE if message is empty, otherwise print TRUE."
                ],
                [
                  "SET message TO \"\"",
                  "IF message IS EMPTY THEN",
                  "PRINT FALSE",
                  "ELSE",
                  "PRINT TRUE"
                ]
              )
            ]
      ),
    ]
  ),
  lesson(
    "operators",
    6,
    "Operators",
    "Operators are the symbols or actions that combine, compare, update, or test values. A student should know what each operator means, when it should be used, and what result it produces.",
    [
      topic(
        "arithmetic-operators",
        "Arithmetic operators",
        "Arithmetic operators perform mathematical calculations. Common arithmetic operators include addition, subtraction, multiplication, division, exponentiation, floor division, and remainder.",
        "They are used to total values, compute averages, find growth, split quantities into groups, and test divisibility.",
        [
              example(
                "arithmetic-operators-example-1",
                [
                  "Set result to 4 + 6.",
                  "Print result."
                ],
                [
                  "Add 4 and 6, store the result in result, and print it."
                ],
                [
                  "Print the result of 4 + 6."
                ],
                [
                  "SET result TO 4 + 6",
                  "PRINT result"
                ]
              ),
              example(
                "arithmetic-operators-example-2",
                [
                  "Set result to 10 - 3.",
                  "Print result."
                ],
                [
                  "Subtract 3 from 10, store the result in result, and print it."
                ],
                [
                  "Print the result of 10 - 3."
                ],
                [
                  "SET result TO 10 - 3",
                  "PRINT result"
                ]
              ),
              example(
                "arithmetic-operators-example-3",
                [
                  "Set result to 7 * 5.",
                  "Print result."
                ],
                [
                  "Multiply 7 by 5, store the result in result, and print it."
                ],
                [
                  "Print the result of 7 * 5."
                ],
                [
                  "SET result TO 7 * 5",
                  "PRINT result"
                ]
              ),
              example(
                "arithmetic-operators-example-4",
                [
                  "Set result to 20 / 4.",
                  "Print result."
                ],
                [
                  "Divide 20 by 4, store the result in result, and print it."
                ],
                [
                  "Print the result of 20 / 4."
                ],
                [
                  "SET result TO 20 / 4",
                  "PRINT result"
                ]
              ),
              example(
                "arithmetic-operators-example-5",
                [
                  "Set result to 2 ^ 3.",
                  "Print result."
                ],
                [
                  "Raise 2 to the power of 3, store the result in result, and print it."
                ],
                [
                  "Print the result of 2 ^ 3."
                ],
                [
                  "SET result TO 2 ^ 3",
                  "PRINT result"
                ]
              ),
              example(
                "arithmetic-operators-example-6",
                [
                  "Set result to FLOOR DIVISION OF 10 BY 3.",
                  "Print result."
                ],
                [
                  "Floor-divide 10 by 3, store the result in result, and print it."
                ],
                [
                  "Print the floor division result of 10 by 3."
                ],
                [
                  "SET result TO FLOOR DIVISION OF 10 BY 3",
                  "PRINT result"
                ]
              ),
              example(
                "arithmetic-operators-example-7",
                [
                  "Set result to 10 MOD 3.",
                  "Print result."
                ],
                [
                  "Find 10 MOD 3, store the result in result, and print it."
                ],
                [
                  "Print the remainder of 10 divided by 3."
                ],
                [
                  "SET result TO 10 MOD 3",
                  "PRINT result"
                ]
              )
            ]
      ),
      topic(
        "assignment-operators",
        "Assignment operators",
        "Assignment operators store a value in a variable. They can also update a variable based on its current value.",
        "They are used to create state and then change it over time as the program runs.",
        [
              example(
                "assignment-operators-example-1",
                [
                  "Set count to 5.",
                  "Print count."
                ],
                [
                  "Set count to 5 and print it."
                ],
                [
                  "Print count after setting it to 5."
                ],
                [
                  "SET count TO 5",
                  "PRINT count"
                ]
              ),
              example(
                "assignment-operators-example-2",
                [
                  "Set count to count + 1.",
                  "Print count."
                ],
                [
                  "Increase count by 1, then print it."
                ],
                [
                  "Print count after adding 1."
                ],
                [
                  "SET count TO count + 1",
                  "PRINT count"
                ]
              ),
              example(
                "assignment-operators-example-3",
                [
                  "Set count to count - 2.",
                  "Print count."
                ],
                [
                  "Decrease count by 2, then print it."
                ],
                [
                  "Print count after subtracting 2."
                ],
                [
                  "SET count TO count - 2",
                  "PRINT count"
                ]
              ),
              example(
                "assignment-operators-example-4",
                [
                  "Set count to count * 3.",
                  "Print count."
                ],
                [
                  "Multiply count by 3, then print it."
                ],
                [
                  "Print count after multiplying it by 3."
                ],
                [
                  "SET count TO count * 3",
                  "PRINT count"
                ]
              ),
              example(
                "assignment-operators-example-5",
                [
                  "Set count to count / 2.",
                  "Print count."
                ],
                [
                  "Divide count by 2, then print it."
                ],
                [
                  "Print count after dividing it by 2."
                ],
                [
                  "SET count TO count / 2",
                  "PRINT count"
                ]
              )
            ]
      ),
      topic(
        "comparison-operators",
        "Comparison operators",
        "Comparison operators compare two values and return true or false. Common comparisons include equal to, not equal to, greater than, less than, greater than or equal to, and less than or equal to.",
        "They are used in decisions, filters, thresholds, and validation rules.",
        [
              example(
                "comparison-operators-example-1",
                [
                  "Set result to 9 = 9.",
                  "Print result."
                ],
                [
                  "Compare 9 and 9, store the result in result, and print it."
                ],
                [
                  "Print whether 9 equals 9."
                ],
                [
                  "SET result TO 9 = 9",
                  "PRINT result"
                ]
              ),
              example(
                "comparison-operators-example-2",
                [
                  "Set result to 9 != 4.",
                  "Print result."
                ],
                [
                  "Compare 9 and 4 for inequality, store the result in result, and print it."
                ],
                [
                  "Print whether 9 is not equal to 4."
                ],
                [
                  "SET result TO 9 != 4",
                  "PRINT result"
                ]
              ),
              example(
                "comparison-operators-example-3",
                [
                  "Set result to 12 > 5.",
                  "Print result."
                ],
                [
                  "Compare 12 and 5, store whether 12 is greater in result, and print it."
                ],
                [
                  "Print whether 12 is greater than 5."
                ],
                [
                  "SET result TO 12 > 5",
                  "PRINT result"
                ]
              ),
              example(
                "comparison-operators-example-4",
                [
                  "Set result to 3 < 7.",
                  "Print result."
                ],
                [
                  "Compare 3 and 7, store whether 3 is smaller in result, and print it."
                ],
                [
                  "Print whether 3 is less than 7."
                ],
                [
                  "SET result TO 3 < 7",
                  "PRINT result"
                ]
              ),
              example(
                "comparison-operators-example-5",
                [
                  "Set result to 8 >= 8.",
                  "Print result."
                ],
                [
                  "Compare 8 and 8, store whether 8 is at least 8 in result, and print it."
                ],
                [
                  "Print whether 8 is greater than or equal to 8."
                ],
                [
                  "SET result TO 8 >= 8",
                  "PRINT result"
                ]
              ),
              example(
                "comparison-operators-example-6",
                [
                  "Set result to 6 <= 9.",
                  "Print result."
                ],
                [
                  "Compare 6 and 9, store whether 6 is at most 9 in result, and print it."
                ],
                [
                  "Print whether 6 is less than or equal to 9."
                ],
                [
                  "SET result TO 6 <= 9",
                  "PRINT result"
                ]
              )
            ]
      ),
      topic(
        "logical-operators",
        "Logical operators",
        "Logical operators combine boolean conditions. The most common are AND, OR, and NOT.",
        "They are used when a decision depends on multiple requirements or on reversing a condition.",
        [
              example(
                "logical-operators-example-1",
                [
                  "Set passed_exam to TRUE.",
                  "Set submitted_assignment to TRUE.",
                  "Set can_pass_course to passed_exam AND submitted_assignment.",
                  "Print can_pass_course."
                ],
                [
                  "Set passed_exam and submitted_assignment to TRUE.",
                  "Set can_pass_course to their AND result and print it."
                ],
                [
                  "Print whether passed_exam AND submitted_assignment is TRUE."
                ],
                [
                  "SET passed_exam TO TRUE",
                  "SET submitted_assignment TO TRUE",
                  "SET can_pass_course TO passed_exam AND submitted_assignment",
                  "PRINT can_pass_course"
                ]
              ),
              example(
                "logical-operators-example-2",
                [
                  "Set is_admin to FALSE.",
                  "Set is_teacher to TRUE.",
                  "Set has_access to is_admin OR is_teacher.",
                  "Print has_access."
                ],
                [
                  "Set is_admin to FALSE and is_teacher to TRUE.",
                  "Set has_access to their OR result and print it."
                ],
                [
                  "Print whether is_admin OR is_teacher gives access."
                ],
                [
                  "SET is_admin TO FALSE",
                  "SET is_teacher TO TRUE",
                  "SET has_access TO is_admin OR is_teacher",
                  "PRINT has_access"
                ]
              ),
              example(
                "logical-operators-example-3",
                [
                  "Set is_logged_in to FALSE.",
                  "Set needs_login to NOT is_logged_in.",
                  "Print needs_login."
                ],
                [
                  "Set is_logged_in to FALSE.",
                  "Negate it into needs_login and print the result."
                ],
                [
                  "Print the opposite of FALSE in needs_login."
                ],
                [
                  "SET is_logged_in TO FALSE",
                  "SET needs_login TO NOT is_logged_in",
                  "PRINT needs_login"
                ]
              )
            ]
      ),
      topic(
        "membership-operators",
        "Membership operators",
        "Membership operators test whether a value is inside a collection or inside a piece of text.",
        "They are useful for search, validation, filtering, and permission checks.",
        [
              example(
                "membership-operators-example-1",
                [
                  "Set values to [1, 2, 3, 4].",
                  "Set result to 4 IS IN values.",
                  "Print result."
                ],
                [
                  "Set values to [1, 2, 3, 4].",
                  "Check whether 4 is in values and print the result."
                ],
                [
                  "Print whether 4 appears in [1, 2, 3, 4]."
                ],
                [
                  "SET values TO [1, 2, 3, 4]",
                  "SET result TO 4 IS IN values",
                  "PRINT result"
                ]
              ),
              example(
                "membership-operators-example-2",
                [
                  "Set sentence to \"I like math and science\".",
                  "Set result to \"math\" IS IN sentence.",
                  "Print result."
                ],
                [
                  "Set sentence to \"I like math and science\".",
                  "Check whether it contains \"math\" and print the result."
                ],
                [
                  "Print whether \"math\" appears in \"I like math and science\"."
                ],
                [
                  "SET sentence TO \"I like math and science\"",
                  "SET result TO \"math\" IS IN sentence",
                  "PRINT result"
                ]
              )
            ]
      ),
      topic(
        "identity-operators",
        "Identity operators",
        "Identity checks ask whether two names refer to the exact same object, not just equal values.",
        "This matters when programs reuse the same list or object through different variable names. Two values can look equal while still being different objects.",
        [
              example(
                "identity-operators-example",
                [
                  "Set numbers to [1, 2, 3].",
                  "Set alias to numbers.",
                  "Set same_object to alias IS THE SAME OBJECT AS numbers.",
                  "Print same_object."
                ],
                [
                  "Set numbers to [1, 2, 3] and alias to numbers.",
                  "Check whether alias and numbers are the same object and print the result."
                ],
                [
                  "Print whether alias and numbers refer to the same object."
                ],
                [
                  "SET numbers TO [1, 2, 3]",
                  "SET alias TO numbers",
                  "SET same_object TO alias IS THE SAME OBJECT AS numbers",
                  "PRINT same_object"
                ]
              )
            ]
      ),
      topic(
        "bitwise-operators",
        "Bitwise operators",
        "Bitwise operators work on the binary representation of integers. Common ones include AND, OR, XOR, left shift, right shift, and bitwise NOT.",
        "These are used less often in beginner programs, but they matter in low-level tasks, compact flag systems, and performance-oriented logic.",
        [
              example(
                "bitwise-operators-example-1",
                [
                  "Set result to BITWISE AND OF 6 AND 3.",
                  "Print result."
                ],
                [
                  "Apply bitwise AND to 6 and 3, store the result in result, and print it."
                ],
                [
                  "Print the bitwise AND of 6 and 3."
                ],
                [
                  "SET result TO BITWISE AND OF 6 AND 3",
                  "PRINT result"
                ]
              ),
              example(
                "bitwise-operators-example-2",
                [
                  "Set result to BITWISE OR OF 6 AND 3.",
                  "Print result."
                ],
                [
                  "Apply bitwise OR to 6 and 3, store the result in result, and print it."
                ],
                [
                  "Print the bitwise OR of 6 and 3."
                ],
                [
                  "SET result TO BITWISE OR OF 6 AND 3",
                  "PRINT result"
                ]
              ),
              example(
                "bitwise-operators-example-3",
                [
                  "Set result to BITWISE XOR OF 6 AND 3.",
                  "Print result."
                ],
                [
                  "Apply bitwise XOR to 6 and 3, store the result in result, and print it."
                ],
                [
                  "Print the bitwise XOR of 6 and 3."
                ],
                [
                  "SET result TO BITWISE XOR OF 6 AND 3",
                  "PRINT result"
                ]
              ),
              example(
                "bitwise-operators-example-4",
                [
                  "Set result to 3 SHIFT LEFT BY 2.",
                  "Print result."
                ],
                [
                  "Shift 3 left by 2, store the result in result, and print it."
                ],
                [
                  "Print the result of shifting 3 left by 2."
                ],
                [
                  "SET result TO 3 SHIFT LEFT BY 2",
                  "PRINT result"
                ]
              ),
              example(
                "bitwise-operators-example-5",
                [
                  "Set result to 16 SHIFT RIGHT BY 2.",
                  "Print result."
                ],
                [
                  "Shift 16 right by 2, store the result in result, and print it."
                ],
                [
                  "Print the result of shifting 16 right by 2."
                ],
                [
                  "SET result TO 16 SHIFT RIGHT BY 2",
                  "PRINT result"
                ]
              )
            ]
      ),
      topic(
        "operator-precedence",
        "Operator precedence",
        "Operator precedence is the rule that decides which operation happens first when several operators appear in one expression.",
        "Understanding precedence prevents mistakes. Multiplication usually happens before addition unless grouping symbols force a different order.",
        [
              example(
                "operator-precedence-example",
                [
                  "Set first_result to 2 + 3 * 4.",
                  "Set second_result to (2 + 3) * 4.",
                  "Print first_result.",
                  "Print second_result."
                ],
                [
                  "Set first_result to 2 + 3 * 4 and second_result to (2 + 3) * 4.",
                  "Print both results."
                ],
                [
                  "Print the two results from 2 + 3 * 4 and (2 + 3) * 4."
                ],
                [
                  "SET first_result TO 2 + 3 * 4",
                  "SET second_result TO (2 + 3) * 4",
                  "PRINT first_result",
                  "PRINT second_result"
                ]
              )
            ]
      ),
    ]
  ),
  lesson(
    "lists-and-list-operations",
    7,
    "Lists and list operations",
    "A list is an ordered collection of values. Lists are used when a program must store many items in a meaningful order.",
    [
      topic(
        "creating-a-list",
        "Creating a list",
        "Creating a list means putting several values into one ordered collection.",
        "Use a list when values belong together and may need to be processed one by one.",
        [
              example(
                "creating-a-list-example",
                [
                  "Set scores to [80, 90, 100].",
                  "Print scores."
                ],
                [
                  "Create a list scores with 80, 90, and 100, then print it."
                ],
                [
                  "Print the list [80, 90, 100]."
                ],
                [
                  "SET scores TO [80, 90, 100]",
                  "PRINT scores"
                ]
              )
            ]
      ),
      topic(
        "accessing-list-items",
        "Accessing list items",
        "Accessing a list item means retrieving the value at a particular position.",
        "This is used when the program needs a specific element, such as the first score or last task.",
        [
              example(
                "accessing-list-items-example",
                [
                  "Set scores to [80, 90, 100].",
                  "Set first_score to ITEM 0 OF scores.",
                  "Print first_score."
                ],
                [
                  "Set scores to [80, 90, 100].",
                  "Print item 0 of scores."
                ],
                [
                  "Print the first item of [80, 90, 100]."
                ],
                [
                  "SET scores TO [80, 90, 100]",
                  "SET first_score TO ITEM 0 OF scores",
                  "PRINT first_score"
                ]
              )
            ]
      ),
      topic(
        "changing-a-list-item",
        "Changing a list item",
        "A list item can be updated by replacing the value at a particular position.",
        "This is used when an old value is no longer correct and needs to be revised.",
        [
              example(
                "changing-a-list-item-example",
                [
                  "Set scores to [80, 90, 100].",
                  "Set item 1 of scores to 95.",
                  "Print scores."
                ],
                [
                  "Set scores to [80, 90, 100].",
                  "Change item 1 to 95 and print scores."
                ],
                [
                  "Print scores after replacing item 1 with 95."
                ],
                [
                  "SET scores TO [80, 90, 100]",
                  "SET ITEM 1 OF scores TO 95",
                  "PRINT scores"
                ]
              )
            ]
      ),
      topic(
        "appending",
        "Appending",
        "Appending adds a new item to the end of the list.",
        "This is used when new data arrives over time and order matters.",
        [
              example(
                "appending-example",
                [
                  "Set scores to [80, 90, 100].",
                  "Append 110 to scores.",
                  "Print scores."
                ],
                [
                  "Set scores to [80, 90, 100].",
                  "Append 110 and print scores."
                ],
                [
                  "Print scores after appending 110."
                ],
                [
                  "SET scores TO [80, 90, 100]",
                  "APPEND 110 TO scores PRINT scores"
                ]
              )
            ]
      ),
      topic(
        "inserting",
        "Inserting",
        "Inserting adds a value at a chosen position and shifts later items to the right.",
        "Use this when order matters and the new value must appear in the middle rather than at the end.",
        [
              example(
                "inserting-example",
                [
                  "Set scores to [80, 90, 100].",
                  "Insert 85 AT POSITION 1 IN scores.",
                  "Print scores."
                ],
                [
                  "Set scores to [80, 90, 100].",
                  "Insert 85 at position 1 and print scores."
                ],
                [
                  "Print scores after inserting 85 at position 1."
                ],
                [
                  "SET scores TO [80, 90, 100]",
                  "INSERT 85 AT POSITION 1 IN scores",
                  "PRINT scores"
                ]
              )
            ]
      ),
      topic(
        "removing-by-value",
        "Removing by value",
        "Removing by value deletes the first matching value from the list.",
        "This is used when the item itself matters more than its exact position.",
        [
              example(
                "removing-by-value-example",
                [
                  "Set scores to [80, 90, 100].",
                  "Remove 90 from scores.",
                  "Print scores."
                ],
                [
                  "Set scores to [80, 90, 100].",
                  "Remove 90 and print scores."
                ],
                [
                  "Print scores after removing 90."
                ],
                [
                  "SET scores TO [80, 90, 100]",
                  "REMOVE 90 FROM scores",
                  "PRINT scores"
                ]
              )
            ]
      ),
      topic(
        "removing-by-position",
        "Removing by position",
        "Removing by position deletes the item at a chosen index.",
        "This is used when the program knows where the unwanted item is located.",
        [
              example(
                "removing-by-position-example",
                [
                  "Set scores to [80, 90, 100].",
                  "Remove item 0 from scores.",
                  "Print scores."
                ],
                [
                  "Set scores to [80, 90, 100].",
                  "Remove item 0 and print scores."
                ],
                [
                  "Print scores after removing item 0."
                ],
                [
                  "SET scores TO [80, 90, 100]",
                  "REMOVE ITEM 0 FROM scores",
                  "PRINT scores"
                ]
              )
            ]
      ),
      topic(
        "length-of-a-list",
        "Length of a list",
        "The length of a list is the number of items it contains.",
        "Length is used for counting, validation, and loop control.",
        [
              example(
                "length-of-a-list-example",
                [
                  "Set tasks to [\"study\", \"eat\", \"sleep\"].",
                  "Set task_count to LENGTH OF tasks.",
                  "Print task_count."
                ],
                [
                  "Set tasks to [\"study\", \"eat\", \"sleep\"].",
                  "Print the length of tasks."
                ],
                [
                  "Print how many items are in [\"study\", \"eat\", \"sleep\"]."
                ],
                [
                  "SET tasks TO [\"study\", \"eat\", \"sleep\"]",
                  "SET task_count TO LENGTH OF tasks",
                  "PRINT task_count"
                ]
              )
            ]
      ),
      topic(
        "membership-in-a-list",
        "Membership in a list",
        "Membership checks test whether a value appears anywhere in the list.",
        "This is useful for search, permission checks, and avoiding duplicates.",
        [
              example(
                "membership-in-a-list-example",
                [
                  "Set tasks to [\"study\", \"eat\", \"sleep\"].",
                  "Set has_study to \"study\" IS IN tasks.",
                  "Print has_study."
                ],
                [
                  "Set tasks to [\"study\", \"eat\", \"sleep\"].",
                  "Check whether \"study\" is in tasks and print the result."
                ],
                [
                  "Print whether \"study\" is in [\"study\", \"eat\", \"sleep\"]."
                ],
                [
                  "SET tasks TO [\"study\", \"eat\", \"sleep\"]",
                  "SET has_study TO \"study\" IS IN tasks",
                  "PRINT has_study"
                ]
              )
            ]
      ),
      topic(
        "slicing-a-list",
        "Slicing a list",
        "Slicing a list means taking a sub-list from a start position to an end position.",
        "This is used for pagination, batching, or extracting part of a sequence.",
        [
              example(
                "slicing-a-list-example",
                [
                  "Set values to [10, 20, 30, 40].",
                  "Set first_two to ITEMS 0 THROUGH 1 OF values.",
                  "Print first_two."
                ],
                [
                  "Set values to [10, 20, 30, 40].",
                  "Print items 0 through 1 of values."
                ],
                [
                  "Print the first two items of [10, 20, 30, 40]."
                ],
                [
                  "SET values TO [10, 20, 30, 40]",
                  "SET first_two TO ITEMS 0 THROUGH 1 OF values",
                  "PRINT first_two"
                ]
              )
            ]
      ),
      topic(
        "sorting-a-list",
        "Sorting a list",
        "Sorting rearranges the items of a list into order.",
        "It is used whenever the program needs smallest-to-largest, largest-to-smallest, or alphabetical order.",
        [
              example(
                "sorting-a-list-example",
                [
                  "Set numbers to [9, 3, 12, 1, 5].",
                  "Sort numbers.",
                  "Print numbers."
                ],
                [
                  "Set numbers to [9, 3, 12, 1, 5].",
                  "Sort them and print the result."
                ],
                [
                  "Print [9, 3, 12, 1, 5] after sorting it."
                ],
                [
                  "SET numbers TO [9, 3, 12, 1, 5]",
                  "SORT numbers",
                  "PRINT numbers"
                ]
              )
            ]
      ),
      topic(
        "reversing-a-list",
        "Reversing a list",
        "Reversing changes the order so the last item becomes first.",
        "This is used for countdowns, recent-first views, and simple ordering changes.",
        [
              example(
                "reversing-a-list-example",
                [
                  "Set names to [\"Ava\", \"Noah\", \"Liam\"].",
                  "Reverse names.",
                  "Print names."
                ],
                [
                  "Set names to [\"Ava\", \"Noah\", \"Liam\"].",
                  "Reverse them and print the result."
                ],
                [
                  "Print [\"Ava\", \"Noah\", \"Liam\"] after reversing it."
                ],
                [
                  "SET names TO [\"Ava\", \"Noah\", \"Liam\"]",
                  "REVERSE names PRINT names"
                ]
              )
            ]
      ),
      topic(
        "counting-values",
        "Counting values",
        "Counting values means finding how many times a certain item appears.",
        "This is useful for frequency checks, duplicate detection, and summaries.",
        [
              example(
                "counting-values-example",
                [
                  "Set values to [2, 1, 2, 3, 2].",
                  "Set two_count to COUNT OF 2 IN values.",
                  "Print two_count."
                ],
                [
                  "Set values to [2, 1, 2, 3, 2].",
                  "Count how many times 2 appears and print the result."
                ],
                [
                  "Print how many times 2 appears in [2, 1, 2, 3, 2]."
                ],
                [
                  "SET values TO [2, 1, 2, 3, 2]",
                  "SET two_count TO COUNT OF 2 IN values",
                  "PRINT two_count"
                ]
              )
            ]
      ),
      topic(
        "aggregating-a-list",
        "Aggregating a list",
        "Aggregation means turning many values into one summary such as a sum, average, minimum, or maximum.",
        "This is used constantly in real programs because raw data is often less useful than a summary.",
        [
              example(
                "aggregating-a-list-example",
                [
                  "Set scores to [80, 90, 100].",
                  "Set total to SUM OF scores.",
                  "Set average to total / LENGTH OF scores.",
                  "Print total.",
                  "Print average."
                ],
                [
                  "Set scores to [80, 90, 100].",
                  "Find total and average, then print both."
                ],
                [
                  "Print the total and average of [80, 90, 100]."
                ],
                [
                  "SET scores TO [80, 90, 100]",
                  "SET total TO SUM OF scores",
                  "SET average TO total / LENGTH OF scores",
                  "PRINT total",
                  "PRINT average"
                ]
              )
            ]
      ),
    ]
  ),
];

// GENERATED FILE -- DO NOT EDIT.
//
// Built from the YAML in src/content/lessons by scripts/build-lessons.mjs,
// which runs before every dev run and build. Edit the YAML instead; changes
// made here are overwritten.

import type { Lesson, TabId } from "./lesson-schema";

export const LESSONS_BY_TAB: Record<TabId, Lesson[]> = {
  "operators": [
    {
      "id": "variables",
      "number": 1,
      "title": "Variables",
      "overview": "Variables let a program keep track of information by giving that information a name. They are used whenever a value needs to be stored, reused, updated, or compared later.",
      "topics": [
        {
          "id": "variable-names",
          "title": "Variable names",
          "definition": "A variable name is the label used to refer to stored information. Good names make a program easier to read because the name tells you what the value represents.",
          "howAndWhy": "Use variable names when you want instructions to stay understandable. A name like total_score is better than a name like x because it explains the role of the value.",
          "examples": [
            {
              "id": "variable-names-example",
              "strict": [
                "Initialize a variable called score.",
                "Make score equal 95.",
                "Print score."
              ],
              "standard": [
                "Set a variable called score to 95.",
                "Print score."
              ],
              "abstraction": [
                "Print a variable score that equals 95."
              ],
              "pseudocode": [
                "SET score TO 95",
                "PRINT score"
              ]
            }
          ]
        },
        {
          "id": "assign-multiple-values",
          "title": "Assign multiple values",
          "definition": "Assigning multiple values means creating or updating more than one variable during the same step or small group of steps.",
          "howAndWhy": "This is used when several related values belong together, such as width and height, or first_name and last_name. It helps organize state early before later calculations use those values.",
          "examples": [
            {
              "id": "assign-multiple-values-example",
              "strict": [
                "Initialize a variable called width.",
                "Initialize a variable called height.",
                "Set width to 10.",
                "Set height to 20.",
                "Print width.",
                "Print height."
              ],
              "standard": [
                "Create 2 variables called width and height.",
                "Set width to 10 and set height to 20.",
                "Print width and height"
              ],
              "abstraction": [
                "Print 2 variables width and height that are 10 and 20 repsectively."
              ],
              "pseudocode": [
                "SET width TO 10",
                "SET height TO 20",
                "PRINT width",
                "PRINT height"
              ]
            }
          ]
        },
        {
          "id": "output-variables",
          "title": "Output variables",
          "definition": "Outputting a variable means showing the value currently stored inside it.",
          "howAndWhy": "This is used for debugging, checking progress, and presenting results. If you cannot see a value, it is harder to know whether earlier steps worked correctly.",
          "examples": [
            {
              "id": "output-variables-example",
              "strict": [
                "Initialize a variable called name.",
                "Set name to \"Matthew\".",
                "Print name."
              ],
              "standard": [
                "Make a variable called name and set it to \"Matthew\".",
                "Print name."
              ],
              "abstraction": [
                "Set name to \"Matthew\".",
                "Print name."
              ],
              "pseudocode": [
                "SET name TO \"Matthew\"",
                "PRINT name"
              ]
            }
          ]
        },
        {
          "id": "global-variables",
          "title": "Global variables",
          "definition": "A global variable is a variable that is intended to be available across multiple parts of a program instead of living only inside one small block.",
          "howAndWhy": "Global variables are used when many parts of a program must share the same setting or state. They should be used carefully because too many shared variables make programs harder to reason about.",
          "examples": [
            {
              "id": "global-variables-example",
              "strict": [
                "Create a global variable called tax_rate.",
                "Set tax_rate to 0.13.",
                "Create a variable called price and set it to 100.",
                "Calculate final_price as price plus (price times tax_rate)."
              ],
              "standard": [
                "Set the global variable tax_rate to 0.13.",
                "Calculate a value final_price as price plus (price times tax_rate)."
              ],
              "abstraction": [
                "Set the global variable tax_rate to 0.13.",
                "Use tax_rate when calculating final_price."
              ],
              "pseudocode": [
                "SET GLOBAL tax_rate TO 0.13",
                "USE tax_rate WHEN CALCULATING final_price"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "data-types",
      "number": 2,
      "title": "Data types",
      "overview": "A data type tells you what kind of value something is. The type matters because different kinds of values support different operations.",
      "topics": [
        {
          "id": "common-data-types",
          "title": "Common data types",
          "definition": "Common data types include numbers, strings, booleans, lists, tuples, sets, and dictionaries.",
          "howAndWhy": "Knowing the type of a value prevents mistakes. For example, text and numbers are handled differently, and a list behaves differently from a single value.",
          "examples": [
            {
              "id": "common-data-types-example",
              "strict": [
                "Set name to \"Ava\".",
                "Set age to 19.",
                "Set is_enrolled to TRUE."
              ],
              "standard": [
                "Set name to \"Ava\".",
                "Set age to 19.",
                "Set is_enrolled to TRUE."
              ],
              "abstraction": [
                "Set name to \"Ava\".",
                "Set age to 19.",
                "Set is_enrolled to TRUE."
              ],
              "pseudocode": [
                "SET name TO \"Ava\"",
                "SET age TO 19",
                "SET is_enrolled TO TRUE"
              ]
            }
          ]
        },
        {
          "id": "why-type-matters",
          "title": "Why type matters",
          "definition": "Type matters because the program needs to know what actions make sense for a value.",
          "howAndWhy": "You can add numbers, slice strings, loop through lists, and look up values in dictionaries. Each data type gives you its own useful operations.",
          "examples": [
            {
              "id": "why-type-matters-example",
              "strict": [
                "Set a to 4.",
                "Set b to 7.",
                "Set is_smaller to a < b.",
                "Set full_name to \"Ada\" + \" Lovelace\"."
              ],
              "standard": [
                "Set a to 4.",
                "Set b to 7.",
                "Set is_smaller to a < b.",
                "Set full_name to \"Ada\" + \" Lovelace\"."
              ],
              "abstraction": [
                "Set a to 4.",
                "Set b to 7.",
                "Set is_smaller to a < b.",
                "Set full_name to \"Ada\" + \" Lovelace\"."
              ],
              "pseudocode": [
                "SET a TO 4",
                "SET b TO 7",
                "SET is_smaller TO a < b",
                "SET full_name TO \"Ada\" + \" Lovelace\""
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "numbers",
      "number": 3,
      "title": "Numbers",
      "overview": "Numbers represent quantities. They are used for counting, measuring, averaging, scoring, comparing, and doing arithmetic.",
      "topics": [
        {
          "id": "integers-and-decimals",
          "title": "Integers and decimals",
          "definition": "Integers are whole numbers. Decimals store numbers with fractional parts.",
          "howAndWhy": "Use integers for counting items and decimals for measurements, money, probabilities, or any quantity that is not restricted to whole units.",
          "examples": [
            {
              "id": "integers-and-decimals-example",
              "strict": [
                "Set student_count to 8.",
                "Set average_grade to 92.5."
              ],
              "standard": [
                "Set student_count to 8.",
                "Set average_grade to 92.5."
              ],
              "abstraction": [
                "Set student_count to 8.",
                "Set average_grade to 92.5."
              ],
              "pseudocode": [
                "SET student_count TO 8",
                "SET average_grade TO 92.5"
              ]
            }
          ]
        },
        {
          "id": "numeric-operations",
          "title": "Numeric operations",
          "definition": "Numeric operations include addition, subtraction, multiplication, division, exponentiation, remainder, and order-of-operations combinations.",
          "howAndWhy": "They are used whenever a program must transform raw quantities into useful results.",
          "examples": [
            {
              "id": "numeric-operations-example",
              "strict": [
                "Set total to 88 + 91 + 95.",
                "Set average to total / 3.",
                "Print average."
              ],
              "standard": [
                "Set total to 88 + 91 + 95.",
                "Set average to total / 3.",
                "Print average."
              ],
              "abstraction": [
                "Set total to 88 + 91 + 95.",
                "Set average to total / 3.",
                "Print average."
              ],
              "pseudocode": [
                "SET total TO 88 + 91 + 95",
                "SET average TO total / 3",
                "PRINT average"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "strings",
      "number": 4,
      "title": "Strings",
      "overview": "A string is a sequence of text characters. Strings are used for names, messages, labels, user input, file-like text content, and formatted output.",
      "topics": [
        {
          "id": "creating-strings",
          "title": "Creating strings",
          "definition": "Creating a string means storing text as a value.",
          "howAndWhy": "This is used whenever the program must remember words, labels, sentences, or user-facing messages.",
          "examples": [
            {
              "id": "creating-strings-example",
              "strict": [
                "Set greeting to \"Hello world\"."
              ],
              "standard": [
                "Set greeting to \"Hello world\"."
              ],
              "abstraction": [
                "Set greeting to \"Hello world\"."
              ],
              "pseudocode": [
                "SET greeting TO \"Hello world\""
              ]
            }
          ]
        },
        {
          "id": "string-length",
          "title": "String length",
          "definition": "The length of a string is the number of characters it contains.",
          "howAndWhy": "Length is used to check whether text is empty, whether a password is long enough, or whether a user entered too much or too little text.",
          "examples": [
            {
              "id": "string-length-example",
              "strict": [
                "Set username to \"matthew\".",
                "Set character_count to LENGTH OF username.",
                "Print character_count."
              ],
              "standard": [
                "Set username to \"matthew\".",
                "Set character_count to LENGTH OF username.",
                "Print character_count."
              ],
              "abstraction": [
                "Set username to \"matthew\".",
                "Set character_count to LENGTH OF username.",
                "Print character_count."
              ],
              "pseudocode": [
                "SET username TO \"matthew\"",
                "SET character_count TO LENGTH OF username",
                "PRINT character_count"
              ]
            }
          ]
        },
        {
          "id": "indexing",
          "title": "Indexing",
          "definition": "Indexing means accessing one character at a specific position inside a string.",
          "howAndWhy": "It is used when a program needs a particular letter, such as the first initial of a name or the last character of an ID.",
          "examples": [
            {
              "id": "indexing-example",
              "strict": [
                "Set word to \"banana\".",
                "Set first_character to CHARACTER 0 OF word.",
                "Print first_character."
              ],
              "standard": [
                "Set word to \"banana\".",
                "Set first_character to CHARACTER 0 OF word.",
                "Print first_character."
              ],
              "abstraction": [
                "Set word to \"banana\".",
                "Set first_character to CHARACTER 0 OF word.",
                "Print first_character."
              ],
              "pseudocode": [
                "SET word TO \"banana\"",
                "SET first_character TO CHARACTER 0 OF word",
                "PRINT first_character"
              ]
            }
          ]
        },
        {
          "id": "slicing-strings",
          "title": "Slicing strings",
          "definition": "Slicing means taking a portion of a string from one position to another.",
          "howAndWhy": "This is used for abbreviations, extracting prefixes and suffixes, getting date parts, or isolating a certain section of text.",
          "examples": [
            {
              "id": "slicing-strings-example",
              "strict": [
                "Set date_text to \"2026-04-15\".",
                "Set year_text to CHARACTERS 0 THROUGH 3 OF date_text.",
                "Print year_text."
              ],
              "standard": [
                "Set date_text to \"2026-04-15\".",
                "Set year_text to CHARACTERS 0 THROUGH 3 OF date_text.",
                "Print year_text."
              ],
              "abstraction": [
                "Set date_text to \"2026-04-15\".",
                "Set year_text to CHARACTERS 0 THROUGH 3 OF date_text.",
                "Print year_text."
              ],
              "pseudocode": [
                "SET date_text TO \"2026-04-15\"",
                "SET year_text TO CHARACTERS 0 THROUGH 3 OF date_text",
                "PRINT year_text"
              ]
            }
          ]
        },
        {
          "id": "concatenation",
          "title": "Concatenation",
          "definition": "Concatenation means joining strings together to build larger text.",
          "howAndWhy": "This is used for names, messages, labels, and dynamic output.",
          "examples": [
            {
              "id": "concatenation-example",
              "strict": [
                "Set first_name to \"Grace\".",
                "Set last_name to \"Hopper\".",
                "Set full_name to first_name + \" \" + last_name.",
                "Print full_name."
              ],
              "standard": [
                "Set first_name to \"Grace\".",
                "Set last_name to \"Hopper\".",
                "Set full_name to first_name + \" \" + last_name.",
                "Print full_name."
              ],
              "abstraction": [
                "Set first_name to \"Grace\".",
                "Set last_name to \"Hopper\".",
                "Set full_name to first_name + \" \" + last_name.",
                "Print full_name."
              ],
              "pseudocode": [
                "SET first_name TO \"Grace\"",
                "SET last_name TO \"Hopper\"",
                "SET full_name TO first_name + \" \" + last_name",
                "PRINT full_name"
              ]
            }
          ]
        },
        {
          "id": "repetition",
          "title": "Repetition",
          "definition": "String repetition means repeating the same text multiple times.",
          "howAndWhy": "It is used for simple patterns, dividers, banners, or placeholders.",
          "examples": [
            {
              "id": "repetition-example",
              "strict": [
                "Set divider to \"-\" REPEATED 5 TIMES.",
                "Print divider."
              ],
              "standard": [
                "Set divider to \"-\" REPEATED 5 TIMES.",
                "Print divider."
              ],
              "abstraction": [
                "Set divider to \"-\" REPEATED 5 TIMES.",
                "Print divider."
              ],
              "pseudocode": [
                "SET divider TO \"-\" REPEATED 5 TIMES",
                "PRINT divider"
              ]
            }
          ]
        },
        {
          "id": "changing-case",
          "title": "Changing case",
          "definition": "Changing case means converting text to uppercase, lowercase, or title case.",
          "howAndWhy": "This is used for normalization, display consistency, and comparisons that should ignore capitalization differences.",
          "examples": [
            {
              "id": "changing-case-example",
              "strict": [
                "Set subject to \"Math\".",
                "Set normalized_subject to LOWERCASE OF subject.",
                "Print normalized_subject."
              ],
              "standard": [
                "Set subject to \"Math\".",
                "Set normalized_subject to LOWERCASE OF subject.",
                "Print normalized_subject."
              ],
              "abstraction": [
                "Set subject to \"Math\".",
                "Set normalized_subject to LOWERCASE OF subject.",
                "Print normalized_subject."
              ],
              "pseudocode": [
                "SET subject TO \"Math\"",
                "SET normalized_subject TO LOWERCASE OF subject",
                "PRINT normalized_subject"
              ]
            }
          ]
        },
        {
          "id": "removing-extra-spaces",
          "title": "Removing extra spaces",
          "definition": "Trimming removes unnecessary spaces from the beginning and end of a string.",
          "howAndWhy": "This is important when user input contains accidental spaces that would otherwise break comparisons or formatting.",
          "examples": [
            {
              "id": "removing-extra-spaces-example",
              "strict": [
                "Set raw_name to \"  Ava  \".",
                "Set clean_name to TRIM raw_name.",
                "Print clean_name."
              ],
              "standard": [
                "Set raw_name to \"  Ava  \".",
                "Set clean_name to TRIM raw_name.",
                "Print clean_name."
              ],
              "abstraction": [
                "Set raw_name to \"  Ava  \".",
                "Set clean_name to TRIM raw_name.",
                "Print clean_name."
              ],
              "pseudocode": [
                "SET raw_name TO \"  Ava  \"",
                "SET clean_name TO TRIM raw_name",
                "PRINT clean_name"
              ]
            }
          ]
        },
        {
          "id": "replacing-text",
          "title": "Replacing text",
          "definition": "Replacing text means finding one part of a string and changing it to another value.",
          "howAndWhy": "This is used to clean text, standardize labels, or update words inside a message.",
          "examples": [
            {
              "id": "replacing-text-example",
              "strict": [
                "Set sentence to \"The cat is sleeping\".",
                "Set updated_sentence to REPLACE \"cat\" WITH \"dog\" IN sentence.",
                "Print updated_sentence."
              ],
              "standard": [
                "Set sentence to \"The cat is sleeping\".",
                "Set updated_sentence to REPLACE \"cat\" WITH \"dog\" IN sentence.",
                "Print updated_sentence."
              ],
              "abstraction": [
                "Set sentence to \"The cat is sleeping\".",
                "Set updated_sentence to REPLACE \"cat\" WITH \"dog\" IN sentence.",
                "Print updated_sentence."
              ],
              "pseudocode": [
                "SET sentence TO \"The cat is sleeping\"",
                "SET updated_sentence TO REPLACE \"cat\" WITH \"dog\" IN sentence",
                "PRINT updated_sentence"
              ]
            }
          ]
        },
        {
          "id": "searching-inside-strings",
          "title": "Searching inside strings",
          "definition": "Searching means checking whether text contains a certain word or character, or finding where it appears.",
          "howAndWhy": "This is used for validation, filtering, keyword checks, and simple parsing.",
          "examples": [
            {
              "id": "searching-inside-strings-example",
              "strict": [
                "Set message to \"system error detected\".",
                "Set has_error to message CONTAINS \"error\".",
                "Print has_error."
              ],
              "standard": [
                "Set message to \"system error detected\".",
                "Set has_error to message CONTAINS \"error\".",
                "Print has_error."
              ],
              "abstraction": [
                "Set message to \"system error detected\".",
                "Set has_error to message CONTAINS \"error\".",
                "Print has_error."
              ],
              "pseudocode": [
                "SET message TO \"system error detected\"",
                "SET has_error TO message CONTAINS \"error\"",
                "PRINT has_error"
              ]
            }
          ]
        },
        {
          "id": "starts-with-and-ends-with",
          "title": "Starts with and ends with",
          "definition": "These checks test whether a string begins or finishes with a particular pattern.",
          "howAndWhy": "They are used for file names, email checks, prefixes, suffixes, and routing-like decisions.",
          "examples": [
            {
              "id": "starts-with-and-ends-with-example",
              "strict": [
                "Set file_name to \"notes.pdf\".",
                "Set is_pdf to file_name ENDS WITH \".pdf\".",
                "Print is_pdf."
              ],
              "standard": [
                "Set file_name to \"notes.pdf\".",
                "Set is_pdf to file_name ENDS WITH \".pdf\".",
                "Print is_pdf."
              ],
              "abstraction": [
                "Set file_name to \"notes.pdf\".",
                "Set is_pdf to file_name ENDS WITH \".pdf\".",
                "Print is_pdf."
              ],
              "pseudocode": [
                "SET file_name TO \"notes.pdf\"",
                "SET is_pdf TO file_name ENDS WITH \".pdf\"",
                "PRINT is_pdf"
              ]
            }
          ]
        },
        {
          "id": "splitting-strings",
          "title": "Splitting strings",
          "definition": "Splitting turns one string into multiple pieces using a separator such as a comma or space.",
          "howAndWhy": "It is used when one line of text actually contains several values that need to be processed separately.",
          "examples": [
            {
              "id": "splitting-strings-example",
              "strict": [
                "Set colors_text to \"red,blue,green\".",
                "Set colors to SPLIT colors_text BY \",\".",
                "Print colors."
              ],
              "standard": [
                "Set colors_text to \"red,blue,green\".",
                "Set colors to SPLIT colors_text BY \",\".",
                "Print colors."
              ],
              "abstraction": [
                "Set colors_text to \"red,blue,green\".",
                "Set colors to SPLIT colors_text BY \",\".",
                "Print colors."
              ],
              "pseudocode": [
                "SET colors_text TO \"red,blue,green\"",
                "SET colors TO SPLIT colors_text BY \",\"",
                "PRINT colors"
              ]
            }
          ]
        },
        {
          "id": "joining-strings",
          "title": "Joining strings",
          "definition": "Joining is the reverse of splitting. It combines many strings into one string using a chosen separator.",
          "howAndWhy": "It is used when a program stores many text pieces separately but needs to display them as one message.",
          "examples": [
            {
              "id": "joining-strings-example",
              "strict": [
                "Set names to [\"Ava\", \"Noah\", \"Liam\"].",
                "Set roster_text to JOIN names WITH \", \".",
                "Print roster_text."
              ],
              "standard": [
                "Set names to [\"Ava\", \"Noah\", \"Liam\"].",
                "Set roster_text to JOIN names WITH \", \".",
                "Print roster_text."
              ],
              "abstraction": [
                "Set names to [\"Ava\", \"Noah\", \"Liam\"].",
                "Set roster_text to JOIN names WITH \", \".",
                "Print roster_text."
              ],
              "pseudocode": [
                "SET names TO [\"Ava\", \"Noah\", \"Liam\"]",
                "SET roster_text TO JOIN names WITH \", \"",
                "PRINT roster_text"
              ]
            }
          ]
        },
        {
          "id": "formatting-strings",
          "title": "Formatting strings",
          "definition": "Formatting means building text using both fixed words and inserted values.",
          "howAndWhy": "This is used when the program must produce readable output for a person, such as a score message, receipt line, or report sentence.",
          "examples": [
            {
              "id": "formatting-strings-example",
              "strict": [
                "Set student_name to \"Maya\".",
                "Set score to 94.",
                "Set message to FORMAT \"Maya scored 94\" USING student_name AND score.",
                "Print message."
              ],
              "standard": [
                "Set student_name to \"Maya\".",
                "Set score to 94.",
                "Set message to FORMAT \"Maya scored 94\" USING student_name AND score.",
                "Print message."
              ],
              "abstraction": [
                "Set student_name to \"Maya\".",
                "Set score to 94.",
                "Set message to FORMAT \"Maya scored 94\" USING student_name AND score.",
                "Print message."
              ],
              "pseudocode": [
                "SET student_name TO \"Maya\"",
                "SET score TO 94",
                "SET message TO FORMAT \"Maya scored 94\" USING student_name AND score",
                "PRINT message"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "booleans",
      "number": 5,
      "title": "Booleans",
      "overview": "A boolean is a value that is either true or false. Booleans let programs represent decisions, conditions, tests, and logical checks.",
      "topics": [
        {
          "id": "boolean-values",
          "title": "Boolean values",
          "definition": "A boolean stores whether something is true or false.",
          "howAndWhy": "Use booleans whenever the program needs to remember the result of a check, such as whether a user is logged in or whether a number is even.",
          "examples": [
            {
              "id": "boolean-values-example",
              "strict": [
                "Set is_greater to 8 > 5.",
                "Print is_greater."
              ],
              "standard": [
                "Set is_greater to whether 8 is greater than 5.",
                "Print is_greater."
              ],
              "abstraction": [
                "Print whether 8 is greater than 5."
              ],
              "pseudocode": [
                "SET is_greater TO 8 > 5",
                "PRINT is_greater"
              ]
            }
          ]
        },
        {
          "id": "truthiness-and-falsiness",
          "title": "Truthiness and falsiness",
          "definition": "Some values naturally behave like true or false when checked in a condition. Empty values often act false, and present values often act true.",
          "howAndWhy": "This is useful for concise checks such as testing whether a list has items or whether a string is empty.",
          "examples": [
            {
              "id": "truthiness-and-falsiness-example",
              "strict": [
                "Set message to \"\".",
                "If message is EMPTY, then.",
                "Print FALSE.",
                "Otherwise.",
                "Print TRUE."
              ],
              "standard": [
                "Set message to \"\".",
                "If message is EMPTY.",
                "Print FALSE.",
                "Otherwise, print TRUE."
              ],
              "abstraction": [
                "Print FALSE if message is empty, otherwise print TRUE."
              ],
              "pseudocode": [
                "SET message TO \"\"",
                "IF message IS EMPTY THEN",
                "PRINT FALSE",
                "ELSE",
                "PRINT TRUE"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "operators",
      "number": 6,
      "title": "Operators",
      "overview": "Operators are the symbols or actions that combine, compare, update, or test values. A student should know what each operator means, when it should be used, and what result it produces.",
      "topics": [
        {
          "id": "arithmetic-operators",
          "title": "Arithmetic operators",
          "definition": "Arithmetic operators perform mathematical calculations. Common arithmetic operators include addition, subtraction, multiplication, division, exponentiation, floor division, and remainder.",
          "howAndWhy": "They are used to total values, compute averages, find growth, split quantities into groups, and test divisibility.",
          "examples": [
            {
              "id": "arithmetic-operators-example-1",
              "strict": [
                "Set result to 4 + 6.",
                "Print result."
              ],
              "standard": [
                "Add 4 and 6, store the result in result, and print it."
              ],
              "abstraction": [
                "Print the result of 4 + 6."
              ],
              "pseudocode": [
                "SET result TO 4 + 6",
                "PRINT result"
              ]
            },
            {
              "id": "arithmetic-operators-example-2",
              "strict": [
                "Set result to 10 - 3.",
                "Print result."
              ],
              "standard": [
                "Subtract 3 from 10, store the result in result, and print it."
              ],
              "abstraction": [
                "Print the result of 10 - 3."
              ],
              "pseudocode": [
                "SET result TO 10 - 3",
                "PRINT result"
              ]
            },
            {
              "id": "arithmetic-operators-example-3",
              "strict": [
                "Set result to 7 * 5.",
                "Print result."
              ],
              "standard": [
                "Multiply 7 by 5, store the result in result, and print it."
              ],
              "abstraction": [
                "Print the result of 7 * 5."
              ],
              "pseudocode": [
                "SET result TO 7 * 5",
                "PRINT result"
              ]
            },
            {
              "id": "arithmetic-operators-example-4",
              "strict": [
                "Set result to 20 / 4.",
                "Print result."
              ],
              "standard": [
                "Divide 20 by 4, store the result in result, and print it."
              ],
              "abstraction": [
                "Print the result of 20 / 4."
              ],
              "pseudocode": [
                "SET result TO 20 / 4",
                "PRINT result"
              ]
            },
            {
              "id": "arithmetic-operators-example-5",
              "strict": [
                "Set result to 2 ^ 3.",
                "Print result."
              ],
              "standard": [
                "Raise 2 to the power of 3, store the result in result, and print it."
              ],
              "abstraction": [
                "Print the result of 2 ^ 3."
              ],
              "pseudocode": [
                "SET result TO 2 ^ 3",
                "PRINT result"
              ]
            },
            {
              "id": "arithmetic-operators-example-6",
              "strict": [
                "Set result to FLOOR DIVISION OF 10 BY 3.",
                "Print result."
              ],
              "standard": [
                "Floor-divide 10 by 3, store the result in result, and print it."
              ],
              "abstraction": [
                "Print the floor division result of 10 by 3."
              ],
              "pseudocode": [
                "SET result TO FLOOR DIVISION OF 10 BY 3",
                "PRINT result"
              ]
            },
            {
              "id": "arithmetic-operators-example-7",
              "strict": [
                "Set result to 10 MOD 3.",
                "Print result."
              ],
              "standard": [
                "Find 10 MOD 3, store the result in result, and print it."
              ],
              "abstraction": [
                "Print the remainder of 10 divided by 3."
              ],
              "pseudocode": [
                "SET result TO 10 MOD 3",
                "PRINT result"
              ]
            }
          ]
        },
        {
          "id": "assignment-operators",
          "title": "Assignment operators",
          "definition": "Assignment operators store a value in a variable. They can also update a variable based on its current value.",
          "howAndWhy": "They are used to create state and then change it over time as the program runs.",
          "examples": [
            {
              "id": "assignment-operators-example-1",
              "strict": [
                "Set count to 5.",
                "Print count."
              ],
              "standard": [
                "Set count to 5 and print it."
              ],
              "abstraction": [
                "Print count after setting it to 5."
              ],
              "pseudocode": [
                "SET count TO 5",
                "PRINT count"
              ]
            },
            {
              "id": "assignment-operators-example-2",
              "strict": [
                "Set count to count + 1.",
                "Print count."
              ],
              "standard": [
                "Increase count by 1, then print it."
              ],
              "abstraction": [
                "Print count after adding 1."
              ],
              "pseudocode": [
                "SET count TO count + 1",
                "PRINT count"
              ]
            },
            {
              "id": "assignment-operators-example-3",
              "strict": [
                "Set count to count - 2.",
                "Print count."
              ],
              "standard": [
                "Decrease count by 2, then print it."
              ],
              "abstraction": [
                "Print count after subtracting 2."
              ],
              "pseudocode": [
                "SET count TO count - 2",
                "PRINT count"
              ]
            },
            {
              "id": "assignment-operators-example-4",
              "strict": [
                "Set count to count * 3.",
                "Print count."
              ],
              "standard": [
                "Multiply count by 3, then print it."
              ],
              "abstraction": [
                "Print count after multiplying it by 3."
              ],
              "pseudocode": [
                "SET count TO count * 3",
                "PRINT count"
              ]
            },
            {
              "id": "assignment-operators-example-5",
              "strict": [
                "Set count to count / 2.",
                "Print count."
              ],
              "standard": [
                "Divide count by 2, then print it."
              ],
              "abstraction": [
                "Print count after dividing it by 2."
              ],
              "pseudocode": [
                "SET count TO count / 2",
                "PRINT count"
              ]
            }
          ]
        },
        {
          "id": "comparison-operators",
          "title": "Comparison operators",
          "definition": "Comparison operators compare two values and return true or false. Common comparisons include equal to, not equal to, greater than, less than, greater than or equal to, and less than or equal to.",
          "howAndWhy": "They are used in decisions, filters, thresholds, and validation rules.",
          "examples": [
            {
              "id": "comparison-operators-example-1",
              "strict": [
                "Set result to 9 = 9.",
                "Print result."
              ],
              "standard": [
                "Compare 9 and 9, store the result in result, and print it."
              ],
              "abstraction": [
                "Print whether 9 equals 9."
              ],
              "pseudocode": [
                "SET result TO 9 = 9",
                "PRINT result"
              ]
            },
            {
              "id": "comparison-operators-example-2",
              "strict": [
                "Set result to 9 != 4.",
                "Print result."
              ],
              "standard": [
                "Compare 9 and 4 for inequality, store the result in result, and print it."
              ],
              "abstraction": [
                "Print whether 9 is not equal to 4."
              ],
              "pseudocode": [
                "SET result TO 9 != 4",
                "PRINT result"
              ]
            },
            {
              "id": "comparison-operators-example-3",
              "strict": [
                "Set result to 12 > 5.",
                "Print result."
              ],
              "standard": [
                "Compare 12 and 5, store whether 12 is greater in result, and print it."
              ],
              "abstraction": [
                "Print whether 12 is greater than 5."
              ],
              "pseudocode": [
                "SET result TO 12 > 5",
                "PRINT result"
              ]
            },
            {
              "id": "comparison-operators-example-4",
              "strict": [
                "Set result to 3 < 7.",
                "Print result."
              ],
              "standard": [
                "Compare 3 and 7, store whether 3 is smaller in result, and print it."
              ],
              "abstraction": [
                "Print whether 3 is less than 7."
              ],
              "pseudocode": [
                "SET result TO 3 < 7",
                "PRINT result"
              ]
            },
            {
              "id": "comparison-operators-example-5",
              "strict": [
                "Set result to 8 >= 8.",
                "Print result."
              ],
              "standard": [
                "Compare 8 and 8, store whether 8 is at least 8 in result, and print it."
              ],
              "abstraction": [
                "Print whether 8 is greater than or equal to 8."
              ],
              "pseudocode": [
                "SET result TO 8 >= 8",
                "PRINT result"
              ]
            },
            {
              "id": "comparison-operators-example-6",
              "strict": [
                "Set result to 6 <= 9.",
                "Print result."
              ],
              "standard": [
                "Compare 6 and 9, store whether 6 is at most 9 in result, and print it."
              ],
              "abstraction": [
                "Print whether 6 is less than or equal to 9."
              ],
              "pseudocode": [
                "SET result TO 6 <= 9",
                "PRINT result"
              ]
            }
          ]
        },
        {
          "id": "logical-operators",
          "title": "Logical operators",
          "definition": "Logical operators combine boolean conditions. The most common are AND, OR, and NOT.",
          "howAndWhy": "They are used when a decision depends on multiple requirements or on reversing a condition.",
          "examples": [
            {
              "id": "logical-operators-example-1",
              "strict": [
                "Set passed_exam to TRUE.",
                "Set submitted_assignment to TRUE.",
                "Set can_pass_course to passed_exam AND submitted_assignment.",
                "Print can_pass_course."
              ],
              "standard": [
                "Set passed_exam and submitted_assignment to TRUE.",
                "Set can_pass_course to their AND result and print it."
              ],
              "abstraction": [
                "Print whether passed_exam AND submitted_assignment is TRUE."
              ],
              "pseudocode": [
                "SET passed_exam TO TRUE",
                "SET submitted_assignment TO TRUE",
                "SET can_pass_course TO passed_exam AND submitted_assignment",
                "PRINT can_pass_course"
              ]
            },
            {
              "id": "logical-operators-example-2",
              "strict": [
                "Set is_admin to FALSE.",
                "Set is_teacher to TRUE.",
                "Set has_access to is_admin OR is_teacher.",
                "Print has_access."
              ],
              "standard": [
                "Set is_admin to FALSE and is_teacher to TRUE.",
                "Set has_access to their OR result and print it."
              ],
              "abstraction": [
                "Print whether is_admin OR is_teacher gives access."
              ],
              "pseudocode": [
                "SET is_admin TO FALSE",
                "SET is_teacher TO TRUE",
                "SET has_access TO is_admin OR is_teacher",
                "PRINT has_access"
              ]
            },
            {
              "id": "logical-operators-example-3",
              "strict": [
                "Set is_logged_in to FALSE.",
                "Set needs_login to NOT is_logged_in.",
                "Print needs_login."
              ],
              "standard": [
                "Set is_logged_in to FALSE.",
                "Negate it into needs_login and print the result."
              ],
              "abstraction": [
                "Print the opposite of FALSE in needs_login."
              ],
              "pseudocode": [
                "SET is_logged_in TO FALSE",
                "SET needs_login TO NOT is_logged_in",
                "PRINT needs_login"
              ]
            }
          ]
        },
        {
          "id": "membership-operators",
          "title": "Membership operators",
          "definition": "Membership operators test whether a value is inside a collection or inside a piece of text.",
          "howAndWhy": "They are useful for search, validation, filtering, and permission checks.",
          "examples": [
            {
              "id": "membership-operators-example-1",
              "strict": [
                "Set values to [1, 2, 3, 4].",
                "Set result to 4 IS IN values.",
                "Print result."
              ],
              "standard": [
                "Set values to [1, 2, 3, 4].",
                "Check whether 4 is in values and print the result."
              ],
              "abstraction": [
                "Print whether 4 appears in [1, 2, 3, 4]."
              ],
              "pseudocode": [
                "SET values TO [1, 2, 3, 4]",
                "SET result TO 4 IS IN values",
                "PRINT result"
              ]
            },
            {
              "id": "membership-operators-example-2",
              "strict": [
                "Set sentence to \"I like math and science\".",
                "Set result to \"math\" IS IN sentence.",
                "Print result."
              ],
              "standard": [
                "Set sentence to \"I like math and science\".",
                "Check whether it contains \"math\" and print the result."
              ],
              "abstraction": [
                "Print whether \"math\" appears in \"I like math and science\"."
              ],
              "pseudocode": [
                "SET sentence TO \"I like math and science\"",
                "SET result TO \"math\" IS IN sentence",
                "PRINT result"
              ]
            }
          ]
        },
        {
          "id": "identity-operators",
          "title": "Identity operators",
          "definition": "Identity checks ask whether two names refer to the exact same object, not just equal values.",
          "howAndWhy": "This matters when programs reuse the same list or object through different variable names. Two values can look equal while still being different objects.",
          "examples": [
            {
              "id": "identity-operators-example",
              "strict": [
                "Set numbers to [1, 2, 3].",
                "Set alias to numbers.",
                "Set same_object to alias IS THE SAME OBJECT AS numbers.",
                "Print same_object."
              ],
              "standard": [
                "Set numbers to [1, 2, 3] and alias to numbers.",
                "Check whether alias and numbers are the same object and print the result."
              ],
              "abstraction": [
                "Print whether alias and numbers refer to the same object."
              ],
              "pseudocode": [
                "SET numbers TO [1, 2, 3]",
                "SET alias TO numbers",
                "SET same_object TO alias IS THE SAME OBJECT AS numbers",
                "PRINT same_object"
              ]
            }
          ]
        },
        {
          "id": "bitwise-operators",
          "title": "Bitwise operators",
          "definition": "Bitwise operators work on the binary representation of integers. Common ones include AND, OR, XOR, left shift, right shift, and bitwise NOT.",
          "howAndWhy": "These are used less often in beginner programs, but they matter in low-level tasks, compact flag systems, and performance-oriented logic.",
          "examples": [
            {
              "id": "bitwise-operators-example-1",
              "strict": [
                "Set result to BITWISE AND OF 6 AND 3.",
                "Print result."
              ],
              "standard": [
                "Apply bitwise AND to 6 and 3, store the result in result, and print it."
              ],
              "abstraction": [
                "Print the bitwise AND of 6 and 3."
              ],
              "pseudocode": [
                "SET result TO BITWISE AND OF 6 AND 3",
                "PRINT result"
              ]
            },
            {
              "id": "bitwise-operators-example-2",
              "strict": [
                "Set result to BITWISE OR OF 6 AND 3.",
                "Print result."
              ],
              "standard": [
                "Apply bitwise OR to 6 and 3, store the result in result, and print it."
              ],
              "abstraction": [
                "Print the bitwise OR of 6 and 3."
              ],
              "pseudocode": [
                "SET result TO BITWISE OR OF 6 AND 3",
                "PRINT result"
              ]
            },
            {
              "id": "bitwise-operators-example-3",
              "strict": [
                "Set result to BITWISE XOR OF 6 AND 3.",
                "Print result."
              ],
              "standard": [
                "Apply bitwise XOR to 6 and 3, store the result in result, and print it."
              ],
              "abstraction": [
                "Print the bitwise XOR of 6 and 3."
              ],
              "pseudocode": [
                "SET result TO BITWISE XOR OF 6 AND 3",
                "PRINT result"
              ]
            },
            {
              "id": "bitwise-operators-example-4",
              "strict": [
                "Set result to 3 SHIFT LEFT BY 2.",
                "Print result."
              ],
              "standard": [
                "Shift 3 left by 2, store the result in result, and print it."
              ],
              "abstraction": [
                "Print the result of shifting 3 left by 2."
              ],
              "pseudocode": [
                "SET result TO 3 SHIFT LEFT BY 2",
                "PRINT result"
              ]
            },
            {
              "id": "bitwise-operators-example-5",
              "strict": [
                "Set result to 16 SHIFT RIGHT BY 2.",
                "Print result."
              ],
              "standard": [
                "Shift 16 right by 2, store the result in result, and print it."
              ],
              "abstraction": [
                "Print the result of shifting 16 right by 2."
              ],
              "pseudocode": [
                "SET result TO 16 SHIFT RIGHT BY 2",
                "PRINT result"
              ]
            }
          ]
        },
        {
          "id": "operator-precedence",
          "title": "Operator precedence",
          "definition": "Operator precedence is the rule that decides which operation happens first when several operators appear in one expression.",
          "howAndWhy": "Understanding precedence prevents mistakes. Multiplication usually happens before addition unless grouping symbols force a different order.",
          "examples": [
            {
              "id": "operator-precedence-example",
              "strict": [
                "Set first_result to 2 + 3 * 4.",
                "Set second_result to (2 + 3) * 4.",
                "Print first_result.",
                "Print second_result."
              ],
              "standard": [
                "Set first_result to 2 + 3 * 4 and second_result to (2 + 3) * 4.",
                "Print both results."
              ],
              "abstraction": [
                "Print the two results from 2 + 3 * 4 and (2 + 3) * 4."
              ],
              "pseudocode": [
                "SET first_result TO 2 + 3 * 4",
                "SET second_result TO (2 + 3) * 4",
                "PRINT first_result",
                "PRINT second_result"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "lists-and-list-operations",
      "number": 7,
      "title": "Lists and list operations",
      "overview": "A list is an ordered collection of values. Lists are used when a program must store many items in a meaningful order.",
      "topics": [
        {
          "id": "creating-a-list",
          "title": "Creating a list",
          "definition": "Creating a list means putting several values into one ordered collection.",
          "howAndWhy": "Use a list when values belong together and may need to be processed one by one.",
          "examples": [
            {
              "id": "creating-a-list-example",
              "strict": [
                "Set scores to [80, 90, 100].",
                "Print scores."
              ],
              "standard": [
                "Create a list scores with 80, 90, and 100, then print it."
              ],
              "abstraction": [
                "Print the list [80, 90, 100]."
              ],
              "pseudocode": [
                "SET scores TO [80, 90, 100]",
                "PRINT scores"
              ]
            }
          ]
        },
        {
          "id": "accessing-list-items",
          "title": "Accessing list items",
          "definition": "Accessing a list item means retrieving the value at a particular position.",
          "howAndWhy": "This is used when the program needs a specific element, such as the first score or last task.",
          "examples": [
            {
              "id": "accessing-list-items-example",
              "strict": [
                "Set scores to [80, 90, 100].",
                "Set first_score to ITEM 0 OF scores.",
                "Print first_score."
              ],
              "standard": [
                "Set scores to [80, 90, 100].",
                "Print item 0 of scores."
              ],
              "abstraction": [
                "Print the first item of [80, 90, 100]."
              ],
              "pseudocode": [
                "SET scores TO [80, 90, 100]",
                "SET first_score TO ITEM 0 OF scores",
                "PRINT first_score"
              ]
            }
          ]
        },
        {
          "id": "changing-a-list-item",
          "title": "Changing a list item",
          "definition": "A list item can be updated by replacing the value at a particular position.",
          "howAndWhy": "This is used when an old value is no longer correct and needs to be revised.",
          "examples": [
            {
              "id": "changing-a-list-item-example",
              "strict": [
                "Set scores to [80, 90, 100].",
                "Set item 1 of scores to 95.",
                "Print scores."
              ],
              "standard": [
                "Set scores to [80, 90, 100].",
                "Change item 1 to 95 and print scores."
              ],
              "abstraction": [
                "Print scores after replacing item 1 with 95."
              ],
              "pseudocode": [
                "SET scores TO [80, 90, 100]",
                "SET ITEM 1 OF scores TO 95",
                "PRINT scores"
              ]
            }
          ]
        },
        {
          "id": "appending",
          "title": "Appending",
          "definition": "Appending adds a new item to the end of the list.",
          "howAndWhy": "This is used when new data arrives over time and order matters.",
          "examples": [
            {
              "id": "appending-example",
              "strict": [
                "Set scores to [80, 90, 100].",
                "Append 110 to scores.",
                "Print scores."
              ],
              "standard": [
                "Set scores to [80, 90, 100].",
                "Append 110 and print scores."
              ],
              "abstraction": [
                "Print scores after appending 110."
              ],
              "pseudocode": [
                "SET scores TO [80, 90, 100]",
                "APPEND 110 TO scores PRINT scores"
              ]
            }
          ]
        },
        {
          "id": "inserting",
          "title": "Inserting",
          "definition": "Inserting adds a value at a chosen position and shifts later items to the right.",
          "howAndWhy": "Use this when order matters and the new value must appear in the middle rather than at the end.",
          "examples": [
            {
              "id": "inserting-example",
              "strict": [
                "Set scores to [80, 90, 100].",
                "Insert 85 AT POSITION 1 IN scores.",
                "Print scores."
              ],
              "standard": [
                "Set scores to [80, 90, 100].",
                "Insert 85 at position 1 and print scores."
              ],
              "abstraction": [
                "Print scores after inserting 85 at position 1."
              ],
              "pseudocode": [
                "SET scores TO [80, 90, 100]",
                "INSERT 85 AT POSITION 1 IN scores",
                "PRINT scores"
              ]
            }
          ]
        },
        {
          "id": "removing-by-value",
          "title": "Removing by value",
          "definition": "Removing by value deletes the first matching value from the list.",
          "howAndWhy": "This is used when the item itself matters more than its exact position.",
          "examples": [
            {
              "id": "removing-by-value-example",
              "strict": [
                "Set scores to [80, 90, 100].",
                "Remove 90 from scores.",
                "Print scores."
              ],
              "standard": [
                "Set scores to [80, 90, 100].",
                "Remove 90 and print scores."
              ],
              "abstraction": [
                "Print scores after removing 90."
              ],
              "pseudocode": [
                "SET scores TO [80, 90, 100]",
                "REMOVE 90 FROM scores",
                "PRINT scores"
              ]
            }
          ]
        },
        {
          "id": "removing-by-position",
          "title": "Removing by position",
          "definition": "Removing by position deletes the item at a chosen index.",
          "howAndWhy": "This is used when the program knows where the unwanted item is located.",
          "examples": [
            {
              "id": "removing-by-position-example",
              "strict": [
                "Set scores to [80, 90, 100].",
                "Remove item 0 from scores.",
                "Print scores."
              ],
              "standard": [
                "Set scores to [80, 90, 100].",
                "Remove item 0 and print scores."
              ],
              "abstraction": [
                "Print scores after removing item 0."
              ],
              "pseudocode": [
                "SET scores TO [80, 90, 100]",
                "REMOVE ITEM 0 FROM scores",
                "PRINT scores"
              ]
            }
          ]
        },
        {
          "id": "length-of-a-list",
          "title": "Length of a list",
          "definition": "The length of a list is the number of items it contains.",
          "howAndWhy": "Length is used for counting, validation, and loop control.",
          "examples": [
            {
              "id": "length-of-a-list-example",
              "strict": [
                "Set tasks to [\"study\", \"eat\", \"sleep\"].",
                "Set task_count to LENGTH OF tasks.",
                "Print task_count."
              ],
              "standard": [
                "Set tasks to [\"study\", \"eat\", \"sleep\"].",
                "Print the length of tasks."
              ],
              "abstraction": [
                "Print how many items are in [\"study\", \"eat\", \"sleep\"]."
              ],
              "pseudocode": [
                "SET tasks TO [\"study\", \"eat\", \"sleep\"]",
                "SET task_count TO LENGTH OF tasks",
                "PRINT task_count"
              ]
            }
          ]
        },
        {
          "id": "membership-in-a-list",
          "title": "Membership in a list",
          "definition": "Membership checks test whether a value appears anywhere in the list.",
          "howAndWhy": "This is useful for search, permission checks, and avoiding duplicates.",
          "examples": [
            {
              "id": "membership-in-a-list-example",
              "strict": [
                "Set tasks to [\"study\", \"eat\", \"sleep\"].",
                "Set has_study to \"study\" IS IN tasks.",
                "Print has_study."
              ],
              "standard": [
                "Set tasks to [\"study\", \"eat\", \"sleep\"].",
                "Check whether \"study\" is in tasks and print the result."
              ],
              "abstraction": [
                "Print whether \"study\" is in [\"study\", \"eat\", \"sleep\"]."
              ],
              "pseudocode": [
                "SET tasks TO [\"study\", \"eat\", \"sleep\"]",
                "SET has_study TO \"study\" IS IN tasks",
                "PRINT has_study"
              ]
            }
          ]
        },
        {
          "id": "slicing-a-list",
          "title": "Slicing a list",
          "definition": "Slicing a list means taking a sub-list from a start position to an end position.",
          "howAndWhy": "This is used for pagination, batching, or extracting part of a sequence.",
          "examples": [
            {
              "id": "slicing-a-list-example",
              "strict": [
                "Set values to [10, 20, 30, 40].",
                "Set first_two to ITEMS 0 THROUGH 1 OF values.",
                "Print first_two."
              ],
              "standard": [
                "Set values to [10, 20, 30, 40].",
                "Print items 0 through 1 of values."
              ],
              "abstraction": [
                "Print the first two items of [10, 20, 30, 40]."
              ],
              "pseudocode": [
                "SET values TO [10, 20, 30, 40]",
                "SET first_two TO ITEMS 0 THROUGH 1 OF values",
                "PRINT first_two"
              ]
            }
          ]
        },
        {
          "id": "sorting-a-list",
          "title": "Sorting a list",
          "definition": "Sorting rearranges the items of a list into order.",
          "howAndWhy": "It is used whenever the program needs smallest-to-largest, largest-to-smallest, or alphabetical order.",
          "examples": [
            {
              "id": "sorting-a-list-example",
              "strict": [
                "Set numbers to [9, 3, 12, 1, 5].",
                "Sort numbers.",
                "Print numbers."
              ],
              "standard": [
                "Set numbers to [9, 3, 12, 1, 5].",
                "Sort them and print the result."
              ],
              "abstraction": [
                "Print [9, 3, 12, 1, 5] after sorting it."
              ],
              "pseudocode": [
                "SET numbers TO [9, 3, 12, 1, 5]",
                "SORT numbers",
                "PRINT numbers"
              ]
            }
          ]
        },
        {
          "id": "reversing-a-list",
          "title": "Reversing a list",
          "definition": "Reversing changes the order so the last item becomes first.",
          "howAndWhy": "This is used for countdowns, recent-first views, and simple ordering changes.",
          "examples": [
            {
              "id": "reversing-a-list-example",
              "strict": [
                "Set names to [\"Ava\", \"Noah\", \"Liam\"].",
                "Reverse names.",
                "Print names."
              ],
              "standard": [
                "Set names to [\"Ava\", \"Noah\", \"Liam\"].",
                "Reverse them and print the result."
              ],
              "abstraction": [
                "Print [\"Ava\", \"Noah\", \"Liam\"] after reversing it."
              ],
              "pseudocode": [
                "SET names TO [\"Ava\", \"Noah\", \"Liam\"]",
                "REVERSE names PRINT names"
              ]
            }
          ]
        },
        {
          "id": "counting-values",
          "title": "Counting values",
          "definition": "Counting values means finding how many times a certain item appears.",
          "howAndWhy": "This is useful for frequency checks, duplicate detection, and summaries.",
          "examples": [
            {
              "id": "counting-values-example",
              "strict": [
                "Set values to [2, 1, 2, 3, 2].",
                "Set two_count to COUNT OF 2 IN values.",
                "Print two_count."
              ],
              "standard": [
                "Set values to [2, 1, 2, 3, 2].",
                "Count how many times 2 appears and print the result."
              ],
              "abstraction": [
                "Print how many times 2 appears in [2, 1, 2, 3, 2]."
              ],
              "pseudocode": [
                "SET values TO [2, 1, 2, 3, 2]",
                "SET two_count TO COUNT OF 2 IN values",
                "PRINT two_count"
              ]
            }
          ]
        },
        {
          "id": "aggregating-a-list",
          "title": "Aggregating a list",
          "definition": "Aggregation means turning many values into one summary such as a sum, average, minimum, or maximum.",
          "howAndWhy": "This is used constantly in real programs because raw data is often less useful than a summary.",
          "examples": [
            {
              "id": "aggregating-a-list-example",
              "strict": [
                "Set scores to [80, 90, 100].",
                "Set total to SUM OF scores.",
                "Set average to total / LENGTH OF scores.",
                "Print total.",
                "Print average."
              ],
              "standard": [
                "Set scores to [80, 90, 100].",
                "Find total and average, then print both."
              ],
              "abstraction": [
                "Print the total and average of [80, 90, 100]."
              ],
              "pseudocode": [
                "SET scores TO [80, 90, 100]",
                "SET total TO SUM OF scores",
                "SET average TO total / LENGTH OF scores",
                "PRINT total",
                "PRINT average"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "tuples-and-tuple-operations",
      "number": 8,
      "title": "Tuples and tuple operations",
      "overview": "A tuple is an ordered collection like a list, but it is meant to stay fixed after creation. Tuples are useful for grouped values that belong together and should not be changed casually.",
      "topics": [
        {
          "id": "creating-tuples",
          "title": "Creating tuples",
          "definition": "Creating a tuple means storing a fixed group of values together.",
          "howAndWhy": "This is used for coordinates, date parts, color values, and any bundle that should behave like one unit.",
          "examples": [
            {
              "id": "creating-tuples-example",
              "strict": [
                "Set point to (4, 9).",
                "Print point."
              ],
              "standard": [
                "Create a tuple point with 4 and 9, then print it."
              ],
              "abstraction": [
                "Print the tuple (4, 9)."
              ],
              "pseudocode": [
                "SET point TO (4, 9)",
                "PRINT point"
              ]
            }
          ]
        },
        {
          "id": "accessing-tuple-items",
          "title": "Accessing tuple items",
          "definition": "Tuple items can be accessed by position just like list items.",
          "howAndWhy": "This is used when the grouped values have predictable meaning by order.",
          "examples": [
            {
              "id": "accessing-tuple-items-example",
              "strict": [
                "Set point to (4, 9).",
                "Set x_value to ITEM 0 OF point.",
                "Print x_value."
              ],
              "standard": [
                "Set point to (4, 9).",
                "Print item 0 of point."
              ],
              "abstraction": [
                "Print the first item of (4, 9)."
              ],
              "pseudocode": [
                "SET point TO (4, 9)",
                "SET x_value TO ITEM 0 OF point",
                "PRINT x_value"
              ]
            }
          ]
        },
        {
          "id": "unpacking-tuples",
          "title": "Unpacking tuples",
          "definition": "Unpacking means taking the separate values from a tuple and storing them in separate variables.",
          "howAndWhy": "This makes grouped output easier to reuse in later calculations.",
          "examples": [
            {
              "id": "unpacking-tuples-example",
              "strict": [
                "Set point to (4, 9).",
                "Set x to FIRST ITEM OF point.",
                "Set y to SECOND ITEM OF point.",
                "Print x.",
                "Print y."
              ],
              "standard": [
                "Set point to (4, 9).",
                "Unpack it into x and y, then print both."
              ],
              "abstraction": [
                "Print the two unpacked values from (4, 9)."
              ],
              "pseudocode": [
                "SET point TO (4, 9)",
                "SET x TO FIRST ITEM OF point",
                "SET y TO SECOND ITEM OF point",
                "PRINT x",
                "PRINT y"
              ]
            }
          ]
        },
        {
          "id": "length-and-membership",
          "title": "Length and membership",
          "definition": "Tuples support checks like length and membership even though they are fixed.",
          "howAndWhy": "These operations are useful when the tuple is used like a protected list of options or values.",
          "examples": [
            {
              "id": "length-and-membership-example",
              "strict": [
                "Set point to (4, 9).",
                "Set has_nine to 9 IS IN point.",
                "Print has_nine."
              ],
              "standard": [
                "Set point to (4, 9).",
                "Check whether 9 is in point and print the result."
              ],
              "abstraction": [
                "Print whether 9 appears in (4, 9)."
              ],
              "pseudocode": [
                "SET point TO (4, 9)",
                "SET has_nine TO 9 IS IN point",
                "PRINT has_nine"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "sets-and-set-operations",
      "number": 9,
      "title": "Sets and set operations",
      "overview": "A set is an unordered collection of unique values. Sets are useful when duplicates do not matter and the main goal is fast membership, uniqueness, or set-style comparison.",
      "topics": [
        {
          "id": "creating-sets",
          "title": "Creating sets",
          "definition": "Creating a set means storing unique values together without caring about order.",
          "howAndWhy": "Sets are used for tags, categories, permissions, and duplicate removal.",
          "examples": [
            {
              "id": "creating-sets-example",
              "strict": [
                "Set subjects to {\"math\", \"science\", \"history\"}.",
                "Print subjects."
              ],
              "standard": [
                "Create a set subjects with math, science, and history, then print it."
              ],
              "abstraction": [
                "Print the set {\"math\", \"science\", \"history\"}."
              ],
              "pseudocode": [
                "SET subjects TO {\"math\", \"science\", \"history\"}",
                "PRINT subjects"
              ]
            }
          ]
        },
        {
          "id": "adding-items",
          "title": "Adding items",
          "definition": "Adding inserts a value into the set if it is not already present.",
          "howAndWhy": "This is used to build a unique collection over time.",
          "examples": [
            {
              "id": "adding-items-example",
              "strict": [
                "Set subjects to {\"math\", \"science\"}.",
                "Add \"art\" to subjects.",
                "Print subjects."
              ],
              "standard": [
                "Set subjects to {\"math\", \"science\"}.",
                "Add \"art\" and print subjects."
              ],
              "abstraction": [
                "Print subjects after adding \"art\"."
              ],
              "pseudocode": [
                "SET subjects TO {\"math\", \"science\"}",
                "ADD \"art\" TO subjects",
                "PRINT subjects"
              ]
            }
          ]
        },
        {
          "id": "removing-items",
          "title": "Removing items",
          "definition": "Removing deletes a value from the set.",
          "howAndWhy": "This is used when access, labels, or categories change.",
          "examples": [
            {
              "id": "removing-items-example",
              "strict": [
                "Set subjects to {\"math\", \"science\", \"art\"}.",
                "Remove \"science\" from subjects.",
                "Print subjects."
              ],
              "standard": [
                "Set subjects to {\"math\", \"science\", \"art\"}.",
                "Remove \"science\" and print subjects."
              ],
              "abstraction": [
                "Print subjects after removing \"science\"."
              ],
              "pseudocode": [
                "SET subjects TO {\"math\", \"science\", \"art\"}",
                "REMOVE \"science\" FROM subjects",
                "PRINT subjects"
              ]
            }
          ]
        },
        {
          "id": "membership-in-sets",
          "title": "Membership in sets",
          "definition": "Membership checks test whether a value is part of the set.",
          "howAndWhy": "This is one of the main reasons sets exist because membership checks are simple and meaningful.",
          "examples": [
            {
              "id": "membership-in-sets-example",
              "strict": [
                "Set subjects to {\"math\", \"science\", \"art\"}.",
                "Set has_math to \"math\" IS IN subjects.",
                "Print has_math."
              ],
              "standard": [
                "Set subjects to {\"math\", \"science\", \"art\"}.",
                "Check whether \"math\" is in subjects and print the result."
              ],
              "abstraction": [
                "Print whether \"math\" is in the subjects set."
              ],
              "pseudocode": [
                "SET subjects TO {\"math\", \"science\", \"art\"}",
                "SET has_math TO \"math\" IS IN subjects",
                "PRINT has_math"
              ]
            }
          ]
        },
        {
          "id": "union",
          "title": "Union",
          "definition": "A union combines all unique values from two sets.",
          "howAndWhy": "This is used when two groups must be merged without duplicates.",
          "examples": [
            {
              "id": "union-example",
              "strict": [
                "Set group_a to {\"Ava\", \"Noah\"}.",
                "Set group_b to {\"Noah\", \"Liam\"}.",
                "Set everyone to UNION OF group_a AND group_b.",
                "Print everyone."
              ],
              "standard": [
                "Set group_a to {\"Ava\", \"Noah\"} and group_b to {\"Noah\", \"Liam\"}.",
                "Find their union and print everyone."
              ],
              "abstraction": [
                "Print the union of {\"Ava\", \"Noah\"} and {\"Noah\", \"Liam\"}."
              ],
              "pseudocode": [
                "SET group_a TO {\"Ava\", \"Noah\"}",
                "SET group_b TO {\"Noah\", \"Liam\"}",
                "SET everyone TO UNION OF group_a AND group_b",
                "PRINT everyone"
              ]
            }
          ]
        },
        {
          "id": "intersection",
          "title": "Intersection",
          "definition": "An intersection keeps only the values that appear in both sets.",
          "howAndWhy": "It is used to find overlap, shared permissions, or common interests.",
          "examples": [
            {
              "id": "intersection-example",
              "strict": [
                "Set club_a to {\"Ava\", \"Noah\", \"Liam\"}.",
                "Set club_b to {\"Noah\", \"Liam\", \"Maya\"}.",
                "Set shared_students to INTERSECTION OF club_a AND club_b.",
                "Print shared_students."
              ],
              "standard": [
                "Set club_a to {\"Ava\", \"Noah\", \"Liam\"} and club_b to {\"Noah\", \"Liam\", \"Maya\"}.",
                "Find their intersection and print shared_students."
              ],
              "abstraction": [
                "Print the shared students in both clubs."
              ],
              "pseudocode": [
                "SET club_a TO {\"Ava\", \"Noah\", \"Liam\"}",
                "SET club_b TO {\"Noah\", \"Liam\", \"Maya\"}",
                "SET shared_students TO INTERSECTION OF club_a AND club_b",
                "PRINT shared_students"
              ]
            }
          ]
        },
        {
          "id": "difference",
          "title": "Difference",
          "definition": "A difference keeps the values that appear in the first set but not in the second.",
          "howAndWhy": "This is used to find what is missing, what remains, or what belongs only to one group.",
          "examples": [
            {
              "id": "difference-example",
              "strict": [
                "Set club_a to {\"Ava\", \"Noah\", \"Liam\"}.",
                "Set club_b to {\"Noah\", \"Maya\"}.",
                "Set only_a to DIFFERENCE OF club_a AND club_b.",
                "Print only_a."
              ],
              "standard": [
                "Set club_a to {\"Ava\", \"Noah\", \"Liam\"} and club_b to {\"Noah\", \"Maya\"}.",
                "Find what is only in club_a and print it."
              ],
              "abstraction": [
                "Print the values that appear only in club_a."
              ],
              "pseudocode": [
                "SET club_a TO {\"Ava\", \"Noah\", \"Liam\"}",
                "SET club_b TO {\"Noah\", \"Maya\"}",
                "SET only_a TO DIFFERENCE OF club_a AND club_b",
                "PRINT only_a"
              ]
            }
          ]
        },
        {
          "id": "subset-checks",
          "title": "Subset checks",
          "definition": "A subset check asks whether every value in one set also appears in another.",
          "howAndWhy": "This is useful for permission systems, requirement checks, and category containment.",
          "examples": [
            {
              "id": "subset-checks-example",
              "strict": [
                "Set required_skills to {\"python\", \"sql\"}.",
                "Set student_skills to {\"python\", \"sql\", \"excel\"}.",
                "Set qualifies to required_skills IS SUBSET OF student_skills.",
                "Print qualifies."
              ],
              "standard": [
                "Set required_skills to {\"python\", \"sql\"} and student_skills to {\"python\", \"sql\", \"excel\"}.",
                "Check whether required_skills is a subset and print the result."
              ],
              "abstraction": [
                "Print whether {\"python\", \"sql\"} is a subset of the student skills."
              ],
              "pseudocode": [
                "SET required_skills TO {\"python\", \"sql\"}",
                "SET student_skills TO {\"python\", \"sql\", \"excel\"}",
                "SET qualifies TO required_skills IS SUBSET OF student_skills",
                "PRINT qualifies"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "dictionaries-and-dictionary-operations",
      "number": 10,
      "title": "Dictionaries and dictionary operations",
      "overview": "A dictionary stores key-value pairs. A key is the label used to look up a value. Dictionaries are used whenever information is naturally described by name.",
      "topics": [
        {
          "id": "creating-dictionaries",
          "title": "Creating dictionaries",
          "definition": "Creating a dictionary means linking keys to values.",
          "howAndWhy": "Dictionaries are used when lookup by name matters more than lookup by position.",
          "examples": [
            {
              "id": "creating-dictionaries-example",
              "strict": [
                "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                "Print grades."
              ],
              "standard": [
                "Create a dictionary grades with Ava and Noah, then print it."
              ],
              "abstraction": [
                "Print the dictionary {\"Ava\": 92, \"Noah\": 88}."
              ],
              "pseudocode": [
                "SET grades TO {\"Ava\": 92, \"Noah\": 88}",
                "PRINT grades"
              ]
            }
          ]
        },
        {
          "id": "accessing-values-by-key",
          "title": "Accessing values by key",
          "definition": "Accessing by key means retrieving a value using its label.",
          "howAndWhy": "This is used because the key describes what the value means.",
          "examples": [
            {
              "id": "accessing-values-by-key-example",
              "strict": [
                "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                "Set ava_grade to VALUE FOR KEY \"Ava\" IN grades.",
                "Print ava_grade."
              ],
              "standard": [
                "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                "Look up \"Ava\" and print the value."
              ],
              "abstraction": [
                "Print the value stored for key \"Ava\"."
              ],
              "pseudocode": [
                "SET grades TO {\"Ava\": 92, \"Noah\": 88}",
                "SET ava_grade TO VALUE FOR KEY \"Ava\" IN grades",
                "PRINT ava_grade"
              ]
            }
          ]
        },
        {
          "id": "adding-or-updating-keys",
          "title": "Adding or updating keys",
          "definition": "Adding or updating means assigning a value to a key whether that key is new or already exists.",
          "howAndWhy": "This is used when data changes over time or new entries are added.",
          "examples": [
            {
              "id": "adding-or-updating-keys-example",
              "strict": [
                "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                "Set the key Maya in grades to 95.",
                "Set the key Noah in grades to 90.",
                "Print grades."
              ],
              "standard": [
                "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                "Add Maya with 95, update Noah to 90, and print grades."
              ],
              "abstraction": [
                "Print grades after adding Maya and updating Noah."
              ],
              "pseudocode": [
                "SET grades TO {\"Ava\": 92, \"Noah\": 88}",
                "SET KEY \"Maya\" IN grades TO 95",
                "SET KEY \"Noah\" IN grades TO 90",
                "PRINT grades"
              ]
            }
          ]
        },
        {
          "id": "removing-keys",
          "title": "Removing keys",
          "definition": "Removing deletes a key and its value from the dictionary.",
          "howAndWhy": "This is used when data is no longer needed or is no longer valid.",
          "examples": [
            {
              "id": "removing-keys-example",
              "strict": [
                "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                "Remove key \"ava\" from grades.",
                "Print grades."
              ],
              "standard": [
                "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                "Remove key \"Ava\" and print grades."
              ],
              "abstraction": [
                "Print grades after removing key \"Ava\"."
              ],
              "pseudocode": [
                "SET grades TO {\"Ava\": 92, \"Noah\": 88}",
                "REMOVE KEY \"Ava\" FROM grades",
                "PRINT grades"
              ]
            }
          ]
        },
        {
          "id": "checking-keys",
          "title": "Checking keys",
          "definition": "Checking keys means testing whether a certain label exists in the dictionary.",
          "howAndWhy": "This prevents lookup errors and supports safe validation.",
          "examples": [
            {
              "id": "checking-keys-example",
              "strict": [
                "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                "Set has_maya to KEY \"Maya\" EXISTS IN grades.",
                "Print has_maya."
              ],
              "standard": [
                "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                "Check whether key \"Maya\" exists and print the result."
              ],
              "abstraction": [
                "Print whether the dictionary contains key \"Maya\"."
              ],
              "pseudocode": [
                "SET grades TO {\"Ava\": 92, \"Noah\": 88}",
                "SET has_maya TO KEY \"Maya\" EXISTS IN grades",
                "PRINT has_maya"
              ]
            }
          ]
        },
        {
          "id": "keys-values-and-items",
          "title": "Keys, values, and items",
          "definition": "A dictionary can expose all of its keys, all of its values, or all key-value pairs.",
          "howAndWhy": "This is useful for iteration, summaries, and reporting.",
          "examples": [
            {
              "id": "keys-values-and-items-example",
              "strict": [
                "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                "Set student_names to ALL KEYS OF grades.",
                "Set score_values to ALL VALUES OF grades.",
                "Print student_names.",
                "Print score_values."
              ],
              "standard": [
                "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                "Get the keys and values, then print both."
              ],
              "abstraction": [
                "Print the keys and values from the grades dictionary."
              ],
              "pseudocode": [
                "SET grades TO {\"Ava\": 92, \"Noah\": 88}",
                "SET student_names TO ALL KEYS OF grades",
                "SET score_values TO ALL VALUES OF grades",
                "PRINT student_names",
                "PRINT score_values"
              ]
            }
          ]
        },
        {
          "id": "looping-through-dictionaries",
          "title": "Looping through dictionaries",
          "definition": "Looping through a dictionary means visiting each key or each key-value pair.",
          "howAndWhy": "This is used when the program must process all records one by one.",
          "examples": [
            {
              "id": "looping-through-dictionaries-example",
              "strict": [
                "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                "For each student, score in grades.",
                "Print student.",
                "Print score."
              ],
              "standard": [
                "Set grades to {\"Ava\": 92, \"Noah\": 88}.",
                "Loop through each student and score, then print both."
              ],
              "abstraction": [
                "Print each student and score in the grades dictionary."
              ],
              "pseudocode": [
                "SET grades TO {\"Ava\": 92, \"Noah\": 88}",
                "FOR EACH student, score IN grades",
                "PRINT student",
                "PRINT score"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "if-else-logic",
      "number": 11,
      "title": "If else logic",
      "overview": "If else logic lets a program choose between actions based on conditions. It is the simplest way to make a program behave differently in different situations.",
      "topics": [
        {
          "id": "basic-if",
          "title": "Basic if",
          "definition": "An if statement runs a block only when its condition is true.",
          "howAndWhy": "It is used to guard actions so they happen only when a rule is satisfied.",
          "examples": [
            {
              "id": "basic-if-example",
              "strict": [
                "Set score to 72.",
                "If score >= 50, then.",
                "Print \"Pass\"."
              ],
              "standard": [
                "Set score to 72.",
                "If score >= 50.",
                "Print \"Pass\"."
              ],
              "abstraction": [
                "Print \"Pass\" if score is at least 50."
              ],
              "pseudocode": [
                "SET score TO 72",
                "IF score >= 50 THEN",
                "PRINT \"Pass\""
              ]
            }
          ]
        },
        {
          "id": "if-else",
          "title": "If else",
          "definition": "If else chooses between two paths.",
          "howAndWhy": "It is used when both success and failure behavior matter.",
          "examples": [
            {
              "id": "if-else-example",
              "strict": [
                "Set score to 42.",
                "If score >= 50, then.",
                "Print \"Pass\".",
                "Otherwise.",
                "Print \"Fail\"."
              ],
              "standard": [
                "Set score to 42.",
                "If score >= 50.",
                "Print \"Pass\".",
                "Otherwise, print \"Fail\"."
              ],
              "abstraction": [
                "Print \"Pass\" if score is at least 50, otherwise print \"Fail\"."
              ],
              "pseudocode": [
                "SET score TO 42",
                "IF score >= 50 THEN",
                "PRINT \"Pass\"",
                "ELSE",
                "PRINT \"Fail\""
              ]
            }
          ]
        },
        {
          "id": "if-elif-else",
          "title": "If elif else",
          "definition": "This form handles several cases in order.",
          "howAndWhy": "It is used for grade bands, menu logic, and category selection.",
          "examples": [
            {
              "id": "if-elif-else-example",
              "strict": [
                "Set score to 84.",
                "If score >= 90, then.",
                "Print \"A\".",
                "Otherwise, if score >= 80, then.",
                "Print \"B\".",
                "Otherwise.",
                "Print \"C\"."
              ],
              "standard": [
                "Set score to 84.",
                "If score >= 90.",
                "Print \"A\".",
                "Otherwise, if score >= 80, print \"B\".",
                "Otherwise, print \"C\"."
              ],
              "abstraction": [
                "Print A for 90+, B for 80+, otherwise C."
              ],
              "pseudocode": [
                "SET score TO 84",
                "IF score >= 90 THEN",
                "PRINT \"A\"",
                "ELSE IF score >= 80 THEN",
                "PRINT \"B\"",
                "ELSE",
                "PRINT \"C\""
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "case-or-match-logic",
      "number": 12,
      "title": "Case or match logic",
      "overview": "Case logic compares one value against several possible exact options. It is cleaner than many repeated if statements when the program is choosing between named cases.",
      "topics": [
        {
          "id": "case-selection",
          "title": "Case selection",
          "definition": "Case logic selects one branch based on the value of a variable.",
          "howAndWhy": "It is used in menus, role selection, command processing, and category dispatch.",
          "examples": [
            {
              "id": "case-selection-example",
              "strict": [
                "Set day to \"Monday\".",
                "Match day.",
                "If the case is \"Monday\", then print \"start of week\".",
                "If the case is \"Friday\", then print \"end of week\".",
                "In the default case, print \"middle of week\"."
              ],
              "standard": [
                "Set day to \"Monday\".",
                "Match day.",
                "If the value is \"Monday\", print \"start of week\".",
                "If the value is \"Friday\", print \"end of week\".",
                "Otherwise, print \"middle of week\"."
              ],
              "abstraction": [
                "Match day and print the message for Monday, Friday, or the default case."
              ],
              "pseudocode": [
                "SET day TO \"Monday\"",
                "MATCH day CASE \"Monday\": PRINT \"Start of week\" CASE \"Friday\": PRINT \"End of week\" DEFAULT:",
                "PRINT \"Middle of week\""
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "while-loops",
      "number": 13,
      "title": "While loops",
      "overview": "A while loop repeats as long as a condition stays true. It is useful when the number of repetitions is not known in advance.",
      "topics": [
        {
          "id": "basic-while-loop",
          "title": "Basic while loop",
          "definition": "A while loop checks the condition before each repetition.",
          "howAndWhy": "Use it for counting, retrying, waiting, and repeated processing until a state changes.",
          "examples": [
            {
              "id": "basic-while-loop-example",
              "strict": [
                "Set count to 1.",
                "While count <= 3.",
                "Print count.",
                "Set count to count + 1."
              ],
              "standard": [
                "Set count to 1.",
                "Repeat while count <= 3, printing count and increasing it each time."
              ],
              "abstraction": [
                "Print the numbers 1 through 3 with a while loop."
              ],
              "pseudocode": [
                "SET count TO 1",
                "WHILE count <= 3 DO",
                "PRINT count",
                "SET count TO count + 1"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "for-loops",
      "number": 14,
      "title": "For loops",
      "overview": "A for loop repeats over a sequence or over a known range of values. It is often the clearest loop when you already know what collection or count you want to iterate over.",
      "topics": [
        {
          "id": "for-each-item",
          "title": "For each item",
          "definition": "This form loops through every item in a collection.",
          "howAndWhy": "It is used to process lists, tuples, sets, dictionaries, and strings.",
          "examples": [
            {
              "id": "for-each-item-example",
              "strict": [
                "Set names to [\"Ava\", \"Noah\", \"Liam\"].",
                "For each name in names.",
                "Print name."
              ],
              "standard": [
                "Set names to [\"Ava\", \"Noah\", \"Liam\"].",
                "Loop through each name and print it."
              ],
              "abstraction": [
                "Print each name in [\"Ava\", \"Noah\", \"Liam\"]."
              ],
              "pseudocode": [
                "SET names TO [\"Ava\", \"Noah\", \"Liam\"]",
                "FOR EACH name IN names",
                "PRINT name"
              ]
            }
          ]
        },
        {
          "id": "for-with-index",
          "title": "For with index",
          "definition": "Some loops need both the item and its position.",
          "howAndWhy": "This is useful when numbering output or updating a collection by index.",
          "examples": [
            {
              "id": "for-with-index-example",
              "strict": [
                "Set tasks to [\"study\", \"eat\", \"sleep\"].",
                "For each index from 0 to length of tasks - 1.",
                "Print index.",
                "Print ITEM index OF tasks."
              ],
              "standard": [
                "Set tasks to [\"study\", \"eat\", \"sleep\"].",
                "Loop through the indexes, then print each index and its task."
              ],
              "abstraction": [
                "Print each index with its matching task."
              ],
              "pseudocode": [
                "SET tasks TO [\"study\", \"eat\", \"sleep\"]",
                "FOR EACH index FROM 0 TO LENGTH OF tasks - 1",
                "PRINT index",
                "PRINT ITEM index OF tasks"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "functions",
      "number": 15,
      "title": "Functions",
      "overview": "A function is a reusable block of instructions that performs one clear job. Functions help programs stay organized because instead of repeating the same steps many times, the program can define those steps once and call them whenever needed.",
      "topics": [
        {
          "id": "defining-a-function",
          "title": "Defining a function",
          "definition": "Defining a function gives a name to a block of reusable instructions.",
          "howAndWhy": "This is used to organize repeated logic into one place.",
          "examples": [
            {
              "id": "defining-a-function-example",
              "strict": [
                "Define a function named welcome.",
                "Print \"Welcome\"."
              ],
              "standard": [
                "Define a function welcome that prints \"Welcome\"."
              ],
              "abstraction": [
                "Define welcome to print \"Welcome\"."
              ],
              "pseudocode": [
                "DEFINE FUNCTION welcome PRINT \"Welcome\""
              ]
            }
          ]
        },
        {
          "id": "calling-a-function",
          "title": "Calling a function",
          "definition": "Calling a function means running the instructions inside it.",
          "howAndWhy": "This is how reuse actually happens.",
          "examples": [
            {
              "id": "calling-a-function-example",
              "strict": [
                "Call welcome."
              ],
              "standard": [
                "Run the welcome function."
              ],
              "abstraction": [
                "Invoke welcome."
              ],
              "pseudocode": [
                "CALL welcome"
              ]
            }
          ]
        },
        {
          "id": "function-arguments",
          "title": "Function arguments",
          "definition": "Arguments are input values passed into a function.",
          "howAndWhy": "They make one function reusable for many different values instead of only one fixed case.",
          "examples": [
            {
              "id": "function-arguments-example",
              "strict": [
                "Define a function named greet that takes name.",
                "Print \"Hello \" + name.",
                "Call greet(\"Ava\")."
              ],
              "standard": [
                "Define a function greet that takes name.",
                "Call greet(\"Ava\") to print the greeting."
              ],
              "abstraction": [
                "Call greet with \"Ava\" to print a greeting."
              ],
              "pseudocode": [
                "DEFINE FUNCTION greet(name) PRINT \"Hello \" + name CALL greet(\"Ava\")"
              ]
            }
          ]
        },
        {
          "id": "return-values",
          "title": "Return values",
          "definition": "A return value is the result sent back by a function.",
          "howAndWhy": "Functions return values when later steps need to use the result in another calculation.",
          "examples": [
            {
              "id": "return-values-example",
              "strict": [
                "Define a function named double that takes number.",
                "Return number * 2.",
                "Set answer to CALL double(6).",
                "Print answer."
              ],
              "standard": [
                "Define a function double that returns number * 2.",
                "Call it with 6, store the answer, and print it."
              ],
              "abstraction": [
                "Print the value returned by double(6)."
              ],
              "pseudocode": [
                "DEFINE FUNCTION double(number) RETURN number * 2 SET answer TO CALL double(6) PRINT answer"
              ]
            }
          ]
        },
        {
          "id": "function-scope",
          "title": "Function scope",
          "definition": "Scope describes where a variable can be seen and used.",
          "howAndWhy": "This matters because variables created inside a function are usually meant to stay local to that function.",
          "examples": [
            {
              "id": "function-scope-example",
              "strict": [
                "Define a function named show_score.",
                "Set score to 100.",
                "Print score.",
                "Call show_score."
              ],
              "standard": [
                "Define show_score so score is set and printed inside the function.",
                "Call show_score."
              ],
              "abstraction": [
                "Call show_score to print its local score."
              ],
              "pseudocode": [
                "DEFINE FUNCTION show_score SET score TO 100 PRINT score CALL show_score"
              ]
            }
          ]
        },
        {
          "id": "recursion",
          "title": "Recursion",
          "definition": "Recursion means a function calls itself on a smaller version of the same problem.",
          "howAndWhy": "It is used for repeating structures such as factorials, tree-like data, and divide-and-conquer logic.",
          "examples": [
            {
              "id": "recursion-example",
              "strict": [
                "Define a function named factorial that takes n.",
                "If n <= 1, then.",
                "Return 1.",
                "Otherwise.",
                "Return n * CALL factorial(n - 1)."
              ],
              "standard": [
                "Define factorial(n).",
                "Return 1 when n <= 1, otherwise return n * CALL factorial(n - 1)."
              ],
              "abstraction": [
                "Define factorial recursively with a base case of 1."
              ],
              "pseudocode": [
                "DEFINE FUNCTION factorial(n) IF n <= 1 THEN RETURN 1 ELSE RETURN n * CALL factorial(n - 1)"
              ]
            }
          ]
        },
        {
          "id": "generators",
          "title": "Generators",
          "definition": "A generator produces values one at a time instead of building the whole result at once.",
          "howAndWhy": "This is useful when a sequence may be large or when values should be produced only when needed.",
          "examples": [
            {
              "id": "generators-example",
              "strict": [
                "Define generator count_to_three.",
                "Yield 1.",
                "Yield 2.",
                "Yield 3."
              ],
              "standard": [
                "Define generator count_to_three that yields 1, 2, and 3."
              ],
              "abstraction": [
                "Yield 1, 2, and 3 from count_to_three."
              ],
              "pseudocode": [
                "DEFINE GENERATOR count_to_three YIELD 1 YIELD 2 YIELD 3"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "range",
      "number": 16,
      "title": "Range",
      "overview": "A range represents a sequence of numbers, often used for counting loops.",
      "topics": [
        {
          "id": "using-a-range",
          "title": "Using a range",
          "definition": "A range gives start, stop, and sometimes step information for repeated iteration.",
          "howAndWhy": "It is useful when the loop is about positions or counts rather than about items already stored in a collection.",
          "examples": [
            {
              "id": "using-a-range-example",
              "strict": [
                "For number from 1 to 5.",
                "Print number."
              ],
              "standard": [
                "Loop from 1 to 5 and print each number."
              ],
              "abstraction": [
                "Print each number from 1 to 5."
              ],
              "pseudocode": [
                "FOR number FROM 1 TO 5",
                "PRINT number"
              ]
            }
          ]
        },
        {
          "id": "using-a-step",
          "title": "Using a step",
          "definition": "A step changes how much the loop variable increases each time.",
          "howAndWhy": "This is useful for skipping values or moving through a sequence in regular jumps.",
          "examples": [
            {
              "id": "using-a-step-example",
              "strict": [
                "For number from 2 to 10 step 2.",
                "Print number."
              ],
              "standard": [
                "Loop from 2 to 10 in steps of 2 and print each number."
              ],
              "abstraction": [
                "Print every second number from 2 to 10."
              ],
              "pseudocode": [
                "FOR number FROM 2 TO 10 STEP 2",
                "PRINT number"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "types-of-errors",
      "number": 17,
      "title": "Types of errors",
      "overview": "Errors are problems that stop a program from working correctly. Learning error types helps students debug more calmly because they can identify what kind of mistake happened.",
      "topics": [
        {
          "id": "syntax-errors",
          "title": "Syntax errors",
          "definition": "A syntax error means the program structure is written in an invalid way.",
          "howAndWhy": "This prevents the program from running at all because the instructions cannot be parsed correctly.",
          "examples": [
            {
              "id": "syntax-errors-example",
              "strict": [
                "If, then.",
                "Print \"Hello\"."
              ],
              "standard": [
                "If.",
                "Print \"Hello\"."
              ],
              "abstraction": [
                "Show an incomplete if statement, then try to print \"Hello\"."
              ],
              "pseudocode": [
                "IF THEN",
                "PRINT \"Hello\""
              ]
            }
          ]
        },
        {
          "id": "runtime-errors",
          "title": "Runtime errors",
          "definition": "A runtime error happens while the program is executing.",
          "howAndWhy": "The program may start correctly but crash when it hits an invalid action such as dividing by zero or looking up a missing value.",
          "examples": [
            {
              "id": "runtime-errors-example",
              "strict": [
                "Set value to 10 / 0.",
                "Print value."
              ],
              "standard": [
                "Divide 10 by 0, store it in value, and try to print it."
              ],
              "abstraction": [
                "Show a divide-by-zero runtime error."
              ],
              "pseudocode": [
                "SET value TO 10 / 0",
                "PRINT value"
              ]
            }
          ]
        },
        {
          "id": "logic-errors",
          "title": "Logic errors",
          "definition": "A logic error means the program runs, but it produces the wrong result.",
          "howAndWhy": "These are often the hardest errors because nothing crashes. The idea is simply wrong.",
          "examples": [
            {
              "id": "logic-errors-example",
              "strict": [
                "Set total to 80 + 90.",
                "Set average to total / 3.",
                "Print average."
              ],
              "standard": [
                "Set total to 80 + 90.",
                "Divide by 3 instead of 2 and print the average."
              ],
              "abstraction": [
                "Print an incorrect average caused by the wrong divisor."
              ],
              "pseudocode": [
                "SET total TO 80 + 90",
                "SET average TO total / 3",
                "PRINT average"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "try-except",
      "number": 18,
      "title": "Try except",
      "overview": "Try except logic allows a program to attempt an action and respond gracefully if something goes wrong.",
      "topics": [
        {
          "id": "basic-try-except",
          "title": "Basic try except",
          "definition": "The try block contains risky code. The except block explains what to do if an error occurs.",
          "howAndWhy": "This is used for safer programs and for user-friendly failure handling.",
          "examples": [
            {
              "id": "basic-try-except-example",
              "strict": [
                "Set text_value to \"abc\".",
                "Try.",
                "Set number_value to CONVERT text_value TO NUMBER.",
                "Print number_value.",
                "Except.",
                "Print \"Conversion failed\"."
              ],
              "standard": [
                "Set text_value to \"abc\".",
                "Try converting it to a number and print it.",
                "If conversion fails, print \"Conversion failed\"."
              ],
              "abstraction": [
                "Try to convert \"abc\" to a number, otherwise print \"Conversion failed\"."
              ],
              "pseudocode": [
                "SET text_value TO \"abc\"",
                "TRY SET number_value TO CONVERT text_value TO NUMBER PRINT number_value EXCEPT PRINT",
                "\"Conversion failed\""
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "oop",
      "number": 19,
      "title": "OOP",
      "overview": "Object-oriented programming organizes code around objects that bundle together data and behavior. Beginners should see OOP as a way to model real entities such as students, bank accounts, or game characters.",
      "topics": [
        {
          "id": "classes",
          "title": "Classes",
          "definition": "A class is a blueprint that describes what data and behavior an object should have.",
          "howAndWhy": "Use a class when many objects should share the same structure.",
          "examples": [
            {
              "id": "classes-example",
              "strict": [
                "Define a class named Student.",
                "Store name.",
                "Store score."
              ],
              "standard": [
                "Define a class Student that stores name and score."
              ],
              "abstraction": [
                "Define Student to store name and score."
              ],
              "pseudocode": [
                "DEFINE CLASS Student STORE name STORE score"
              ]
            }
          ]
        },
        {
          "id": "objects",
          "title": "Objects",
          "definition": "An object is a specific instance created from a class.",
          "howAndWhy": "Objects are used when the program must represent many concrete entities of the same kind.",
          "examples": [
            {
              "id": "objects-example",
              "strict": [
                "Create student object ava with name = \"ava\" and score = 95."
              ],
              "standard": [
                "Create a Student object ava with name = \"Ava\" and score = 95."
              ],
              "abstraction": [
                "Instantiate Student as ava with name \"Ava\" and score 95."
              ],
              "pseudocode": [
                "CREATE Student OBJECT ava WITH name = \"Ava\" AND score = 95"
              ]
            }
          ]
        },
        {
          "id": "init-methods",
          "title": "Init methods",
          "definition": "An initialization method sets up the object's starting data when it is created.",
          "howAndWhy": "This ensures every new object starts with a valid internal state.",
          "examples": [
            {
              "id": "init-methods-example",
              "strict": [
                "Define a class named Student.",
                "Define the initialization method that takes name, score.",
                "Set self.name to name.",
                "Set self.score to score."
              ],
              "standard": [
                "Define a class Student with an initializer that stores name and score."
              ],
              "abstraction": [
                "Initialize Student objects with name and score."
              ],
              "pseudocode": [
                "DEFINE CLASS Student DEFINE INIT(name, score) SET self.name TO name SET self.score TO score"
              ]
            }
          ]
        },
        {
          "id": "self-parameter",
          "title": "Self parameter",
          "definition": "The self parameter refers to the current object inside its own methods.",
          "howAndWhy": "It is used so the object can read or update its own data.",
          "examples": [
            {
              "id": "self-parameter-example",
              "strict": [
                "Define a class named Student.",
                "Define a method named show_name that takes self.",
                "Print self.name."
              ],
              "standard": [
                "Define a class Student.",
                "Define show_name to print self.name."
              ],
              "abstraction": [
                "Use self to print the object's name."
              ],
              "pseudocode": [
                "DEFINE CLASS Student DEFINE METHOD show_name(self) PRINT self.name"
              ]
            }
          ]
        },
        {
          "id": "class-properties",
          "title": "Class properties",
          "definition": "Class properties are the data stored on each object.",
          "howAndWhy": "They describe the state of each object and allow different objects to hold different values.",
          "examples": [
            {
              "id": "class-properties-example",
              "strict": [
                "Define a class named BankAccount.",
                "Define the initialization method that takes balance.",
                "Set self.balance to balance."
              ],
              "standard": [
                "Define a class BankAccount with an initializer that stores balance."
              ],
              "abstraction": [
                "Store balance as a BankAccount property."
              ],
              "pseudocode": [
                "DEFINE CLASS BankAccount DEFINE INIT(balance) SET self.balance TO balance"
              ]
            }
          ]
        },
        {
          "id": "class-methods",
          "title": "Class methods",
          "definition": "Class methods are behaviors that objects of the class can perform.",
          "howAndWhy": "They are used to keep related actions close to the data they affect.",
          "examples": [
            {
              "id": "class-methods-example",
              "strict": [
                "Define a class named BankAccount.",
                "Define a method named deposit that takes self, amount.",
                "Set self.balance to self.balance + amount."
              ],
              "standard": [
                "Define a class BankAccount.",
                "Define deposit to add amount to self.balance."
              ],
              "abstraction": [
                "Use deposit to increase the account balance."
              ],
              "pseudocode": [
                "DEFINE CLASS BankAccount DEFINE METHOD deposit(self, amount) SET self.balance TO self.balance +",
                "amount"
              ]
            }
          ]
        },
        {
          "id": "class-inheritance",
          "title": "Class inheritance",
          "definition": "Inheritance lets one class build on another class so shared behavior does not need to be rewritten.",
          "howAndWhy": "It is used when one object type is a more specific version of another.",
          "examples": [
            {
              "id": "class-inheritance-example",
              "strict": [
                "Define a class named GraduateStudent that extends Student.",
                "Define the initialization method that takes name, score, research_topic.",
                "Set self.name to name.",
                "Set self.score to score.",
                "Set self.research_topic to research_topic."
              ],
              "standard": [
                "Define GraduateStudent as a class that extends Student.",
                "Initialize it with name, score, and research_topic."
              ],
              "abstraction": [
                "Extend Student with GraduateStudent and add research_topic."
              ],
              "pseudocode": [
                "DEFINE CLASS GraduateStudent EXTENDS Student DEFINE INIT(name, score, research_topic) SET",
                "self.name TO name SET self.score TO score SET self.research_topic TO research_topic"
              ]
            }
          ]
        }
      ]
    }
  ],
  "data-structures-algorithms": [
    {
      "id": "linked-list",
      "number": 1,
      "title": "Linked List",
      "overview": "A linked list stores values in nodes, where each node points to the next node. Unlike an array-like structure, elements do not have to sit next to each other in memory, which makes insertion and deletion near known locations natural while ordinary searching still requires stepping through the chain one node at a time.",
      "topics": [
        {
          "id": "linked-list-initialization-with-classes",
          "title": "Initialization with classes",
          "definition": "Initialization is the process of defining the node object and the list object, then setting the head pointer to the first node or to empty. In an object-oriented design, the list class owns the head and any helper methods.",
          "howAndWhy": "This is used because a linked list is not just a bag of values. It is a relationship between nodes. By using a Node class and a LinkedList class, the learner sees exactly what the structure must remember: where the first node is, how new nodes are attached, and how the chain is traversed.",
          "examples": [
            {
              "id": "linked-list-initialization-with-classes-example",
              "strict": [
                "Create a class named Node.",
                "                  Define a function named initialize that takes value.",
                "                  Set self.value to value.",
                "                  Set self.next to null.",
                "                  Create a class named LinkedList.",
                "                  Define a function named initialize.",
                "                  Set self.head to null.",
                "                  Define a function named append that takes value.",
                "                  Create new_node as Node(value).",
                "                  If self.head is null, then.",
                "                  Set self.head to new_node.",
                "                  Return.",
                "                  End the if.",
                "                  Set current to self.head.",
                "                  While current.next is not null.",
                "                  Set current to current.next.",
                "                  End the while.",
                "                  Set current.next to new_node.",
                "                  Create numbers as LinkedList().",
                "                  Call numbers.append(7).",
                "                  Call numbers.append(11).",
                "                  Call numbers.append(15)."
              ],
              "standard": [
                "Create Node with initialize storing value and next.",
                "                  Create LinkedList with initialize setting head to null.",
                "                  Define append(value) to create new_node, set head if empty, otherwise walk to the end and attach it.",
                "                  Create numbers and append 7, 11, and 15."
              ],
              "abstraction": [
                "Build Node and LinkedList classes, then append 7, 11, and 15 to numbers."
              ],
              "pseudocode": [
                "CLASS Node",
                "                  FUNCTION initialize(value)",
                "                  SET self.value = value",
                "                  SET self.next = null",
                "                  CLASS LinkedList",
                "                  FUNCTION initialize()",
                "                  SET self.head = null",
                "                  FUNCTION append(value)",
                "                  CREATE new_node AS Node(value)",
                "                  IF self.head IS null THEN",
                "                  SET self.head = new_node",
                "                  RETURN",
                "                  END IF",
                "                  SET current = self.head",
                "                  WHILE current.next IS NOT null",
                "                  SET current = current.next",
                "                  END WHILE",
                "                  SET current.next = new_node",
                "                  CREATE numbers AS LinkedList()",
                "                  CALL numbers.append(7)",
                "                  CALL numbers.append(11)",
                "                  CALL numbers.append(15)"
              ]
            }
          ]
        },
        {
          "id": "linked-list-linear-search",
          "title": "Linear search",
          "definition": "Linear search in a linked list means starting at the head and checking each node until the target is found or the list ends.",
          "howAndWhy": "It is used because linked lists do not support direct indexing the way arrays do. The only reliable way to find a value is to follow the next pointers one by one. This makes the cost proportional to how far through the chain the value appears.",
          "examples": [
            {
              "id": "linked-list-linear-search-example",
              "strict": [
                "Define a function named contains that takes target.",
                "                  Set current to self.head.",
                "                  While current is not null.",
                "                  If current.value = target, then.",
                "                  Return true.",
                "                  End the if.",
                "                  Set current to current.next.",
                "                  End the while.",
                "                  Return false."
              ],
              "standard": [
                "Define contains(target).",
                "                  Start current at self.head and walk through the list.",
                "                  Return true when current.value = target.",
                "                  Otherwise move to current.next until the list ends.",
                "                  Return false if target is never found."
              ],
              "abstraction": [
                "Traverse from head to tail and return whether target appears."
              ],
              "pseudocode": [
                "FUNCTION contains(target)",
                "                  SET current = self.head",
                "                  WHILE current IS NOT null",
                "                  IF current.value = target THEN",
                "                  RETURN true",
                "                  END IF",
                "                  SET current = current.next",
                "                  END WHILE",
                "                  RETURN false"
              ]
            }
          ]
        },
        {
          "id": "linked-list-insert-at-the-front",
          "title": "Insert at the front",
          "definition": "Insert at the front creates a new node and makes that node the new head of the list.",
          "howAndWhy": "This is one of the main strengths of a linked list. The operation is constant-time because no existing values need to shift. Only the head reference and the new node's next reference need to be updated.",
          "examples": [
            {
              "id": "linked-list-insert-at-the-front-example",
              "strict": [
                "Define a function named push_front that takes value.",
                "                  Create new_node as Node(value).",
                "                  Set new_node.next to self.head.",
                "                  Set self.head to new_node."
              ],
              "standard": [
                "Define push_front(value).",
                "                  Create new_node, point it to the old head, and make it the new head."
              ],
              "abstraction": [
                "Insert a new node at the front of the list."
              ],
              "pseudocode": [
                "FUNCTION push_front(value)",
                "                  CREATE new_node AS Node(value)",
                "                  SET new_node.next = self.head",
                "                  SET self.head = new_node"
              ]
            }
          ]
        },
        {
          "id": "linked-list-insert-after-a-known-node",
          "title": "Insert after a known node",
          "definition": "Insert after a known node means splicing a new node into the chain after a node that has already been located.",
          "howAndWhy": "It is used when the program already has a pointer to the position where the new value belongs. This is efficient because the list does not have to shift later elements. Only a few references are rewired.",
          "examples": [
            {
              "id": "linked-list-insert-after-a-known-node-example",
              "strict": [
                "Define a function named insert_after that takes node, value.",
                "                  If node is null, then.",
                "                  Return.",
                "                  End the if.",
                "                  Create new_node as Node(value).",
                "                  Set new_node.next to node.next.",
                "                  Set node.next to new_node."
              ],
              "standard": [
                "Define insert_after(node, value).",
                "                  Return if node is null.",
                "                  Create new_node, preserve node.next, and link new_node after node."
              ],
              "abstraction": [
                "Splice a new node in immediately after a known node."
              ],
              "pseudocode": [
                "FUNCTION insert_after(node, value)",
                "                  IF node IS null THEN",
                "                  RETURN",
                "                  END IF",
                "                  CREATE new_node AS Node(value)",
                "                  SET new_node.next = node.next",
                "                  SET node.next = new_node"
              ]
            }
          ]
        },
        {
          "id": "linked-list-delete-by-value",
          "title": "Delete by value",
          "definition": "Delete by value removes the first node whose value matches the target and reconnects the surrounding nodes so the chain remains intact.",
          "howAndWhy": "It is used when the goal is to remove a logical item from the list. Deletion is natural in a linked list because values do not need to shift left. The key challenge is keeping track of the node before the node being removed.",
          "examples": [
            {
              "id": "linked-list-delete-by-value-example",
              "strict": [
                "Define a function named delete_value that takes target.",
                "                  If self.head is null, then.",
                "                  Return false.",
                "                  End the if.",
                "                  If self.head.value = target, then.",
                "                  Set self.head to self.head.next.",
                "                  Return true.",
                "                  End the if.",
                "                  Set previous to self.head.",
                "                  Set current to self.head.next.",
                "                  While current is not null.",
                "                  If current.value = target, then.",
                "                  Set previous.next to current.next.",
                "                  Return true.",
                "                  End the if.",
                "                  Set previous to current.",
                "                  Set current to current.next.",
                "                  End the while.",
                "                  Return false."
              ],
              "standard": [
                "Define delete_value(target).",
                "                  Handle the empty list and the case where the head matches.",
                "                  Walk previous and current through the list until target is found.",
                "                  Bypass the matching node and return true.",
                "                  Return false if no node matches."
              ],
              "abstraction": [
                "Remove the first node whose value equals target and report success."
              ],
              "pseudocode": [
                "FUNCTION delete_value(target)",
                "                  IF self.head IS null THEN",
                "                  RETURN false",
                "                  END IF",
                "                  IF self.head.value = target THEN",
                "                  SET self.head = self.head.next",
                "                  RETURN true",
                "                  END IF",
                "                  SET previous = self.head",
                "                  SET current = self.head.next",
                "                  WHILE current IS NOT null",
                "                  IF current.value = target THEN",
                "                  SET previous.next = current.next",
                "                  RETURN true",
                "                  END IF",
                "                  SET previous = current",
                "                  SET current = current.next",
                "                  END WHILE",
                "                  RETURN false"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "doubly-linked-list",
      "number": 2,
      "title": "Doubly Linked List",
      "overview": "A doubly linked list is like a linked list, but each node stores both a next pointer and a previous pointer. This extra link makes backward movement and deletion from known positions easier, at the cost of more memory and slightly more bookkeeping.",
      "topics": [
        {
          "id": "doubly-linked-list-initialization",
          "title": "Initialization with previous and next references",
          "definition": "Initialization defines nodes that know both their predecessor and successor, and a list object that usually stores both a head and a tail.",
          "howAndWhy": "It is used because many real tasks need movement in both directions. A tail pointer also makes appending more natural because the structure remembers where the chain ends.",
          "examples": [
            {
              "id": "doubly-linked-list-initialization-example",
              "strict": [
                "Create a class named DoublyNode.",
                "                  Define a function named initialize that takes value.",
                "                  Set self.value to value.",
                "                  Set self.next to null.",
                "                  Set self.prev to null.",
                "                  Create a class named DoublyLinkedList.",
                "                  Define a function named initialize.",
                "                  Set self.head to null.",
                "                  Set self.tail to null.",
                "                  Define a function named append that takes value.",
                "                  Create new_node as DoublyNode(value).",
                "                  If self.head is null, then.",
                "                  Set self.head to new_node.",
                "                  Set self.tail to new_node.",
                "                  Return.",
                "                  End the if.",
                "                  Set self.tail.next to new_node.",
                "                  Set new_node.prev to self.tail.",
                "                  Set self.tail to new_node."
              ],
              "standard": [
                "Create DoublyNode with value, next, and prev.",
                "                  Create DoublyLinkedList with head and tail starting at null.",
                "                  Define append(value) to handle the empty list or link the new node after the current tail."
              ],
              "abstraction": [
                "Build a doubly linked list with head and tail pointers and append support."
              ],
              "pseudocode": [
                "CLASS DoublyNode",
                "                  FUNCTION initialize(value)",
                "                  SET self.value = value",
                "                  SET self.next = null",
                "                  SET self.prev = null",
                "                  CLASS DoublyLinkedList",
                "                  FUNCTION initialize()",
                "                  SET self.head = null",
                "                  SET self.tail = null",
                "                  FUNCTION append(value)",
                "                  CREATE new_node AS DoublyNode(value)",
                "                  IF self.head IS null THEN",
                "                  SET self.head = new_node",
                "                  SET self.tail = new_node",
                "                  RETURN",
                "                  END IF",
                "                  SET self.tail.next = new_node",
                "                  SET new_node.prev = self.tail",
                "                  SET self.tail = new_node"
              ]
            }
          ]
        },
        {
          "id": "doubly-linked-list-bidirectional-search-and-traversal",
          "title": "Bidirectional search and traversal",
          "definition": "Traversal means walking through the nodes. In a doubly linked list, the walk can begin at the head and move forward or begin at the tail and move backward.",
          "howAndWhy": "This is used when a program needs to undo, reverse-iterate, or inspect neighbors on both sides. Searching by value is still linear, but the extra direction changes how surrounding structure can be inspected and edited.",
          "examples": [
            {
              "id": "doubly-linked-list-bidirectional-search-and-traversal-example",
              "strict": [
                "Define a function named print_forward.",
                "                  Set current to self.head.",
                "                  While current is not null.",
                "                  Output current.value.",
                "                  Set current to current.next.",
                "                  End the while.",
                "                  Define a function named print_backward.",
                "                  Set current to self.tail.",
                "                  While current is not null.",
                "                  Output current.value.",
                "                  Set current to current.prev.",
                "                  End the while."
              ],
              "standard": [
                "Define print_forward and walk from head through next links.",
                "                  Define print_backward and walk from tail through prev links.",
                "                  Output each value during both traversals."
              ],
              "abstraction": [
                "Traverse the list forward from head and backward from tail."
              ],
              "pseudocode": [
                "FUNCTION print_forward()",
                "                  SET current = self.head",
                "                  WHILE current IS NOT null",
                "                  OUTPUT current.value",
                "                  SET current = current.next",
                "                  END WHILE",
                "                  FUNCTION print_backward()",
                "                  SET current = self.tail",
                "                  WHILE current IS NOT null",
                "                  OUTPUT current.value",
                "                  SET current = current.prev",
                "                  END WHILE"
              ]
            }
          ]
        },
        {
          "id": "doubly-linked-list-insert-before-or-after-a-node",
          "title": "Insert before or after a node",
          "definition": "A doubly linked list can insert relative to a known node by updating four references: the new node's prev and next, and the neighboring nodes that must point to it.",
          "howAndWhy": "This is used when the list represents an ordered sequence and insertion must happen at a precise local position. Because both directions are stored, the structure can be updated without searching for the predecessor separately.",
          "examples": [
            {
              "id": "doubly-linked-list-insert-before-or-after-a-node-example",
              "strict": [
                "Define a function named insert_before that takes node, value.",
                "                  If node is null, then.",
                "                  Return.",
                "                  End the if.",
                "                  Create new_node as DoublyNode(value).",
                "                  Set new_node.next to node.",
                "                  Set new_node.prev to node.prev.",
                "                  If node.prev is not null, then.",
                "                  Set node.prev.next to new_node.",
                "                  Otherwise.",
                "                  Set self.head to new_node.",
                "                  End the if.",
                "                  Set node.prev to new_node."
              ],
              "standard": [
                "Define insert_before(node, value).",
                "                  Return if node is null.",
                "                  Create new_node, connect it before node, and update the surrounding prev and next links.",
                "                  Set self.head when the insertion happens before the old first node."
              ],
              "abstraction": [
                "Insert a new node before a known node and repair both directions."
              ],
              "pseudocode": [
                "FUNCTION insert_before(node, value)",
                "                  IF node IS null THEN",
                "                  RETURN",
                "                  END IF",
                "                  CREATE new_node AS DoublyNode(value)",
                "                  SET new_node.next = node",
                "                  SET new_node.prev = node.prev",
                "                  IF node.prev IS NOT null THEN",
                "                  SET node.prev.next = new_node",
                "                  ELSE",
                "                  SET self.head = new_node",
                "                  END IF",
                "                  SET node.prev = new_node"
              ]
            }
          ]
        },
        {
          "id": "doubly-linked-list-delete-a-known-node",
          "title": "Delete a known node",
          "definition": "Deleting a known node removes it by connecting its predecessor directly to its successor and then updating head or tail when necessary.",
          "howAndWhy": "It is especially useful in structures such as browser histories, deques, and LRU caches because once the node is known, removal is local and efficient.",
          "examples": [
            {
              "id": "doubly-linked-list-delete-a-known-node-example",
              "strict": [
                "Define a function named delete_node that takes node.",
                "                  If node is null, then.",
                "                  Return false.",
                "                  End the if.",
                "                  If node.prev is not null, then.",
                "                  Set node.prev.next to node.next.",
                "                  Otherwise.",
                "                  Set self.head to node.next.",
                "                  End the if.",
                "                  If node.next is not null, then.",
                "                  Set node.next.prev to node.prev.",
                "                  Otherwise.",
                "                  Set self.tail to node.prev.",
                "                  End the if.",
                "                  Return true."
              ],
              "standard": [
                "Define delete_node(node).",
                "                  Return false if node is null.",
                "                  Reconnect node.prev and node.next around the node being removed.",
                "                  Update self.head or self.tail when the removed node is at an end.",
                "                  Return true after deletion."
              ],
              "abstraction": [
                "Delete a known node by reconnecting its neighbors and updating head or tail when needed."
              ],
              "pseudocode": [
                "FUNCTION delete_node(node)",
                "                  IF node IS null THEN",
                "                  RETURN false",
                "                  END IF",
                "                  IF node.prev IS NOT null THEN",
                "                  SET node.prev.next = node.next",
                "                  ELSE",
                "                  SET self.head = node.next",
                "                  END IF",
                "                  IF node.next IS NOT null THEN",
                "                  SET node.next.prev = node.prev",
                "                  ELSE",
                "                  SET self.tail = node.prev",
                "                  END IF",
                "                  RETURN true"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "hash-table",
      "number": 3,
      "title": "Hash Table",
      "overview": "A hash table stores key-value pairs by transforming each key into an index with a hash function. When designed well, it gives very fast average-case lookup, insertion, and deletion. In Python, dictionaries already provide this behavior, but teaching the structure through classes makes the underlying idea visible.",
      "topics": [
        {
          "id": "hash-table-initialization-with-buckets",
          "title": "Initialization with buckets",
          "definition": "Initialization creates an array of buckets and chooses a hash rule that maps keys into bucket positions. Each bucket may store a small chain or list of entries to handle collisions.",
          "howAndWhy": "This is used because a hash table is really two ideas combined: a fast address calculation and a collision strategy. Building the class explicitly teaches that keys can collide and that the table must still preserve every key-value pair correctly.",
          "examples": [
            {
              "id": "hash-table-initialization-with-buckets-example",
              "strict": [
                "Create a class named HashTable.",
                "                  Define a function named initialize that takes capacity.",
                "                  Set self.capacity to capacity.",
                "                  Set self.buckets to array of empty lists of length capacity.",
                "                  Define a function named hash that takes key.",
                "                  Return computed_index_from_key mod self.capacity."
              ],
              "standard": [
                "Create HashTable with capacity and an array of empty bucket lists.",
                "                  Define hash(key) to compute an index modulo capacity."
              ],
              "abstraction": [
                "Initialize a hash table with bucket storage and a hash-to-index function."
              ],
              "pseudocode": [
                "CLASS HashTable",
                "                  FUNCTION initialize(capacity)",
                "                  SET self.capacity = capacity",
                "                  SET self.buckets = array of empty lists of length capacity",
                "                  FUNCTION hash(key)",
                "                  RETURN computed_index_from_key MOD self.capacity"
              ]
            }
          ]
        },
        {
          "id": "hash-table-search-by-key",
          "title": "Search by key",
          "definition": "Searching in a hash table first hashes the key to find the correct bucket and then searches only within that bucket for the matching key.",
          "howAndWhy": "It is used because the hash function narrows the search area dramatically. Instead of scanning every entry, the program jumps directly to the small bucket where the key should live. This is why hash tables are a common choice for symbol tables, caches, and frequency counters.",
          "examples": [
            {
              "id": "hash-table-search-by-key-example",
              "strict": [
                "Define a function named get that takes key.",
                "                  Set index to hash(key).",
                "                  For each pair in self.buckets[index].",
                "                  If pair.key = key, then.",
                "                  Return pair.value.",
                "                  End the if.",
                "                  End the for.",
                "                  Return not_found."
              ],
              "standard": [
                "Define get(key).",
                "                  Hash the key to choose a bucket.",
                "                  Scan the bucket for a matching pair and return its value.",
                "                  Return not_found if the key is missing."
              ],
              "abstraction": [
                "Look up a key by hashing to its bucket and scanning that bucket."
              ],
              "pseudocode": [
                "FUNCTION get(key)",
                "                  SET index = hash(key)",
                "                  FOR EACH pair IN self.buckets[index]",
                "                  IF pair.key = key THEN",
                "                  RETURN pair.value",
                "                  END IF",
                "                  END FOR",
                "                  RETURN not_found"
              ]
            }
          ]
        },
        {
          "id": "hash-table-insert-or-update",
          "title": "Insert or update",
          "definition": "Insertion places a new key-value pair into its bucket. If the key already exists, the value is updated rather than duplicated.",
          "howAndWhy": "This is used because many table operations really mean assign a value to a key, whether that key is new or already present. Update-on-duplicate is what makes hash tables natural for counting and memoization tasks.",
          "examples": [
            {
              "id": "hash-table-insert-or-update-example",
              "strict": [
                "Define a function named put that takes key, value.",
                "                  Set index to hash(key).",
                "                  For each pair in self.buckets[index].",
                "                  If pair.key = key, then.",
                "                  Set pair.value to value.",
                "                  Return.",
                "                  End the if.",
                "                  End the for.",
                "                  Append (key, value) to self.buckets[index]."
              ],
              "standard": [
                "Define put(key, value).",
                "                  Hash the key to choose a bucket.",
                "                  Update the value if the key already exists there.",
                "                  Otherwise append a new key-value pair to that bucket."
              ],
              "abstraction": [
                "Hash the key, update it if present, or append a new entry if absent."
              ],
              "pseudocode": [
                "FUNCTION put(key, value)",
                "                  SET index = hash(key)",
                "                  FOR EACH pair IN self.buckets[index]",
                "                  IF pair.key = key THEN",
                "                  SET pair.value = value",
                "                  RETURN",
                "                  END IF",
                "                  END FOR",
                "                  APPEND (key, value) TO self.buckets[index]"
              ]
            }
          ]
        },
        {
          "id": "hash-table-delete-by-key",
          "title": "Delete by key",
          "definition": "Deletion removes the pair whose key matches the target from the correct bucket.",
          "howAndWhy": "It is used when stale data should no longer be returned. Because the hash table can jump directly to the right bucket, deletion is local rather than global.",
          "examples": [
            {
              "id": "hash-table-delete-by-key-example",
              "strict": [
                "Define a function named delete that takes key.",
                "                  Set index to hash(key).",
                "                  For i from 0 to length(self.buckets[index]) - 1.",
                "                  If self.buckets[index][i].key = key, then.",
                "                  Remove entry at position i from self.buckets[index].",
                "                  Return true.",
                "                  End the if.",
                "                  End the for.",
                "                  Return false."
              ],
              "standard": [
                "Define delete(key).",
                "                  Hash the key to choose a bucket.",
                "                  Scan the bucket positions until the key is found.",
                "                  Remove the matching entry and return true.",
                "                  Return false if the key does not exist."
              ],
              "abstraction": [
                "Remove a key from its bucket and report whether deletion happened."
              ],
              "pseudocode": [
                "FUNCTION delete(key)",
                "                  SET index = hash(key)",
                "                  FOR i FROM 0 TO length(self.buckets[index]) - 1",
                "                  IF self.buckets[index][i].key = key THEN",
                "                  REMOVE entry at position i from self.buckets[index]",
                "                  RETURN true",
                "                  END IF",
                "                  END FOR",
                "                  RETURN false"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "undirected-graph",
      "number": 4,
      "title": "Undirected Graph",
      "overview": "An undirected graph stores objects as vertices and connections as edges, where each connection works both ways. This is the right model for roads without one-way restrictions, friendship relationships, and physical network links.",
      "topics": [
        {
          "id": "undirected-graph-initialization",
          "title": "Initialization with a Graph class and adjacency lists",
          "definition": "Initialization creates a graph object whose main state is an adjacency list. Each vertex maps to the vertices connected to it. In an undirected graph, adding an edge means recording the relationship in both directions.",
          "howAndWhy": "This is used because graphs are about relationships, not just storage. An adjacency list is compact and natural when most vertices connect to only a few others. Using a class keeps the rules for adding vertices and edges inside one object.",
          "examples": [
            {
              "id": "undirected-graph-initialization-example",
              "strict": [
                "Create a class named UndirectedGraph.",
                "                  Define a function named initialize.",
                "                  Set self.adj to empty map.",
                "                  Define a function named add_vertex that takes v.",
                "                  If v NOT in self.adj, then.",
                "                  Set self.adj[v] to empty list.",
                "                  End the if.",
                "                  Define a function named add_edge that takes u, v.",
                "                  Call add_vertex(u).",
                "                  Call add_vertex(v).",
                "                  Append v to self.adj[u].",
                "                  Append u to self.adj[v]."
              ],
              "standard": [
                "Create UndirectedGraph with an empty adjacency map.",
                "                  Define add_vertex(v) to create an empty neighbor list when needed.",
                "                  Define add_edge(u, v) to add both endpoints and append each vertex to the other's list."
              ],
              "abstraction": [
                "Build an undirected graph by storing each edge in both adjacency lists."
              ],
              "pseudocode": [
                "CLASS UndirectedGraph",
                "                  FUNCTION initialize()",
                "                  SET self.adj = empty map",
                "                  FUNCTION add_vertex(v)",
                "                  IF v NOT IN self.adj THEN",
                "                  SET self.adj[v] = empty list",
                "                  END IF",
                "                  FUNCTION add_edge(u, v)",
                "                  CALL add_vertex(u)",
                "                  CALL add_vertex(v)",
                "                  APPEND v TO self.adj[u] APPEND u TO self.adj[v]"
              ]
            }
          ]
        },
        {
          "id": "undirected-graph-breadth-first-search",
          "title": "Breadth-first search for unweighted shortest paths",
          "definition": "Breadth-first search visits vertices level by level. In an unweighted graph, this means the first time a vertex is reached, it has been reached by the shortest number of edges.",
          "howAndWhy": "It is used because many graph questions are really minimum-step questions: what is the fewest number of hops, roads, or friend links needed to go from one place to another. BFS answers that exactly in unweighted settings.",
          "examples": [
            {
              "id": "undirected-graph-breadth-first-search-example",
              "strict": [
                "Define a function named bfs_shortest_path that takes start, goal.",
                "                  Create queue.",
                "                  Enqueue start.",
                "                  Set visited to {start}.",
                "                  Set parent[start] to null.",
                "                  While queue is not empty.",
                "                  Set current to dequeue queue.",
                "                  If current = goal, then.",
                "                  Stop the current loop.",
                "                  End the if.",
                "                  For each neighbor in self.adj[current].",
                "                  If neighbor NOT in visited, then.",
                "                  Add neighbor to visited.",
                "                  Set parent[neighbor] to current.",
                "                  Enqueue neighbor.",
                "                  End the if.",
                "                  End the for.",
                "                  End the while.",
                "                  Reconstruct path from parent map."
              ],
              "standard": [
                "Define bfs_shortest_path(start, goal).",
                "                  Use a queue, visited set, and parent map starting from start.",
                "                  Process vertices level by level until goal is reached.",
                "                  Record parent links for newly discovered neighbors.",
                "                  Reconstruct the path from the parent map."
              ],
              "abstraction": [
                "Use BFS to find and reconstruct the shortest unweighted path from start to goal."
              ],
              "pseudocode": [
                "FUNCTION bfs_shortest_path(start, goal)",
                "                  CREATE queue",
                "                  ENQUEUE start",
                "                  SET visited = {start}",
                "                  SET parent[start] = null",
                "                  WHILE queue IS NOT empty",
                "                  SET current = DEQUEUE queue",
                "                  IF current = goal THEN",
                "                  BREAK END IF FOR EACH neighbor IN self.adj[current] IF neighbor NOT IN visited THEN ADD neighbor",
                "                  TO visited SET parent[neighbor] = current ENQUEUE neighbor END IF END FOR END WHILE",
                "                  RECONSTRUCT path from parent map"
              ]
            }
          ]
        },
        {
          "id": "undirected-graph-depth-first-search",
          "title": "Depth-first search for exploration and components",
          "definition": "Depth-first search follows one branch as far as possible before backtracking.",
          "howAndWhy": "It is used when the program wants to explore structure, find connected components, or test reachability. DFS is not an unweighted shortest-path algorithm, but it is excellent for understanding shape and connectivity.",
          "examples": [
            {
              "id": "undirected-graph-depth-first-search-example",
              "strict": [
                "Define a function named dfs that takes vertex.",
                "                  Add vertex to visited.",
                "                  For each neighbor in self.adj[vertex].",
                "                  If neighbor NOT in visited, then.",
                "                  Call dfs(neighbor).",
                "                  End the if.",
                "                  End the for."
              ],
              "standard": [
                "Define dfs(vertex).",
                "                  Mark vertex visited.",
                "                  Recursively visit each unvisited neighbor."
              ],
              "abstraction": [
                "Depth-first search visits a vertex, marks it, and recurses on unvisited neighbors."
              ],
              "pseudocode": [
                "FUNCTION dfs(vertex)",
                "                  ADD vertex TO visited",
                "                  FOR EACH neighbor IN self.adj[vertex]",
                "                  IF neighbor NOT IN visited THEN",
                "                  CALL dfs(neighbor)",
                "                  END IF",
                "                  END FOR"
              ]
            }
          ]
        },
        {
          "id": "undirected-graph-dijkstra",
          "title": "Dijkstra for weighted graphs with non-negative edges",
          "definition": "Dijkstra's algorithm computes the shortest path from a source to all other vertices when every edge weight is non-negative.",
          "howAndWhy": "It is used when the graph measures cost, distance, or time instead of just step count. The algorithm repeatedly finalizes the smallest known tentative distance and relaxes outgoing edges.",
          "examples": [
            {
              "id": "undirected-graph-dijkstra-example",
              "strict": [
                "Define a function named dijkstra that takes start.",
                "                  For each vertex.",
                "                  Set distance[vertex] to infinity.",
                "                  End the for.",
                "                  Set distance[start] to 0.",
                "                  Create priority_queue.",
                "                  Insert (0, start).",
                "                  While priority_queue is not empty.",
                "                  Extract vertex with smallest tentative distance.",
                "                  For each (neighbor, weight) adjacent to vertex.",
                "                  If distance[vertex] + weight < distance[neighbor], then.",
                "                  Set distance[neighbor] to distance[vertex] + weight.",
                "                  Set parent[neighbor] to vertex.",
                "                  Insert (distance[neighbor], neighbor).",
                "                  End the if.",
                "                  End the for.",
                "                  End the while."
              ],
              "standard": [
                "Define dijkstra(start).",
                "                  Initialize all distances to infinity except start.",
                "                  Use a priority queue to repeatedly extract the closest vertex.",
                "                  Relax each adjacent edge, updating distance and parent when a shorter path is found."
              ],
              "abstraction": [
                "Use Dijkstra's algorithm to update shortest distances and parents from start."
              ],
              "pseudocode": [
                "FUNCTION dijkstra(start)",
                "                  FOR EACH vertex",
                "                  SET distance[vertex] = infinity",
                "                  END FOR",
                "                  SET distance[start] = 0",
                "                  CREATE priority_queue",
                "                  INSERT (0, start)",
                "                  WHILE priority_queue IS NOT empty",
                "                  EXTRACT vertex with smallest tentative distance FOR EACH (neighbor, weight) ADJACENT TO vertex IF",
                "                  distance[vertex] + weight < distance[neighbor] THEN SET distance[neighbor] = distance[vertex] +",
                "                  weight SET parent[neighbor] = vertex INSERT (distance[neighbor], neighbor) END IF END FOR END",
                "                  WHILE"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "directed-graph",
      "number": 5,
      "title": "Directed Graph",
      "overview": "A directed graph stores edges that point from one vertex to another in a specific direction. This is the natural model for web links, task dependencies, one-way streets, and state transitions.",
      "topics": [
        {
          "id": "directed-graph-initialization",
          "title": "Initialization with outgoing adjacency lists",
          "definition": "Initialization creates a map from each vertex to its outgoing neighbors. Adding a directed edge records only the forward direction.",
          "howAndWhy": "This is used because direction changes meaning. The edge A -> B says A can reach B directly, but B does not automatically reach A.",
          "examples": [
            {
              "id": "directed-graph-initialization-example",
              "strict": [
                "Create a class named DirectedGraph.",
                "                  Define a function named initialize.",
                "                  Set self.adj to empty map.",
                "                  Define a function named add_vertex that takes v.",
                "                  If v NOT in self.adj, then.",
                "                  Set self.adj[v] to empty list.",
                "                  End the if.",
                "                  Define a function named add_edge that takes u, v, weight.",
                "                  Call add_vertex(u).",
                "                  Call add_vertex(v).",
                "                  Append (v, weight) to self.adj[u]."
              ],
              "standard": [
                "Create DirectedGraph with an empty adjacency map.",
                "                  Define add_vertex(v) to create an empty outgoing list when needed.",
                "                  Define add_edge(u, v, weight) to add both vertices and append the weighted outgoing edge from u."
              ],
              "abstraction": [
                "Build a directed weighted graph by storing outgoing edges in each vertex's adjacency list."
              ],
              "pseudocode": [
                "CLASS DirectedGraph",
                "                  FUNCTION initialize()",
                "                  SET self.adj = empty map",
                "                  FUNCTION add_vertex(v)",
                "                  IF v NOT IN self.adj THEN",
                "                  SET self.adj[v] = empty list",
                "                  END IF",
                "                  FUNCTION add_edge(u, v, weight)",
                "                  CALL add_vertex(u)",
                "                  CALL add_vertex(v)",
                "                  APPEND (v, weight) TO self.adj[u]"
              ]
            }
          ]
        },
        {
          "id": "directed-graph-reachability-and-path-search-with-bfs",
          "title": "Reachability and path search with BFS",
          "definition": "In a directed graph, BFS still explores level by level, but only along outgoing edges.",
          "howAndWhy": "It is used for questions such as whether one state can reach another, how many transitions separate two states, or what the minimum number of directed steps is in an unweighted setting.",
          "examples": [
            {
              "id": "directed-graph-reachability-and-path-search-with-bfs-example",
              "strict": [
                "Define a function named directed_bfs that takes start, goal.",
                "                  Create queue.",
                "                  Enqueue start.",
                "                  Set visited to {start}.",
                "                  Set parent[start] to null.",
                "                  While queue is not empty.",
                "                  Set current to dequeue queue.",
                "                  If current = goal, then.",
                "                  Stop the current loop.",
                "                  End the if.",
                "                  For each (neighbor, weight) in self.adj[current].",
                "                  If neighbor NOT in visited, then.",
                "                  Add neighbor to visited.",
                "                  Set parent[neighbor] to current.",
                "                  Enqueue neighbor.",
                "                  End the if.",
                "                  End the for.",
                "                  End the while."
              ],
              "standard": [
                "Define directed_bfs(start, goal).",
                "                  Use a queue, visited set, and parent map starting from start.",
                "                  Follow outgoing edges only while processing the queue.",
                "                  Record parents for newly discovered neighbors until goal is reached."
              ],
              "abstraction": [
                "Use BFS on outgoing edges to test reachability and recover a directed path."
              ],
              "pseudocode": [
                "FUNCTION directed_bfs(start, goal)",
                "                  CREATE queue",
                "                  ENQUEUE start",
                "                  SET visited = {start}",
                "                  SET parent[start] = null",
                "                  WHILE queue IS NOT empty",
                "                  SET current = DEQUEUE queue",
                "                  IF current = goal THEN",
                "                  BREAK END IF FOR EACH (neighbor, weight) IN self.adj[current] IF neighbor NOT IN visited THEN ADD",
                "                  neighbor TO visited SET parent[neighbor] = current ENQUEUE neighbor END IF END FOR END WHILE"
              ]
            }
          ]
        },
        {
          "id": "directed-graph-dijkstra",
          "title": "Dijkstra for directed non-negative weighted graphs",
          "definition": "Dijkstra also works on directed graphs, as long as edge weights are non-negative.",
          "howAndWhy": "It is used when each directed edge has a cost, such as time, fuel, or penalty, and the task is to find the cheapest directed route from a source.",
          "examples": [
            {
              "id": "directed-graph-dijkstra-example",
              "strict": [
                "Define a function named dijkstra that takes start.",
                "                  Initialize all distances to infinity.",
                "                  Set distance[start] to 0.",
                "                  Create priority_queue with (0, start).",
                "                  While priority_queue is not empty.",
                "                  Extract current vertex.",
                "                  For each (neighbor, weight) in self.adj[current].",
                "                  If distance[current] + weight < distance[neighbor], then.",
                "                  Set distance[neighbor] to distance[current] + weight.",
                "                  Set parent[neighbor] to current.",
                "                  Insert (distance[neighbor], neighbor).",
                "                  End the if.",
                "                  End the for.",
                "                  End the while."
              ],
              "standard": [
                "Define dijkstra(start).",
                "                  Initialize distances and push start into the priority queue.",
                "                  Repeatedly extract the current vertex and relax each outgoing weighted edge.",
                "                  Update distance and parent whenever a shorter path is found."
              ],
              "abstraction": [
                "Run Dijkstra on the directed weighted graph from start."
              ],
              "pseudocode": [
                "FUNCTION dijkstra(start)",
                "                  INITIALIZE all distances to infinity",
                "                  SET distance[start] = 0",
                "                  CREATE priority_queue with (0, start)",
                "                  WHILE priority_queue IS NOT empty",
                "                  EXTRACT current vertex FOR EACH (neighbor, weight) IN self.adj[current] IF distance[current] +",
                "                  weight < distance[neighbor] THEN SET distance[neighbor] = distance[current] + weight SET",
                "                  parent[neighbor] = current INSERT (distance[neighbor], neighbor) END IF END FOR END WHILE"
              ]
            }
          ]
        },
        {
          "id": "directed-graph-bellman-ford",
          "title": "Bellman-Ford for directed graphs with negative edges",
          "definition": "Bellman-Ford computes shortest paths when directed edges may be negative, as long as no negative cycle is reachable from the source.",
          "howAndWhy": "It is used because Dijkstra can fail when a later negative edge should improve a path that was assumed to be settled too early. Bellman-Ford systematically relaxes every edge multiple times and can also detect negative cycles.",
          "examples": [
            {
              "id": "directed-graph-bellman-ford-example",
              "strict": [
                "Define a function named bellman_ford that takes start.",
                "                  Initialize all distances to infinity.",
                "                  Set distance[start] to 0.",
                "                  Repeat |v| - 1 times.",
                "                  For each edge (u, v, weight).",
                "                  If distance[u] is not infinity and distance[u] + weight < distance[v], then.",
                "                  Set distance[v] to distance[u] + weight.",
                "                  Set parent[v] to u.",
                "                  End the if.",
                "                  End the for.",
                "                  End the repeat.",
                "                  For each edge (u, v, weight).",
                "                  If distance[u] is not infinity and distance[u] + weight < distance[v], then.",
                "                  Report negative_cycle.",
                "                  End the if.",
                "                  End the for."
              ],
              "standard": [
                "Define bellman_ford(start).",
                "                  Initialize all distances to infinity except start.",
                "                  Relax every edge |V| - 1 times, updating distance and parent.",
                "                  Scan the edges one more time to detect any further improvement.",
                "                  Report negative_cycle if one is found."
              ],
              "abstraction": [
                "Repeatedly relax all edges and then check once more for a negative cycle."
              ],
              "pseudocode": [
                "FUNCTION bellman_ford(start)",
                "                  INITIALIZE all distances to infinity",
                "                  SET distance[start] = 0",
                "                  REPEAT |V| - 1 TIMES FOR EACH edge (u, v, weight) IF distance[u] IS NOT infinity AND distance[u] +",
                "                  weight < distance[v] THEN SET distance[v] = distance[u] + weight SET parent[v] = u END IF END FOR",
                "                  END REPEAT FOR EACH edge (u, v, weight) IF distance[u] IS NOT infinity AND distance[u] + weight <",
                "                  distance[v] THEN REPORT negative_cycle END IF END FOR"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "directed-acyclic-graph",
      "number": 6,
      "title": "Directed Acyclic Graph (DAG)",
      "overview": "A DAG is a directed graph with no directed cycles. This restriction is powerful because it creates a partial order, which makes DAGs ideal for scheduling, prerequisite systems, build pipelines, and dependency management.",
      "topics": [
        {
          "id": "dag-initialization-and-modeling-dependencies",
          "title": "Initialization and modeling dependencies",
          "definition": "Initialization is the same as for a directed graph, but the graph is built under the rule that no directed cycle may be introduced.",
          "howAndWhy": "It is used because many real systems have one-way dependencies that must not loop back on themselves. If task A depends on task B, and task B depends on task A, the schedule is impossible.",
          "examples": [
            {
              "id": "dag-initialization-and-modeling-dependencies-example",
              "strict": [
                "Create a class named DAG.",
                "                  Define a function named initialize.",
                "                  Set self.adj to empty map.",
                "                  Define a function named add_edge that takes u, v.",
                "                  Call add_vertex(u).",
                "                  Call add_vertex(v).",
                "                  Append v to self.adj[u]."
              ],
              "standard": [
                "Create DAG with an empty adjacency map.",
                "                  Define add_edge(u, v) to ensure both vertices exist and then append v to u's list."
              ],
              "abstraction": [
                "Model dependencies as directed edges in a DAG adjacency map."
              ],
              "pseudocode": [
                "CLASS DAG",
                "                  FUNCTION initialize()",
                "                  SET self.adj = empty map",
                "                  FUNCTION add_edge(u, v)",
                "                  CALL add_vertex(u)",
                "                  CALL add_vertex(v)",
                "                  APPEND v TO self.adj[u]"
              ]
            }
          ]
        },
        {
          "id": "dag-topological-sort",
          "title": "Topological sort",
          "definition": "A topological sort is an ordering of the vertices such that every edge goes from an earlier vertex to a later one.",
          "howAndWhy": "It is used whenever tasks must be completed in a legal order. In a DAG, topological order turns graph structure into an actual execution sequence.",
          "examples": [
            {
              "id": "dag-topological-sort-example",
              "strict": [
                "Define a function named topological_sort.",
                "                  Compute in_degree of every vertex.",
                "                  Create queue of all vertices with in_degree 0.",
                "                  Create empty order list.",
                "                  While queue is not empty.",
                "                  Dequeue from current.",
                "                  Append current to order.",
                "                  For each neighbor in self.adj[current].",
                "                  Decrease in_degree[neighbor] by 1.",
                "                  If in_degree[neighbor] = 0, then.",
                "                  Enqueue neighbor.",
                "                  End the if.",
                "                  End the for.",
                "                  End the while.",
                "                  Return order."
              ],
              "standard": [
                "Define topological_sort.",
                "                  Compute in_degree for every vertex.",
                "                  Queue all vertices with in_degree 0 and build order as they are removed.",
                "                  Decrease neighbors' in_degree and enqueue any that become 0.",
                "                  Return order."
              ],
              "abstraction": [
                "Produce a topological order by repeatedly removing vertices whose in-degree is 0."
              ],
              "pseudocode": [
                "FUNCTION topological_sort()",
                "                  COMPUTE in_degree of every vertex CREATE queue of all vertices with in_degree 0 CREATE empty",
                "                  order list WHILE queue IS NOT empty DEQUEUE current APPEND current TO order FOR EACH",
                "                  neighbor IN self.adj[current] DECREASE in_degree[neighbor] BY 1 IF in_degree[neighbor] = 0 THEN",
                "                  ENQUEUE neighbor END IF END FOR END WHILE RETURN order"
              ]
            }
          ]
        },
        {
          "id": "dag-shortest-path-unweighted",
          "title": "Shortest path in an unweighted DAG",
          "definition": "An unweighted DAG can use topological order to relax edges once in the correct dependency order.",
          "howAndWhy": "It is used because the acyclic structure removes the need to revisit vertices endlessly. Once earlier dependencies are processed, later distances can be updated cleanly.",
          "examples": [
            {
              "id": "dag-shortest-path-unweighted-example",
              "strict": [
                "Define a function named dag_shortest_path_unweighted that takes start.",
                "                  Set order to topological_sort().",
                "                  Initialize all distances to infinity.",
                "                  Set distance[start] to 0.",
                "                  For each vertex in order.",
                "                  If distance[vertex] is not infinity, then.",
                "                  For each neighbor in self.adj[vertex].",
                "                  If distance[vertex] + 1 < distance[neighbor], then.",
                "                  Set distance[neighbor] to distance[vertex] + 1.",
                "                  End the if.",
                "                  End the for.",
                "                  End the if.",
                "                  End the for."
              ],
              "standard": [
                "Define dag_shortest_path_unweighted(start).",
                "                  Get the topological order and initialize distances.",
                "                  Process vertices in that order only when they are reachable.",
                "                  Relax each outgoing edge with cost 1."
              ],
              "abstraction": [
                "Use topological order to compute unweighted shortest paths in a DAG."
              ],
              "pseudocode": [
                "FUNCTION dag_shortest_path_unweighted(start)",
                "                  SET order = topological_sort()",
                "                  INITIALIZE all distances to infinity",
                "                  SET distance[start] = 0",
                "                  FOR EACH vertex IN order",
                "                  IF distance[vertex] IS NOT infinity THEN",
                "                  FOR EACH neighbor IN self.adj[vertex]",
                "                  IF distance[vertex] + 1 < distance[neighbor] THEN",
                "                  SET distance[neighbor] = distance[vertex] + 1",
                "                  END IF",
                "                  END FOR",
                "                  END IF",
                "                  END FOR"
              ]
            }
          ]
        },
        {
          "id": "dag-shortest-path-weighted",
          "title": "Shortest path in a weighted DAG",
          "definition": "A weighted DAG can compute shortest paths by processing vertices in topological order and relaxing weighted edges once.",
          "howAndWhy": "It is used because acyclicity removes the risk of revisiting a vertex due to a future cycle. This makes the algorithm simpler than Bellman-Ford and often faster than Dijkstra in DAG settings.",
          "examples": [
            {
              "id": "dag-shortest-path-weighted-example",
              "strict": [
                "Define a function named dag_shortest_path_weighted that takes start.",
                "                  Set order to topological_sort().",
                "                  Initialize all distances to infinity.",
                "                  Set distance[start] to 0.",
                "                  For each vertex in order.",
                "                  If distance[vertex] is not infinity, then.",
                "                  For each (neighbor, weight) in self.adj[vertex].",
                "                  If distance[vertex] + weight < distance[neighbor], then.",
                "                  Set distance[neighbor] to distance[vertex] + weight.",
                "                  Set parent[neighbor] to vertex.",
                "                  End the if.",
                "                  End the for.",
                "                  End the if.",
                "                  End the for."
              ],
              "standard": [
                "Define dag_shortest_path_weighted(start).",
                "                  Get the topological order and initialize distances.",
                "                  Process each reachable vertex in order.",
                "                  Relax each outgoing weighted edge and update parent when distance improves."
              ],
              "abstraction": [
                "Use topological order to compute weighted shortest paths in a DAG."
              ],
              "pseudocode": [
                "FUNCTION dag_shortest_path_weighted(start)",
                "                  SET order = topological_sort()",
                "                  INITIALIZE all distances to infinity",
                "                  SET distance[start] = 0",
                "                  FOR EACH vertex IN order",
                "                  IF distance[vertex] IS NOT infinity THEN",
                "                  FOR EACH (neighbor, weight) IN self.adj[vertex]",
                "                  IF distance[vertex] + weight < distance[neighbor] THEN",
                "                  SET distance[neighbor] = distance[vertex] + weight",
                "                  SET parent[neighbor] = vertex",
                "                  END IF",
                "                  END FOR",
                "                  END IF",
                "                  END FOR"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "heap",
      "number": 7,
      "title": "Heap",
      "overview": "A heap is a tree-based priority structure usually stored in an array. In a min-heap, every parent is less than or equal to its children, so the smallest element stays at the root. In a max-heap, the largest element stays at the root.",
      "topics": [
        {
          "id": "heap-initialization-with-a-heap-class",
          "title": "Initialization with a heap class",
          "definition": "Initialization creates a class whose internal state is an array. The array is interpreted as a complete binary tree using index relationships rather than explicit node pointers.",
          "howAndWhy": "This is used because heaps are designed for fast access to the current minimum or maximum. An array representation is compact and lets parent-child navigation be computed by index formulas.",
          "examples": [
            {
              "id": "heap-initialization-with-a-heap-class-example",
              "strict": [
                "Create a class named MinHeap.",
                "                  Define a function named initialize.",
                "                  Set self.data to empty list.",
                "                  Define a function named parent that takes i.",
                "                  Return floor((i - 1) / 2).",
                "                  Define a function named left that takes i.",
                "                  Return 2*i + 1.",
                "                  Define a function named right that takes i.",
                "                  Return 2*i + 2."
              ],
              "standard": [
                "Create MinHeap with self.data as an empty list.",
                "                  Define parent(i), left(i), and right(i) helper functions.",
                "                  Use those helpers to navigate the array-based tree."
              ],
              "abstraction": [
                "Initialize an array-backed min-heap with index helpers for parent and children."
              ],
              "pseudocode": [
                "CLASS MinHeap",
                "                  FUNCTION initialize()",
                "                  SET self.data = empty list",
                "                  FUNCTION parent(i)",
                "                  RETURN floor((i - 1) / 2)",
                "                  FUNCTION left(i)",
                "                  RETURN 2*i + 1",
                "                  FUNCTION right(i)",
                "                  RETURN 2*i + 2"
              ]
            }
          ]
        },
        {
          "id": "heap-search-and-why-heaps-are-not-for-arbitrary-lookup",
          "title": "Search and why heaps are not for arbitrary lookup",
          "definition": "A heap guarantees order only between parents and children, not across the entire array. Because of that, searching for an arbitrary value is generally linear.",
          "howAndWhy": "This matters because students often assume every ordered structure supports fast lookup. A heap is optimized for priority operations, not membership search. Its strength is at the root, not everywhere.",
          "examples": [
            {
              "id": "heap-search-and-why-heaps-are-not-for-arbitrary-lookup-example",
              "strict": [
                "Define a function named contains that takes target.",
                "                  For each value in self.data.",
                "                  If value = target, then.",
                "                  Return true.",
                "                  End the if.",
                "                  End the for.",
                "                  Return false."
              ],
              "standard": [
                "Define contains(target).",
                "                  Scan every value in self.data.",
                "                  Return true when target is found, otherwise return false after the scan."
              ],
              "abstraction": [
                "Search a heap linearly when you need arbitrary lookup."
              ],
              "pseudocode": [
                "FUNCTION contains(target)",
                "                  FOR EACH value IN self.data",
                "                  IF value = target THEN",
                "                  RETURN true",
                "                  END IF",
                "                  END FOR",
                "                  RETURN false"
              ]
            }
          ]
        },
        {
          "id": "heap-insert-with-sift-up",
          "title": "Insert with sift-up",
          "definition": "Insert adds the new value at the end of the array and then repeatedly swaps it with its parent until the heap property is restored.",
          "howAndWhy": "It is used whenever a new task, score, or priority enters the system. Sift-up keeps the structure complete while restoring correct priority order.",
          "examples": [
            {
              "id": "heap-insert-with-sift-up-example",
              "strict": [
                "Define a function named insert that takes value.",
                "                  Append value to self.data.",
                "                  Set i to last index of self.data.",
                "                  While i > 0 and self.data[i] < self.data[parent(i)].",
                "                  Swap self.data[i] and self.data[parent(i)].",
                "                  Set i to parent(i).",
                "                  End the while."
              ],
              "standard": [
                "Define insert(value).",
                "                  Append value and start at the last index.",
                "                  While the new value is smaller than its parent, swap upward."
              ],
              "abstraction": [
                "Insert into the heap by appending and sifting the new value upward."
              ],
              "pseudocode": [
                "FUNCTION insert(value)",
                "                  APPEND value TO self.data SET i = last index of self.data WHILE i > 0 AND self.data[i] <",
                "                  self.data[parent(i)] SWAP self.data[i] AND self.data[parent(i)] SET i = parent(i) END WHILE"
              ]
            }
          ]
        },
        {
          "id": "heap-delete-root-with-sift-down",
          "title": "Delete root with sift-down",
          "definition": "Deleting the root of a heap removes the current minimum or maximum. The last element is moved to the root and then pushed downward until the heap property is restored.",
          "howAndWhy": "This is used in scheduling and priority queues because the structure must repeatedly return and remove the most urgent or smallest item.",
          "examples": [
            {
              "id": "heap-delete-root-with-sift-down-example",
              "strict": [
                "Define a function named extract_min.",
                "                  If self.data is empty, then.",
                "                  Return not_found.",
                "                  End the if.",
                "                  Set answer to self.data[0].",
                "                  Move last element to index 0.",
                "                  Remove last array position.",
                "                  Call sift_down(0).",
                "                  Return answer.",
                "                  Define a function named sift_down that takes i.",
                "                  While true.",
                "                  Set smallest to i.",
                "                  If left(i) EXISTS and self.data[left(i)] < self.data[smallest], then.",
                "                  Set smallest to left(i).",
                "                  End the if.",
                "                  If right(i) EXISTS and self.data[right(i)] < self.data[smallest], then.",
                "                  Set smallest to right(i).",
                "                  End the if.",
                "                  If smallest = i, then.",
                "                  Stop the current loop.",
                "                  End the if.",
                "                  Swap self.data[i] and self.data[smallest].",
                "                  Set i to smallest.",
                "                  End the while."
              ],
              "standard": [
                "Define extract_min.",
                "                  Handle the empty heap, save the root, move the last element to index 0, remove the last slot, and sift down.",
                "                  Define sift_down(i) to compare with both children, swap with the smaller child, and stop when heap order is restored."
              ],
              "abstraction": [
                "Remove the min element, move the last value to the root, and sift it down until heap order returns."
              ],
              "pseudocode": [
                "FUNCTION extract_min()",
                "                  IF self.data IS empty THEN",
                "                  RETURN not_found",
                "                  END IF",
                "                  SET answer = self.data[0]",
                "                  MOVE last element to index 0 REMOVE last array position CALL sift_down(0) RETURN answer",
                "                  FUNCTION sift_down(i) WHILE true SET smallest = i IF left(i) EXISTS AND self.data[left(i)] <",
                "                  self.data[smallest] THEN SET smallest = left(i) END IF IF right(i) EXISTS AND self.data[right(i)] <",
                "                  self.data[smallest] THEN SET smallest = right(i) END IF IF smallest = i THEN BREAK END IF SWAP",
                "                  self.data[i] AND self.data[smallest] SET i = smallest END WHILE"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "sorting-algorithms",
      "number": 8,
      "title": "Sorting Algorithms",
      "overview": "Sorting places values into a chosen order, usually ascending or descending. Different sorting methods reflect different strategies: local swapping, repeated selection, gradual insertion into a sorted region, divide-and-conquer merging, and digit-by-digit grouping.",
      "topics": [
        {
          "id": "sorting-bubble-sort",
          "title": "Bubble sort",
          "definition": "Bubble sort repeatedly compares neighboring elements and swaps them when they are out of order. Larger values gradually move toward the end of the list, like bubbles rising upward.",
          "howAndWhy": "It is used mainly as a teaching algorithm because it makes local improvement visible. It is easy to understand but inefficient on large inputs because it performs many repeated comparisons.",
          "examples": [
            {
              "id": "sorting-bubble-sort-example",
              "strict": [
                "Define a function named bubble_sort that takes A.",
                "                  For pass from 1 to length(a) - 1.",
                "                  Set swapped to false.",
                "                  For i from 0 to length(a) - 2.",
                "                  If A[i] > A[i+1], then.",
                "                  Swap A[i] and A[i+1].",
                "                  Set swapped to true.",
                "                  End the if.",
                "                  End the for.",
                "                  If swapped = false, then.",
                "                  Stop the current loop.",
                "                  End the if.",
                "                  End the for."
              ],
              "standard": [
                "Define bubble_sort(A).",
                "                  Repeat passes through the array, swapping adjacent out-of-order pairs.",
                "                  Track whether any swap happened on the pass.",
                "                  Stop early when a pass makes no swaps."
              ],
              "abstraction": [
                "Repeatedly swap adjacent out-of-order pairs until the array is sorted."
              ],
              "pseudocode": [
                "FUNCTION bubble_sort(A)",
                "                  FOR pass FROM 1 TO length(A) - 1",
                "                  SET swapped = false",
                "                  FOR i FROM 0 TO length(A) - 2",
                "                  IF A[i] > A[i+1] THEN",
                "                  SWAP A[i] AND A[i+1]",
                "                  SET swapped = true",
                "                  END IF",
                "                  END FOR",
                "                  IF swapped = false THEN",
                "                  BREAK END IF END FOR"
              ]
            }
          ]
        },
        {
          "id": "sorting-selection-sort",
          "title": "Selection sort",
          "definition": "Selection sort repeatedly finds the smallest remaining unsorted value and places it into the next correct position.",
          "howAndWhy": "It is used because it separates the sorted prefix from the unsorted suffix very clearly. Like bubble sort, it is mostly pedagogical, but it teaches the idea of repeatedly selecting the next best candidate.",
          "examples": [
            {
              "id": "sorting-selection-sort-example",
              "strict": [
                "Define a function named selection_sort that takes A.",
                "                  For i from 0 to length(a) - 1.",
                "                  Set min_index to i.",
                "                  For j from i+1 to length(a) - 1.",
                "                  If A[j] < A[min_index], then.",
                "                  Set min_index to j.",
                "                  End the if.",
                "                  End the for.",
                "                  Swap A[i] and A[min_index].",
                "                  End the for."
              ],
              "standard": [
                "Define selection_sort(A).",
                "                  For each position i, find the smallest remaining value to the right.",
                "                  Swap that minimum into position i."
              ],
              "abstraction": [
                "Repeatedly select the smallest remaining value and place it next."
              ],
              "pseudocode": [
                "FUNCTION selection_sort(A)",
                "                  FOR i FROM 0 TO length(A) - 1",
                "                  SET min_index = i",
                "                  FOR j FROM i+1 TO length(A) - 1",
                "                  IF A[j] < A[min_index] THEN",
                "                  SET min_index = j",
                "                  END IF",
                "                  END FOR",
                "                  SWAP A[i] AND A[min_index]",
                "                  END FOR"
              ]
            }
          ]
        },
        {
          "id": "sorting-insertion-sort",
          "title": "Insertion sort",
          "definition": "Insertion sort builds a sorted region from left to right. Each new value is inserted into the correct position within the portion that is already sorted.",
          "howAndWhy": "It is used because it performs very well on small inputs and nearly sorted data. It also matches the way many people sort cards in their hands, so the mental model feels natural.",
          "examples": [
            {
              "id": "sorting-insertion-sort-example",
              "strict": [
                "Define a function named insertion_sort that takes A.",
                "                  For i from 1 to length(a) - 1.",
                "                  Set key to a[i].",
                "                  Set j to i - 1.",
                "                  While j >= 0 and A[j] > key.",
                "                  Set a[j+1] to a[j].",
                "                  Set j to j - 1.",
                "                  End the while.",
                "                  Set a[j+1] to key.",
                "                  End the for."
              ],
              "standard": [
                "Define insertion_sort(A).",
                "                  Take each new key from left to right.",
                "                  Shift larger earlier values one position right.",
                "                  Insert the key into the gap that remains."
              ],
              "abstraction": [
                "Grow a sorted prefix by shifting larger values right and inserting the current key."
              ],
              "pseudocode": [
                "FUNCTION insertion_sort(A)",
                "                  FOR i FROM 1 TO length(A) - 1",
                "                  SET key = A[i]",
                "                  SET j = i - 1",
                "                  WHILE j >= 0 AND A[j] > key",
                "                  SET A[j+1] = A[j]",
                "                  SET j = j - 1",
                "                  END WHILE",
                "                  SET A[j+1] = key",
                "                  END FOR"
              ]
            }
          ]
        },
        {
          "id": "sorting-merge-sort",
          "title": "Merge sort",
          "definition": "Merge sort divides the list into smaller halves, sorts each half recursively, and then merges the sorted halves back together.",
          "howAndWhy": "It is used because divide-and-conquer gives predictable efficiency and stable behavior. It is especially valuable when reliable performance matters more than in-place memory savings.",
          "examples": [
            {
              "id": "sorting-merge-sort-example",
              "strict": [
                "Define a function named merge_sort that takes A.",
                "                  If length(A) <= 1, then.",
                "                  Return A.",
                "                  End the if.",
                "                  Set mid to floor(length(a) / 2).",
                "                  Set left to merge_sort(first half of a).",
                "                  Set right to merge_sort(second half of a).",
                "                  Return merge(left, right).",
                "                  Define a function named merge that takes left, right.",
                "                  Create empty result.",
                "                  While left NOT empty and right NOT empty.",
                "                  If first(left) <= first(right), then.",
                "                  Move first(left) to result.",
                "                  Otherwise.",
                "                  Move first(right) to result.",
                "                  End the if.",
                "                  End the while.",
                "                  Append remaining items to result.",
                "                  Return result."
              ],
              "standard": [
                "Define merge_sort(A).",
                "                  Return A immediately when its length is 1 or less.",
                "                  Split A into halves, recursively sort each half, and merge the sorted results.",
                "                  Define merge(left, right) to repeatedly move the smaller front item into result, then append the remainder."
              ],
              "abstraction": [
                "Recursively split the array, sort both halves, and merge them back together."
              ],
              "pseudocode": [
                "FUNCTION merge_sort(A)",
                "                  IF length(A) <= 1 THEN",
                "                  RETURN A",
                "                  END IF",
                "                  SET mid = floor(length(A) / 2)",
                "                  SET left = merge_sort(first half of A)",
                "                  SET right = merge_sort(second half of A)",
                "                  RETURN merge(left, right)",
                "                  FUNCTION merge(left, right)",
                "                  CREATE empty result",
                "                  WHILE left NOT empty AND right NOT empty",
                "                  IF first(left) <= first(right) THEN",
                "                  MOVE first(left) TO result ELSE MOVE first(right) TO result END IF END WHILE APPEND remaining",
                "                  items to result RETURN result"
              ]
            }
          ]
        },
        {
          "id": "sorting-radix-sort",
          "title": "Radix sort",
          "definition": "Radix sort sorts numbers digit by digit, usually from least significant digit to most significant digit, using a stable grouping step at each digit position.",
          "howAndWhy": "It is used when keys are integers or strings with a fixed alphabetic or numeric structure. Instead of comparing whole values directly, it organizes them by parts. This can be very efficient in the right setting.",
          "examples": [
            {
              "id": "sorting-radix-sort-example",
              "strict": [
                "Define a function named radix_sort that takes A.",
                "                  Set max_digits to number of digits in the largest value.",
                "                  For digit_position from 1 to max_digits.",
                "                  Place each value into bucket based on its current digit.",
                "                  Collect buckets back into a in bucket order.",
                "                  End the for."
              ],
              "standard": [
                "Define radix_sort(A).",
                "                  Find how many digit positions the largest value has.",
                "                  For each digit position, bucket values by that digit and collect the buckets back into A."
              ],
              "abstraction": [
                "Sort numbers digit by digit, from least significant to most significant."
              ],
              "pseudocode": [
                "FUNCTION radix_sort(A)",
                "                  SET max_digits = number of digits in the largest value",
                "                  FOR digit_position FROM 1 TO max_digits",
                "                  PLACE each value into bucket based on its current digit COLLECT buckets back into A in bucket order",
                "                  END FOR"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "greedy-algorithms",
      "number": 9,
      "title": "Greedy Algorithms",
      "overview": "A greedy algorithm makes the best-looking local choice at each step and does not reconsider that choice later. Greedy methods are powerful when a problem has a structure that guarantees local decisions build a global optimum.",
      "topics": [
        {
          "id": "greedy-activity-selection",
          "title": "Activity selection",
          "definition": "The activity selection problem asks for the maximum number of non-overlapping activities. The classic greedy rule is to keep choosing the activity that finishes first among those still available.",
          "howAndWhy": "It is used because finishing early leaves as much room as possible for future activities. This is a case where the locally best decision provably supports the globally best schedule.",
          "examples": [
            {
              "id": "greedy-activity-selection-example",
              "strict": [
                "Define a function named activity_selection that takes activities.",
                "                  Sort activities by finish time.",
                "                  Create empty answer.",
                "                  Set last_finish to -infinity.",
                "                  For each activity in activities.",
                "                  If activity.start >= last_finish, then.",
                "                  Append activity to answer.",
                "                  Set last_finish to activity.finish.",
                "                  End the if.",
                "                  End the for.",
                "                  Return answer."
              ],
              "standard": [
                "Define activity_selection(activities).",
                "                  Sort the activities by finish time.",
                "                  Walk through them in that order and choose an activity whenever its start is at least the last chosen finish.",
                "                  Return the chosen set."
              ],
              "abstraction": [
                "Greedily keep the earliest-finishing compatible activities."
              ],
              "pseudocode": [
                "FUNCTION activity_selection(activities)",
                "                  SORT activities by finish time",
                "                  CREATE empty answer",
                "                  SET last_finish = -infinity",
                "                  FOR EACH activity IN activities",
                "                  IF activity.start >= last_finish THEN",
                "                  APPEND activity TO answer SET last_finish = activity.finish END IF END FOR RETURN answer"
              ]
            }
          ]
        },
        {
          "id": "greedy-fractional-knapsack",
          "title": "Fractional knapsack",
          "definition": "In fractional knapsack, each item has value and weight, and fractions of items may be taken. The greedy rule is to take as much as possible of the item with highest value-to-weight ratio first.",
          "howAndWhy": "It is used because every partial unit of an item contributes proportionally. That proportional structure is exactly what makes the greedy choice correct here, unlike in the 0-1 version where items are indivisible.",
          "examples": [
            {
              "id": "greedy-fractional-knapsack-example",
              "strict": [
                "Define a function named fractional_knapsack that takes items, capacity.",
                "                  Sort items by value_per_weight in descending order.",
                "                  Set total_value to 0.",
                "                  For each item in items.",
                "                  If capacity = 0, then.",
                "                  Stop the current loop.",
                "                  End the if.",
                "                  If item.weight <= capacity, then.",
                "                  Take all of item.",
                "                  Decrease capacity by item.weight.",
                "                  Increase total_value by item.value.",
                "                  Otherwise.",
                "                  Take fraction = capacity / item.weight of item.",
                "                  Increase total_value by fraction * item.value.",
                "                  Set capacity to 0.",
                "                  End the if.",
                "                  End the for.",
                "                  Return total_value."
              ],
              "standard": [
                "Define fractional_knapsack(items, capacity).",
                "                  Sort items by value_per_weight descending.",
                "                  Take each whole item while it fits.",
                "                  When the next item no longer fits, take only the needed fraction and stop.",
                "                  Return total_value."
              ],
              "abstraction": [
                "Greedily fill the knapsack by value density, taking a fraction of the last item if needed."
              ],
              "pseudocode": [
                "FUNCTION fractional_knapsack(items, capacity)",
                "                  SORT items by value_per_weight in descending order",
                "                  SET total_value = 0",
                "                  FOR EACH item IN items",
                "                  IF capacity = 0 THEN",
                "                  BREAK END IF IF item.weight <= capacity THEN TAKE all of item DECREASE capacity by item.weight",
                "                  INCREASE total_value by item.value ELSE TAKE fraction = capacity / item.weight of item INCREASE",
                "                  total_value by fraction * item.value SET capacity = 0 END IF END FOR RETURN total_value"
              ]
            }
          ]
        },
        {
          "id": "greedy-huffman-coding",
          "title": "Huffman coding",
          "definition": "Huffman coding builds an optimal prefix code by repeatedly combining the two least frequent symbols into a new tree node.",
          "howAndWhy": "It is used in compression because frequent symbols should get shorter codes and rare symbols can tolerate longer ones. The greedy choice of merging the two least frequent symbols is what makes the final code optimal.",
          "examples": [
            {
              "id": "greedy-huffman-coding-example",
              "strict": [
                "Define a function named huffman that takes frequencies.",
                "                  Create min_heap of one-node trees keyed by frequency.",
                "                  While heap size > 1.",
                "                  Extract smallest tree x.",
                "                  Extract smallest tree y.",
                "                  Create new parent with weight x.weight + y.weight.",
                "                  Set parent.left to x.",
                "                  Set parent.right to y.",
                "                  Insert parent back into heap.",
                "                  End the while.",
                "                  Return remaining tree."
              ],
              "standard": [
                "Define huffman(frequencies).",
                "                  Create a min-heap of one-node trees.",
                "                  Repeatedly remove the two lightest trees, join them under a new parent, and push that parent back.",
                "                  Return the final remaining tree."
              ],
              "abstraction": [
                "Build the Huffman tree by repeatedly merging the two least frequent trees."
              ],
              "pseudocode": [
                "FUNCTION huffman(frequencies)",
                "                  CREATE min_heap of one-node trees keyed by frequency",
                "                  WHILE heap size > 1",
                "                  EXTRACT smallest tree x EXTRACT smallest tree y CREATE new parent with weight x.weight + y.weight",
                "                  SET parent.left = x SET parent.right = y INSERT parent back into heap END WHILE RETURN remaining",
                "                  tree"
              ]
            }
          ]
        },
        {
          "id": "greedy-minimum-spanning-tree-with-kruskals-idea",
          "title": "Minimum spanning tree with Kruskal's idea",
          "definition": "A minimum spanning tree connects all vertices in a weighted undirected graph using the smallest possible total edge weight without creating cycles. Kruskal's greedy rule adds the smallest safe edge next.",
          "howAndWhy": "It is used in network design because it minimizes total wiring, road cost, or infrastructure cost while still keeping the system connected. The key is that an edge is chosen only if it does not form a cycle with edges already chosen.",
          "examples": [
            {
              "id": "greedy-minimum-spanning-tree-with-kruskals-idea-example",
              "strict": [
                "Define a function named kruskal that takes vertices, edges.",
                "                  Sort edges by weight.",
                "                  Make each vertex its own set.",
                "                  Create empty tree_edges.",
                "                  For each edge (u, v, w) in sorted edges.",
                "                  If find(u) != find(v), then.",
                "                  Append edge to tree_edges.",
                "                  Union sets of u and v.",
                "                  End the if.",
                "                  End the for.",
                "                  Return tree_edges."
              ],
              "standard": [
                "Define kruskal(vertices, edges).",
                "                  Sort edges by weight and place each vertex in its own set.",
                "                  Scan edges from lightest to heaviest.",
                "                  Add an edge only when its endpoints are in different sets, then union those sets.",
                "                  Return tree_edges."
              ],
              "abstraction": [
                "Build the MST by adding the lightest edges that do not create a cycle."
              ],
              "pseudocode": [
                "FUNCTION kruskal(vertices, edges)",
                "                  SORT edges by weight",
                "                  MAKE each vertex its own set CREATE empty tree_edges FOR EACH edge (u, v, w) IN sorted edges IF",
                "                  find(u) != find(v) THEN APPEND edge TO tree_edges UNION sets of u and v END IF END FOR RETURN",
                "                  tree_edges"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "dynamic-programming",
      "number": 10,
      "title": "Dynamic Programming",
      "overview": "Dynamic programming solves problems with overlapping subproblems and optimal substructure by storing smaller answers and reusing them. The main design questions are always the same: what is the state, what is the recurrence, and in what order should states be filled?",
      "topics": [
        {
          "id": "dynamic-programming-zero-one-knapsack",
          "title": "0-1 Knapsack",
          "definition": "In 0-1 knapsack, each item may either be taken whole or left behind. The state usually records how many items have been considered and how much capacity remains or has already been used.",
          "howAndWhy": "It is used because greedy choice fails in the 0-1 setting. Dynamic programming works by comparing two possibilities for each item: skip it or take it, then reusing those smaller decisions.",
          "examples": [
            {
              "id": "dynamic-programming-zero-one-knapsack-example",
              "strict": [
                "Define a function named zero_one_knapsack that takes weights, values, capacity.",
                "                  Create table dp with rows for items and columns 0..capacity.",
                "                  For i from 1 to number_of_items.",
                "                  For c from 0 to capacity.",
                "                  Set dp[i][c] to dp[i-1][c].",
                "                  If weights[i] <= c, then.",
                "                  Set dp[i][c] to max(dp[i][c], values[i] + dp[i-1][c - weights[i]]).",
                "                  End the if.",
                "                  End the for.",
                "                  End the for.",
                "                  Return dp[number_of_items][capacity]."
              ],
              "standard": [
                "Define zero_one_knapsack(weights, values, capacity).",
                "                  Create a DP table over items and capacities.",
                "                  For each item and capacity, start from the skip case.",
                "                  If the item fits, compare skipping it with taking it.",
                "                  Return the value at the final state."
              ],
              "abstraction": [
                "Fill a DP table that decides, for each item and capacity, whether skipping or taking the item is better."
              ],
              "pseudocode": [
                "FUNCTION zero_one_knapsack(weights, values, capacity)",
                "                  CREATE table dp with rows for items and columns 0..capacity",
                "                  FOR i FROM 1 TO number_of_items",
                "                  FOR c FROM 0 TO capacity",
                "                  SET dp[i][c] = dp[i-1][c]",
                "                  IF weights[i] <= c THEN",
                "                  SET dp[i][c] = max(dp[i][c], values[i] + dp[i-1][c - weights[i]])",
                "                  END IF",
                "                  END FOR",
                "                  END FOR",
                "                  RETURN dp[number_of_items][capacity]"
              ]
            }
          ]
        },
        {
          "id": "dynamic-programming-unbounded-knapsack",
          "title": "Unbounded Knapsack",
          "definition": "In unbounded knapsack, an item may be used more than once. The recurrence changes because the current item can remain available after it is chosen.",
          "howAndWhy": "It is used for production, coin-style packing, and resource allocation problems where repeating an item is legal. The central lesson is that a small change in problem rules changes the recurrence completely.",
          "examples": [
            {
              "id": "dynamic-programming-unbounded-knapsack-example",
              "strict": [
                "Define a function named unbounded_knapsack that takes weights, values, capacity.",
                "                  Create array dp[0..capacity] initialized to 0.",
                "                  For c from 0 to capacity.",
                "                  For each item i.",
                "                  If weights[i] <= c, then.",
                "                  Set dp[c] to max(dp[c], values[i] + dp[c - weights[i]]).",
                "                  End the if.",
                "                  End the for.",
                "                  End the for.",
                "                  Return dp[capacity]."
              ],
              "standard": [
                "Define unbounded_knapsack(weights, values, capacity).",
                "                  Create a 1D DP array from 0 to capacity.",
                "                  For each capacity, test every item that fits.",
                "                  Update dp[c] using the best value after taking that item again.",
                "                  Return dp[capacity]."
              ],
              "abstraction": [
                "Use dynamic programming over capacity, allowing the same item to be reused."
              ],
              "pseudocode": [
                "FUNCTION unbounded_knapsack(weights, values, capacity)",
                "                  CREATE array dp[0..capacity] initialized to 0",
                "                  FOR c FROM 0 TO capacity",
                "                  FOR EACH item i",
                "                  IF weights[i] <= c THEN",
                "                  SET dp[c] = max(dp[c], values[i] + dp[c - weights[i]])",
                "                  END IF",
                "                  END FOR",
                "                  END FOR",
                "                  RETURN dp[capacity]"
              ]
            }
          ]
        },
        {
          "id": "dynamic-programming-longest-common-subsequence",
          "title": "Longest Common Subsequence (LCS)",
          "definition": "The longest common subsequence problem asks for the longest sequence of symbols that appears in the same relative order in two strings, not necessarily contiguously.",
          "howAndWhy": "It is used in diff tools, bioinformatics, and version comparison because it measures shared structure rather than exact matching blocks. The state compares prefixes of the two strings.",
          "examples": [
            {
              "id": "dynamic-programming-longest-common-subsequence-example",
              "strict": [
                "Define a function named lcs that takes X, Y.",
                "                  Create table dp with size (length(x)+1) by (length(y)+1).",
                "                  For i from 1 to length(x).",
                "                  For j from 1 to length(y).",
                "                  If X[i] = Y[j], then.",
                "                  Set dp[i][j] to 1 + dp[i-1][j-1].",
                "                  Otherwise.",
                "                  Set dp[i][j] to max(dp[i-1][j], dp[i][j-1]).",
                "                  End the if.",
                "                  End the for.",
                "                  End the for.",
                "                  Return dp[length(X)][length(Y)]."
              ],
              "standard": [
                "Define lcs(X, Y).",
                "                  Create a DP table over prefixes of X and Y.",
                "                  For each pair of positions, extend the diagonal when the symbols match.",
                "                  Otherwise take the larger value from the cell above or left.",
                "                  Return the final table entry."
              ],
              "abstraction": [
                "Fill a DP table over both strings to compute the length of their longest common subsequence."
              ],
              "pseudocode": [
                "FUNCTION lcs(X, Y)",
                "                  CREATE table dp with size (length(X)+1) by (length(Y)+1)",
                "                  FOR i FROM 1 TO length(X)",
                "                  FOR j FROM 1 TO length(Y)",
                "                  IF X[i] = Y[j] THEN",
                "                  SET dp[i][j] = 1 + dp[i-1][j-1]",
                "                  ELSE",
                "                  SET dp[i][j] = max(dp[i-1][j], dp[i][j-1])",
                "                  END IF",
                "                  END FOR",
                "                  END FOR",
                "                  RETURN dp[length(X)][length(Y)]"
              ]
            }
          ]
        },
        {
          "id": "dynamic-programming-longest-increasing-subsequence",
          "title": "Longest Increasing Subsequence (LIS)",
          "definition": "The longest increasing subsequence problem asks for the longest subsequence of numbers that increases strictly from left to right.",
          "howAndWhy": "It is used because it teaches how to reason about sequences where local comparisons affect future potential. A classic dynamic program lets each position ask: what is the best increasing subsequence ending here?",
          "examples": [
            {
              "id": "dynamic-programming-longest-increasing-subsequence-example",
              "strict": [
                "Define a function named lis that takes A.",
                "                  Create array dp of length(a), initialized to 1.",
                "                  For i from 0 to length(a) - 1.",
                "                  For j from 0 to i - 1.",
                "                  If A[j] < A[i], then.",
                "                  Set dp[i] to max(dp[i], dp[j] + 1).",
                "                  End the if.",
                "                  End the for.",
                "                  End the for.",
                "                  Return maximum value in dp."
              ],
              "standard": [
                "Define lis(A).",
                "                  Create dp so every position starts with length 1.",
                "                  For each i, compare against all earlier j.",
                "                  When A[j] < A[i], update dp[i] from dp[j] + 1.",
                "                  Return the maximum value in dp."
              ],
              "abstraction": [
                "Compute the best increasing subsequence ending at each position and return the largest one."
              ],
              "pseudocode": [
                "FUNCTION lis(A)",
                "                  CREATE array dp of length(A), initialized to 1",
                "                  FOR i FROM 0 TO length(A) - 1",
                "                  FOR j FROM 0 TO i - 1",
                "                  IF A[j] < A[i] THEN",
                "                  SET dp[i] = max(dp[i], dp[j] + 1)",
                "                  END IF",
                "                  END FOR",
                "                  END FOR",
                "                  RETURN maximum value in dp"
              ]
            }
          ]
        },
        {
          "id": "dynamic-programming-matrix-chain-multiplication",
          "title": "Matrix Chain Multiplication",
          "definition": "Matrix chain multiplication asks how to parenthesize a product of matrices so the total number of scalar multiplications is minimized.",
          "howAndWhy": "It is used because multiplication order changes cost dramatically even though the final mathematical product stays the same. Dynamic programming compares all possible split points of each subchain and stores the cheapest one.",
          "examples": [
            {
              "id": "dynamic-programming-matrix-chain-multiplication-example",
              "strict": [
                "Define a function named matrix_chain_order that takes p.",
                "                  Let n = number of matrices.",
                "                  Create table dp[n][n].",
                "                  For chain_length from 2 to n.",
                "                  For i from 1 to n - chain_length + 1.",
                "                  Set j to i + chain_length - 1.",
                "                  Set dp[i][j] to infinity.",
                "                  For k from i to j - 1.",
                "                  Set cost to dp[i][k] + dp[k+1][j] + p[i-1] * p[k] * p[j].",
                "                  Set dp[i][j] to min(dp[i][j], cost).",
                "                  End the for.",
                "                  End the for.",
                "                  End the for.",
                "                  Return dp[1][n]."
              ],
              "standard": [
                "Define matrix_chain_order(p).",
                "                  Create a DP table for all matrix subchains.",
                "                  Process chains in increasing length.",
                "                  For each subchain, try every split point k and keep the cheapest multiplication cost.",
                "                  Return dp[1][n]."
              ],
              "abstraction": [
                "Use dynamic programming to test every split of each matrix subchain and keep the minimum cost."
              ],
              "pseudocode": [
                "FUNCTION matrix_chain_order(p)",
                "                  LET n = number of matrices CREATE table dp[n][n] FOR chain_length FROM 2 TO n FOR i FROM 1 TO n -",
                "                  chain_length + 1 SET j = i + chain_length - 1 SET dp[i][j] = infinity FOR k FROM i TO j - 1 SET cost = dp[i]",
                "                  [k] + dp[k+1][j] + p[i-1] * p[k] * p[j] SET dp[i][j] = min(dp[i][j], cost) END FOR END FOR END FOR RETURN",
                "                  dp[1][n]"
              ]
            }
          ]
        }
      ]
    }
  ]
};

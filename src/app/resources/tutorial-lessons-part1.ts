import { example, lesson, topic, type Lesson } from "./tutorial-types";

export const TAB_ONE_LESSONS_PART_1: Lesson[] = [
  lesson(
    "variables",
    1,
    "Variables",
    "Variables let a program keep track of information by giving that information a name. They are used whenever a value needs to be stored, reused, updated, or compared later.",
    [
      topic(
        "variable-names",
        "Variable names",
        "A variable name is the label used to refer to stored information. Good names make a program easier to read because the name tells you what the value represents.",
        "Use variable names when you want instructions to stay understandable. A name like total_score is better than a name like x because it explains the role of the value.",
        [
              example(
                "variable-names-example",
                [
                  "Initialize a variable called score.",
                  "Make score equal 95.",
                  "Print score."
                ],
                [
                  "Set a variable called score to 95.",
                  "Print score."
                ],
                [
                  "Print a variable score that equals 95."
                ],
                [
                  "SET score TO 95",
                  "PRINT score"
                ]
              )
            ]
      ),
      topic(
        "assign-multiple-values",
        "Assign multiple values",
        "Assigning multiple values means creating or updating more than one variable during the same step or small group of steps.",
        "This is used when several related values belong together, such as width and height, or first_name and last_name. It helps organize state early before later calculations use those values.",
        [
              example(
                "assign-multiple-values-example",
                [
                  "Initialize a variable called width.",
                  "Initialize a variable called height.",
                  "Set width to 10.",
                  "Set height to 20.",
                  "Print width.",
                  "Print height."
                ],
                [
                  "Create 2 variables called width and height.",
                  "Set width to 10 and set height to 20.",
                  "Print width and height",
                ],
                [
                  "Print 2 variables width and height that are 10 and 20 repsectively."
                ],
                [
                  "SET width TO 10",
                  "SET height TO 20",
                  "PRINT width",
                  "PRINT height"
                ]
              )
            ]
      ),
      topic(
        "output-variables",
        "Output variables",
        "Outputting a variable means showing the value currently stored inside it.",
        "This is used for debugging, checking progress, and presenting results. If you cannot see a value, it is harder to know whether earlier steps worked correctly.",
        [
              example(
                "output-variables-example",
                [
                  "Initialize a variable called name.",
                  "Set name to \"Matthew\".",
                  "Print name."
                ],
                [
                  "Make a variable called name and set it to \"Matthew\".",
                  "Print name."
                ],
                [
                  "Set name to \"Matthew\".",
                  "Print name."
                ],
                [
                  "SET name TO \"Matthew\"",
                  "PRINT name"
                ]
              )
            ]
      ),
      topic(
        "global-variables",
        "Global variables",
        "A global variable is a variable that is intended to be available across multiple parts of a program instead of living only inside one small block.",
        "Global variables are used when many parts of a program must share the same setting or state. They should be used carefully because too many shared variables make programs harder to reason about.",
        [
              example(
                "global-variables-example",
                [
                  "Create a global variable called tax_rate.",
                  "Set tax_rate to 0.13.",
                  "Create a variable called price and set it to 100.",
                  "Calculate final_price as price plus (price times tax_rate)."
                ],
                [
                  "Set the global variable tax_rate to 0.13.",
                  "Calculate a value final_price as price plus (price times tax_rate)."
                ],
                [
                  "Set the global variable tax_rate to 0.13.",
                  "Use tax_rate when calculating final_price."
                ],
                [
                  "SET GLOBAL tax_rate TO 0.13",
                  "USE tax_rate WHEN CALCULATING final_price"
                ]
              )
            ]
      ),
    ]
  ),
  lesson(
    "data-types",
    2,
    "Data types",
    "A data type tells you what kind of value something is. The type matters because different kinds of values support different operations.",
    [
      topic(
        "common-data-types",
        "Common data types",
        "Common data types include numbers, strings, booleans, lists, tuples, sets, and dictionaries.",
        "Knowing the type of a value prevents mistakes. For example, text and numbers are handled differently, and a list behaves differently from a single value.",
        [
              example(
                "common-data-types-example",
                [
                  "Set name to \"Ava\".",
                  "Set age to 19.",
                  "Set is_enrolled to TRUE."
                ],
                [
                  "Set name to \"Ava\".",
                  "Set age to 19.",
                  "Set is_enrolled to TRUE."
                ],
                [
                  "Set name to \"Ava\".",
                  "Set age to 19.",
                  "Set is_enrolled to TRUE."
                ],
                [
                  "SET name TO \"Ava\"",
                  "SET age TO 19",
                  "SET is_enrolled TO TRUE"
                ]
              )
            ]
      ),
      topic(
        "why-type-matters",
        "Why type matters",
        "Type matters because the program needs to know what actions make sense for a value.",
        "You can add numbers, slice strings, loop through lists, and look up values in dictionaries. Each data type gives you its own useful operations.",
        [
              example(
                "why-type-matters-example",
                [
                  "Set a to 4.",
                  "Set b to 7.",
                  "Set is_smaller to a < b.",
                  "Set full_name to \"Ada\" + \" Lovelace\"."
                ],
                [
                  "Set a to 4.",
                  "Set b to 7.",
                  "Set is_smaller to a < b.",
                  "Set full_name to \"Ada\" + \" Lovelace\"."
                ],
                [
                  "Set a to 4.",
                  "Set b to 7.",
                  "Set is_smaller to a < b.",
                  "Set full_name to \"Ada\" + \" Lovelace\"."
                ],
                [
                  "SET a TO 4",
                  "SET b TO 7",
                  "SET is_smaller TO a < b",
                  "SET full_name TO \"Ada\" + \" Lovelace\""
                ]
              )
            ]
      ),
    ]
  ),
  lesson(
    "numbers",
    3,
    "Numbers",
    "Numbers represent quantities. They are used for counting, measuring, averaging, scoring, comparing, and doing arithmetic.",
    [
      topic(
        "integers-and-decimals",
        "Integers and decimals",
        "Integers are whole numbers. Decimals store numbers with fractional parts.",
        "Use integers for counting items and decimals for measurements, money, probabilities, or any quantity that is not restricted to whole units.",
        [
              example(
                "integers-and-decimals-example",
                [
                  "Set student_count to 8.",
                  "Set average_grade to 92.5."
                ],
                [
                  "Set student_count to 8.",
                  "Set average_grade to 92.5."
                ],
                [
                  "Set student_count to 8.",
                  "Set average_grade to 92.5."
                ],
                [
                  "SET student_count TO 8",
                  "SET average_grade TO 92.5"
                ]
              )
            ]
      ),
      topic(
        "numeric-operations",
        "Numeric operations",
        "Numeric operations include addition, subtraction, multiplication, division, exponentiation, remainder, and order-of-operations combinations.",
        "They are used whenever a program must transform raw quantities into useful results.",
        [
              example(
                "numeric-operations-example",
                [
                  "Set total to 88 + 91 + 95.",
                  "Set average to total / 3.",
                  "Print average."
                ],
                [
                  "Set total to 88 + 91 + 95.",
                  "Set average to total / 3.",
                  "Print average."
                ],
                [
                  "Set total to 88 + 91 + 95.",
                  "Set average to total / 3.",
                  "Print average."
                ],
                [
                  "SET total TO 88 + 91 + 95",
                  "SET average TO total / 3",
                  "PRINT average"
                ]
              )
            ]
      ),
    ]
  ),
  lesson(
    "strings",
    4,
    "Strings",
    "A string is a sequence of text characters. Strings are used for names, messages, labels, user input, file-like text content, and formatted output.",
    [
      topic(
        "creating-strings",
        "Creating strings",
        "Creating a string means storing text as a value.",
        "This is used whenever the program must remember words, labels, sentences, or user-facing messages.",
        [
              example(
                "creating-strings-example",
                ["Set greeting to \"Hello world\"."],
                ["Set greeting to \"Hello world\"."],
                ["Set greeting to \"Hello world\"."],
                ["SET greeting TO \"Hello world\""]
              )
            ]
      ),
      topic(
        "string-length",
        "String length",
        "The length of a string is the number of characters it contains.",
        "Length is used to check whether text is empty, whether a password is long enough, or whether a user entered too much or too little text.",
        [
              example(
                "string-length-example",
                [
                  "Set username to \"matthew\".",
                  "Set character_count to LENGTH OF username.",
                  "Print character_count."
                ],
                [
                  "Set username to \"matthew\".",
                  "Set character_count to LENGTH OF username.",
                  "Print character_count."
                ],
                [
                  "Set username to \"matthew\".",
                  "Set character_count to LENGTH OF username.",
                  "Print character_count."
                ],
                [
                  "SET username TO \"matthew\"",
                  "SET character_count TO LENGTH OF username",
                  "PRINT character_count"
                ]
              )
            ]
      ),
      topic(
        "indexing",
        "Indexing",
        "Indexing means accessing one character at a specific position inside a string.",
        "It is used when a program needs a particular letter, such as the first initial of a name or the last character of an ID.",
        [
              example(
                "indexing-example",
                [
                  "Set word to \"banana\".",
                  "Set first_character to CHARACTER 0 OF word.",
                  "Print first_character."
                ],
                [
                  "Set word to \"banana\".",
                  "Set first_character to CHARACTER 0 OF word.",
                  "Print first_character."
                ],
                [
                  "Set word to \"banana\".",
                  "Set first_character to CHARACTER 0 OF word.",
                  "Print first_character."
                ],
                [
                  "SET word TO \"banana\"",
                  "SET first_character TO CHARACTER 0 OF word",
                  "PRINT first_character"
                ]
              )
            ]
      ),
      topic(
        "slicing-strings",
        "Slicing strings",
        "Slicing means taking a portion of a string from one position to another.",
        "This is used for abbreviations, extracting prefixes and suffixes, getting date parts, or isolating a certain section of text.",
        [
              example(
                "slicing-strings-example",
                [
                  "Set date_text to \"2026-04-15\".",
                  "Set year_text to CHARACTERS 0 THROUGH 3 OF date_text.",
                  "Print year_text."
                ],
                [
                  "Set date_text to \"2026-04-15\".",
                  "Set year_text to CHARACTERS 0 THROUGH 3 OF date_text.",
                  "Print year_text."
                ],
                [
                  "Set date_text to \"2026-04-15\".",
                  "Set year_text to CHARACTERS 0 THROUGH 3 OF date_text.",
                  "Print year_text."
                ],
                [
                  "SET date_text TO \"2026-04-15\"",
                  "SET year_text TO CHARACTERS 0 THROUGH 3 OF date_text",
                  "PRINT year_text"
                ]
              )
            ]
      ),
      topic(
        "concatenation",
        "Concatenation",
        "Concatenation means joining strings together to build larger text.",
        "This is used for names, messages, labels, and dynamic output.",
        [
              example(
                "concatenation-example",
                [
                  "Set first_name to \"Grace\".",
                  "Set last_name to \"Hopper\".",
                  "Set full_name to first_name + \" \" + last_name.",
                  "Print full_name."
                ],
                [
                  "Set first_name to \"Grace\".",
                  "Set last_name to \"Hopper\".",
                  "Set full_name to first_name + \" \" + last_name.",
                  "Print full_name."
                ],
                [
                  "Set first_name to \"Grace\".",
                  "Set last_name to \"Hopper\".",
                  "Set full_name to first_name + \" \" + last_name.",
                  "Print full_name."
                ],
                [
                  "SET first_name TO \"Grace\"",
                  "SET last_name TO \"Hopper\"",
                  "SET full_name TO first_name + \" \" + last_name",
                  "PRINT full_name"
                ]
              )
            ]
      ),
      topic(
        "repetition",
        "Repetition",
        "String repetition means repeating the same text multiple times.",
        "It is used for simple patterns, dividers, banners, or placeholders.",
        [
              example(
                "repetition-example",
                [
                  "Set divider to \"-\" REPEATED 5 TIMES.",
                  "Print divider."
                ],
                [
                  "Set divider to \"-\" REPEATED 5 TIMES.",
                  "Print divider."
                ],
                [
                  "Set divider to \"-\" REPEATED 5 TIMES.",
                  "Print divider."
                ],
                [
                  "SET divider TO \"-\" REPEATED 5 TIMES",
                  "PRINT divider"
                ]
              )
            ]
      ),
      topic(
        "changing-case",
        "Changing case",
        "Changing case means converting text to uppercase, lowercase, or title case.",
        "This is used for normalization, display consistency, and comparisons that should ignore capitalization differences.",
        [
              example(
                "changing-case-example",
                [
                  "Set subject to \"Math\".",
                  "Set normalized_subject to LOWERCASE OF subject.",
                  "Print normalized_subject."
                ],
                [
                  "Set subject to \"Math\".",
                  "Set normalized_subject to LOWERCASE OF subject.",
                  "Print normalized_subject."
                ],
                [
                  "Set subject to \"Math\".",
                  "Set normalized_subject to LOWERCASE OF subject.",
                  "Print normalized_subject."
                ],
                [
                  "SET subject TO \"Math\"",
                  "SET normalized_subject TO LOWERCASE OF subject",
                  "PRINT normalized_subject"
                ]
              )
            ]
      ),
      topic(
        "removing-extra-spaces",
        "Removing extra spaces",
        "Trimming removes unnecessary spaces from the beginning and end of a string.",
        "This is important when user input contains accidental spaces that would otherwise break comparisons or formatting.",
        [
              example(
                "removing-extra-spaces-example",
                [
                  "Set raw_name to \"  Ava  \".",
                  "Set clean_name to TRIM raw_name.",
                  "Print clean_name."
                ],
                [
                  "Set raw_name to \"  Ava  \".",
                  "Set clean_name to TRIM raw_name.",
                  "Print clean_name."
                ],
                [
                  "Set raw_name to \"  Ava  \".",
                  "Set clean_name to TRIM raw_name.",
                  "Print clean_name."
                ],
                [
                  "SET raw_name TO \"  Ava  \"",
                  "SET clean_name TO TRIM raw_name",
                  "PRINT clean_name"
                ]
              )
            ]
      ),
      topic(
        "replacing-text",
        "Replacing text",
        "Replacing text means finding one part of a string and changing it to another value.",
        "This is used to clean text, standardize labels, or update words inside a message.",
        [
              example(
                "replacing-text-example",
                [
                  "Set sentence to \"The cat is sleeping\".",
                  "Set updated_sentence to REPLACE \"cat\" WITH \"dog\" IN sentence.",
                  "Print updated_sentence."
                ],
                [
                  "Set sentence to \"The cat is sleeping\".",
                  "Set updated_sentence to REPLACE \"cat\" WITH \"dog\" IN sentence.",
                  "Print updated_sentence."
                ],
                [
                  "Set sentence to \"The cat is sleeping\".",
                  "Set updated_sentence to REPLACE \"cat\" WITH \"dog\" IN sentence.",
                  "Print updated_sentence."
                ],
                [
                  "SET sentence TO \"The cat is sleeping\"",
                  "SET updated_sentence TO REPLACE \"cat\" WITH \"dog\" IN sentence",
                  "PRINT updated_sentence"
                ]
              )
            ]
      ),
      topic(
        "searching-inside-strings",
        "Searching inside strings",
        "Searching means checking whether text contains a certain word or character, or finding where it appears.",
        "This is used for validation, filtering, keyword checks, and simple parsing.",
        [
              example(
                "searching-inside-strings-example",
                [
                  "Set message to \"system error detected\".",
                  "Set has_error to message CONTAINS \"error\".",
                  "Print has_error."
                ],
                [
                  "Set message to \"system error detected\".",
                  "Set has_error to message CONTAINS \"error\".",
                  "Print has_error."
                ],
                [
                  "Set message to \"system error detected\".",
                  "Set has_error to message CONTAINS \"error\".",
                  "Print has_error."
                ],
                [
                  "SET message TO \"system error detected\"",
                  "SET has_error TO message CONTAINS \"error\"",
                  "PRINT has_error"
                ]
              )
            ]
      ),
      topic(
        "starts-with-and-ends-with",
        "Starts with and ends with",
        "These checks test whether a string begins or finishes with a particular pattern.",
        "They are used for file names, email checks, prefixes, suffixes, and routing-like decisions.",
        [
              example(
                "starts-with-and-ends-with-example",
                [
                  "Set file_name to \"notes.pdf\".",
                  "Set is_pdf to file_name ENDS WITH \".pdf\".",
                  "Print is_pdf."
                ],
                [
                  "Set file_name to \"notes.pdf\".",
                  "Set is_pdf to file_name ENDS WITH \".pdf\".",
                  "Print is_pdf."
                ],
                [
                  "Set file_name to \"notes.pdf\".",
                  "Set is_pdf to file_name ENDS WITH \".pdf\".",
                  "Print is_pdf."
                ],
                [
                  "SET file_name TO \"notes.pdf\"",
                  "SET is_pdf TO file_name ENDS WITH \".pdf\"",
                  "PRINT is_pdf"
                ]
              )
            ]
      ),
      topic(
        "splitting-strings",
        "Splitting strings",
        "Splitting turns one string into multiple pieces using a separator such as a comma or space.",
        "It is used when one line of text actually contains several values that need to be processed separately.",
        [
              example(
                "splitting-strings-example",
                [
                  "Set colors_text to \"red,blue,green\".",
                  "Set colors to SPLIT colors_text BY \",\".",
                  "Print colors."
                ],
                [
                  "Set colors_text to \"red,blue,green\".",
                  "Set colors to SPLIT colors_text BY \",\".",
                  "Print colors."
                ],
                [
                  "Set colors_text to \"red,blue,green\".",
                  "Set colors to SPLIT colors_text BY \",\".",
                  "Print colors."
                ],
                [
                  "SET colors_text TO \"red,blue,green\"",
                  "SET colors TO SPLIT colors_text BY \",\"",
                  "PRINT colors"
                ]
              )
            ]
      ),
      topic(
        "joining-strings",
        "Joining strings",
        "Joining is the reverse of splitting. It combines many strings into one string using a chosen separator.",
        "It is used when a program stores many text pieces separately but needs to display them as one message.",
        [
              example(
                "joining-strings-example",
                [
                  "Set names to [\"Ava\", \"Noah\", \"Liam\"].",
                  "Set roster_text to JOIN names WITH \", \".",
                  "Print roster_text."
                ],
                [
                  "Set names to [\"Ava\", \"Noah\", \"Liam\"].",
                  "Set roster_text to JOIN names WITH \", \".",
                  "Print roster_text."
                ],
                [
                  "Set names to [\"Ava\", \"Noah\", \"Liam\"].",
                  "Set roster_text to JOIN names WITH \", \".",
                  "Print roster_text."
                ],
                [
                  "SET names TO [\"Ava\", \"Noah\", \"Liam\"]",
                  "SET roster_text TO JOIN names WITH \", \"",
                  "PRINT roster_text"
                ]
              )
            ]
      ),
      topic(
        "formatting-strings",
        "Formatting strings",
        "Formatting means building text using both fixed words and inserted values.",
        "This is used when the program must produce readable output for a person, such as a score message, receipt line, or report sentence.",
        [
              example(
                "formatting-strings-example",
                [
                  "Set student_name to \"Maya\".",
                  "Set score to 94.",
                  "Set message to FORMAT \"Maya scored 94\" USING student_name AND score.",
                  "Print message."
                ],
                [
                  "Set student_name to \"Maya\".",
                  "Set score to 94.",
                  "Set message to FORMAT \"Maya scored 94\" USING student_name AND score.",
                  "Print message."
                ],
                [
                  "Set student_name to \"Maya\".",
                  "Set score to 94.",
                  "Set message to FORMAT \"Maya scored 94\" USING student_name AND score.",
                  "Print message."
                ],
                [
                  "SET student_name TO \"Maya\"",
                  "SET score TO 94",
                  "SET message TO FORMAT \"Maya scored 94\" USING student_name AND score",
                  "PRINT message"
                ]
              )
            ]
      ),
    ]
  ),
];

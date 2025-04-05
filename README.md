Function documentation:

# `?c` askBool -> doCheckmark

|Arg|Explanation|
|-|-|
|1|The question to ask. Defaults first to "[Default Text] checked?" and then "Unspecified Checkmark"|
|2|Whether to force an answer or not: 0 is yes, 1 is default no, 2 is default yes|
|3|Whether to perform the opposite action or not, `true` will pass a checkmark on a "no" answer|
|Default Text|To add a label following the check box, and to provide the default for 1|

# `?s` askBool -> beginSkip

|Arg|Explanation|
|-|-|
|1|The skipping value: The program will skip all sections until it finds an `es` with an equal skipping value|
|2|The question to ask. Defaults to "Skip?"|
|3|Whether to force an answer or not: 0 is yes, 1 is default to no, 2 is default to yes|
|4|Whether to perform the opposite action or not, `true` will skip on a "no" answer|
|Default Text|Will be passed and not skipped if the askBool fails.

# `es` precheck

|Arg|Explanation|
|-|-|
|1|The skipping value to check for as explained in `?s`|
|Default Text|Will be passed if the section is not skipped|

# `in` askText

|Arg|Explanation|
|-|-|
|1|The question to ask. Defaults to "Unspecified Text:"|
|2|Whether to force a non-blank answer|
|Default Text|Is the default if a blank answer is given|

# `co` askText -> colourParse

|Arg|Explanation|
|-|-|
|1|The question to ask. Defaults to "Unspecified Colour:". This colour will then be checked against the custom colour list for other options|
|Default Text|Is the default if a blank answer is given, otherwise is `pass` if there is no Default Text.|


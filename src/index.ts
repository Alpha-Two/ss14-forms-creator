var promptCL = require("prompt-sync")();
var fs = require("fs");
var Case = require("case");

const continueCharacters: string[] = [" ", "\n", "[", "]"];
const codeMarker: string = "!#";
let colourFile = fs.readFileSync(__dirname + "/colours.txt").toString();
let colours = colourFile.split("\n");
for (let i = 0; i < colours.length; i++) {
	colours[i] = colours[i].split(" ");
}
console.log(colours);

interface functionSegment {
	args: string[];
	defaultText: string;
	element: string;
	index: number;
}

class FileInStatus {
	#skippingValue: number = 0;
	#completeArray: string[] = [];
	rawFile: string;
	fileSegments: string[];

	constructor(filePath: string) {
		this.rawFile = fs.readFileSync(filePath).toString();
		console.log(this.rawFile)
		this.fileSegments = this.rawFile.split(codeMarker);
		
	}

	processFile(): string {
		for (let i = 0; i < this.fileSegments.length; i++) {
			const element = this.fileSegments[i];

			let [doContinue, args, defaultText] = this.precheck(element, i);
			if (doContinue) continue;

			this.evalShortCode({
				args: args,
				defaultText: defaultText,
				element: element,
				index: i,
			});
		}

		console.log(this.#completeArray.join(""));
		return this.#completeArray.join("");
	}

	precheck(element: string, index: number): [boolean, string[], string] {
		// returns 3 things: 1, whether to completely skip this loop. 2, the args. 3, the default text
		// 1. If empty, skip
		if (element == "") return [true, [], ""];

		let [args, defaultText] = section(element);
		// 2. if we are in the process of skipping text, check for the e function
		if (this.#skippingValue > 0) {
			if (args[0] == "e" && Number(args[1]) == this.#skippingValue) {
				this.#completeArray.push(defaultText);
				this.#skippingValue = 0;
			}
			return [true, args, defaultText];
		}
		// 3. If it is a common character, just presume it's not a function to save time
		if (continueCharacters.includes(element[0])) {
			this.#completeArray.push(element);
			return [true, args, defaultText];
		}
		return [false, args, defaultText];
	}

	evalShortCode(a: functionSegment) {
		console.log(a)
		let response: any;
		switch (a.args[0]) {
			case "?c":
				response = askBool(
					a.args[1] ||
						(a.defaultText ? a.defaultText + " checked?" : "") ||
						"Unspecified Checkmark:",
					Number(a.args[2]) || 0,
					!!a.args[3] || false
				);
				this.doCheckmark(a, response);
				break;
			case "?s":
				response = askBool(
					a.args[2] || "Skip?",
					Number(a.args[3]) || 0,
					!!a.args[4]
				);
				this.beginSkip(a, response);
				break;
			case "es": //already checked in precheck()
				this.#completeArray.push(a.defaultText);
				break;
			case "in":
				response = askText(
					a.args[1] || "Unspecified Text:",
					!!a.args[2]
				);
				this.pushText(a, response, true);
				break;
			case "co":
				response = askText(a.args[1] || "Unspecified Colour:", false);
				this.pushText(a, this.colourParse(a, response), false);
			default:
				this.#completeArray.push(a.element)
				break;
		}
	}

	doCheckmark(a: functionSegment, request: boolean) {
		this.#completeArray.push(
			"\\[" +
				(request ? "X" : "  ") +
				"]" +
				(a.defaultText ? " " + a.defaultText : "")
		);
	}

	beginSkip(a: functionSegment, request: boolean) {
		if (request) {
			this.#skippingValue = Number(a.args[1]);
			return;
		}
		this.#completeArray.push(a.defaultText);
		return;
	}

	pushText(
		a: functionSegment,
		request: string,
		forceDefault: boolean = false
	) {
		this.#completeArray.push(
			request || (forceDefault ? a.defaultText : "")
		);
	}

	colourParse(a: functionSegment, request: string) {
		request = request || a.defaultText || "pass";
		for (let i = 0; i < colours.length; i++) {
			if (colours[i][1] == request) request = colours[i][0];
		}
		return request;
	}
}

const isFile = (fileName: string) => {
	return fs.lstatSync(fileName).isFile();
};
const isFolder = (fileName: string) => {
	return fs.lstatSync(fileName).isDirectory();
};

let folderPath = __dirname + "/../";
let foundFile: string = "";

while (!foundFile) {
	let folderList = fs
		.readdirSync(folderPath)
		.map((fileName: string) => {
			return folderPath + fileName;
		})
		.filter(isFolder)
		.map((longFile: string, i: number) => {
			return [i, longFile.replace(folderPath, "")];
		});
	let fileList = fs
		.readdirSync(folderPath)
		.map((fileName: string) => {
			return folderPath + fileName;
		})
		.filter(isFile)
		.map((longFile: string, i: number) => {
			return [i + folderList.length, longFile.replace(folderPath, "")];
		});
	console.log(folderList, fileList);
	let selectNumber = Number(promptCL("File number: "));
	if (selectNumber < folderList.length) {
		folderPath += folderList[selectNumber][1] + "/";
	} else {
		foundFile =
			folderPath + fileList[selectNumber - folderList.length][1];
	}
}

let currentFile = new FileInStatus(foundFile);
fs.writeFileSync(__dirname + "/output.txt", currentFile.processFile());

function section(request: string): [string[], string] {
	let defaultValueSplit: string[] = request.split("^");
	let argSplit: string[] = defaultValueSplit[0].split("|");
	let returnObject: [string[], string] = [
		argSplit,
		defaultValueSplit.slice(1).join("^"),
	];
	console.log(returnObject);
	return returnObject;
}

function askBool(request: string, skip: number, invert: boolean) {
	console.log(skip);
	while (true) {
		let response = promptCL(request + " (y/n) ");
		if (Case.lower(response) == Case.lower("y")) return !invert;
		if (Case.lower(response) == Case.lower("n")) return !!invert;
		if (response == "" && skip) return !!(skip - 1) != invert;
	}
}

function askText(request: string, force: boolean) {
	while (true) {
		let response = promptCL(request + " ");
		if (!force || response) return response;
	}
}

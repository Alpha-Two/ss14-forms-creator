"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _FileInStatus_skippingValue, _FileInStatus_completeArray;
var promptCL = require("prompt-sync")();
var fs = require("fs");
var Case = require("case");
const continueCharacters = [" ", "\n", "[", "]"];
const codeMarker = "!#";
let colourFile = fs.readFileSync(__dirname + "/colours.txt").toString();
let colours = colourFile.split("\n");
for (let i = 0; i < colours.length; i++) {
    colours[i] = colours[i].split(" ");
}
console.log(colours);
class FileInStatus {
    constructor(filePath) {
        _FileInStatus_skippingValue.set(this, 0);
        _FileInStatus_completeArray.set(this, []);
        this.rawFile = fs.readFileSync(filePath).toString();
        console.log(this.rawFile);
        this.fileSegments = this.rawFile.split(codeMarker);
    }
    processFile() {
        for (let i = 0; i < this.fileSegments.length; i++) {
            const element = this.fileSegments[i];
            let [doContinue, args, defaultText] = this.precheck(element, i);
            if (doContinue)
                continue;
            this.evalShortCode({
                args: args,
                defaultText: defaultText,
                element: element,
                index: i,
            });
        }
        console.log(__classPrivateFieldGet(this, _FileInStatus_completeArray, "f").join(""));
        return __classPrivateFieldGet(this, _FileInStatus_completeArray, "f").join("");
    }
    precheck(element, index) {
        // returns 3 things: 1, whether to completely skip this loop. 2, the args. 3, the default text
        // 1. If empty, skip
        if (element == "")
            return [true, [], ""];
        let [args, defaultText] = section(element);
        // 2. if we are in the process of skipping text, check for the e function
        if (__classPrivateFieldGet(this, _FileInStatus_skippingValue, "f") > 0) {
            if (args[0] == "e" && Number(args[1]) == __classPrivateFieldGet(this, _FileInStatus_skippingValue, "f")) {
                __classPrivateFieldGet(this, _FileInStatus_completeArray, "f").push(defaultText);
                __classPrivateFieldSet(this, _FileInStatus_skippingValue, 0, "f");
            }
            return [true, args, defaultText];
        }
        // 3. If it is a common character, just presume it's not a function to save time
        if (continueCharacters.includes(element[0])) {
            __classPrivateFieldGet(this, _FileInStatus_completeArray, "f").push(element);
            return [true, args, defaultText];
        }
        return [false, args, defaultText];
    }
    evalShortCode(a) {
        console.log(a);
        let response;
        switch (a.args[0]) {
            case "?c":
                response = askBool(a.args[1] ||
                    (a.defaultText ? a.defaultText + " checked?" : "") ||
                    "Unspecified Checkmark:", Number(a.args[2]) || 0, !!a.args[3] || false);
                this.doCheckmark(a, response);
                break;
            case "?s":
                response = askBool(a.args[2] || "Skip?", Number(a.args[3]) || 0, !!a.args[4]);
                this.beginSkip(a, response);
                break;
            case "es": //already checked in precheck()
                __classPrivateFieldGet(this, _FileInStatus_completeArray, "f").push(a.defaultText);
                break;
            case "in":
                response = askText(a.args[1] || "Unspecified Text:", !!a.args[2]);
                this.pushText(a, response, true);
                break;
            case "co":
                response = askText(a.args[1] || "Unspecified Colour:", false);
                this.pushText(a, this.colourParse(a, response), false);
            default:
                __classPrivateFieldGet(this, _FileInStatus_completeArray, "f").push(a.element);
                break;
        }
    }
    doCheckmark(a, request) {
        __classPrivateFieldGet(this, _FileInStatus_completeArray, "f").push("\\[" +
            (request ? "X" : "  ") +
            "]" +
            (a.defaultText ? " " + a.defaultText : ""));
    }
    beginSkip(a, request) {
        if (request) {
            __classPrivateFieldSet(this, _FileInStatus_skippingValue, Number(a.args[1]), "f");
            return;
        }
        __classPrivateFieldGet(this, _FileInStatus_completeArray, "f").push(a.defaultText);
        return;
    }
    pushText(a, request, forceDefault = false) {
        __classPrivateFieldGet(this, _FileInStatus_completeArray, "f").push(request || (forceDefault ? a.defaultText : ""));
    }
    colourParse(a, request) {
        request = request || a.defaultText || "pass";
        for (let i = 0; i < colours.length; i++) {
            if (colours[i][1] == request)
                request = colours[i][0];
        }
        return request;
    }
}
_FileInStatus_skippingValue = new WeakMap(), _FileInStatus_completeArray = new WeakMap();
const isFile = (fileName) => {
    return fs.lstatSync(fileName).isFile();
};
const isFolder = (fileName) => {
    return fs.lstatSync(fileName).isDirectory();
};
let folderPath = __dirname + "/../";
let foundFile = "";
while (!foundFile) {
    let folderList = fs
        .readdirSync(folderPath)
        .map((fileName) => {
        return folderPath + fileName;
    })
        .filter(isFolder)
        .map((longFile, i) => {
        return [i, longFile.replace(folderPath, "")];
    });
    let fileList = fs
        .readdirSync(folderPath)
        .map((fileName) => {
        return folderPath + fileName;
    })
        .filter(isFile)
        .map((longFile, i) => {
        return [i + folderList.length, longFile.replace(folderPath, "")];
    });
    console.log(folderList, fileList);
    let selectNumber = Number(promptCL("File number: "));
    if (selectNumber < folderList.length) {
        folderPath += folderList[selectNumber][1] + "/";
    }
    else {
        foundFile =
            folderPath + fileList[selectNumber - folderList.length][1];
    }
}
let currentFile = new FileInStatus(foundFile);
fs.writeFileSync(__dirname + "/output.txt", currentFile.processFile());
function section(request) {
    let defaultValueSplit = request.split("^");
    let argSplit = defaultValueSplit[0].split("|");
    let returnObject = [
        argSplit,
        defaultValueSplit.slice(1).join("^"),
    ];
    console.log(returnObject);
    return returnObject;
}
function askBool(request, skip, invert) {
    console.log(skip);
    while (true) {
        let response = promptCL(request + " (y/n) ");
        if (Case.lower(response) == Case.lower("y"))
            return !invert;
        if (Case.lower(response) == Case.lower("n"))
            return !!invert;
        if (response == "" && skip)
            return !!(skip - 1) != invert;
    }
}
function askText(request, force) {
    while (true) {
        let response = promptCL(request + " ");
        if (!force || response)
            return response;
    }
}

var prompt = require('prompt-sync')();
var isHeadless = false
var headlessLineCount = 0
var headlessArray = null;

function getInput(query) {
	console.log(query.question)
	if(query.options == []) {return prompt("Response: ")}
	query.options.forEach(e => {
		console.log("- ", e.hotkey, " - ", e.explainer)
	});
	let answer = prompt("Response: ")
	for (let i = 0; i < query.options.length; i++) {
		let e = query.options[i];
		if (e.hotkey == answer) return i;
	}
}

console.log(getInput({question: "Which one?", options: [
		{
			hotkey: "e",
			explainer: "EEEEEEEE"
		},
		{
			hotkey: "r",
			explainer: "RRRRRRRRRRR"
		}
	]}
))
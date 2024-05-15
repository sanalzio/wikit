const Fore = {
    Reset : "\x1b[0m",
    ColorReset : "\x1b[39m",
    Bright : "\x1b[1m",
    Dim : "\x1b[2m",
    Italic : "\x1b[3m",
    Underscore : "\x1b[4m",
    Blink : "\x1b[5m",
    Reverse : "\x1b[7m",
    Hidden : "\x1b[8m",
    CrossedOut : "\x1b[9m",
    Black : "\x1b[30m",
    Red : "\x1b[31m",
    Green : "\x1b[32m",
    Yellow : "\x1b[33m",
    Blue : "\x1b[34m",
    Magenta : "\x1b[35m",
    Cyan : "\x1b[36m",
    White : "\x1b[37m",
    Gray : "\x1b[90m",
    BrightRed : "\x1b[91m",
    BrightGreen : "\x1b[92m",
    BrightYellow : "\x1b[93m",
    BrightBlue : "\x1b[94m",
    BrightMagenta : "\x1b[95m",
    BrightCyan : "\x1b[96m",
    BrightWhite : "\x1b[97m",
}
const Back = {
    Reset : "\x1b[49m",
    BgBlack : "\x1b[40m",
    BgRed : "\x1b[41m",
    BgGreen : "\x1b[42m",
    BgYellow : "\x1b[43m",
    BgBlue : "\x1b[44m",
    BgMagenta : "\x1b[45m",
    BgCyan : "\x1b[46m",
    BgWhite : "\x1b[47m",
    BgGray : "\x1b[100m",
    BgBrightRed : "\x1b[101m",
    BgBrightGreen : "\x1b[102m",
    BgBrightYellow : "\x1b[103m",
    BgBrightBlue : "\x1b[104m",
    BgBrightMagenta : "\x1b[105m",
    BgBrightCyan : "\x1b[106m",
    BgBrightWhite : "\x1b[107m",
}
function testLog() {
    let out = "";
    for (let i = 0; i < Object.keys(Fore).length; i++) {
        const code = Fore[Object.keys(Fore)[i]];
        out += code + Object.keys(Fore)[i] + Fore.Reset + " ";
    }
    for (let i = 0; i < Object.keys(Back).length; i++) {
        const code = Back[Object.keys(Back)[i]];
        out += code + Object.keys(Back)[i] + Back.Reset + " ";
    }
    console.log(out);
}

module.exports = { Fore, Back, testLog };
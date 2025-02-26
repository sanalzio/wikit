#!/usr/bin/env bun
'use strict';

const pkg = require('./package.json');

process.title = pkg.name;

const { Fore } = require("./colorama"); // Module for 3-4 bit ansi colors.

const argv = require('minimist')(process.argv.slice(2));

// --plain flag
if (argv.plain || argv.p) {
  Object.entries(Fore).map(([key, value]) => {
    Fore[key] = "";
  });
}

// Print version if requested
if (argv.version || argv.v) printVersionAndExit();
if (argv.name || argv.n) printNameAndExit();

// If no query, print usage and exit
if (argv._.length == 0 && argv.r==null && argv.random==null && argv.lang==null && argv.l==null) printUsageAndExit();

const wiki = require('wtf_wikipedia');
const inquirer = require('inquirer');
const ora = require('ora');
const opn = require('opn');
const htmlToText = require('html-to-text');

const languages = require("./data/languages.json");

const Configstore = require('configstore');
const conf = new Configstore(pkg.name, { lang: languages.default });

// Flags
let _openInBrowser = false;
let _browser = null;
let _lineLength = process.stdout.columns - 10; // Terminal width - 10
let _lang = conf.get('lang');
let _disambig = false;
let mobile = "";

// Maintain comfortable line length
if (_lineLength > 80) _lineLength = 80;

// Parse flags
if (argv.b) {
  _openInBrowser = true;
}
if (argv.browser) {
  _openInBrowser = true;
  _browser = argv.browser;
}
if (argv.m || argv.mobile) {
  mobile = ".m";
}
if (argv.lang || argv.l) {
  _lang = argv.lang || argv.l;
  if (!validLanguageCode(_lang)) {
    console.log(`${Fore.Red}Unrecognized language code: ${Fore.Yellow}${_lang}${Fore.Reset}`);
    process.exit(1);
  }
  if (argv._.length == 0 && argv.r==null && argv.random==null) {
    conf.set('lang', _lang);
    console.log(`Language setting is set to '${Fore.Green}${_lang}${Fore.Reset}'.`);
    process.exit(0);
  }
}
if (argv.d) {
  _disambig = true;
  _openInBrowser = false;
}
if (argv.D) {
  _disambig = true;
  _openInBrowser = true;
}
if (argv.line) {
  if (parseInt(argv.line) > 14) {
    _lineLength = parseInt(argv.line);
  } else {
    console.log(`${Fore.Red}Invalid line length: ${Fore.Yellow}${argv.line}${Fore.Reset}`);
    process.exit(1);
  }
}

// Format query
let query = argv._.join(' ').trim();

// Special:Random
let random = false;
if (query.toLowerCase()=="special:random" || argv.r || argv.random) {
  await fetch(`https://${_lang}.m.wikipedia.org/wiki/Special:Random`).then(res => res.text()).then(data => {
    const titleTag = data.match(/<title>.*<\/title>/g)[0].replace(/<title>|\s[—-]\s[^—-]*<\/title>/g, '');
    query = titleTag;
    random = true;
  });
}


if (_disambig) query += ` (${getDisambigTranslation(_lang)})`;

// Execute
if (_openInBrowser) openInBrowser(query);
else printWikiSummary(query);

// ===== Functions =====

function printWikiSummary(queryText) {
  let spinner = ora({ text: Fore.Magenta + 'Searching...' + Fore.Reset, spinner: 'dots4' }).start();

  queryText = queryText.replace(/_/g, ' ');

  wiki.fetch(queryText, _lang, (err, doc) => {
    spinner.stop();

    if (err) handleError(err);

    if (doc) {
      const summary = doc.sections()[0].text();

      // Handle ambiguous results
      if (_disambig || isDisambiguationPage(doc) || summary.includes('may refer to:')) {
        handleAmbiguousResults(doc, queryText);
        return;
      }

      // Output all
      if (argv.all || argv.a) {
        const sections = doc.sections().map(section => {
          const text = section.text();
          if (text) {
            return {
              'title': section.title(),
              'text': lineWrap(text, _lineLength),
            }
          }
        });
        const output = sections
          .map(section => {
            if (section && section.text) {
              return `${formatTitle(section.title)}\n${section.text}\n\n`;
            }
          })
          .join('');
        console.log(formatTitle(doc.title())+output);
        if (argv.link) printLink(_lang, queryText);
        return;
      }

      // Output summary
      if (summary) {
        let title = "";
        if(random || argv.r || argv.random) {
          title = formatTitle(doc.title())+"\n";
        }
        console.log(title + lineWrap(summary, _lineLength));
        if (argv.link) printLink(_lang, queryText);
        return;
      } else {
        console.log(Fore.Red + `Something went wrong, opening in browser...${Fore.Reset}\n(${Fore.Underscore}Error code: ${Fore.BrightRed}0${Fore.ColorReset} | Query: "${Fore.BrightBlue + queryText + Fore.ColorReset}")${Fore.Reset}`);
        console.log(Fore.Yellow + 'Submit bugs at https://github.com/koryschneider/wikit/issues/new' + Fore.Reset);
        openInBrowser(queryText);
      }
    } else {
      console.log(`${Fore.BrightBlue + Fore.Underscore + query + Fore.Reset} ${Fore.Red}not found ${Fore.Yellow}:(` + Fore.Reset);
    }
  }).catch(err => handleError(err));
}

function handleAmbiguousResults(doc, queryText) {
  _disambig = false;
  const choices = [];
  doc.sections().forEach(section => {
    section.links().forEach(link => {
      if (link.page) choices.push(link.page);
    });
  });
  inquirer.prompt([
    {
      name: 'selection',
      type: 'list',
      message: `${Fore.BrightRed}Ambiguous results, ${Fore.BrightGreen}"${Fore.BrightBlue + Fore.Underscore}${queryText}${Fore.Reset + Fore.BrightGreen}" ${Fore.BrightRed}may refer to:` + Fore.Reset,
      choices: choices,
      pageSize: 15,
    }
  ]).then(answers => {
    printWikiSummary(answers.selection);
  }).catch(err => {
    console.log('Error:', err);
  });
}

function lineWrap(text, max) {
  // remove stray html elements
  text = htmlToText.fromString(text, {
    wordwrap: false,
    uppercaseHeadings: false,
    ignoreHref: true,
  });
  text = text.trim().replace(/\n\n/g, '\n');
  text = text.trim().replace(/\n/g, ' '); // replace newlines with spaces
  let formattedText = ' ';

  while (text.length > max) {
    let nextSpaceIndex = -1;
    for (let i=max; i < text.length; i++) {
      if (text[i] == ' ') {
        nextSpaceIndex = i;
        break;
      }
    }
    if (nextSpaceIndex < 0) nextSpaceIndex = max; // No space char was found

    formattedText += text.slice(0, nextSpaceIndex) + '\n';
    text = text.slice(nextSpaceIndex, text.length);
  }

  // add remaining text
  formattedText += (text.startsWith(' '))
    ? text
    : ' ' + text;

  return formattedText;
}

function openInBrowser(query) {
  const format = (s) => s.trim().replace(/ /g, '+'); // replace spaces with +'s
  let url = `https://${_lang}${mobile}.wikipedia.org/w/index.php?title=Special:Search&search=`;
  url += format(query);

  if (_browser)
    opn(url, { app: _browser });
  else
    opn(url);
}

function validLanguageCode(code) {
  if (Object.keys(languages).includes(code)) return true;
  return false;
}

function isDisambiguationPage(doc) {
  let disambigPage = false;
  doc.categories().forEach(category => {
    if (category.toLowerCase().includes(getDisambigTranslation(_lang).toLowerCase())) {
      disambigPage = true;
    }
  });
  return disambigPage;
}

function getDisambigTranslation(lang) {
  let translation = languages[[lang]].disambig;
  if (translation) return translation;
  else return 'disambiguation';
}

function printUsageAndExit() {
  console.log(`
${Fore.Blue}Usage: ${Fore.Magenta}$${Fore.BrightCyan} wikit${Fore.ColorReset+Fore.Bright} <query> ${Fore.BrightBlue}[-flags]${Fore.Reset}

${Fore.Yellow}Quotes are not required for multi-word queries.${Fore.Reset}

  ${Fore.Blue}Flags:${Fore.Reset}

    ${Fore.BrightBlue}--lang ${Fore.BrightRed}<LANG>${Fore.Reset}        Specify language;
    ${Fore.BrightBlue}-l ${Fore.BrightRed}<LANG>${Fore.Reset}            ${Fore.BrightRed}LANG${Fore.Reset} is an HTML ISO language code${Fore.Reset}

    ${Fore.BrightBlue}--all${Fore.Reset}                Print all sections of the article
    ${Fore.BrightBlue}-a${Fore.Reset}                   Recommended to pipe into a reader e.g. ${Fore.BrightCyan}less${Fore.Reset}

    ${Fore.BrightBlue}-b${Fore.Reset}                   Open Wikipedia article in default browser

    ${Fore.BrightBlue}--browser ${Fore.BrightRed}<BROWSER>${Fore.Reset}  Open article in specific ${Fore.BrightRed}BROWSER${Fore.Reset}

    ${Fore.BrightBlue}-d${Fore.Reset}                   Open disambiguation CLI menu

    ${Fore.BrightBlue}-D${Fore.Reset}                   Open disambiguation page in browser

    ${Fore.BrightBlue}--line ${Fore.BrightRed}<NUM>${Fore.Reset}         Set line wrap length to ${Fore.BrightRed}NUM${Fore.Reset} ${Fore.Blue}(minimum 15)${Fore.Reset}

    ${Fore.BrightBlue}--link${Fore.Reset}               Print a link to the full article after the summary

    ${Fore.BrightBlue}--random${Fore.Reset} / ${Fore.BrightBlue}-r${Fore.Reset}        Print random article

    ${Fore.BrightBlue}--mobile${Fore.Reset} / ${Fore.BrightBlue}-m${Fore.Reset}        Modify the link to the mobil verison of web site

    ${Fore.BrightBlue}--version${Fore.Reset} / ${Fore.BrightBlue}-v${Fore.Reset}       Print installed version number

    ${Fore.BrightBlue}--plain${Fore.Reset} / ${Fore.BrightBlue}-p${Fore.Reset}         Disable terminal colors

    ${Fore.BrightBlue}--name${Fore.Reset} / ${Fore.BrightBlue}-n${Fore.Reset}          Print the CLI name: ${Fore.BrightCyan}wikit

  ${Fore.Blue}Examples:${Fore.Reset}

    ${Fore.Magenta}$${Fore.BrightCyan} wikit ${Fore.ColorReset+Fore.Bright}JavaScript${Fore.Reset}

    ${Fore.Magenta}$${Fore.BrightCyan} wikit ${Fore.ColorReset+Fore.Bright}empire state building ${Fore.BrightBlue}--link${Fore.Reset}

    ${Fore.Magenta}$${Fore.BrightCyan} wikit ${Fore.ColorReset+Fore.Bright}linux ${Fore.BrightBlue}-b${Fore.Reset}

    ${Fore.Magenta}$${Fore.BrightCyan} wikit ${Fore.ColorReset+Fore.Bright}jugo ${Fore.BrightBlue}--lang ${Fore.BrightRed}es${Fore.Reset}
  `);

  process.exit(1);
}

function printVersionAndExit() {
  console.log(pkg.version);
  process.exit(0);
}

function printNameAndExit() {
  console.log(pkg.name);
  process.exit(0);
}

function handleError(error) {
  console.log(Fore.Red + 'Error:' + Fore.Reset, error);
  console.log(Fore.Yellow + 'Please report errors at ' + Fore.BrightBlue + 'https://github.com/koryschneider/wikit/issues/new' + Fore.Reset);
}

function formatTitle(title) {
  if(title==0 || title==null) return "";
  let output = ` ${Fore.Bright}${title}${Fore.Reset}\n ${Fore.Gray}`;
  for (let i = 0; i < title.length; i++) {
    output += '-';
  }
  return output+Fore.Reset+"\n";
}

function printLink(lang, title) {
  console.log(` ${Fore.BrightBlue}https://${lang}${mobile}.wikipedia.org/wiki/${encodeURIComponent(title)}` + Fore.Reset);
}

# wikit

A command line program for getting Wikipedia summaries easily.

- [wikit](#wikit)
  - [✔ Installation](#-installation)
  - [❔ Usage](#-usage)
    - [⚙ Examples](#-examples)
    - [🏴 Flags](#-flags)
    - [📜 Output](#-output)
  - [🕓 Chanage Log](#-chanage-log)
  - [🐞 Bugs and Suggestions](#-bugs-and-suggestions)
  - [❤ Support Development](#-support-development)
  - [⁉ WHY BUN?](#-why-bun)


## ✔ Installation

`$ npm i wikit -g`

## ❔ Usage

Syntax: `$ wikit <query> [-flags]`

Quotes are not required for multi-word queries.

To change the default language, edit `~/.config/configstore/wikit.json`.

### ⚙ Examples

`$ wikit wikipedia`

`$ wikit empire state building`

`$ wikit linux -b`

`$ wikit jugo -l es --link -a`

`$ wikit --random --link -a`

`$ wikit special:random --link --plain`

`$ wikit arch linux --plain --all --link --lang it --mobile --line 30`

### 🏴 Flags

| Flag | Description |
| ---- | ----------- |
| `--lang langCode`<br>`-l langCode` | Specify language; `langCode` is an [HTML ISO language code](https://www.w3schools.com/tags/ref_language_codes.asp) |
| `--all`<br>`-a` | Print all sections of the article (the full page).  Recommended to pipe into a reader e.g. `less` |
| `--line num` | Set line wrap length to `num` (minimum 15) |
| `--link` | Print a link to the full article after the summary |
| `-b` | Open full Wikipedia article in default browser |
| `--browser browser` | Open full Wikipedia article in specific `browser` |
| `-d` | Open disambiguation CLI menu |
| `-D` | Open disambiguation page in browser |
| `--random`<br>`-r` | Print random article |
| `--mobile`<br>`-m` | Modify the link to the mobil verison of web site|
| `--plain`<br>`-p` | Disable terminal colors |
| `--version`<br>`-v` | Print installed version number |
| `--name`<br>`-n` | Print the name of the program: wikit |

### 📜 Output

The output will be the paragraphs of the wikipedia article before the table of contents.
Line length is neatly wrapped based on your terminal's window size, with a max
of about 80 characters. For example:

```
$ wikit arch linux
 Arch Linux (or Arch /ˈɑːrtʃ/) is a Linux distribution for computers based on x86-64
 architectures. Arch Linux is composed predominantly of free and open-source software,
 and supports community involvement. The design approach of the development team
 follows the KISS principle ("keep it simple, stupid") as the general guideline,
 and focuses on elegance, code correctness, minimalism and simplicity, and expects
 the user to be willing to make some effort to understand the system's operation.
 A package manager written specifically for Arch Linux, pacman, is used to install,
 remove and update software packages. Arch Linux uses a rolling release model, such
 that a regular system update is all that is needed to obtain the latest Arch software;
 the installation images released by the Arch team are simply up-to-date snapshots
 of the main system components. Arch Linux has comprehensive documentation in the
 form of a community wiki, called the ArchWiki. The wiki is widely regarded among
 the Linux community and ecosystem for often having the most recent information on
 a specific topic and being applicable beyond Arch Linux.
```

## 🕓 Chanage Log
View [chanagelog.md](/readme.md) file.

## 🐞 Bugs and Suggestions

Please create an issue
[here](https://github.com/koryschneider/wikit/issues/new). Thanks!

## ❤ Support Development
<a href="https://www.buymeacoffee.com/koryschneider" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

## ⁉ WHY BUN?

Because I wanted to try Bun and I encountered an error on [line 87 of the index.js](/index.js#L87) file due to the node-fetch library not allowing `await fetch` and I came to this solution as the most appropriate. See ([index.js#87](index.js#L87))

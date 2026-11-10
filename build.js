// Source - https://stackoverflow.com/a/26298948
// Posted by Paolo Moretti, modified by community. See post 'Timeline' for change history
// Retrieved 2026-10-26, License - CC BY-SA 3.0

const fs = require("fs");
const path = require("path");
//const marked = require("marked");
const MarkdownIt = require("markdown-it");
const markdownit = new MarkdownIt({ html: true });

// clean a note name into an entry name: "Ivan's Stables" → "ivan-s-stables"
function toEntry(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// turn Obsidian [[links]] into <a href="#entry"> links
function convertLinks(markdown) {
  return markdown.replace(
    /(?<!!)\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g,
    (match, target, label) => {
      const text = (label || target).trim();
      return `<a href="#${toEntry(target.trim())}">${text}</a>`;
    },
  );
}

//const glob = require("glob");

const leafs = [];
const tocArr = [];

const folder =
    "/home/michael/Documents/Lore-Site/Lore"
  //"/home/michael/Dropbox/Call of Aerenthius/Aerenthius/Aerenthius/Aerenthius/Lore";

fs.readdirSync(folder, { recursive: true }).forEach((file) => {
  const yes = file;
  if (!file.endsWith(".md")) return;
  //console.log(file);
  let note = fs.readFileSync(path.join(folder, file), "utf8");
  //console.log(note);

  const title = path.parse(yes).name;
  const dataEntry = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");


  note = note.replace(/!\[\[([^\]|]+?\.(?:png|jpe?g|webp|gif))(?:\|(\d+))?\]\]/gi, (match, filename, width) =>{
    return `<img src="images/lore/${encodeURIComponent(filename)}" alt="${filename}" class="center" ${width ? `width="${width}"` : ""}>`;

  });

    const half = note.length / 2;
    const headings = [...note.matchAll(/^#{1,6} /gm)].map((m) => m.index);

    let split = headings[0];
    for (const pos of headings) {
      if (Math.abs(pos - half) < Math.abs(split - half)) split = pos;
    }

  const frontMarkdown = note.slice(0, split);
  const backMarkdown = note.slice(split);

  const frontNote = markdownit.render(convertLinks(frontMarkdown));
  const backNote = markdownit.render(convertLinks(backMarkdown));


  

// regex \]\]\[|]|\[|\!|[0-9]|\|


const toc = `
  <p><a href="#${dataEntry}" style="color: black">${title} </a></p>
`;

const leaf = `
<div class="leaf">
            <article class="leaf__face leaf__face--front">
              <div class="leaf__content">
                <h2 data-entry="${dataEntry}" class="chapter-title">${title}</h2>

                  ${frontNote}

              </div>
            </article>
            <article class="leaf__face leaf__face--back">
              <div class="leaf__content">

                  ${backNote}

              </div>
            </article>
          </div>
`;

  leafs.push(leaf);
  tocArr.push(toc);
  
});

const htmlPath = path.join(__dirname, "template.html");
const html = fs.readFileSync(htmlPath, "utf8");

const STARTtoc = "<!--Start of the TOC-->";
const ENDtoc = "<!--End of the TOC-->";

const START = "<!--Start of the leafs-->";
const END = "<!--End of the leafs-->";

const startIdxtoc = html.indexOf(STARTtoc) + STARTtoc.length; // just after the start marker
const endIdxtoc = html.indexOf(ENDtoc); // just before the end marker

const startIdx = html.indexOf(START) + START.length; // just after the start marker
const endIdx = html.indexOf(END); // just before the end marker

// image handeling 





//const newHtmltoc =
 // html.slice(0, startIdxtoc) + "\n" + tocArr.join("\n") + "\n" + html.slice(endIdxtoc);
let out = html.slice(0, startIdxtoc) + "\n" + tocArr.join("\n") + "\n" + html.slice(endIdxtoc);

// image handeling





const s2 = out.indexOf(START) + START.length;   // against `out`, not `html`
const e2 = out.indexOf(END);
out = out.slice(0, s2) + "\n" + leafs.join("\n") + "\n" + out.slice(e2);

fs.writeFileSync(htmlPath, out);


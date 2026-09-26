// Precomputes real tokenizer output shown on screen (scene "What is a token").
// Uses OpenAI's o200k_base (GPT-4o family) and cl100k_base (GPT-4) BPE vocabularies.
import { getEncoding } from "js-tiktoken";
import { writeFileSync } from "node:fs";

const samples = {
  en: "Sovereign AI infrastructure keeps sensitive data within Malaysia.",
  ms: "Infrastruktur AI berdaulat memastikan data sensitif kekal di Malaysia.",
};

const out = {};
for (const name of ["o200k_base", "cl100k_base"]) {
  const enc = getEncoding(name);
  out[name] = {};
  for (const [lang, text] of Object.entries(samples)) {
    const ids = enc.encode(text);
    out[name][lang] = {
      text,
      ids,
      pieces: ids.map((id) => enc.decode([id])),
      count: ids.length,
      words: text.split(/\s+/).length,
    };
  }
}
writeFileSync("src/data/tokens.json", JSON.stringify(out, null, 2));
for (const [n, v] of Object.entries(out))
  for (const [l, r] of Object.entries(v)) console.log(n, l, r.count, "tokens /", r.words, "words", JSON.stringify(r.pieces));

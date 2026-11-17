import { languages } from "./whisper-prefix.mjs";

export function createCaptionRow() {
  const row = document.createElement("div");
  row.className = "caption-row columns";
  row.setAttribute("role", "listitem");
  for (const language of languages) {
    const cell = document.createElement("p");
    cell.className = "caption";
    cell.lang = language;
    row.append(cell);
  }
  return row;
}

export function paintCaption(row, translation) {
  for (const cell of row.children) {
    const text = translation[cell.lang];
    if (cell.textContent !== (text || "—")) cell.textContent = text || "—";
    cell.toggleAttribute("data-unavailable", !text);
    cell.title = text ? "" : "翻訳を取得できませんでした。";
  }
}

export function followCaptions(viewport, button) {
  let followsLatest = true;
  function update() {
    if (followsLatest) viewport.scrollTop = viewport.scrollHeight;
    button.hidden = followsLatest;
  }
  viewport.addEventListener("scroll", () => {
    followsLatest = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 48;
    button.hidden = followsLatest;
  });
  button.addEventListener("click", () => {
    followsLatest = true;
    update();
  });
  return update;
}

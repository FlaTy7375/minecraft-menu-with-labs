const firstBtn = document.querySelector(".container-button.first");
const secondBtn = document.querySelector(".container-button.second");
const paragraphs = document.querySelectorAll(".paragraph");
const lastParagraph = [...paragraphs].slice(-1)[0];
const images = [...(document.querySelectorAll('.article-img'))].slice(0, 2);
const elements = [...document.querySelector(".article-container").children];

let isChangeFirst = false;
let isChangeSecond = false;
let saveText = '';

firstBtn.addEventListener("click", () => {
    if (!isChangeFirst) {
        paragraphs.forEach((val, i) => i % 2 === 0 ? val.classList.add("paragraph-hidden") : val.classList.add("paragraph-styled"))
    } else {
        paragraphs.forEach((val, i) => i % 2 === 0 ? val.classList.remove("paragraph-hidden") : val.classList.remove("paragraph-styled"))
    }
    isChangeFirst = !isChangeFirst;
});

secondBtn.addEventListener("click", () => {
    if (!isChangeSecond) {
        images.forEach((img) => img.classList.add("img-bigger"));
        elements.forEach((el) => el.classList.add("border"));
        saveText = lastParagraph.textContent;
        lastParagraph.textContent += " LONDON";
    } else {
        images.forEach((img) => img.classList.remove("img-bigger"));
        elements.forEach((el) => el.classList.remove("border"));
        lastParagraph.textContent = saveText;
    }
    isChangeSecond = !isChangeSecond;
});
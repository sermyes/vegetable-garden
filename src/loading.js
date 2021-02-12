export function loading() {
    const loadingText = document.querySelector(".loading__text");
    const text = 'Game Loading...'.split("");
    let sec = 0;
    let ms = 1;
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement("span");
      span.textContent = text[i];
      span.classList.add("loading__char");
      span.style.animationDelay = `${sec}.${ms++}s`;

      if (ms >= 9) {
        sec++;
        ms = 1;
      }

      loadingText.appendChild(span);
    }
  }
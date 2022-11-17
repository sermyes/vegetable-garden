let fadeOutTimerId;
let fadeInTimerId;

export function fadeOut(element) {
  let opacity = 1;
  element.style.opacity = opacity;

  fadeOutTimerId = setInterval(() => {
    if (opacity > 0) {
      opacity -= 0.1;
      element.style.opacity = opacity;
    } else {
      element.style.display = 'none';
      element.style.visibility = 'hidden';
      clearInterval(fadeOutTimerId);
    }
  }, 100);
}

export function fadeIn(element, option) {
  let opacity = 0;
  element.style.display = option;
  element.style.opacity = opacity;
  element.style.visibility = 'visible';

  fadeInTimerId = setInterval(() => {
    if (opacity < 1) {
      opacity += 0.1;
      element.style.opacity = opacity;
    } else {
      clearInterval(fadeInTimerId);
    }
  }, 100);
}

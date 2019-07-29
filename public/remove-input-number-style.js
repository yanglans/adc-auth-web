function isInputNumberElem(elem) {
  return elem && elem.tagName.toLowerCase() === 'input' && elem.type === 'number';
}

window.addEventListener('mousewheel', (event) => {
  const { target } = event;


  if (isInputNumberElem(target)) {
    event.preventDefault();
  }
});

window.addEventListener('keydown', (event) => {
  const { target } = event;

  if (isInputNumberElem(target)) {
    const { key } = event;

    if (key === 'ArrowUp' || key === 'ArrowDown') {
      event.preventDefault();
    }
  }
});

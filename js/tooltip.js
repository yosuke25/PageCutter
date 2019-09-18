'use strict';

(() => {

  window.createTooltip = (targets) => {
    for (let i = 0; i < targets.length; i++) {
      let target = targets[i];
      let text = target.getAttribute('data-tooltip');
      let button = target.getElementsByTagName('div')[0];
      createElements(text, button);
    }
  };

  function createElements (text, button) {
    let doc = document;
    let el = {
      button
    };

    el.tooltip = doc.createElement('div');
    el.tooltip.classList.add('tooltip');
    doc.body.appendChild(el.tooltip);

    el.text = doc.createElement('p');
    el.text.innerText = text;
    el.text.classList.add('tooltipText');
    el.tooltip.appendChild(el.text);

    let tooltipWidth = el.tooltip.clientWidth + 10;
    let tooltipHeight = 24 + 20;

    setStyle(el.tooltip, {
      display: 'none'
    });

    standbyEvent(el, tooltipWidth, tooltipHeight);
  }

  function standbyEvent (el, tooltipWidth, tooltipHeight) {
    let interval;

    el.button.addEventListener('mouseenter', () => {
      let position = {};
      let bodyWidth = document.body.clientWidth;
      let bodyHeight = document.body.clientHeight;
      let buttonClientRect = el.button.getBoundingClientRect();

      let beginX = buttonClientRect.x + (buttonClientRect.width / 2) - (tooltipWidth / 2);
      let endX = buttonClientRect.x + (buttonClientRect.width / 2) + (tooltipWidth / 2);
      if (beginX < 0) {
        position.x = 0;
      } else if (endX > bodyWidth) {
        position.x = bodyWidth - tooltipWidth;
      } else {
        position.x = beginX;
      }

      if (buttonClientRect.y <= (bodyHeight / 2)) {
        position.y = buttonClientRect.y + buttonClientRect.height;
      } else {
        position.y = buttonClientRect.y - tooltipHeight;
      }

      setStyle(el.tooltip, {
        top: position.y + 'px',
        left: position.x + 'px',
        display: 'flex'
      });

      interval = setInterval(() => {
        setStyle(el.tooltip, {
          opacity: '1'
        });
      }, 500);
    }, false);

    el.button.addEventListener('mouseleave', () => {
      clearInterval(interval);
      setStyle(el.tooltip, {
        display: 'none',
        opacity: '0'
      });
    }, false);
  }

})();

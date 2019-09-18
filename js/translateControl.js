'use strict';

(() => {

  let nowArea;
  let elements = {};

  window.addEventListener('load', () => {
    elements.oneLink = document.getElementById('translateSwitchOneLink');
    elements.oneButton = document.getElementById('translateSwitchOneButton');

    elements.twoLink = document.getElementById('translateSwitchTwoLink');
    elements.twoButton = document.getElementById('translateSwitchTwoButton');

    elements.threeLink = document.getElementById('translateSwitchThreeLink');
    elements.threeButton = document.getElementById('translateSwitchThreeButton');

    elements.translateArea = document.getElementById('translateArea');

    standbyLinkClick();

    createTooltip([
      elements.oneLink,
      elements.twoLink,
      elements.threeLink
    ]);
  }, false);

  function standbyLinkClick () {
    elements.oneLink.addEventListener('click', () => {
      displayArea('filesDropArea');
    }, false);

    elements.twoLink.addEventListener('click', () => {
      displayArea('filesEditArea');
    }, false);

    elements.threeLink.addEventListener('click', () => {
      displayArea('filesExportArea');
    }, false);

    elements.translateArea.addEventListener('transitionend', () => {
      if (![
        'translateX(-200vw)',
        'translateX(-100vw)',
        'translateX(0vw)'
      ].includes(elements.translateArea.style.transform)) {
        return;
      }
      setStyle(elements.translateArea, {
        transition: 'transform 0s',
      });
    }, false);
  }

  window.displayArea = (area) => {
    switch (area) {
      case 'filesDropArea':
        setStyle(elements.translateArea, {
          transition: 'transform 0.5s',
          transform: 'translateX(0vw)'
        });

        setStyle(elements.oneButton, {
          'background-color': 'rgba(255, 255, 255, 0.6)'
        });
        setStyle(elements.twoButton, {
          'background-color': 'rgba(255, 255, 255, 0.3)'
        });
        setStyle(elements.threeButton, {
          'background-color': 'rgba(255, 255, 255, 0.3)'
        });

        nowArea = area;
        window.dispatchEvent(new Event('translateFilesDropArea'));

        break;
      case 'filesEditArea':
        setStyle(elements.translateArea, {
          transition: 'transform 0.5s',
          transform: 'translateX(-100vw)'
        });

        setStyle(elements.oneButton, {
          'background-color': 'rgba(255, 255, 255, 0.3)'
        });
        setStyle(elements.twoButton, {
          'background-color': 'rgba(255, 255, 255, 0.6)'
        });
        setStyle(elements.threeButton, {
          'background-color': 'rgba(255, 255, 255, 0.3)'
        });

        nowArea = area;
        window.dispatchEvent(new Event('translateFilesEditArea'));

        break;
      case 'filesExportArea':
        setStyle(elements.translateArea, {
          transition: 'transform 0.5s',
          transform: 'translateX(-200vw)'
        });

        setStyle(elements.oneButton, {
          'background-color': 'rgba(255, 255, 255, 0.3)'
        });
        setStyle(elements.twoButton, {
          'background-color': 'rgba(255, 255, 255, 0.3)'
        });
        setStyle(elements.threeButton, {
          'background-color': 'rgba(255, 255, 255, 0.6)'
        });

        nowArea = area;
        window.dispatchEvent(new Event('translateFilesExportArea'));

        break;
    }
  };

  window.getNowArea = () => {
    return nowArea;
  };

})();

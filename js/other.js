'use strict';

(() => {

  const fs = require('fs');

  window.addEventListener('load', () => {
    let style, data;

    try {
      if (process.platform === 'darwin') {
        data = fs.readFileSync('../../../../style.json', 'utf-8');
      } else {
        data = fs.readFileSync('./style.json', 'utf-8');
      }

      style = JSON.parse(data);
    } catch (e) {
      style = defaultStyle();
    }

    if (!style.background) {
      style = defaultStyle();
    }

    setStyle(document.body, {
      background: style.background
    });
  }, false);

  function defaultStyle () {
    return {
      background: "linear-gradient(-180deg, #BCC5CE 0%, #929EAD 98%)"
    };
  }

})();

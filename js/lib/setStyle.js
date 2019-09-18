'use strict';

(() => {

  window.setStyle = (element, styles) => {
    let keys = Object.keys(styles);
    for (let i in keys) {
      element.style[keys[i]] = styles[keys[i]];
    }
  };

})();

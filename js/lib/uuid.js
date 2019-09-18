'use strict';

(() => {

  window.generateUUIDv4 = () => {
    let str = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return str.replace(new RegExp('[xy]', 'g'), (match) => {
      if (match === 'x') {
        return Math.floor(Math.random() * 16).toString(16);
      } else {
        return (Math.floor(Math.random() * 4) + 8).toString(16);
      }
    });
  }

})();

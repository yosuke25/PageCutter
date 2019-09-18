'use strict';

(() => {

  let gui = require('nw.gui');
  let win = gui.Window.get();

  let windowTitle;
  let version = require('./package.json').version;

  let maximize = false;

  let minimizeLink;
  let maximizeAndUnmaximizeLink;
  let closeLink;

  let windowMaximizeAndUnmaximizeIcon;

  window.addEventListener('load', () => {
    windowTitle = document.getElementById('windowTitle');
    windowTitle.innerText = `PageCutter ver${version}`;

    minimizeLink = document.getElementById('windowMinimizeLink');
    maximizeAndUnmaximizeLink = document.getElementById('windowMaximizeAndUnmaximizeLink');
    closeLink = document.getElementById('windowCloseLink');

    windowMaximizeAndUnmaximizeIcon = document.getElementById('windowMaximizeAndUnmaximizeIcon');

    standbyButtonClick();

    createTooltip([
      minimizeLink,
      maximizeAndUnmaximizeLink,
      closeLink
    ]);
  }, false);

  function standbyButtonClick () {
    // minimize
    minimizeLink.addEventListener('click', () => {
      win.minimize();
    }, false);

    // maximize and unmaximize
    if (chrome.app.window.current().isMaximized()) {
      maximize = true;
      windowMaximizeAndUnmaximizeIcon.src = './img/windowFrame/unmaximize.svg';
    }

    maximizeAndUnmaximizeLink.addEventListener('click', () => {
      if (!maximize) {
        win.maximize();
        windowMaximizeAndUnmaximizeIcon.src = './img/windowFrame/unmaximize.svg';
      } else {
        win.restore();
        windowMaximizeAndUnmaximizeIcon.src = 'img/windowFrame/maximize.svg';
      }
    }, false);

    win.on('maximize', () => {
      maximize = true;
      windowMaximizeAndUnmaximizeIcon.src = './img/windowFrame/unmaximize.svg';
    });

    win.on('restore', () => {
      maximize = false;
      windowMaximizeAndUnmaximizeIcon.src = 'img/windowFrame/maximize.svg';
    });

    // close
    closeLink.addEventListener('click', () => {
      win.close();
    }, false);
  }

})();

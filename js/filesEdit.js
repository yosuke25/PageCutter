'use strict';

(() => {

  let infoStore = getStore('editData', 'info');
  let imagesStore = getStore('editData', 'images');

  let flags = {
    firstDisplay: false,
    mouseOnImage: false,
    keyDown: {
      arrowLeft: false,
      arrowRight: false,
      shift: false,
      alt: false,
      l: false,
      r: false,
      h: false,
      v: false,
      c: false
    }
  };

  let elements = {};

  let cutter = {
    tmp: {
      horizon: null,
      vertical: null
    },
    save: {
      horizon: [],
      vertical: []
    }
  };

  let splitID = {};

  let page = {
    now: {
      url: null,
      number: 0
    },
    total: 0
  };

  let mouse = {
    clientX: null,
    clientY: null
  };

  window.addEventListener('load', () => {
    let doc = document;
    let el = elements;
    el.windowFrame = doc.getElementById('windowFrame');
    el.filesEditArea = doc.getElementById('filesEditArea');
    el.pageNumberText = doc.getElementById('filesEditPageNumberText');
    el.previousLink = doc.getElementById('filesEditPreviousImageLink');
    el.nextLink = doc.getElementById('filesEditNextImageLink');
    el.imageViewArea = doc.getElementById('filesEditImageViewArea');
    el.image = doc.getElementById('filesEditImage');
    el.cutterArea = doc.getElementById('filesEditCutterArea');
    el.splitArea = doc.getElementById('filesEditSplitArea');
    el.rotateLeftLink = doc.getElementById('filesEditToolRotateLeftLink');
    el.rotateRightLink = doc.getElementById('filesEditToolRotateRightLink');
    el.flipHorizonLink = doc.getElementById('filesEditToolFlipHorizonLink');
    el.flipVerticalLink = doc.getElementById('filesEditToolFlipVerticalLink');
    el.copyEditDataLink = doc.getElementById('filesEditToolCopyEditDataLink');

    standbyEvent();

    createTooltip([
      el.previousLink,
      el.nextLink,
      el.rotateLeftLink,
      el.rotateRightLink,
      el.flipHorizonLink,
      el.flipVerticalLink,
      el.copyEditDataLink
    ]);
  }, false);

  // ファイルの読み込みを開始したときにfirstDisplayが有効ならpageNumberを更新
  window.addEventListener('startFilesLoading', (ev) => {
    if (!flags.firstDisplay) {
      return;
    }
    page.total += ev.detail.total;
    update.pageNumber();
  }, false);

  // ファイルの読み込みが完了したら、filesEditAreaに移動
  window.addEventListener('completeFilesLoading', () => {
    displayArea('filesEditArea');
  }, false);

  // ファイルの読込中に破損したファイルがあったら、pageNumberを減らす
  window.addEventListener('corruptionFilesLoading', () => {
    if (page.total > 0) {
      page.total--;
      update.pageNumber();
    }
  }, false);

  // 画像が無ければfilesDropAreaに戻る、画像があれば最初の画像を表示する
  window.addEventListener('translateFilesEditArea', () => {
    infoStore.getItem('imagesInfo')
    .then((value) => {
      if (value === null) {
        customAlert({
          type: 'warning',
          title: '画像がありません',
          message: '最初のページから画像を追加してください',
          confirm: false,
          pause: true,
          callback: (result) => {
            displayArea('filesDropArea');
          },
          customFunc: null
        });
      } else {
        if (flags.firstDisplay) {
          return;
        }

        flags.firstDisplay = true;
        page.total += value.length;

        setStyle(elements.image, {
          'pointer-events': 'auto',
          filter: 'drop-shadow(0px 0px 20px rgba(0, 0, 0, 0.4))'
        });

        transitionPage(0);
      }
    })
    .catch((err) => {
      console.error(err);
    });
  }, false);

  // イベントを待機
  function standbyEvent () {
    // 前ページ
    elements.previousLink.addEventListener('click', () => {
      transitionPage(page.now.number - 1);
    }, false);

    // 次ページ
    elements.nextLink.addEventListener('click', () => {
      transitionPage(page.now.number + 1);
    }, false);

    // keydown
    window.addEventListener('keydown', keyDown, false);

    // keyup
    window.addEventListener('keyup', keyUp, false);

    // cutterをマウスに合わせて動かす
    window.addEventListener('mousemove', cutterMove, false);

    // clickでcutterをsave
    window.addEventListener('click', saveCutter, false);

    // 画像の縦横のサイズを取得し、styleを変更する
    elements.image.addEventListener('load', changeImageStyle, false);

    // windowがリサイズされたらimageのサイズを更新
    window.addEventListener('resize', () => {
      update.imageStyle();
      update.cutterAreaStyle();
      update.splitAreaStyle();
    }, false);

    // shiftDown
    window.addEventListener('shiftDown', () => {
      if (flags.mouseOnImage) {
        createCutter('vertical');
      }
    }, false);

    // altDown
    window.addEventListener('altDown', () => {
      if (flags.mouseOnImage) {
        createCutter('horizon');
      }
    }, false);

    // shiftUp
    window.addEventListener('shiftUp', () => {
      if (cutter.tmp.vertical !== null) {
        let cutLine = document.getElementById(cutter.tmp.vertical.id);
        if (cutLine) {
          cutLine.parentNode.removeChild(cutLine);
        }
        cutter.tmp.vertical = null;
      }
    }, false);

    // altUp
    window.addEventListener('altUp', () => {
      if (cutter.tmp.horizon !== null) {
        let cutLine = document.getElementById(cutter.tmp.horizon.id);
        if (cutLine) {
          cutLine.parentNode.removeChild(cutLine);
        }
        cutter.tmp.horizon = null;
      }
    }, false);

    // pageTransition
    window.addEventListener('pageTransition', pageTransition, false);

    // rotateLeft
    elements.rotateLeftLink.addEventListener('click', () => {
      tool.rotate('left');
    }, false);

    // rotateRight
    elements.rotateRightLink.addEventListener('click', () => {
      tool.rotate('right');
    }, false);

    // flipHorizon
    elements.flipHorizonLink.addEventListener('click', () => {
      tool.flip('horizon');
    }, false);

    // flipVertical
    elements.flipVerticalLink.addEventListener('click', () => {
      tool.flip('vertical');
    }, false);

    // copyEditData
    elements.copyEditDataLink.addEventListener('click', () => {
      tool.copyEditData();
    }, false);
  }

  function keyDown (ev) {
    if (getNowArea() != 'filesEditArea') {
      return;
    }

    if (ev.code === 'ArrowLeft') {
      if (flags.keyDown.arrowLeft) {
        return;
      }
      flags.keyDown.arrowLeft = true;
      transitionPage(page.now.number - 1);
    }

    if (ev.code === 'ArrowRight') {
      if (flags.keyDown.arrowRight) {
        return;
      }
      flags.keyDown.arrowRight = true;
      transitionPage(page.now.number + 1);
    }

    if ((ev.code === 'ShiftLeft') || (ev.code === 'ShiftRight')) {
      if (flags.keyDown.shift) {
        return;
      }
      flags.keyDown.shift = true;
      window.dispatchEvent(new Event('shiftDown'));
    }

    if ((ev.code === 'AltLeft') || (ev.code === 'AltRight')) {
      if (flags.keyDown.alt) {
        return;
      }
      flags.keyDown.alt = true;
      window.dispatchEvent(new Event('altDown'));
    }

    if (ev.code === 'KeyL') {
      if (flags.keyDown.l) {
        return;
      }
      flags.keyDown.l = true;
      tool.rotate('left');
    }

    if (ev.code === 'KeyR') {
      if (flags.keyDown.r) {
        return;
      }
      flags.keyDown.r = true;
      tool.rotate('right');
    }

    if (ev.code === 'KeyH') {
      if (flags.keyDown.h) {
        return;
      }
      flags.keyDown.h = true;
      tool.flip('horizon');
    }

    if (ev.code === 'KeyV') {
      if (flags.keyDown.v) {
        return;
      }
      flags.keyDown.v = true;
      tool.flip('vertical');
    }

    if (ev.code === 'KeyC') {
      if (flags.keyDown.c) {
        return;
      }
      flags.keyDown.c = true;
      tool.copyEditData();
    }
  }

  function keyUp (ev) {
    if (getNowArea() != 'filesEditArea') {
      return;
    }

    if (ev.code === 'ArrowLeft') {
      if (!flags.keyDown.arrowLeft) {
        return;
      }
      flags.keyDown.arrowLeft = false;
    }

    if (ev.code === 'ArrowRight') {
      if (!flags.keyDown.arrowRight) {
        return;
      }
      flags.keyDown.arrowRight = false;
    }

    if ((ev.code === 'ShiftLeft') || (ev.code === 'ShiftRight')) {
      if (!flags.keyDown.shift) {
        return;
      }
      flags.keyDown.shift = false;
      window.dispatchEvent(new Event('shiftUp'));
    }

    if ((ev.code === 'AltLeft') || (ev.code === 'AltRight')) {
      if (!flags.keyDown.alt) {
        return;
      }
      flags.keyDown.alt = false;
      window.dispatchEvent(new Event('altUp'));
    }

    if (ev.code === 'KeyL') {
      if (!flags.keyDown.l) {
        return;
      }
      flags.keyDown.l = false;
    }

    if (ev.code === 'KeyR') {
      if (!flags.keyDown.r) {
        return;
      }
      flags.keyDown.r = false;
    }

    if (ev.code === 'KeyH') {
      if (!flags.keyDown.h) {
        return;
      }
      flags.keyDown.h = false;
    }

    if (ev.code === 'KeyV') {
      if (!flags.keyDown.v) {
        return;
      }
      flags.keyDown.v = false;
    }

    if (ev.code === 'KeyC') {
      if (!flags.keyDown.c) {
        return;
      }
      flags.keyDown.c = false;
    }
  }

  function cutterMove (ev) {
    mouse.clientX = ev.clientX;
    mouse.clientY = ev.clientY;
    let clientRect = elements.image.getBoundingClientRect();

    if ((clientRect.x <= mouse.clientX)
    && (mouse.clientX <= (clientRect.width + clientRect.x))
    && (clientRect.y <= mouse.clientY)
    && (mouse.clientY <= (clientRect.height + clientRect.y))
    ) {
      flags.mouseOnImage = true;
    } else {
      flags.mouseOnImage = false;
      return;
    }

    let horizon = cutter.tmp.horizon;
    let vertical = cutter.tmp.vertical;

    if (horizon !== null) {
      let windowHeight = document.body.clientHeight;
      let imageHeight = elements.image.clientHeight;
      let frameHeight = elements.windowFrame.clientHeight;
      let margin = ((windowHeight - frameHeight) - imageHeight) / 2;
      let position = (mouse.clientY - frameHeight) - margin;
      let percent = position / imageHeight * 100;
      setStyle(cutter.tmp.horizon.cutLine, {
        top: percent + '%'
      });
    }

    if (vertical !== null) {
      let windowWidth = document.body.clientWidth;
      let imageWidth = elements.image.clientWidth;
      let margin = (windowWidth - imageWidth) / 2;
      let position = mouse.clientX - margin;
      let percent = position / imageWidth * 100;
      setStyle(cutter.tmp.vertical.cutLine, {
        left: percent + '%'
      });
    }
  }

  function saveCutter (cutterUpdate = true) {
    let horizon = cutter.tmp.horizon;
    let vertical = cutter.tmp.vertical;
    if ((horizon === null) && (vertical === null)) {
      return;
    }
    if (horizon !== null) {
      let saveCutter = {
        id: horizon.id,
        percent: Number(horizon.cutLine.style.top.slice(0, -1))
      };
      cutter.save.horizon.push(saveCutter);
      cutter.tmp.horizon = null;
    }
    if (vertical !== null) {
      let saveCutter = {
        id: vertical.id,
        percent: Number(cutter.tmp.vertical.cutLine.style.left.slice(0, -1))
      };
      cutter.save.vertical.push(saveCutter);
      cutter.tmp.vertical = null;
    }
    if (cutterUpdate) {
      update.cutter();
    }
  }

  function changeImageStyle () {
    if (!flags.firstDisplay) {
      return;
    }

    let width = elements.image.naturalWidth;
    let height = elements.image.naturalHeight;

    if (width >= height) {
      setStyle(elements.image, {
        width: '100%',
        height: 'auto'
      });
    } else {
      setStyle(elements.image, {
        width: 'auto',
        height: '100%'
      });
    }

    update.imageStyle();
    update.cutterAreaStyle();
    update.splitAreaStyle();
  }

  function pageTransition (ev) {
    // cutterを初期化
    let horizon = cutter.save.horizon;
    let vertical = cutter.save.vertical;
    for (let i = 0; i < horizon.length; i++) {
      let cutLine = document.getElementById(horizon[i].id);
      if (cutLine) {
        cutLine.parentNode.removeChild(cutLine);
      }
    }
    for (let i = 0; i < vertical.length; i++) {
      let cutLine = document.getElementById(vertical[i].id);
      if (cutLine) {
        cutLine.parentNode.removeChild(cutLine);
      }
    }
    cutter = {
      tmp: {
        horizon: null,
        vertical: null
      },
      save: {
        horizon: [],
        vertical: []
      }
    };

    // cutterを読み込み
    loadCutter(ev.detail.pageNumber);
    // splitを読み込み
    loadSplit(ev.detail.pageNumber);
  }

  let tool = {
    rotate: (direction) => {
      let deg;
      if (direction === 'left') {
        deg = -90;
      } else if (direction === 'right') {
        deg = 90;
      }
      getImage()
      .then((image) => {
        return canvas.rotate(image, deg);
      })
      .then((arrayBuffer) => {
        setImage(arrayBuffer);
      })
      .then(() => {
        transitionPage(page.now.number);
      })
      .catch((err) => {
        console.error(err);
      });
    },
    flip: (direction) => {
      getImage()
      .then((image) => {
        return canvas.flip(image, direction);
      })
      .then((arrayBuffer) => {
        setImage(arrayBuffer);
      })
      .then(() => {
        transitionPage(page.now.number);
      })
      .catch((err) => {
        console.error(err);
      });
    },
    copyEditData: () => {
      if (page.now.number === 0) {
        customAlert({
          type: 'warning',
          title: '前のページがありません',
          message: '編集情報をコピーすることが出来ません',
          confirm: false,
          pause: true,
          callback: null,
          customFunc: null
        });
        return;
      }
      infoStore.getItem('imagesInfo')
      .then((value) => {
        value[page.now.number].cutLine = {};
        value[page.now.number].splits = [];
        Object.assign(value[page.now.number].cutLine, value[page.now.number - 1].cutLine);
        Object.assign(value[page.now.number].splits, value[page.now.number - 1].splits);
        infoStore.setItem('imagesInfo', value)
        .then((value) => {
          transitionPage(page.now.number);
        })
        .catch((err) => {
          console.error(err);
        });
      })
      .catch((err) => {
        console.error(err);
      });
    }
  };

  function getImage () {
    return new Promise((resolve, reject) => {
      infoStore.getItem('imagesInfo')
      .then((value) => {
        imagesStore.getItem(value[page.now.number].id)
        .then((image) => {
          resolve({
            buffer: image,
            type: value[page.now.number].file.type
          });
        })
        .catch((err) => {
          reject(err);
        });
      })
      .catch((err) => {
        reject(err);
      });
    });
  }

  function setImage (image) {
    return new Promise((resolve, reject) => {
      infoStore.getItem('imagesInfo')
      .then((value) => {
        imagesStore.setItem(value[page.now.number].id, image)
        .then((value) => {
          resolve(value);
        })
        .catch((err) => {
          reject(err);
        });
      })
      .catch((err) => {
        reject(err);
      });
    });
  }

  let canvas = {
    rotate: (image, deg) => {
      return new Promise((resolve, reject) => {
        let img = document.createElement('img');
        let blobURL = createBlobURL(image.buffer, image.type);
        img.addEventListener('load', () => {
          let canvas = document.createElement('canvas');
          canvas.width = img.naturalHeight;
          canvas.height = img.naturalWidth;
          let canvasContext = canvas.getContext('2d');
          canvasContext.save();
          canvasContext.translate((canvas.width / 2), (canvas.height / 2));
          canvasContext.rotate(deg / 180 * Math.PI);
          canvasContext.drawImage(img, -(canvas.height / 2), -(canvas.width / 2));
          canvasContext.restore();
          canvas.toBlob((blob) => {
            let reader = new FileReader();
            reader.addEventListener('load', (ev) => {
              resolve(ev.target.result);
              URL.revokeObjectURL(blobURL);
              URL.revokeObjectURL(blob);
            }, false);
            reader.addEventListener('error', (ev) => {
              reject(ev);
              URL.revokeObjectURL(blobURL);
              URL.revokeObjectURL(blob);
            }, false);
            reader.readAsArrayBuffer(blob);
          }, image.type);
        }, false);
        img.src = blobURL;
      });
    },
    flip: (image, direction) => {
      return new Promise((resolve, reject) => {
        let img = document.createElement('img');
        let blobURL = createBlobURL(image.buffer, image.type);
        img.addEventListener('load', () => {
          let canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          let canvasContext = canvas.getContext('2d');
          canvasContext.translate((canvas.width / 2), (canvas.height / 2));
          if (direction === 'horizon') {
            canvasContext.scale(1, -1);
          } else if (direction === 'vertical') {
            canvasContext.scale(-1, 1);
          }
          canvasContext.drawImage(img, -(canvas.width / 2), -(canvas.height / 2));
          canvas.toBlob((blob) => {
            let reader = new FileReader();
            reader.addEventListener('load', (ev) => {
              resolve(ev.target.result);
              URL.revokeObjectURL(blobURL);
              URL.revokeObjectURL(blob);
            }, false);
            reader.addEventListener('error', (ev) => {
              reject(ev);
              URL.revokeObjectURL(blobURL);
              URL.revokeObjectURL(blob);
            }, false);
            reader.readAsArrayBuffer(blob);
          }, image.type);
        }, false);
        img.src = blobURL;
      });
    }
  };

  // ページ移動
  function transitionPage (pageNumber) {
    infoStore.getItem('imagesInfo')
    .then((value) => {
      // ページを読み込んで表示
      if (!value[pageNumber]) {
        return;
      }

      // イベント発火
      window.dispatchEvent(
        new CustomEvent('pageTransition', {
          detail: {
            pageNumber
          }
        })
      );

      imagesStore.getItem(value[pageNumber].id)
      .then((image) => {
        // 新しいURLを生成
        let newURL = createBlobURL(image, value[pageNumber].file.type);
        // 新しいURLを読み込み
        elements.image.src = newURL;
        // 古いURLを開放
        URL.revokeObjectURL(page.now.url);

        // 新しいURLを記録
        page.now.url = newURL;
        page.now.number = pageNumber;

        // 更新
        update.pageNumber();
      })
      .catch((err) => {
        console.error(err);
      });
    })
    .catch((err) => {
      console.error(err);
    });
  }

  // cutterを生成
  function createCutter (direction, id = generateUUIDv4(), percent = null, save = false) {
    let newCutter = {
      id,
      direction
    };

    // cutline
    newCutter.cutLine = document.createElement('div');
    newCutter.cutLine.id = newCutter.id;
    newCutter.cutLine.classList.add('filesEditCutLine');
    elements.cutterArea.appendChild(newCutter.cutLine);
    newCutter.cutLine.addEventListener('mouseover', (ev) => {
      ev.stopPropagation();
    }, false);
    newCutter.cutLine.addEventListener('mouseout', (ev) => {
      ev.stopPropagation();
    }, false);

    // topDotLink
    newCutter.topDotLink = document.createElement('a');
    newCutter.topDotLink.href = 'javascript:void(0)';
    newCutter.topDotLink.draggable = false;
    newCutter.cutLine.appendChild(newCutter.topDotLink);
    newCutter.topDotLink.addEventListener('click', () => {
      deleteCutter(newCutter.id);
    }, false);

    // topDot
    newCutter.topDot = document.createElement('div');
    newCutter.topDot.classList.add('filesEditCutLineDot');
    newCutter.topDotLink.appendChild(newCutter.topDot);

    // bottomDotLink
    newCutter.bottomDotLink = document.createElement('a');
    newCutter.bottomDotLink.href = 'javascript:void(0)';
    newCutter.bottomDotLink.draggable = false;
    newCutter.cutLine.appendChild(newCutter.bottomDotLink);
    newCutter.bottomDotLink.addEventListener('click', () => {
      deleteCutter(newCutter.id);
    }, false);

    // bottomDot
    newCutter.bottomDot = document.createElement('div');
    newCutter.bottomDot.classList.add('filesEditCutLineDot');
    newCutter.bottomDotLink.appendChild(newCutter.bottomDot);

    if (direction === 'horizon') {
      if (percent === null) {
        let windowHeight = document.body.clientHeight;
        let imageHeight = elements.image.clientHeight;
        let frameHeight = elements.windowFrame.clientHeight;
        let margin = ((windowHeight - frameHeight) - imageHeight) / 2;
        let position = (mouse.clientY - frameHeight) - margin;
        let percent = position / imageHeight * 100;
        setStyle(newCutter.cutLine, {
          width: '100%',
          height: '2px',
          top: percent + '%'
        });
      } else {
        setStyle(newCutter.cutLine, {
          width: '100%',
          height: '2px',
          top: percent + '%'
        });
      }

      setStyle(newCutter.topDot, {
        top: '-5px',
        left: '-12px'
      });

      setStyle(newCutter.bottomDot, {
        top: '-5px',
        right: '-12px'
      });

      cutter.tmp.horizon = newCutter;
    } else if (direction === 'vertical') {
      if (percent === null) {
        let windowWidth = document.body.clientWidth;
        let imageWidth = elements.image.clientWidth;
        let margin = (windowWidth - imageWidth) / 2;
        let position = mouse.clientX - margin;
        let percent = position / imageWidth * 100;
        setStyle(newCutter.cutLine, {
          width: '2px',
          height: '100%',
          left: percent + '%'
        });
      } else {
        setStyle(newCutter.cutLine, {
          width: '2px',
          height: '100%',
          left: percent + '%'
        });
      }

      setStyle(newCutter.topDot, {
        top: '-12px',
        left: '-5px'
      });

      setStyle(newCutter.bottomDot, {
        left: '-5px',
        bottom: '-12px'
      });

      cutter.tmp.vertical = newCutter;
    }

    if (save) {
      saveCutter(false);
    }
  }

  // cutterを削除
  function deleteCutter (cutterID) {
    let cutLine = document.getElementById(cutterID);
    if (cutLine) {
      cutLine.parentNode.removeChild(cutLine);
    }
    let horizon = cutter.save.horizon;
    let vertical = cutter.save.vertical;
    for (let i = 0; i < horizon.length; i++) {
      if (horizon[i].id === cutterID) {
        horizon.splice(i, 1);
        break;
      }
    }
    for (let i = 0; i < vertical.length; i++) {
      if (vertical[i].id === cutterID) {
        vertical.splice(i, 1);
        break;
      }
    }
    update.cutter();
  }

  // cutterを読み込み
  function loadCutter (pageNumber) {
    infoStore.getItem('imagesInfo')
    .then((value) => {
      let horizon = value[pageNumber].cutLine.horizon;
      let vertical = value[pageNumber].cutLine.vertical;

      if ((horizon.length === 0) && (vertical.length === 0)) {
        return;
      }

      for (let i = 0; i < horizon.length; i++) {
        createCutter('horizon', horizon[i].id, horizon[i].percent, true);
      }
      for (let i = 0; i < vertical.length; i++) {
        createCutter('vertical', vertical[i].id, vertical[i].percent, true);
      }

      update.cutter();
    })
    .catch((err) => {
      console.error(err);
    });
  }

  // splitを生成
  function createSplit (split) {
    let position = split.position;
    let width = position.end[0] - position.begin[0];
    let height = position.end[1] - position.begin[1];
    let x = position.begin[0];
    let y = position.begin[1];
    let id = `${width},${height},${x},${y}`;
    let validity;

    if (splitID[id] !== undefined) {
      validity = splitID[id];
    } else {
      validity = split.validity;
    }

    // block
    let block = document.createElement('div');
    block.id = id;
    block.classList.add('filesEditSplitBlock');
    elements.splitArea.appendChild(block);
    setStyle(block, {
      width: width + '%',
      height: height + '%',
      top: y + '%',
      left: x + '%'
    });

    // validityLink
    let validityLink = document.createElement('a');
    validityLink.href = 'javascript:void(0)';
    validityLink.draggable = false;
    validityLink.classList.add('filesEditValidityLink');
    block.appendChild(validityLink);

    // validityButton
    let validityButton = document.createElement('div');
    if (validity) {
      setStyle(validityButton, {
        transform: 'rotateY(0deg)'
      });
    } else {
      setStyle(validityButton, {
        transform: 'rotateY(180deg)'
      });
    }
    validityButton.classList.add('filesEditValidityButton');
    validityLink.appendChild(validityButton);

    // disableBlock
    let disableBlock = document.createElement('div');
    disableBlock.classList.add('filesEditDisableBlock');
    validityButton.appendChild(disableBlock);

    // disbleImage
    let disableImage = document.createElement('img');
    disableImage.src = './img/filesEdit/disable.svg';
    disableBlock.appendChild(disableImage);

    // enableBlock
    let enableBlock = document.createElement('div');
    enableBlock.classList.add('filesEditEnableBlock');
    validityButton.appendChild(enableBlock);

    // enableImage
    let enableImage = document.createElement('img');
    enableImage.src = './img/filesEdit/enable.svg';
    enableBlock.appendChild(enableImage);

    validityLink.addEventListener('click', () => {
      if (splitID[id]) {
        splitID[id] = false;
        setStyle(validityButton, {
          transform: 'rotateY(180deg)'
        });
      } else {
        splitID[id] = true;
        setStyle(validityButton, {
          transform: 'rotateY(0deg)'
        });
      }
      update.split(false);
    }, false);

    splitID[id] = validity;
  }

  // splitを読み込み
  function loadSplit (pageNumber) {
    infoStore.getItem('imagesInfo')
    .then((value) => {
      elements.splitArea.innerHTML = '';
      splitID = {};

      let splits = value[pageNumber].splits;
      for (let i = 0; i < splits.length; i++) {
        createSplit(splits[i]);
      }
    })
    .catch((err) => {
      console.error(err);
    });
  }

  let update = {
    pageNumber: () => {
      elements.pageNumberText.innerText = `${page.now.number + 1}/${page.total}`;
    },
    imageStyle: () => {
      let imageViewAreaClientWidth = elements.imageViewArea.clientWidth;
      let imageViewAreaClientHeight = elements.imageViewArea.clientHeight;

      let imageClientWidth = elements.image.clientWidth;
      let imageClientHeight = elements.image.clientHeight;

      if (imageViewAreaClientWidth < imageClientWidth) {
        setStyle(elements.image, {
          width: '100%',
          height: 'auto'
        });
      }

      if (imageViewAreaClientHeight < imageClientHeight) {
        setStyle(elements.image, {
          width: 'auto',
          height: '100%'
        });
      }
    },
    cutterAreaStyle: () => {
      let imageWidth = elements.image.clientWidth;
      let imageHeight = elements.image.clientHeight;

      setStyle(elements.cutterArea, {
        width: imageWidth + 'px',
        height: imageHeight + 'px'
      });
    },
    cutter: () => {
      infoStore.getItem('imagesInfo')
      .then((value) => {
        let cutLine = value[page.now.number].cutLine;
        cutLine.horizon = cutter.save.horizon;
        cutLine.vertical = cutter.save.vertical;
        cutLine.horizon.sort(customSort);
        cutLine.vertical.sort(customSort);

        function customSort (a, b) {
          return a.percent - b.percent;
        }

        infoStore.setItem('imagesInfo', value)
        .then((value) => {
          update.split();
        })
        .catch((err) => {
          console.error(err);
        });
      })
      .catch((err) => {
        console.error(err);
      });
    },
    splitAreaStyle: () => {
      let imageWidth = elements.image.clientWidth;
      let imageHeight = elements.image.clientHeight;

      setStyle(elements.splitArea, {
        width: imageWidth + 'px',
        height: imageHeight + 'px'
      });
    },
    split: (flag = true) => {
      infoStore.getItem('imagesInfo')
      .then((value) => {
        let cutLine = value[page.now.number].cutLine;
        let horizon = cutLine.horizon;
        let vertical = cutLine.vertical;
        value[page.now.number].splits = [];

        for (let i = 0; i < (horizon.length + 1); i++) {
          let y;
          if (i === 0) {
            y = 0;
          } else {
            y = horizon[i - 1].percent;
          }
          let height;
          if (i === horizon.length) {
            height = 100;
          } else {
            height = horizon[i].percent;
          }
          for (let i = 0; i < (vertical.length + 1); i++) {
            let x;
            if (i === 0) {
              x = 0;
            } else {
              x = vertical[i - 1].percent;
            }
            let width;
            if (i === vertical.length) {
              width = 100;
            } else {
              width = vertical[i].percent;
            }

            let position = {
              begin: [x, y],
              end: [width, height]
            };

            let id = (position.end[0] - position.begin[0])
            + ',' + (position.end[1] - position.begin[1])
            + ',' + position.begin[0]
            + ',' + position.begin[1];

            let validity;

            if (splitID[id] !== undefined) {
              validity = splitID[id];
            } else {
              validity = true;
            }

            value[page.now.number].splits.push({
              position,
              validity
            });
          }
        }

        if (flag) {
          elements.splitArea.innerHTML = '';
          for (let i = 0; i < value[page.now.number].splits.length; i++) {
            createSplit(value[page.now.number].splits[i]);
          }
        }

        infoStore.setItem('imagesInfo', value)
        .then((value) => {})
        .catch((err) => {
          console.error(err);
        });
      })
      .catch((err) => {
        console.error(err);
      });
    }
  };

  window.createBlobURL = (arrayBuffer, type) => {
    let blob = new Blob([arrayBuffer], {type: type});
    return window.URL.createObjectURL(blob);
  };

})();

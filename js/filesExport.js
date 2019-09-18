'use strict';

(() => {

  const fs = require('fs');

  let firstDisplayFlag = false;

  let infoStore = getStore('editData', 'info');
  let imagesStore = getStore('editData', 'images');

  let exportInfo = {
    outFolder: null,
    prefix: null,
    type: null,
    zeroPadding: null
  };

  let elements = {};

  let total = null;

  let index = {
    page: 0,
    split: 0
  };

  let outFolder = null;
  let totalLength = 0;
  let fileCounter = 0;

  window.addEventListener('translateFilesExportArea', () => {
    if (firstDisplayFlag) {
      return;
    }

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
        firstDisplayFlag = true;
        loadExportInfo();
        standbyEvent();
      }
    })
    .catch((err) => {
      console.error(err);
    });
  }, false);

  window.addEventListener('load', () => {
    let el = elements;
    let doc = document;

    el.dirInput = doc.getElementById('filesExportDirInput');
    el.prefixInput = doc.getElementById('filesExportPrefixInput');
    el.typeInput = doc.getElementById('filesExportTypeInput');
    el.zeroPaddingInput = doc.getElementById('filesExportZeroPaddingInput');
    el.clearLink = doc.getElementById('filesExportClearLink');
    el.exportLink = doc.getElementById('filesExportExportLink');
    el.translateArea = doc.getElementById('translateArea');

    createTooltip([
      el.clearLink,
      el.exportLink
    ]);
  }, false);

  function loadExportInfo () {
    infoStore.getItem('exportInfo')
    .then((info) => {
      if (info === null) {
        return;
      }
      elements.dirInput.value = info.outFolder;
      elements.prefixInput.value = info.prefix;
      if (info.type === 'jpeg') {
        elements.typeInput.checked = true;
      } else if (info.type === 'png') {
        elements.typeInput.checked = false;
      }
      elements.zeroPaddingInput.checked = !info.zeroPadding;
    })
    .catch((err) => {
      console.error(err);
    });
  }

  function standbyEvent () {
    elements.dirInput.addEventListener('change', update.exportInfo, false);
    elements.prefixInput.addEventListener('change', update.exportInfo, false);
    elements.typeInput.addEventListener('change', update.exportInfo, false);
    elements.zeroPaddingInput.addEventListener('change', update.exportInfo, false);
    elements.clearLink.addEventListener('click', clearClick, false);
    elements.exportLink.addEventListener('click', exportClick, false);

    window.addEventListener('startFilesExport', (ev) => {
      total = ev.detail.total;
      customAlert({
        type: null,
        title: '書き出し中...',
        message: null,
        confirm: null,
        pause: true,
        callback: null,
        customFunc: exportProgress
      });
    }, false);
  }

  function exportClick () {
    update.exportInfo(false);

    infoStore.getItem('imagesInfo')
    .then((value) => {
      let total = 0;
      for (let i = 0; i < value.length; i++) {
        let splits = value[i].splits;
        for (let i = 0; i < splits.length; i++) {
          if (splits[i].validity) {
            total++;
          }
        }
      }

      if (total === 0) {
        exportError({
          type: 'warning',
          title: '問題が発生しました',
          message: '書き出すファイルがありません'
        });
        return;
      }

      window.dispatchEvent(
        new CustomEvent('startFilesExport', {
          detail: { total }
        })
      );

      index.page = 0;
      index.split = 0;

      outFolder = fileNameReplace(exportInfo.outFolder);

      if (outFolder !== '') {
        let splitPath = outFolder.split(new RegExp('\\/|\\\\'));
        if (process.platform === 'darwin') {
          splitPath[0] = '../../../../' + splitPath[0];
        }

        createDir(splitPath, 0, () => {
          totalLength = String(total).length;
          fileCounter = 0;
          fileExport(value);
        });
      } else {
        totalLength = String(total).length;
        fileCounter = 0;
        fileExport(value);
      }
    })
    .catch((err) => {
      console.error(err);
    });
  }

  function fileExport (value) {
    let id = value[index.page].id;
    let type = value[index.page].file.type;
    let split = value[index.page].splits[index.split];

    if (!split.validity) {
      if (index.split === (value[index.page].splits.length - 1)) {
        index.split = 0;
        if (index.page !== (value.length - 1)) {
          index.page++;
          fileExport(value);
        }
      } else {
        index.split++;
        fileExport(value);
      }
      return;
    }

    imagesStore.getItem(id)
    .then((image) => {
      let blobURL = createBlobURL(image, 'image/' + type);

      fileCut(blobURL, exportInfo.type, split)
      .then((arrayBuffer) => {
        let prefix = fileNameReplace(prefixReplace(exportInfo.prefix));
        let number;
        if (exportInfo.zeroPadding) {
          number = zeroPadding(fileCounter + 1, totalLength);
        } else {
          number = fileCounter + 1;
        }
        let filePath = `./${outFolder}/${prefix}${number}.${exportInfo.type}`;
        if (process.platform === 'darwin') {
          filePath = '../../../../' + filePath;
        }
        let buffer = Buffer.from(arrayBuffer);

        fileWrite(filePath, buffer)
        .then(() => {
          window.dispatchEvent(new Event('updateFilesExport'));
          if (index.split === (value[index.page].splits.length) - 1) {
            index.split = 0;
            if (index.page !== (value.length - 1)) {
              index.page++;
              fileCounter++;
              fileExport(value);
            }
          } else {
            index.split++;
            fileCounter++;
            fileExport(value);
          }
        })
        .catch((err) => {
          console.error(err);
          exportError({
            type: 'error',
            title: '問題が発生しました',
            message: `ファイルの書き出しに失敗しました\n${prefix}${number}.${exportInfo.type}`
          });
        });
      })
      .catch((err) => {
        console.error(err);
        exportError({
          type: 'error',
          title: '問題が発生しました',
          message: `ファイルの書き出しに失敗しました`
        });
      });
    })
    .catch((err) => {
      console.error(err);
      exportError({
        type: 'error',
        title: '問題が発生しました',
        message: `ファイルの書き出しに失敗しました`
      });
    });
  }

  function createDir (splitPath, index, callback) {
    let dirPath = '.';
    for (let i = 0; i <= index; i++) {
      dirPath += '/' + splitPath[i];
    }

    let type = checkPathType(dirPath);
    if (type === null) {
      try {
        fs.mkdirSync(dirPath);
      } catch (e) {
        exportError({
          type: 'error',
          title: '問題が発生しました',
          message: '出力フォルダの生成に失敗しました'
        });
        console.error(e);
        return;
      }
      if (splitPath.length === (index + 1)) {
        callback();
      } else {
        createDir(splitPath, index + 1, callback);
      }
    } else if (type === 'file') {
      exportError({
        type: 'error',
        title: '問題が発生しました',
        message: '出力フォルダに問題があります'
      });
      return;
    } else if (type === 'dir') {
      if (splitPath.length === (index + 1)) {
        callback();
      } else {
        createDir(splitPath, index + 1, callback);
      }
    }
  }

  function checkPathType (path) {
    if (!fs.existsSync(path)) {
      return null;
    }
    if (fs.statSync(path).isDirectory()) {
      return 'dir';
    } else {
      return 'file';
    }
  }

  function fileCut (blobURL, type, split) {
    return new Promise((resolve, reject) => {
      let img = document.createElement('img');
      let canvas = document.createElement('canvas');
      let context = canvas.getContext('2d');
      img.addEventListener('load', () => {
        let width = split.position.end[0] - split.position.begin[0];
        let height = split.position.end[1] - split.position.begin[1];
        canvas.width = img.naturalWidth * width / 100;
        canvas.height = img.naturalHeight * height / 100;
        let x = img.naturalWidth * split.position.begin[0] / 100;
        let y = img.naturalHeight * split.position.begin[1] / 100;
        context.drawImage(img, -x, -y);
        canvas.toBlob((blob) => {
          let reader = new FileReader();
          reader.addEventListener('load', (ev) => {
            resolve(ev.target.result);
          }, false);
          reader.addEventListener('error', (ev) => {
            reject(ev);
          }, false);
          reader.readAsArrayBuffer(blob);
        }, 'image/' + type);
      }, false);
      img.src = blobURL;
    });
  }

  function fileWrite (filePath, arrayBuffer) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, arrayBuffer, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  function fileNameReplace (text) {
    text = text.replace(
      new RegExp(':', 'g'),
      '：'
    );
    text = text.replace(
      new RegExp('\\*', 'g'),
      '*'
    );
    text = text.replace(
      new RegExp('\\?', 'g'),
      '？'
    );
    text = text.replace(
      new RegExp('"', 'g'),
      '”'
    );
    text = text.replace(
      new RegExp('<', 'g'),
      '＜'
    );
    text = text.replace(
      new RegExp('>', 'g'),
      '＞'
    );
    text = text.replace(
      new RegExp('\\|', 'g'),
      '｜'
    );
    return text;
  }

  function prefixReplace (text) {
    let nowDate = new Date();
    text = text.replace(
      new RegExp('%YYYY%', 'g'),
      nowDate.toFormat('YYYY')
    );
    text = text.replace(
      new RegExp('%MM%', 'g'),
      nowDate.toFormat('MM')
    );
    text = text.replace(
      new RegExp('%DD%', 'g'),
      nowDate.toFormat('DD')
    );
    text = text.replace(
      new RegExp('%HH%', 'g'),
      nowDate.toFormat('HH24')
    );
    text = text.replace(
      new RegExp('%MI%', 'g'),
      nowDate.toFormat('MI')
    );
    text = text.replace(
      new RegExp('%SS%', 'g'),
      nowDate.toFormat('SS')
    );
    text = text.replace(
      new RegExp('\\\\', 'g'),
      '＼'
    );
    text = text.replace(
      new RegExp('/', 'g'),
      '／'
    );
    return text;
  }

  function zeroPadding (num, length) {
    let zero = '';
    for (let i = 0; i < length; i++) {
      zero += '0';
    }
    return (zero + num).slice(-length);
  }

  function exportError (info) {
    customAlert({
      type: info.type,
      title: info.title,
      message: info.message,
      confirm: false,
      pause: true,
      callback: null,
      customFunc: (elements, closeAlert) => {
        window.dispatchEvent(new Event('abortFilesExport'));
      }
    });
  }

  let update = {
    exportInfo: (flag = true) => {
      exportInfo.outFolder = elements.dirInput.value;
      exportInfo.prefix = elements.prefixInput.value;
      if (!elements.typeInput.checked) {
        exportInfo.type = 'png';
      } else {
        exportInfo.type = 'jpeg';
      }
      exportInfo.zeroPadding = !elements.zeroPaddingInput.checked;

      if (!flag) {
        return;
      }

      infoStore.setItem('exportInfo', exportInfo)
      .then((value) => {})
      .catch((err) => {
        console.error(err);
      });
    }
  };

  function exportProgress (elements, closeAlert) {
    let remaining = total;

    let progressBarArea = document.createElement('div');
    setStyle(progressBarArea, {
      width: '380px',
      height: '18px',
      margin: '15px auto 15px auto',
      'border-radius': '9px',
      'background-color': '#cfd7df'
    });
    elements.alertArea.appendChild(progressBarArea);

    let progressBar = document.createElement('div');
    setStyle(progressBar, {
      width: '18px',
      height: '18px',
      margin: '15px 0px 0px 0px',
      'border-radius': '9px',
      'background-color': '#2595C7',
      transition: 'width 0.5s'
    });
    progressBarArea.appendChild(progressBar);

    let progressText = document.createElement('p');
    setStyle(progressText, {
      margin: '0px auto 15px auto',
      'text-align': 'center',
      'font-weight': '700',
      color: '#312F2F'
    });
    progressText.innerText = '0 %';
    elements.alertArea.appendChild(progressText);

    window.addEventListener('updateFilesExport', updateExport, false);

    function updateExport () {
      remaining--;
      let progress = ((total - remaining) / total);
      setStyle(progressBar, {
        width: `${362 * progress + 18}px`
      });
      progressText.innerText = `${parseInt(progress * 100)} %`;
      if (remaining === 0) {
        completeExport();
      }
    }

    function completeExport () {
      setStyle(progressBar, {
        width: '380px'
      });
      progressText.innerText = '100%';

      closeExport();

      customAlert({
        type: 'success',
        title: '書き出し完了',
        message: '画像の書き出しが完了しました',
        confirm: false,
        pause: false,
        callback: null,
        customFunc: null
      });
    }

    window.addEventListener('abortFilesExport', closeExport, false);

    function closeExport () {
      total = null;

      closeAlert(elements, () => {
        window.removeEventListener('updateFilesExport', updateExport, false);
        window.removeEventListener('abortFilesExport', closeExport, false);
      });
    }
  }

  function clearClick () {
    customAlert({
      type: 'warning',
      title: 'すべてを初期化します',
      message: 'すべてのデータが消去されます\nよろしいですか?',
      confirm: true,
      pause: true,
      callback: (result) => {
        if (!result) {
          return;
        }
        infoStore.clear()
        .then(() => {
          imagesStore.clear()
          .then(() => {
            elements.translateArea.addEventListener('transitionend', endedAnimation, false);
            displayArea('filesDropArea');
          })
          .catch((err) => {
            console.error(err);
          });
        })
        .catch((err) => {
          console.error(err);
        });
      },
      customFunc: null
    });
  }

  function endedAnimation () {
    location.reload();
    window.removeEventListener('transitionend', endedAnimation, false);
  }

})();

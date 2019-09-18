'use strict';

(() => {

  // ストア
  let infoStore;
  let imagesStore;

  // 前回のデータの対応
  window.addEventListener('load', () => {
    infoStore = getStore('editData', 'info');
    imagesStore = getStore('editData', 'images');
    infoStore.getItem('imagesInfo').then((value) => {
      if (value === null) {
        return;
      }
      customAlert({
        type: 'warning',
        title: '以前の編集データが存在します',
        message: '復元しますか？\n(復元しない場合、データは消去されます)',
        confirm: true,
        pause: true,
        callback: (result) => {
          if (result) {
            displayArea('filesEditArea');
          } else {
            infoStore.clear().then().catch((err) => {
              console.error(err);
            });
            imagesStore.clear().then().catch((err) => {
              console.error(err);
            });
          }
        },
        customFunc: null
      });
    }).catch((err) => {
      console.error(err);
    });
  }, false);

  // ファイルのドロップを監視
  window.addEventListener('dropFiles', (ev) => {
    // ファイルを選別
    let sortedFiles = sortOutFiles(ev.detail);
    if (sortedFiles.length === 0) {
      customAlert({
        type: 'warning',
        title: '注意',
        message: '画像がありません',
        confirm: false,
        pause: false,
        callback: null,
        customFunc: null
      });
      return;
    }

    // 読み込み開始
    window.dispatchEvent(
      new CustomEvent('startFilesLoading', {
        detail: {
          total: sortedFiles.length
        }
      })
    );

    saveFiles(sortedFiles);
  }, false);

  // ファイル形式で選別
  function sortOutFiles (files) {
    let sortedFiles = [];
    for (let i = 0; i < files.length; i++) {
      if (!['image/png', 'image/jpeg'].includes(files[i].type)) {
        continue;
      }
      sortedFiles.push(files[i]);
    }
    return sortedFiles.sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      } else if (a.name < b.name) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  // ファイルをdataURLで保存
  function saveFiles (files) {
    let reader = new FileReader();

    // 完了
    reader.addEventListener('load', (ev) => {

      let img = document.createElement('img');

      // blobURL生成
      let blob = new Blob([ev.target.result], {type: files[0].type});
      let blobURL = window.URL.createObjectURL(blob);

      // 完了
      img.addEventListener('load', () => {
        // blobURL開放
        window.URL.revokeObjectURL(blobURL);

        let key = generateUUIDv4();
        let image = ev.target.result;

        // idを配列に保存
        insertInfo({
          id: key,
          file: {
            name: files[0].name,
            type: files[0].type,
          },
          cutLine: {
            horizon: [],
            vertical: []
          },
          splits: [
            {
              position: {
                begin: [0, 0],
                end: [100, 100]
              },
              validity: true
            }
          ]
        }, files);

        // 画像を保存
        imagesStore.setItem(key, image).then((value) => {
          // 読み込み更新
          window.dispatchEvent(
            new CustomEvent('updateFilesLoading', {
              detail: {
                remaining: files.length
              }
            })
          );

          files.shift();
          if (files[0]) {
            // 次を読み込み
            saveFiles(files);
          } else {
            // 読み込み完了
            window.dispatchEvent(new Event('completeFilesLoading'));
          }
        }).catch((err) => {
          console.error(err);
          saveError(files);
        });
      }, false);

      // エラー
      img.addEventListener('error', (ev) => {
        // blob開放
        window.URL.revokeObjectURL(blobURL);
        console.error(ev);
        saveError(files);
        window.dispatchEvent(new Event('corruptionFilesLoading'));
      }, false);

      // 読み込み
      img.src = blobURL;
    }, false);

    // エラー
    reader.addEventListener('error', (ev) => {
      console.error(ev);
      saveError(files);
    }, false);

    // 読み込み
    reader.readAsArrayBuffer(files[0]);
  }

  function insertInfo (info, files) {
    infoStore.getItem('imagesInfo').then((value) => {
      if (value === null) {
        value = [info];
      } else {
        value.push(info);
      }

      infoStore.setItem('imagesInfo', value).then((value) => {
      }).catch((err) => {
        console.error(err);
        saveError(files)
      });
    }).catch((err) => {
      console.error(err);
      saveError(files)
    });
  }

  function saveError (files) {
    customAlert({
      type: 'error',
      title: 'エラーが発生しました',
      message: '続行しますか？',
      confirm: true,
      pause: false,
      callback: (result) => {
        if (result) {
          files.shift();
          if (files[0]) {
            saveFiles(files);
          } else {
            // 読み込み完了
            window.dispatchEvent(new Event('completeFilesLoading'));
          }
        } else {
          window.dispatchEvent(new Event('abortFilesLoading'));
        }
      },
      customFunc: null
    });
  }

  window.getStore = (name, storeName, driverType) => {
    let driver;
    switch (driverType) {
      case 'WebSQL':
        driver = localforage.WEBSQL;
        break;
      case 'local​Storage':
        driver = localforage.LOCALSTORAGE;
        break;
      default: // IndexedDBがデフォルトで使用される
        driver = localforage.INDEXEDDB;
    }

    return localforage.createInstance({
      driver,
      name,
      storeName
    });
  }

})();

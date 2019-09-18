'use strict';

(() => {

  let filesDropArea;
  let filesDropSurface;
  let filesDropArrow;

  window.addEventListener('load', () =>  {
    filesDropArea = document.getElementById('filesDropArea');
    filesDropSurface = document.getElementById('filesDropSurface');
    filesDropArrow = document.getElementById('filesDropArrow');

    standbyFilesDrop();
    blockPageTransition();
  }, false);

  // ファイルのドロップを待機
  function standbyFilesDrop () {

    // 入った
    filesDropSurface.addEventListener('dragenter', () => {
      // transition有効化 + サイズを大きく
      setStyle(filesDropArea, {
        transition: 'width 0.5s, height 0.5s',
        width: '80%',
        height: '80%'
      });
      // transition有効化 + borderを青く
      setStyle(filesDropSurface, {
        transition: 'width 0.5s, height 0.5s, border 0.5s',
        border: '5px dotted #2595C7'
      });
      // 矢印を下へ
      setStyle(filesDropArrow, {
        bottom: '-160px'
      });
    }, false);

    // 出た
    filesDropSurface.addEventListener('dragleave', () => {
      // サイズを小さく
      setStyle(filesDropArea, {
        width: '75%',
        height: '75%'
      });
      // borderを黒く
      setStyle(filesDropSurface, {
        border: '5px dotted #312F2F'
      });
      // 矢印を上へ
      setStyle(filesDropArrow, {
        bottom: '-135px'
      });
    }, false);

    // 入ってドラッグ
    filesDropSurface.addEventListener('dragover', (ev) => {
      ev.preventDefault();
    }, false);

    // ドロップ
    filesDropSurface.addEventListener('drop', (ev) => {
      // ドロップされたファイルに移動しないため, dragoverとdropに付けとけばok
      ev.preventDefault();

      let event = new CustomEvent('dropFiles', {
        detail: ev.dataTransfer.files
      });

      // カスタムイベント発火
      window.dispatchEvent(event);

      // サイズを小さく
      setStyle(filesDropArea, {
        width: '75%',
        height: '75%'
      });
      // borderを黒く
      setStyle(filesDropSurface, {
        border: '5px dotted #312F2F'
      });
      // 矢印を上へ
      setStyle(filesDropArrow, {
        bottom: '-135px'
      });
    }, false);

    // css transition 終了
    filesDropArea.addEventListener('transitionend', () => {
      if (filesDropArea.style.width !== '80vw') {
        return;
      }
      // transition無効化
      setStyle(filesDropArea, {
        transition: 'width 0s, height 0s'
      });
      setStyle(filesDropSurface, {
        transition: 'width 0s, height 0s, border 0s'
      });
    }, false);
  }

  // bodyにドロップされたファイルへの移動をブロック
  function blockPageTransition () {
    document.body.addEventListener('dragover', (ev) => {
      ev.preventDefault();
    }, false);

    document.body.addEventListener('drop', (ev) => {
      ev.preventDefault();
    }, false);
  }

})();

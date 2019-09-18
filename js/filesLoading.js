'use strict';

(() => {

  let total = null;

  window.addEventListener('startFilesLoading', (ev) => {
    total = ev.detail.total;
    customAlert({
      type: null,
      title: '読み込み中...',
      message: null,
      confirm: null,
      pause: true,
      callback: null,
      customFunc: loadProgress
    });
  }, false);

  function loadProgress (elements, closeAlert) {
    // progressBarArea
    let progressBarArea = document.createElement('div');
    setStyle(progressBarArea, {
      width: '380px',
      height: '18px',
      margin: '15px auto 15px auto',
      'border-radius': '9px',
      'background-color': '#cfd7df'
    });
    elements.alertArea.appendChild(progressBarArea);

    // progressBar
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

    // progressText
    let progressText = document.createElement('p');
    setStyle(progressText, {
      margin: '0px auto 15px auto',
      'text-align': 'center',
      'font-weight': '700',
      color: '#312F2F'
    });
    progressText.innerText = '0 %';
    elements.alertArea.appendChild(progressText);

    // update
    window.addEventListener('updateFilesLoading', updateLoading, false);

    function updateLoading (ev) {
      let progress = ((total - ev.detail.remaining) / total);
      setStyle(progressBar, {
        width: `${362 * progress + 18}px`
      });
      progressText.innerText = `${parseInt(progress * 100)} %`;
    }

    // complate
    window.addEventListener('completeFilesLoading', completeLoading, false);

    function completeLoading () {
      setStyle(progressBar, {
        width: '380px'
      });
      progressText.innerText = '100%';

      closeLoading();

      customAlert({
        type: 'success',
        title: '読み込み完了',
        message: '画像の読み込みが完了しました',
        confirm: false,
        pause: false,
        callback: null,
        customFunc: null
      });
    }

    // abort
    window.addEventListener('abortFilesLoading', closeLoading, false);

    function closeLoading () {
      total = null;

      closeAlert(elements, () => {
        // eventListener停止
        window.removeEventListener('updateFilesLoading', updateLoading, false);
        window.removeEventListener('completeFilesLoading', completeLoading, false);
        window.removeEventListener('abortFilesLoading', closeLoading, false);
      });
    }
  }

})();

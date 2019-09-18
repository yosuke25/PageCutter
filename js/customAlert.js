/*
 * options: {    // 指定できるオプション
 *   type:       // 'info'|'success'|'error'|'warning', アイコンが変わる
 *   title:      // タイトル
 *   message:    // メッセージ
 *   confirm:    // true|false, confirmボタンを使用するか
 *   pause:      // true|false, 他の操作を休止するか
 *   callback:   // コールバック
 *   customFunc: // alert内で使用するcustomFunction
 * }
 *
 * type, title, message, confirmはnullなら非表示
 *
 * callbackには、ok=>true, cancel=>false, close=>nullが引数として渡される
 * customFuncには、elements, closeAlertが引数として渡される
 * closeAlertには、elementsを引数として渡す必要がある, callbackも渡すことができる
*/

'use strict';

(() => {

  // 不具合対策
  let elementsStock;

  window.customAlert = (options) => {
    let newElements = Object.create(elementsStock);
    newElements.alertArea.id = generateUUIDv4();
    newElements.pauseArea.id = generateUUIDv4();
    elementsStock = createElements();
    standbyButtonClick(newElements, options.callback);
    openAlert(options, newElements);
  };

  window.addEventListener('load', () => {
    elementsStock = createElements();
  }, false);

  // 要素を生成
  function createElements () {
    let doc = document;
    let elements = {};

    // alertArea
    elements.alertArea = doc.createElement('div');
    elements.alertArea.classList.add('customAlertArea');
    document.body.appendChild(elements.alertArea);

    // iconArea
    elements.iconArea = doc.createElement('div');
    elements.iconArea.classList.add('customAlertIconArea');
    elements.alertArea.appendChild(elements.iconArea);

    elements.icon = doc.createElement('img');
    elements.icon.classList.add('customAlertIcon');
    elements.iconArea.appendChild(elements.icon);

    // textArea
    elements.textArea = doc.createElement('div');
    elements.textArea.classList.add('customAlertTextArea');
    elements.alertArea.appendChild(elements.textArea);

    elements.title = doc.createElement('h1');
    elements.title.classList.add('customAlertTitle');
    elements.textArea.appendChild(elements.title);

    elements.message = doc.createElement('p');
    elements.message.classList.add('customAlertMessage');
    elements.textArea.appendChild(elements.message);

    // linkArea
    elements.linkArea = doc.createElement('div');
    elements.linkArea.classList.add('customAlertLinkArea');
    elements.alertArea.appendChild(elements.linkArea);

    // okLink
    elements.okLink = doc.createElement('a');
    elements.okLink.classList.add('customAlertOkLink');
    elements.okLink.href = 'javascript:void(0)';
    elements.okLink.draggable = false;
    elements.linkArea.appendChild(elements.okLink);

    elements.okButton = doc.createElement('div');
    elements.okButton.classList.add('customAlertOkButton');
    elements.okLink.appendChild(elements.okButton);

    elements.okText = doc.createElement('img');
    elements.okText.classList.add('customAlertButtonText');
    elements.okText.src = './img/customAlert/okText.svg';
    elements.okButton.appendChild(elements.okText);

    // cancelLink
    elements.cancelLink = doc.createElement('a');
    elements.cancelLink.classList.add('customAlertCancelLink');
    elements.cancelLink.href = 'javascript:void(0)';
    elements.cancelLink.draggable = false;
    elements.linkArea.appendChild(elements.cancelLink);

    elements.cancelButton = doc.createElement('div');
    elements.cancelButton.classList.add('customAlertCancelButton');
    elements.cancelLink.appendChild(elements.cancelButton);

    elements.cancelText = doc.createElement('img');
    elements.cancelText.classList.add('customAlertButtonText');
    elements.cancelText.src = './img/customAlert/cancelText.svg';
    elements.cancelButton.appendChild(elements.cancelText);

    // closeLink
    elements.closeLink = doc.createElement('a');
    elements.closeLink.classList.add('customAlertCloseLink');
    elements.closeLink.href = 'javascript:void(0)';
    elements.closeLink.draggable = false;
    elements.linkArea.appendChild(elements.closeLink);

    elements.closeButton = doc.createElement('div');
    elements.closeButton.classList.add('customAlertCloseButton');
    elements.closeLink.appendChild(elements.closeButton);

    elements.closeText = doc.createElement('img');
    elements.closeText.classList.add('customAlertButtonText');
    elements.closeText.src = './img/customAlert/closeText.svg';
    elements.closeButton.appendChild(elements.closeText);

    // pauseArea
    elements.pauseArea = doc.createElement('div');
    elements.pauseArea.classList.add('pauseArea');
    elements.alertArea.parentNode.insertBefore(elements.pauseArea, elements.alertArea);

    return elements;
  }

  // ボタンのクリックを待機
  function standbyButtonClick (elements, callback) {
    // okをクリック
    elements.okLink.addEventListener('click', () => {
      if (callback) {
        callback(true);
      }
      closeAlert(elements);
    }, false);

    // cancelをクリック
    elements.cancelLink.addEventListener('click', () => {
      if (callback) {
        callback(false);
      }
      closeAlert(elements);
    }, false);

    // closeをクリック
    elements.closeLink.addEventListener('click', () => {
      if (callback) {
        callback(null);
      }
      closeAlert(elements);
    }, false);

    // css transition 終了
    elements.alertArea.addEventListener('transitionend', () => {
      if (elements.alertArea.style.top !== '-412px') {
        return;
      }

      // alertAreaの削除
      let alertAreaResult = document.getElementById(elements.alertArea.id);
      if (alertAreaResult) {
        document.body.removeChild(elements.alertArea);
      }
    }, false);
  }

  // alertを開く
  function openAlert (options, elements) {
    // type
    if (['info', 'success', 'error', 'warning'].includes(options.type)) {
      elements.icon.src = `./img/customAlert/icons/${options.type}.svg`;
      setStyle(elements.iconArea, {
        display: 'block'
      });
      setStyle(elements.message, {
        '-webkit-line-clamp': '4'
      });
    } else if (options.type === null) {
      setStyle(elements.iconArea, {
        display: 'none'
      });
      setStyle(elements.message, {
        '-webkit-line-clamp': '6'
      });
    }

    // title
    if(options.title !== null) {
      elements.title.innerText = options.title;
      setStyle(elements.title, {
        display: 'block'
      });
    } else {
      setStyle(elements.title, {
        display: 'none'
      });
    }

    // message
    if(options.message !== null) {
      elements.message.innerText = options.message;
      setStyle(elements.message, {
        display: '-webkit-box'
      });
    } else {
      setStyle(elements.message, {
        display: 'none'
      });
    }

    // confirm
    if (options.confirm === true) {
      // linkAreaを表示
      setStyle(elements.linkArea, {
        display: 'flex'
      });
      // okボタンを表示
      setStyle(elements.okLink, {
        display: 'inline'
      });
      // cancelボタンを表示
      setStyle(elements.cancelLink, {
        display: 'inline'
      });
      // closeボタンを非表示
      setStyle(elements.closeLink, {
        display: 'none'
      });
    } else if (options.confirm === false) {
      // linkAreaを表示
      setStyle(elements.linkArea, {
        display: 'flex'
      });
      // okボタンを非表示
      setStyle(elements.okLink, {
        display: 'none'
      });
      // cancelボタンを非表示
      setStyle(elements.cancelLink, {
        display: 'none'
      });
      // closeボタンを表示
      setStyle(elements.closeLink, {
        display: 'inline'
      });
    } else if (options.confirm === null) {
      // linkAreaを非表示
      setStyle(elements.linkArea, {
        display: 'none'
      });
    }

    // pause
    if(options.pause) {
      setStyle(elements.pauseArea, {
        display: 'block'
      });
    }

    // customFunction
    if (options.customFunc) {
      options.customFunc(elements, closeAlert);
    }

    // alertAreaを表示
    setStyle(elements.alertArea, {
      top: '0px',
      filter: 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.3))'
    });
  }

  // alertを閉じる
  function closeAlert (elements, callback) {
    if (callback) {
      callback();
    }

    // alertAreaの移動
    setStyle(elements.alertArea, {
      top: '-412px',
      filter: null
    });

    // pauseAreaの削除
    let pauseAreaResult = document.getElementById(elements.pauseArea.id);
    if (pauseAreaResult) {
      document.body.removeChild(elements.pauseArea);
    }
  }

})();

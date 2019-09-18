========================== README ==========================

  PageCutter - ver1.0.0

========================= はじめに ==========================

このたびは、PageCutterをダウンロード頂き誠にありがとうございます。
このテキストには、ソフトの操作方法などが書かれています。

========================= 起動方法 ==========================

・Windows
  => 展開したフォルダの PageCutter.exe を起動します。

・MacOS
  => 展開したフォルダの PageCutter.app を起動します。

====================== アンインストール ======================

展開したフォルダごと削除して下さい。

========================= 操作方法 ==========================

・Tooltipの表示
  => ボタンなどにマウスを重ねると、そのボタンなどについての短い説
     明(Tooltip)が表示されます。

・画像の読み込み
  => 起動後に表示される Drop files here! と書かれた場所に画像を
     ドラック&ドロップします。
     画像が読み込まれると自動的に編集画面に移動します。

・編集

  ・画像の分割
    => マウスを画像上に乗せ、Altキーを押すと水平、Shiftキーを押す
       と垂直の分割線が表示されます。
       マウスを動かすと分割線を移動出来ます。
       位置が決まったらマウスをクリックし、位置を固定します。
       分割線を消す場合には端の黒い丸をクリックします。

  ・分割された部分を書き出し範囲から除外する
    => 分割された部分に表示される緑色のピンをクリックし、赤色にす
       ると、その範囲を書き出しから除外します。

  ・画像の回転
    => 下に表示されているツール群の左側2つは、画像を90度回転出来
       ます。
       それぞれ、左回転・右回転です。
       ※分割線は回転しません

  ・画像の反転
    => 下に表示されているツール群の中央2つは、画像を反転出来ます。
       それぞれ、水平反転・垂直反転です。
       ※分割線は反転しません

  ・編集情報のコピー
    => 下に表示されているツール群の右側1つは、前のページから編集
       情報をコピー出来ます。
       ※回転情報はコピーされません

  ・編集情報の保存
    => 編集情報はすべて自動的に保存され、誤ってソフトを閉じた場
       合でも、次回起動時に復元可能です。

・画像の書き出し

  ・Output Folder
    => 書き出し先のフォルダを指定します。
       何も指定しない場合は、ソフトを展開したフォルダと同じフォル
       ダに書き出されます。
       フォルダ名に使用出来ない文字は自動的に問題のない文字に置換
       されます。

  ・Prefix
    => ファイル名の先頭に付けるプレフィックスを指定します。
       何も指定しない場合は、何も付きません。
       以下の文字は次のように置換されます。
         %YYYY% => 年
         %MM%   => 月
         %DD%   => 日
         %HH%   => 時
         %MI%   => 分
         %SS%   => 秒
       また、ファイル名に使用出来ない文字は自動的に問題のない文字
       に置換されます。

  ・Type
    => 出力形式をPNG・JPEGから選択出来ます。

  ・Zero Padding
    => ファイル名を001というように、先頭を0で埋めます。

  ・Export
    => ファイルを連番で書き出します。

  ・Clear
    => 編集情報を含め、全てを削除し初期化します。
       ※読み込んだ元の画像、書き出した画像は削除されません。

===================== スペシャルサンクス =====================

・フォント
  ・FOT-筑紫A丸ゴシック Std                      Adobe Fonts様
  ・M PLUS Rounded 1c (Open Font License)      Google Fonts様

・ライブラリ
  ・localForage (Apache License 2.0)            localForage様
    => https://github.com/localForage/localForage
       Copyright (c) 2013-2016 Mozilla
  ・date-utils (MIT)                           JerrySievert様
    => https://github.com/JerrySievert/date-utils
       © 2011 by Jerry Sievert

・実行環境
  ・nw.js                                             nw.js様
    => https://nwjs.io/

・ビルド環境
  ・nwjs-builder-phoenix                           evshiron様
    => https://github.com/evshiron/nwjs-builder-phoenix

======================== ライセンス =========================

このソフトウェアは MIT Licence で提供され、
・Open Font License
・Apache License, Version 2.0
・MIT Licence
のライセンスで配布されている成果物を含んでいます。

また、FOT-筑紫A丸ゴシック Std は次のライセンスの元で提供されてい
ます。
  => https://helpx.adobe.com/jp/fonts/using/font-licensing.html

以下に
・Open Font License
・Apache License, Version 2.0
・MIT Licence
の情報を記載します。

・Open Font License
  => https : //scripts.sil.org/OFL

・Apache License, Version 2.0
  => http://www.apache.org/licenses/LICENSE-2.0

・MIT Licence

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the
Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall
be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

========================== 連絡先 ===========================

E-mail : yosuke25.contact@gmail.com

==================== (c) 2019 yosuke25 =====================

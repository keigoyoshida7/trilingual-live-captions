# Live Captions

[Live Captions を開く](https://keigoyoshida7.github.io/trilingual-live-captions/)

マイクから日本語・英語・フランス語の発話を自動で判別し、原文と残り2言語への翻訳を横3列に表示します。字幕を先に表示し、前後の発話がそろうと文脈を踏まえて直近の行を更新します。

## 使い方

1. デスクトップ版 Google Chrome で開き、**開始**を押します。初回はモデルのダウンロードがあります。Chrome によって **翻訳を準備** が表示された場合は、表示が消えるまで画面の案内に沿って押します。
2. マイクを許可して話します。入力欄は **自動検出** が初期値です。短い発話や固有名詞が多い場面では、入力言語を指定できます。
3. **停止**を押すとマイクを閉じ、処理済みの字幕は画面に残ります。全画面ボタンで投影用に表示できます。

初期設定の **高精度** は IBM Granite Speech 5.0 2B を使います。WebGPU と FP16 に対応する端末で実行でき、初回のダウンロードは約1.7 GBです。モデルを早く準備したい場合は開始前に **標準** を選べます。使っているモデル名は画面下部に表示されます。

発話の区切り、話し方、マイクの音質、端末性能によって字幕の精度や表示までの時間が変わります。近くで一人ずつ話すと自動検出が安定します。同時発話や単一発話内の頻繁な言語の切り替えには対応していません。

## スマホや別のPCで字幕を見る

配信するPCで **字幕を共有** を押し、視聴URLをコピーするか、別端末でQRコードを読み取ります。視聴ページには直近の字幕から表示され、以降は追加と訂正の両方が反映されます。縦向きのスマホでは日本語・英語・フランス語を切り替えて読めます。横幅のある画面では3列が並びます。

リンクを知っている人は、配信側のタブが開いている間、字幕のテキストを視聴できます。**視聴リンク → 共有を終了** で配信を閉じられます。

## 実装

- ブラウザ内の [Silero VAD](https://github.com/snakers4/silero-vad) で発話を区切り、Worker 内で [Granite Speech 5.0 2B の ONNX 版](https://huggingface.co/ibm-granite/granite-speech-5.0-2b-ONNX) を実行します。高精度モデルを実行できない端末は、標準設定と同じく Whisper Small（WebGPU）または Whisper Base（WebAssembly）を使用します。
- 同じ言語の近接した発話を続けて聞き直します。2行を照合して、内容や数字が大きく変わる候補は採用しません。直前の文と合わせて [Chrome Translator API](https://developer.chrome.com/docs/ai/translator-api) に渡し、行を復元できた訳を反映します。
- Dot Area のクレジット、参考文献、FIL の企画、メディアアートの技術用語を認識と翻訳に使います。高精度モデルには登壇者・作品の名称と、直近の発話に対応する技術用語をヒントとして渡します。「ライゾマ」は Rhizomatiks に揃え、会場名の FIL や書名の Being There のように一般語と重なる表記は周囲の言葉で判定します。翻訳で名前が欠けた場合は正式表記を保持する形式で再試行します。
- 用語の登録元に、[Dot Areaのクレジット](https://forum.ircam.fr/article/detail/installation-dot-area-by-keigo-yoshida-at-fil/)、[IRCAM Forumのプログラム](https://forum.ircam.fr/collections/detail/ircam-forum-workshops-tokyo-2026-program/)、[FILのアーカイブ](https://www.filtokyo.com/archive/)、[Rhizomatiksの作品一覧](https://rhizomatiks.com/work/)、[真鍋大度のプロフィール](https://daito.ws/ja/profile/)、[阿部一直の活動歴](https://www.ycam.jp/aboutus/interlab/staff/kazunao-abe/)、[吉田慧悟の作品一覧](https://keigoyoshida.jp/)を含みます。表記と聞き違いの候補は `dot-area-terms.mjs` にあります。
- 音声認識と言語判定、翻訳を端末内で実行します。字幕履歴はタブを閉じると消えます。
- 視聴リンクの接続には [VDO.Ninja SDK](https://sdk.vdo.ninja/) を使います。字幕テキストは暗号化された WebRTC データチャンネルで送り、直結できない回線では TURN を利用します。視聴URLの鍵はフラグメントに含まれます。
- GitHub Pages の静的サイトです。APIキーは不要です。CDNからライブラリとモデルを読み込みます。開発時は、このディレクトリで `python3 -m http.server 8000` を実行して `http://localhost:8000/` を開きます。

# Live Captions

[Live Captions を開く](https://keigoyoshida7.github.io/trilingual-live-captions/)

マイクから日本語・英語・フランス語の発話を自動で判別し、原文と残り2言語への翻訳を横3列に表示します。字幕1行が発話1区間に対応し、長い発話では途中の訳も更新します。

## 使い方

1. デスクトップ版 Google Chrome で開き、**開始**を押します。初回は翻訳の言語パックと音声認識モデルのダウンロードを待ちます。
2. マイクを許可して話します。入力欄は **自動検出** が初期値です。短い発話や固有名詞が多い場面では、入力言語を指定できます。
3. **停止**を押すとマイクを閉じ、処理済みの字幕は画面に残ります。全画面ボタンで投影用に表示できます。

発話の区切り、話し方、マイクの音質、端末性能によって字幕の精度や表示までの時間が変わります。近くで一人ずつ話すと自動検出が安定します。同時発話や単一発話内の頻繁な言語の切り替えには対応していません。

## 実装

- ブラウザ内の [Silero VAD](https://github.com/snakers4/silero-vad) で発話を区切り、[Transformers.js](https://huggingface.co/docs/transformers.js) の Worker で Whisper を実行します。WebGPU では Whisper Small、利用できない場合は WebAssembly で Whisper Base を使用します。認識モデルのダウンロードは最大約300 MBです。
- [Chrome Translator API](https://developer.chrome.com/docs/ai/translator-api) のローカル言語パックで残り2言語に翻訳します。音声や字幕をサーバーへ送信せず、字幕履歴はタブを閉じると消えます。
- GitHub Pages の静的サイトです。APIキーは不要です。CDNからライブラリとモデルを読み込みます。開発時は、このディレクトリで `python3 -m http.server 8000` を実行して `http://localhost:8000/` を開きます。

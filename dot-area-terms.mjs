// Vocabulary for the Dot Area installation and its talk, from the program and credits.
const exhibition = /Dot Area|IRCAM|Ircam|イルカム|展覧会|展示|作品|公演|exhibit|installation|œuvre|exposition|conférence|workshop|forum|Spat\s*5/iu;
const spatial = /空間音響|音響空間|スピーカー|音響合成|spatial|spatialisation|surround|ambisonic|enceinte|speaker|Max\/MSP|IRCAM/iu;
const synthesis = /音響合成|音声合成|変換モデル|ニューラル|脳波|音響モデル|neural|synth[eèé]s|audio model|generative model|ACIDS|IRCAM/iu;
const signal = /計測|測定|電極|信号|ヘッドホン|RAVE|EEG|signal|electrode|casque|brainwave|brain activity/iu;
const eventVenue = /(?:会場|ギャラリー|展示会場|venue|gallery|galerie|lieu d[’']exposition)\s*[はがの・:：—-]?\s*$/iu;
const ircamSoftware = /IRCAM|Forum|音響|作曲|ワークショップ|synthesis|sound design|audio|composition|plugin|plug-in|logiciel|synthèse/iu;
const manabe = /真鍋|Daito|Rhizomatiks|ライゾマティクス|ELEVENPLAY|MIKIKO|Reframe|リフレーム|振付|choreography|Japanese group/iu;
const abe = /阿部一直|Kazunao|YCAM|ワイカム|Artlab|アートラボ|三上晴子|Seiko Mikami|池田亮司|Ryoji Ikeda|キュレーション|curat/iu;
const yoshida = /吉田慧悟|Keigo|Dot Area|liberated frequencies|S[óo]nar|Future Frequencies|Audio Buffer Tokyo|作品名|work titled|installation titled|œuvre intitulée/iu;

function term(english, aliases = [], options = {}) {
  return { english, japanese: options.ja ?? english, french: options.fr ?? english, aliases, ...options };
}

const terms = [
  term("IRCAM Forum", ["Ircam Forum", "IR Kam Forum", "Ir Cam Forum", "Irkam Forum", "Air Cam Forum", "Ear Cam Forum", "イルカムフォーラム", "イルカム フォーラム", "アイアールカムフォーラム"]),
  term("IRCAM", ["Irkam", "Irkamm", "I R C A M", "イルカム", "いるかむ", "アイアールカム", "アイ アール カム"], {
    near: ["Air Cam", "Ear Cam", "IR Cam", "Aircam", "Earcam", "Ircan", "アーカム"], context: exhibition,
  }),
  term("Dot Area", ["Dot-Area", "ドットエリア", "ドット・エリア", "どっとえりあ"], {
    fuzzy: true, near: ["Dot Aria", "Dotto Area", "Dot Aeria", "ドットアリア"], context: exhibition,
  }),
  term("De-symmetrical Core", ["Desymmetrical Core", "De symmetrical Core", "De-symmetrical Corps", "Disymmetrical Core", "Desymmetric Core", "ディシンメトリカルコア", "デシンメトリカルコア", "ディ・シンメトリカル・コア", "デ・シンメトリカル・コア", "デシメトリカルコア"], {
    fuzzy: true, near: ["The Symmetrical Core", "D Symmetrical Core", "ザシンメトリカルコア"], context: exhibition,
  }),
  term("liberated frequencies", ["liberated frequency", "liberatedfrequencies", "リベレイテッドフリークエンシーズ", "リベレーテッドフリークエンシーズ", "リベレイテッド・フリークエンシーズ", "リベレイテッドフリクエンシーズ", "リバレイテッドフリークエンシーズ"], {
    fuzzy: true, near: ["Liberty Frequencies", "Liberating Frequencies", "リベレイティッドフリークエンシーズ"], context: exhibition,
  }),
  term("Guillaume Piccarreta", ["Guillaume Picareta", "Guillaume Piccaretta", "Guillaume Picaretta", "William Piccarreta", "ギヨームピカレッタ", "ギヨーム・ピカレッタ", "ギヨーム・ピッカレッタ", "ギヨーム・ピカレタ", "ギヨムピカレッタ"], { fuzzy: true }),
  term("Paola Palumbo", ["Paula Palumbo", "Paola Palombo", "Paola Pallumbo", "パオラパルンボ", "パオラ・パルンボ", "パオラ・パルンボー", "ポーラパルンボ", "パオラパルンボウ"], { fuzzy: true }),
  term("Keigo Yoshida", ["Yoshida Keigo", "吉田 慧悟", "吉田圭吾", "吉田慶吾", "吉田敬悟", "よしだけいご", "ヨシダケイゴ"], { ja: "吉田慧悟", fuzzy: true }),
  term("Daito Manabe", ["Manabe Daito", "Daitoh Manabe", "真鍋 大度", "真鍋大人", "真鍋大登", "まなべだいと", "マナベダイト"], { ja: "真鍋大度", fuzzy: true }),
  term("Kazunao Abe", ["Abe Kazunao", "阿部 一直", "阿部和直", "阿部一尚", "あべかずなお", "アベカズナオ"], { ja: "阿部一直", fuzzy: true }),
  term("Rinko Oka", ["Oka Rinko", "Rinco Oka", "おかりんこ", "オカリンコ", "りんこおか"], { fuzzy: true }),
  term("Mari Tomita", ["Tomita Mari", "Marie Tomita", "とみたまり", "トミタマリ"], { fuzzy: true }),
  term("Atsuya Tsuchida", ["Tsuchida Atsuya", "Atsuya Tuchida", "つちだあつや", "ツチダアツヤ"], { fuzzy: true }),
  term("Ryuji Murakawa", ["Murakawa Ryuji", "Ryūji Murakawa", "村川 龍司", "村川竜司", "むらかわりゅうじ", "ムラカワリュウジ"], { ja: "村川龍司", fuzzy: true }),
  term("Shinya Fujii", ["Fujii Shinya", "Shinya Fuji", "藤井 進也", "藤井真也", "ふじいしんや", "フジイシンヤ"], { ja: "藤井進也", fuzzy: true }),
  term("MUTEK.JP", ["Mutek JP", "MUTEK Japan", "ミューテックジェーピー", "ミューテック JP"]),
  term("arsaffix Inc.", ["arsaffix", "arsaffix Inc", "アルサフィックス", "アーサフィックス"]),
  term("Flying Tokyo 2024", ["フライング東京2024", "フライングトーキョー2024"]),
  term("FIL", [], { near: ["fil", "fill", "フィル", "エフアイエル"], venue: true }),
  term("Spat5", ["SPAT 5", "Spat Five", "Spat Cinq", "スパット5", "スパットファイブ", "スパットファイヴ"], { near: ["Spot Five", "Spot 5", "スポットファイブ", "スポット5"], context: spatial }),
  term("RAVE", [], { near: ["rave", "レイヴ", "レイブ", "レーヴ"], context: synthesis }),
  term("ACIDS", [], { near: ["acids", "アシッズ", "エーシーアイディーエス"], context: /IRCAM|Institut|音響合成|RAVE/iu }),
  term("Max/MSP", ["Max MSP", "Max-MSP", "マックスMSP", "マックスエムエスピー"]),
  term("StreamDiffusion", ["Stream Diffusion", "ストリームディフュージョン", "ストリーム・ディフュージョン"]),
  term("EEG", ["E E G", "イーイージー"]),
  term("EEG", [], { ja: "脳波", near: ["脳派", "脳破", "能波"], context: signal, nearOnly: true }),
  term("spatial audio", ["空間音響", "空間音響技術", "audio spatial", "son spatialisé"], { ja: "空間音響", fr: "audio spatial", near: ["空間音教", "空間音協"], context: spatial, localize: false }),
  term("desymmetrization", ["脱対称性", "dé-symétrisation", "désymétrisation"], { ja: "脱対称性", fr: "désymétrisation", near: ["脱対象性", "脱対照性"], context: exhibition, localize: false }),
  term("Asama stone", ["浅間石", "あさまいし", "アサマ石", "pierre d’Asama", "pierre d'Asama"], { ja: "浅間石", fr: "pierre d’Asama" }),
  term("Roger Caillois", ["ロジェ・カイヨワ", "ロジェカイヨワ", "Roger Cayois"], { ja: "ロジェ・カイヨワ", fuzzy: true }),
  term("Pierre Boulez", ["ピエール・ブーレーズ", "ピエールブーレーズ", "Pierre Boullez"], { ja: "ピエール・ブーレーズ", fuzzy: true }),
  term("Georges Bataille", ["ジョルジュ・バタイユ", "ジョルジュバタイユ", "George Bataille"], { ja: "ジョルジュ・バタイユ", fuzzy: true }),
  term("Leonardo da Vinci", ["レオナルド・ダ・ヴィンチ", "レオナルドダヴィンチ"], { ja: "レオナルド・ダ・ヴィンチ", fuzzy: true }),
  term("Andy Clark", ["アンディ・クラーク", "アンディクラーク"], { ja: "アンディ・クラーク", fuzzy: true }),
  term("Dynamics of Dissymmetry", ["Dynamics of Disymmetry"]),
  term("Dialogue de l’ombre double", ["Dialogue de l'ombre double", "二重の影の対話"], { ja: "二重の影の対話" }),

  // IRCAM Forum program, speakers, and audio software.
  term("IRCAM Forum Workshops Tokyo 2026", ["IRCAM Forum Workshops 2026 Tokyo", "IRCAM Forum Workshop Tokyo 2026", "イルカムフォーラムワークショップ東京2026"]),
  term("IRCAM Forum Workshops", ["IRCAM Forum Workshop", "IR Cam Forum Workshops", "イルカムフォーラムワークショップ", "イルカムフォーラムワークショップス"]),
  term("Institut de recherche et coordination acoustique/musique", ["Institut de recherche et de coordination acoustique musique", "フランス国立音響音楽研究所"], { ja: "フランス国立音響音楽研究所" }),
  term("Centre Pompidou", ["Center Pompidou", "Pompidou Centre", "Pompidou Center", "ポンピドゥーセンター", "ポンピドゥー・センター"], { ja: "ポンピドゥー・センター" }),
  term("IRCAM Forum Hors les murs", ["IRCAM Forum hors les mur", "イルカムフォーラム オールレミュール"]),
  term("STMS", ["S T M S", "エスティーエムエス"]),
  term("Hugues Vinet", ["Hugh Vinet", "ユーグ・ヴィネ", "ユーグヴィネ"], { fuzzy: true }),
  term("Philippe Esling", ["Philippe Essling", "Philip Esling", "フィリップ・エスリング", "フィリップエスリング"], { fuzzy: true }),
  term("Diemo Schwarz", ["Diemo Schwartz", "ディーモ・シュヴァルツ", "ディーモシュワルツ"], { fuzzy: true }),
  term("Augustin Muller", ["Augustin Müller", "オーギュスタン・ミュラー", "オーギュスタンミュラー"], { fuzzy: true }),
  term("Agustin Spinetto", ["Agustín Spinetto", "アグスティン・スピネット", "アグスティンスピネット"], { fuzzy: true }),
  term("Marco Fiorini", ["マルコ・フィオリーニ", "マルコフィオリーニ"], { fuzzy: true }),
  term("Anaïs del Sordo", ["Anais del Sordo", "アナイス・デル・ソルド", "アナイスデルソルド"], { fuzzy: true }),
  term("MoN Takanawa", ["Mon Takanawa", "Museum of Narrative", "モン高輪", "モンタカナワ"]),
  term("Tokyo College of Music", ["東京音楽大学", "東京音大"], { ja: "東京音楽大学" }),
  term("Temple University, Japan Campus", ["Temple University Japan Campus", "Temple University Japan", "テンプル大学ジャパンキャンパス"], { ja: "テンプル大学ジャパンキャンパス" }),
  term("SKataRT", ["S Kata RT", "スカタート", "エスカタート"]),
  term("CataRT", ["Cata RT", "カタート"]),
  term("MuBu", ["Mu Bu", "ムブ", "ミュブ"]),
  term("ASAP", [], { nearOnly: true, near: ["ASAP", "エーエスエーピー"], context: /SKataRT|MuBu|プラグイン|plug-?in|audio software|spectral/iu, localContextOnly: true }),
  term("Somax2", ["Somax 2", "Somax Two", "Somax Deux", "ソマックス2", "ソマックスツー", "ソーマックスツー"]),
  term("Modalys", ["Modalis", "Modaly's", "モーダリス", "モダリス"]),
  term("OpenMusic", ["オープンミュージック"], { near: ["Open Music"], context: ircamSoftware }),
  term("AudioSculpt", ["Audio Sculpt", "オーディオスカルプト"]),
  term("SuperVP", ["Super VP", "スーパーVP", "スーパーブイピー"]),
  term("Antescofo", ["Antes Cofo", "アンテスコフォ", "アンテスコフ"]),

  // Daito Manabe's and Rhizomatiks' public projects.
  term("Rhizomatiks Research", ["Rhizomatics Research", "Rizomatiks Research", "ライゾマティクスリサーチ", "ライゾマティクス・リサーチ"]),
  term("Rhizomatiks", ["Rhizomatics", "Rizomatiks", "Rizomatics", "ライゾマティクス", "ライゾマティックス", "リゾマティクス"]),
  term("ELEVENPLAY", ["Eleven Play", "イレブンプレイ", "イレヴンプレイ"]),
  term("MIKIKO", ["ミキコ"]),
  term("Perfume", [], { nearOnly: true, near: ["Perfume", "パフューム"], context: manabe }),
  term("Perfume Global Site Project", ["Perfume Global Sight Project", "パフューム グローバルサイトプロジェクト"]),
  term("Reframe", [], { nearOnly: true, near: ["Reframe", "リフレーム"], context: /Perfume|パフューム|作品|公演|show|concert/iu, localContextOnly: true }),
  term("Face visualizer, instrument, and copy", ["Face Visualizer Instrument and Copy", "フェイス・ビジュアライザー インストゥルメント アンド コピー"], { near: ["Face Visualizer", "フェイスビジュアライザー"], context: manabe }),
  term("discrete figures", ["discreet figures", "ディスクリートフィギュアズ", "ディスクリート・フィギュアズ"]),
  term("Deleted Reality", ["Delete Reality", "デリーテッドリアリティ", "デリーテッド・リアリティ"]),
  term("Sensing Streams", ["Sensing Stream", "センシングストリームズ", "センシング・ストリームズ"]),
  term("particles", [], { nearOnly: true, near: ["particles", "パーティクルズ"], context: manabe }),
  term("electromyography", ["筋電", "électromyographie"], { ja: "筋電", fr: "électromyographie", near: ["筋伝", "筋電気"], context: /センサー|計測|筋肉|真鍋|EMG|sensor|muscle/iu, localize: false }),
  term("motion capture", ["モーションキャプチャ", "モーションキャプチャー", "capture de mouvement"], { ja: "モーションキャプチャ", fr: "capture de mouvement", localize: false }),
  term("brain organoid", ["ブレインオルガノイド", "脳オルガノイド", "organoïde cérébral"], { ja: "脳オルガノイド", fr: "organoïde cérébral", localize: false }),
  term("spiking neural network", ["スパイキングニューラルネットワーク", "réseau de neurones impulsionnels"], { ja: "スパイキングニューラルネットワーク", fr: "réseau de neurones impulsionnels", localize: false }),

  // Kazunao Abe's public curatorial projects and collaborators.
  term("YCAM", ["山口情報芸術センター", "山口情報芸術センター YCAM", "Yamaguchi Center for Arts and Media", "ワイカム", "ワイキャン"], { near: ["Why Cam", "Y Cam"], context: abe }),
  term("YCAM InterLab", ["YCAM Inter Lab", "ワイカムインターラボ", "YCAMインターラボ"]),
  term("Canon Artlab", ["Canon Art Lab", "Cannon Art Lab", "キヤノン・アートラボ", "キャノンアートラボ"], { ja: "キヤノン・アートラボ" }),
  term("NTT InterCommunication Center", ["NTT ICC", "NTTインターコミュニケーション・センター"], { ja: "NTTインターコミュニケーション・センター" }),
  term("Seiko Mikami", ["Mikami Seiko", "三上 晴子", "みかみせいこ", "ミカミセイコ"], { ja: "三上晴子", fuzzy: true }),
  term("Teiji Furuhashi", ["Furuhashi Teiji", "古橋 悌二", "ふるはしていじ", "フルハシテイジ"], { ja: "古橋悌二", fuzzy: true }),
  term("Ryoji Ikeda", ["Ikeda Ryoji", "池田 亮司", "いけだりょうじ", "イケダリョウジ"], { ja: "池田亮司", fuzzy: true }),
  term("Ryuichi Sakamoto", ["Sakamoto Ryuichi", "坂本 龍一", "坂本竜一", "さかもとりゅういち"], { ja: "坂本龍一", fuzzy: true }),
  term("Shiro Takatani", ["Takatani Shiro", "高谷 史郎", "たかたにしろう"], { ja: "高谷史郎", fuzzy: true }),
  term("Rafael Lozano-Hemmer", ["Rafael Lozano Hemmer", "ラファエル・ロサノ＝ヘメル", "ラファエルロサノヘメル"], { ja: "ラファエル・ロサノ＝ヘメル", fuzzy: true }),
  term("Carsten Nicolai", ["カールステン・ニコライ", "カールステンニコライ"], { ja: "カールステン・ニコライ", fuzzy: true }),
  term("Marko Peljhan", ["マルコ・ペリハン", "マルコペリハン"], { ja: "マルコ・ペリハン", fuzzy: true }),
  term("Knowbotic Research", ["Know Botik Research", "ノウボティック・リサーチ", "ノウボティックリサーチ"]),
  term("Desire of Codes", ["Desire of Code", "欲望のコード"]),
  term("Molecular Informatics", ["視線のモルフォロジー"], { near: ["Molecular Informatic"], context: abe }),
  term("IO_DENCIES", ["IO Dencies", "アイオーデンシーズ"]),
  term("Amodal Suspension", ["アモーダル・サスペンション", "アモーダルサスペンション"]),
  term("supersymmetry", [], { nearOnly: true, near: ["supersymmetry", "super symmetry", "スーパーシンメトリー"], context: abe }),
  term("LOVERS", [], { nearOnly: true, near: ["LOVERS", "ラバーズ"], context: /古橋悌二|Teiji Furuhashi|Artlab|アートラボ|YCAM/iu }),

  // Keigo Yoshida's portfolio, research, and performance contexts.
  term("Artificial Heart Brain Waves", ["Artificial Heart Brain", "Artificial Heart Brainwaves", "アーティフィシャルハートブレインウェーブス"]),
  term("Reservoir A/V Performance", ["Reservoir AV Performance", "Reservoir A/V", "Reservoir AV", "レザバーAV", "リザバーAV"]),
  term("Latent Terrain", ["Latent Terrane", "レイテント・テレイン", "レイテントテレイン", "ラテントテレイン"]),
  term("Mineral Neurons", ["Mineral Neuron", "ミネラル・ニューロンズ", "ミネラルニューロンズ"]),
  term("Vail", [], { nearOnly: true, near: ["Vail", "Veil", "ヴェイル", "ベイル"], context: /作品|タイトル|公演|作品名|titled|performed|performance|œuvre|Future Frequencies/iu, localContextOnly: true }),
  term("Propagation", [], { nearOnly: true, near: ["Propagation", "プロパゲーション"], context: yoshida }),
  term("Audio Buffer Tokyo", ["Audio Buffa Tokyo", "オーディオバッファ東京", "オーディオバッファトーキョー"]),
  term("Future Frequencies Festival", ["Future Frequency Festival", "フューチャーフリークエンシーズフェスティバル"]),
  term("Sónar+D", ["Sonar+D", "Sonar D", "Sonar Plus D", "ソナーD", "ソナー・プラス・ディー"]),
  term("Sónar Istanbul", ["Sonar Istanbul", "ソナーイスタンブール"]),
  term("Neutone", ["Neu Tone", "ニュートーン", "ニュートーンAI"]),
  term("Neuromusic Lab", ["Neuro Music Lab", "ニューロミュージックラボ", "脳音楽研究室"]),
  term("x-Music Lab", ["X Music Lab", "エックスミュージックラボ"]),
  term("Keio University SFC", ["Keio SFC", "慶應SFC", "慶応SFC", "慶應義塾大学SFC", "慶應義塾大学湘南藤沢キャンパス"], { ja: "慶應義塾大学SFC" }),
  term("TEDxKeioU", ["TEDx Keio U", "テデックスケイオーユー", "テッドエックス慶應"]),
  term("ASSR", ["A S S R", "エーエスエスアール", "auditory steady state response", "auditory steady-state response", "聴性定常反応"], { ja: "聴性定常反応（ASSR）", localize: false }),
  term("NIME", ["N I M E", "New Interfaces for Musical Expression", "ナイム"]),
];

const preferredHints = ["IRCAM", "Dot Area", "De-symmetrical Core", "liberated frequencies", "Guillaume Piccarreta", "Paola Palumbo", "Keigo Yoshida", "Daito Manabe", "Kazunao Abe", "Spat5", "RAVE"];
const topicHints = [
  {
    pattern: /De-symmetrical Core|影|ombre|shadow|浅間石|Spat5/iu,
    ja: ["影の輪郭", "光の反射と屈折", "浅間石", "空間音響", "Spat5", "StreamDiffusion"],
    en: ["shadow contour", "light refraction", "Asama stone", "spatial audio", "Spat5", "StreamDiffusion"],
    fr: ["contour de l’ombre", "réfraction de la lumière", "pierre d’Asama", "audio spatial", "Spat5", "StreamDiffusion"],
  },
  {
    pattern: /liberated frequencies|脳波|EEG|RAVE|心地よさ|brain activit|activité cérébrale/iu,
    ja: ["脳波", "脳波計測", "心地よさ", "聴取", "フィールドレコーディング", "RAVE"],
    en: ["EEG", "brain activity", "perceived pleasantness", "field recordings", "RAVE"],
    fr: ["EEG", "activité cérébrale", "agrément perçu", "enregistrements de terrain", "RAVE"],
  },
  {
    pattern: /IRCAM|イルカム|Paola Palumbo|Guillaume Piccarreta|MoN Takanawa/iu,
    names: ["IRCAM Forum Workshops", "Philippe Esling", "Diemo Schwarz", "Spat5", "RAVE", "SKataRT", "MuBu", "Somax2"],
  },
  {
    pattern: manabe,
    names: ["Daito Manabe", "Rhizomatiks", "ELEVENPLAY", "MIKIKO", "Perfume", "electromyography", "motion capture", "brain organoid"],
  },
  {
    pattern: abe,
    names: ["Kazunao Abe", "YCAM", "Canon Artlab", "Seiko Mikami", "Teiji Furuhashi", "Ryoji Ikeda", "Desire of Codes"],
  },
  {
    pattern: yoshida,
    names: ["Keigo Yoshida", "Neuromusic Lab", "x-Music Lab", "Vail", "Latent Terrain", "Mineral Neurons", "Sónar+D", "Audio Buffer Tokyo"],
  },
];
const byEnglish = new Map(terms.map(entry => [entry.english, entry]));
const separator = "[\\s\\p{Pd}−·・._]*";
const latinOrDigit = "[\\p{Script=Latin}\\p{N}]";
const isLatinOrDigit = new RegExp(latinOrDigit, "u");
const cuts = /[\s\p{Pd}−·・._]+/u;

function printable(entry, language) {
  if (language === "ja") return entry.japanese;
  if (language === "fr") return entry.french;
  return entry.english;
}

function regexFor(alias, caseSensitive = false) {
  const parts = alias.split(cuts).filter(Boolean).map(part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const head = isLatinOrDigit.test(alias[0]) ? `(?<!${latinOrDigit})` : "";
  const dot = alias.endsWith("Inc.") ? "\\.?" : "";
  const tail = isLatinOrDigit.test(parts.at(-1).at(-1)) ? `(?!${latinOrDigit})` : "";
  return new RegExp(`${head}${parts.join(separator)}${tail}${dot}`, caseSensitive ? "gu" : "giu");
}

const patterns = terms.flatMap(entry => {
  const original = entry.nearOnly ? [] : [entry.english, entry.japanese, entry.french, ...entry.aliases];
  const exact = [...new Set(original)].map(alias => ({ entry, pattern: regexFor(alias, entry.near?.some(form => form === alias.toLowerCase())), near: false }));
  return exact.concat((entry.near ?? []).map(alias => ({ entry, pattern: regexFor(alias), near: true })));
});

function folded(text) {
  return text.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]/g, "");
}

const fuzzyTerms = terms.filter(entry => entry.fuzzy).map(entry => ({
  entry, words: entry.english.split(cuts).map(folded), value: folded(entry.english),
}));

function editDistance(left, right) {
  let row = Array.from({ length: right.length + 1 }, (_, i) => i);
  for (const [index, char] of [...left].entries()) {
    const next = [index + 1];
    for (let i = 0; i < right.length; i++) next.push(Math.min(row[i + 1] + 1, next[i] + 1, row[i] + (right[i] !== char)));
    row = next;
  }
  return row.at(-1);
}

function plausibleNearMatch(entry, text, start, end, prior) {
  const before = text.slice(Math.max(0, start - 48), start);
  const after = text.slice(end, end + 36);
  if (entry.venue) {
    return eventVenue.test(before) || /^(?:\s*(?:で開催|会場|ギャラリー|venue|gallery|galerie))|^\s*[（(](?:代官山|Daikanyama)/iu.test(after);
  }
  if (entry.english === "RAVE" || entry.english === "ACIDS") {
    return entry.context.test(`${before} ${after}`) || /^\s*(?:の)?(?:モデル|model\b|modèle\b|team\b|group\b|équipe\b)/iu.test(after);
  }
  if (entry.english === "De-symmetrical Core" && /^\s+(?:of|du|de la|des)\b/iu.test(after)) return false;
  const around = `${before} ${after} ${entry.localContextOnly ? "" : prior.slice(-150)}`;
  return entry.context?.test(around) ?? false;
}

function terminologyMatches(text, prior = "") {
  const searchable = text.replace(/[！-～]/gu, char => char.normalize("NFKC"));
  const hits = [];
  for (const { entry, pattern, near } of patterns) {
    for (const match of searchable.matchAll(pattern)) {
      const start = match.index;
      const end = start + match[0].length;
      if (!near || plausibleNearMatch(entry, text, start, end, prior)) hits.push({ entry, start, end, rank: near ? 2 : 3 });
    }
  }

  const words = [...searchable.matchAll(/[\p{Script=Latin}\p{M}0-9]+/gu)];
  for (const { entry, words: expected, value } of fuzzyTerms) {
    if (value.length < 9) continue;
    const maxEdits = value.length >= 15 ? 2 : 1;
    for (let i = 0; i + expected.length <= words.length; i++) {
      const window = words.slice(i, i + expected.length);
      const start = window[0].index;
      const end = window.at(-1).index + window.at(-1)[0].length;
      const spellings = window.map(word => folded(word[0]));
      if (!expected.some((word, j) => word.length >= 4 && word === spellings[j])) continue;
      if (/[.!?。,，、;；:/\d]/u.test(text.slice(start, end))) continue;
      if (text.slice(start, end).split(cuts).length !== window.length) continue;
      const candidate = spellings.join("");
      if (Math.abs(candidate.length - value.length) > maxEdits || editDistance(candidate, value) > maxEdits) continue;
      if (entry.context && !plausibleNearMatch(entry, text, start, end, prior)) continue;
      hits.push({ entry, start, end, rank: 1 });
    }
  }

  const matches = [];
  hits.sort((a, b) => b.rank - a.rank || (b.end - b.start) - (a.end - a.start) || a.start - b.start);
  for (const hit of hits) {
    if (!matches.some(match => hit.start < match.end && match.start < hit.end)) matches.push(hit);
  }
  return matches.sort((a, b) => a.start - b.start);
}

function substitute(text, matches, replacement) {
  let cursor = 0;
  let result = "";
  for (const [index, match] of matches.entries()) {
    result += text.slice(cursor, match.start) + replacement(match, index);
    cursor = match.end;
  }
  return result + text.slice(cursor);
}

export function correctTerminology(text, language, prior = "") {
  return substitute(text, terminologyMatches(text, prior), ({ entry, start, end, rank }) => {
    if (entry.localize === false && rank !== 2) return text.slice(start, end);
    const preferred = printable(entry, language);
    return preferred.endsWith(".") && text[end] === "." ? preferred.slice(0, -1) : preferred;
  });
}

export function isStandaloneTerm(text) {
  const cleaned = text.replace(/[\s.!?。！？]+$/u, "").trim();
  return terminologyMatches(cleaned).some(match => match.rank === 3 && match.start === 0 && match.end === cleaned.length);
}

export function terminologyHints(language, prior = "") {
  const recent = terminologyMatches(prior).map(({ entry }) => printable(entry, language));
  const topicLanguage = language === "auto" ? (/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(prior) ? "ja" : "en") : language;
  const theme = topicHints.filter(({ pattern }) => pattern.test(prior)).flatMap(topic =>
    topic.names ? topic.names.map(name => printable(byEnglish.get(name), topicLanguage)) : topic[topicLanguage]);
  const core = terms.filter(entry => preferredHints.includes(entry.english)).flatMap(entry => {
    return language === "auto" ? [entry.english, entry.japanese] : [printable(entry, language)];
  });
  return [...new Set([...recent, ...theme, ...core])].slice(0, 18).join(", ");
}

export function protectTerminology(text, target, prior = "") {
  const matches = terminologyMatches(text, prior).filter(match => match.entry.localize !== false);
  if (!matches.length) return { input: text, restore: translated => translated };

  let base = 627400;
  while (text.includes(String(base).slice(0, 4))) base += 100;
  const input = substitute(text, matches, (_, index) => `⟦${base + index}⟧`);
  const markers = /[⟦\[［【〔]\s*((?:[0-9０-９]\s*){6})[⟧\]］】〕]/gu;
  return {
    input,
    restore(translated) {
      const used = new Set();
      let duplicate = false;
      const result = translated.replace(markers, (marker, digits) => {
        const index = Number(digits.normalize("NFKC").replace(/\s/g, "")) - base;
        const match = matches[index];
        if (!match) return marker;
        if (used.has(index)) duplicate = true;
        used.add(index);
        return printable(match.entry, target);
      });
      return !duplicate && used.size === matches.length ? result : null;
    },
  };
}

// Vocabulary from the Dot Area credits, the FIL and IRCAM programs, and related media art.
const exhibition = /Dot Area|IRCAM|Ircam|イルカム|展覧会|展示|作品|公演|exhibit|installation|œuvre|exposition|conférence|workshop|forum|Spat\s*5/iu;
const spatial = /空間音響|音響空間|スピーカー|音響合成|spatial|spatialisation|surround|ambisonic|enceinte|speaker|Max\/MSP|IRCAM/iu;
const synthesis = /音響合成|音声合成|変換モデル|ニューラル|脳波|音響モデル|neural|synth[eèé]s|audio model|generative model|ACIDS|IRCAM/iu;
const signal = /計測|測定|電極|信号|ヘッドホン|RAVE|EEG|signal|electrode|casque|brainwave|brain activity/iu;
const eventVenue = /(?:会場|ギャラリー|会場協力|venue|gallery|galerie|lieu d[’']exposition)(?:\s*(?:is|called|est|s[’']appelle|[はがの・:：—-]))?\s*$/iu;
const filVenue = /Dot Area|Daikan[\s-]?yama|代官山|Daito Manabe|真鍋大度|Flying Tokyo|Audio Buffer Tokyo|Vibe Check One Two|filtokyo\.com/iu;
const ircamSoftware = /IRCAM|Forum|音響|作曲|ワークショップ|synthesis|sound design|audio|composition|plugin|plug-in|logiciel|synthèse/iu;
const manabe = /真鍋|Daito|Rhizomatiks|ライゾマ|ELEVENPLAY|MIKIKO|Reframe|リフレーム|振付|choreography|Japanese group/iu;
const abe = /阿部一直|Kazunao|YCAM|ワイカム|Artlab|アートラボ|三上晴子|Seiko Mikami|池田亮司|Ryoji Ikeda|キュレーション|curat/iu;
const yoshida = /吉田慧悟|Keigo|Dot Area|liberated frequencies|S[óo]nar|Future Frequencies|Audio Buffer Tokyo|作品名|work titled|installation titled|œuvre intitulée/iu;
const patching = /Max\/MSP|Cycling\s*['’]?\s*74|Jitter|Pure Data|パッチ|オブジェクト|patch(?:ing|er)?\b/iu;
const visualProgramming = /TouchDesigner|Derivative|CHOP|TOP node|OSC|[Cc]reative coding|クリエイティブコーディング|ノード|programmation visuelle/iu;
const clark = /Andy Clark|アンディ[・\s]?クラーク|cognition incarnée|embodied cognition|身体化された認知|拡張された心/iu;
const bataille = /Georges Bataille|ジョルジュ[・\s]?バタイユ|Georges[- ]Henri Luquet|Documents|ドキュマン/iu;

function term(english, aliases = [], options = {}) {
  return { english, japanese: options.ja ?? english, french: options.fr ?? english, aliases, ...options };
}

function mediaTerm(english, ja, fr, aliases = [], options = {}) {
  return term(english, aliases, { ja, fr, protect: false, ...options });
}

const terms = [
  term("IRCAM Forum", ["IR Kam Forum", "Ir Cam Forum", "Irkam Forum", "Air Cam Forum", "Ear Cam Forum", "Forum IRCAM", "Forum de l'IRCAM", "IRCAMフォーラム", "イルカムフォーラム", "アイアールカムフォーラム", "イルカムのフォーラム", "IRCAMのフォーラム"], { fr: "Forum de l’IRCAM" }),
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
  term("Keigo Yoshida", ["Yoshida Keigo", "吉田 慧悟", "吉田圭吾", "吉田慶吾", "吉田敬悟", "吉田京吾", "吉田 京吾", "吉田ケイゴ", "よしだけいご", "ヨシダケイゴ"], { ja: "吉田慧悟", fuzzy: true }),
  term("Daito Manabe", ["Manabe Daito", "Daitoh Manabe", "真鍋 大度", "真鍋大人", "真鍋大登", "まなべだいと", "マナベダイト"], {
    ja: "真鍋大度", fuzzy: true, near: ["ダイト"], context: /真鍋|Rhizomatiks|ライゾマ|ELEVENPLAY|MIKIKO|\bFIL\b/u,
  }),
  term("Kazunao Abe", ["Abe Kazunao", "阿部 一直", "阿部和直", "阿部一尚", "阿部カズナオ", "あべかずなお", "アベカズナオ"], { ja: "阿部一直", fuzzy: true }),
  term("Rinko Oka", ["Oka Rinko", "Rinco Oka", "岡 倫子", "岡凛子", "岡凜子", "岡りんこ", "おかりんこ", "オカリンコ", "りんこおか"], { ja: "岡倫子", fuzzy: true }),
  term("Mari Tomita", ["Tomita Mari", "Marie Tomita", "とみたまり", "トミタマリ"], { fuzzy: true }),
  term("Atsuya Tsuchida", ["Tsuchida Atsuya", "Atsuya Tuchida", "つちだあつや", "ツチダアツヤ"], { fuzzy: true }),
  term("Ryuji Murakawa", ["Murakawa Ryuji", "Ryūji Murakawa", "村川 龍司", "村川竜司", "むらかわりゅうじ", "ムラカワリュウジ"], { ja: "村川龍司", fuzzy: true }),
  term("Shinya Fujii", ["Fujii Shinya", "Shinya Fuji", "藤井 進也", "藤井真也", "ふじいしんや", "フジイシンヤ"], { ja: "藤井進也", fuzzy: true }),
  term("MUTEK.JP", ["Mutek JP", "MUTEK Japan", "ミューテックジェーピー", "ミューテック JP"]),
  term("MUTEK", ["ミューテック", "ミューテク"]),
  term("arsaffix Inc.", ["arsaffix", "arsaffix Inc", "arsaffix, Inc.", "アルサフィックス", "アーサフィックス", "アーサフィクス"]),
  term("Flying Tokyo 2024", ["フライング東京2024", "フライングトーキョー2024", "フライング東京二千二十四"]),
  term("FIL", [], { near: ["fil", "fill", "フィル", "エフアイエル"], venue: true, katakanaWord: true }),
  term("Spat5", ["SPAT 5", "Spat Five", "Spat Cinq", "スパット5", "スパットファイブ", "スパットファイヴ"], { near: ["Spot Five", "Spot 5", "スポットファイブ", "スポット5"], context: spatial }),
  term("RAVE", [], { near: ["rave", "レイヴ", "レイブ", "レーヴ"], context: synthesis }),
  term("AFTER", [], { exactCase: true, near: ["アフター"], context: /拡散モデル|拡散ベース|音響変換|ACIDS|diffusion model|modèle de diffusion/iu }),
  term("ACIDS", [], { near: ["acids", "アシッズ", "エーシーアイディーエス"], context: /IRCAM|Institut|音響合成|RAVE/iu }),
  term("Max/MSP", ["Max MSP", "Max-MSP", "マックスMSP", "マックスエムエスピー"]),
  term("StreamDiffusion", ["Stream Diffusion", "ストリームディフュージョン", "ストリーム・ディフュージョン"]),
  term("EEG", ["E E G", "イーイージー"]),
  term("EEG", [], { ja: "脳波", near: ["脳派", "脳破", "能波"], context: signal, nearOnly: true }),
  term("spatial audio", ["空間音響", "空間音響技術", "audio spatial", "son spatialisé"], { ja: "空間音響", fr: "audio spatial", near: ["空間音教", "空間音協"], context: spatial, localize: false }),
  term("desymmetrization", ["脱対称性", "dé-symétrisation", "désymétrisation"], { ja: "脱対称性", fr: "désymétrisation", near: ["脱対象性", "脱対照性"], context: exhibition, localize: false }),
  term("Asama stone", ["浅間石", "あさまいし", "アサマ石", "pierre d’Asama", "pierre d'Asama"], { ja: "浅間石", fr: "pierre d’Asama" }),
  term("Roger Caillois", ["ロジェ・カイヨワ", "ロジェカイヨワ", "ロジェカイヨア", "Roger Cayois", "Roger Caillou"], { ja: "ロジェ・カイヨワ", fuzzy: true }),
  term("Pierre Boulez", ["ピエール・ブーレーズ", "ピエールブーレーズ", "ピエール・ブレーズ", "Pierre Boullez"], { ja: "ピエール・ブーレーズ", fuzzy: true }),
  term("Georges Bataille", ["ジョルジュ・バタイユ", "ジョルジュバタイユ", "ジョルジュ・バタイーユ", "George Bataille"], { ja: "ジョルジュ・バタイユ", fuzzy: true }),
  term("Leonardo da Vinci", ["レオナルド・ダ・ヴィンチ", "レオナルドダヴィンチ", "レオナルドダビンチ", "Leonard de Vinci", "Léonard de Vinci"], { ja: "レオナルド・ダ・ヴィンチ", fr: "Léonard de Vinci", fuzzy: true }),
  term("Andy Clark", ["アンディ・クラーク", "アンディクラーク", "Andy Clarke"], { ja: "アンディ・クラーク", fuzzy: true }),
  term("Dynamics of Dissymmetry", ["Dynamics of Disymmetry", "Dynamics of De-symmetry", "ダイナミクスオブディシメトリー"]),
  term("Dialogue de l’ombre double", ["Dialogue de l'ombre double", "二重の影の対話", "二重の陰の対話", "ディアローグ・ドゥ・ロンブル・ドゥーブル"], { ja: "二重の影の対話" }),
  term("L’art primitif", ["ラールプリミティフ", "ラール・プリミティフ"], {
    near: ["l’art primitif", "l'art primitif", "primitive art", "原始芸術"], context: bataille, quoted: true,
  }),
  term("Being There", ["ビーイングゼア", "ビーイング・ゼア"], {
    near: ["being there", "現れる存在", "脳と身体と世界の再統合"], context: clark, quoted: true,
  }),
  term("Being There: Putting Brain, Body, and World Together Again", ["Being There Putting Brain Body and World Together Again"]),
  term("sfumato", ["スフマート", "スフマト", "sfumado", "sfoumatto"], { ja: "スフマート" }),
  term("chiaroscuro", ["キアロスクーロ", "明暗法", "clair-obscur"], { ja: "明暗法", fr: "clair-obscur" }),
  term("embodied cognition", ["身体化された認知", "身体化認知", "cognition incarnée", "cognition embodied"], { ja: "身体化された認知", fr: "cognition incarnée" }),
  term("extended mind", ["拡張された心", "拡張する心", "esprit étendu"], { ja: "拡張された心", fr: "esprit étendu", localize: false }),
  term("situated cognition", ["状況に埋め込まれた認知", "状況的認知", "cognition située"], { ja: "状況的認知", fr: "cognition située", localize: false }),
  term("Project to Support Emerging Media Arts Creators", ["メディア芸術クリエイター育成支援事業", "文化庁メディア芸術クリエイター育成支援事業", "メディア芸術クリエイター育成事業"], { ja: "メディア芸術クリエイター育成支援事業" }),
  term("Project to Support Emerging Media Arts Creators, 2026", ["Project to Support Emerging Media Arts Creators 2026", "2026年度メディア芸術クリエイター育成支援事業", "令和8年度文化庁メディア芸術クリエイター育成支援事業", "令和8年度メディア芸術クリエイター育成支援事業"], { ja: "2026年度メディア芸術クリエイター育成支援事業" }),
  term("production support", ["制作サポート", "制作支援", "soutien à la production"], { ja: "制作協力", fr: "soutien à la production", localize: false }),
  term("technical adviser", ["technical advisor", "技術アドバイザー", "技術顧問", "conseiller technique"], { ja: "技術アドバイザー", fr: "conseiller technique", localize: false }),
  term("technical direction", ["テクニカルディレクション", "技術監修", "direction technique"], { ja: "技術監修", fr: "direction technique", localize: false }),
  term("curatorial adviser", ["curatorial advisor", "キュラトリアル・アドバイザー", "conseiller curatorial"], { ja: "キュラトリアル・アドバイザー", fr: "conseiller curatorial", localize: false }),
  term("endorsement, cooperation and support", ["endorsement cooperation and support", "後援・協力・支援", "後援、協力、支援"], { ja: "後援・協力・支援", localize: false }),

  // FIL's public program and contributors.
  term("Flying Tokyo", ["フライング東京", "フライングトーキョー"]),
  term("Vibe Check One Two", ["Vibe Check 1 2", "Vibe Check One, Two", "バイブチェックワンツー", "ヴァイブチェックワンツー"]),
  term("RUNWAY Tokyo Gathering at FIL", ["Runway Tokyo Gathering at Fill", "ランウェイ東京ギャザリングアットフィル"]),
  term("Cristóbal Valenzuela", ["Cristobal Valenzuela", "クリストバル・バレンスエラ", "クリストバルバレンスエラ"], { fuzzy: true }),
  term("Zachary Lieberman", ["Zach Lieberman", "Zachary Liberman", "ザカリー・リーバーマン", "ザッカリー・リーバーマン", "ザックリーバーマン"], { fuzzy: true }),
  term("Samy Kamkar", ["Sammy Kamkar", "サミー・カムカー", "サミー・カムカール", "サミーカムカー"], { fuzzy: true }),
  term("Daikanyama", ["Daikan-yama", "Daikan Yama", "だいかんやま", "ダイカンヤマ"], { ja: "代官山" }),

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
  term("Rhizomatiks Research", ["Rhizomatics Research", "Rizomatiks Research", "ライゾマティクスリサーチ", "ライゾマティクス・リサーチ", "ライゾマリサーチ"]),
  term("Rhizomatiks", ["Rhizomatics", "Rizomatiks", "Rizomatics", "ライゾマティクス", "ライゾマティックス", "リゾマティクス", "ライゾマ"], { near: ["Rhizo", "Rhizoma", "リゾマ"], context: manabe, katakanaWord: true }),
  term("Motoi Ishibashi", ["Ishibashi Motoi", "石橋 素", "石橋もとい", "いしばしもとい", "イシバシモトイ"], { ja: "石橋素", fuzzy: true }),
  term("Abstract Engine", ["アブストラクトエンジン", "アブストラクト・エンジン"]),
  term("Rhizomatiks Multiplex", ["Rhizomatiks Multiplex Exhibition", "ライゾマティクスマルティプレックス", "ライゾマ展マルティプレックス"]),
  term("Continuum Resonance", ["連続する共鳴", "コンティニュアムレゾナンス", "コンティニューム・レゾナンス"], { fuzzy: true }),
  term("Rhizomatiks Beyond Perception", ["Rhizomatics Beyond Perception", "ライゾマティクスビヨンドパーセプション"]),
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

  // Media art, exhibition formats, and techniques.
  mediaTerm("media art", "メディアアート", "art médiatique", ["メディア・アート", "new media art"], { near: ["メディアート"], context: exhibition }),
  mediaTerm("digital art", "デジタルアート", "art numérique", ["デジタル・アート"]),
  mediaTerm("interactive art", "インタラクティブアート", "art interactif", ["インタラクティヴ・アート", "インタラクションアート"]),
  mediaTerm("generative art", "ジェネラティブアート", "art génératif", ["ジェネレーティブアート", "ジェネラティヴ・アート", "生成芸術"]),
  mediaTerm("algorithmic art", "アルゴリズムアート", "art algorithmique", ["アルゴリズミックアート"]),
  mediaTerm("kinetic art", "キネティックアート", "art cinétique", ["キネティック・アート"]),
  mediaTerm("sound art", "サウンドアート", "art sonore", ["サウンド・アート", "音響芸術"]),
  mediaTerm("video art", "ビデオアート", "art vidéo", ["映像芸術", "ヴィデオアート", "ヴィデオ・アート"]),
  mediaTerm("interactive installation", "インタラクティブ・インスタレーション", "installation interactive", ["インタラクティヴインスタレーション"]),
  mediaTerm("immersive installation", "没入型インスタレーション", "installation immersive", ["イマーシブインスタレーション", "没入型のインスタレーション"]),
  mediaTerm("sound installation", "サウンド・インスタレーション", "installation sonore", ["音響インスタレーション", "サウンドインスタレーション"]),
  mediaTerm("audiovisual installation", "音と映像のインスタレーション", "installation audiovisuelle", ["オーディオビジュアルインスタレーション", "AVインスタレーション", "audio visual installation"]),
  mediaTerm("audiovisual performance", "オーディオビジュアル・パフォーマンス", "performance audiovisuelle", ["音と映像のパフォーマンス", "AVパフォーマンス", "audiovisual live performance"]),
  mediaTerm("projection mapping", "プロジェクションマッピング", "vidéomapping", ["プロジェクション・マッピング", "映像マッピング", "vidéo mapping", "mapping vidéo"]),
  mediaTerm("creative coding", "クリエイティブコーディング", "creative coding", ["クリエイティヴコーディング", "codage créatif", "programmation créative"]),
  mediaTerm("live coding", "ライブコーディング", "live coding", ["ライヴコーディング", "codage en direct"]),
  mediaTerm("sonification", "ソニフィケーション", "sonification", ["ソニフィケイション"]),
  mediaTerm("data sonification", "データのソニフィケーション", "sonification des données", ["データソニフィケーション", "データの可聴化"]),
  mediaTerm("field recording", "フィールドレコーディング", "enregistrement de terrain", ["フィールド・レコーディング"]),
  mediaTerm("eye tracking", "アイトラッキング", "suivi du regard", ["視線追跡", "アイトラッキング技術", "oculométrie"]),
  mediaTerm("motion tracking", "モーショントラッキング", "suivi de mouvement", ["モーション・トラッキング"]),
  mediaTerm("spatialization", "音の空間化", "spatialisation sonore", ["spatialisation", "sound spatialization", "音響の空間化"]),
  mediaTerm("ambisonics", "アンビソニックス", "ambisonie", ["アンビソニック", "ambisonique"]),
  mediaTerm("binaural audio", "バイノーラル音響", "son binaural", ["バイノーラルオーディオ", "audio binaural", "バイノーラル録音"]),
  mediaTerm("soundscape", "サウンドスケープ", "paysage sonore", ["音風景"]),
  mediaTerm("robotic arm", "ロボットアーム", "bras robotisé", ["ロボティックアーム", "bras robotique"]),
  mediaTerm("diffusion model", "拡散モデル", "modèle de diffusion", ["ディフュージョンモデル", "ディフュージョン・モデル"]),
  mediaTerm("shader", "シェーダー", "shader", ["シェイダー", "シェーダ", "nuanceur"]),
  mediaTerm("point cloud", "点群", "nuage de points", ["点群データ", "ポイントクラウド"]),
  mediaTerm("generative AI", "生成AI", "IA générative", ["ジェネレーティブAI", "ジェネラティブAI"]),
  term("Spat", ["Spatialisateur"], { near: ["spat", "スパット"], context: spatial }),
  term("Max 9", ["Max Nine", "マックス9", "マックスナイン"]),
  term("Max", [], { near: ["マックス"], context: patching, nearOnly: true, localContextOnly: true }),
  term("Cycling ’74", ["Cycling 74", "Cycling '74", "サイクリングセブンティーフォー"]),
  term("TouchDesigner", ["Touch Designer", "タッチデザイナー", "タチデザ"], { near: ["TD", "ティーディー"], context: visualProgramming }),
  term("openFrameworks", ["open frameworks", "オープンフレームワークス"], { near: ["オーエフ"], context: visualProgramming }),
  term("p5.js", ["p 5 js", "p5 js", "ピーゴージェイエス", "ピーファイブジェイエス"]),
  term("Pure Data", ["ピュアデータ", "ピュア・データ"], { near: ["Pd", "ピーディー"], context: patching }),
  term("Open Sound Control", ["オープンサウンドコントロール"]),
  term("OSC", ["O S C", "オーエスシー", "オー・エス・シー"]),
  term("MIDI", ["M I D I", "ミディ"]),
  term("GLSL", ["G L S L", "ジーエルエスエル"]),
  term("Ableton Live", ["AbletonLive", "エイブルトンライブ", "エイブルトン・ライヴ"]),
  term("Ars Electronica", ["Ars Elektronika", "アルスエレクトロニカ", "アルス・エレクトロニカ"]),
  term("IAMAS", ["イアマス", "情報科学芸術大学院大学"], { ja: "IAMAS" }),
  term("Japan Media Arts Festival", ["文化庁メディア芸術祭", "メディア芸術祭"], { ja: "文化庁メディア芸術祭" }),
];

const preferredHints = ["IRCAM", "Dot Area", "De-symmetrical Core", "liberated frequencies", "Guillaume Piccarreta", "Paola Palumbo", "Keigo Yoshida", "Daito Manabe", "Kazunao Abe", "Spat5", "RAVE"];
const topicHints = [
  {
    pattern: /\bFIL\b|フィル(?:で|に|の|は)|Flying Tokyo|代官山|Daikanyama|Vibe Check One Two/u,
    names: ["FIL", "Flying Tokyo", "Audio Buffer Tokyo", "Vibe Check One Two", "Rhizomatiks", "Zachary Lieberman", "creative coding"],
  },
  {
    pattern: /メディア[・\s]?アート|クリエイティブコーディング|TouchDesigner|media art|art médiatique|creative coding|projection mapping/iu,
    names: ["media art", "interactive installation", "creative coding", "TouchDesigner", "projection mapping", "sonification", "spatialization"],
  },
  {
    pattern: /Caillois|カイヨワ|Boulez|ブーレーズ|Bataille|バタイユ|da Vinci|ダ[・\s]?ヴィンチ|sfumato|スフマート|Andy Clark|アンディ[・\s]?クラーク/iu,
    names: ["sfumato", "Dynamics of Dissymmetry", "Dialogue de l’ombre double", "L’art primitif", "Being There", "embodied cognition"],
  },
  {
    pattern: /De-symmetrical Core|影|ombre|shadow|浅間石|Spat5/iu,
    ja: ["影の輪郭", "光の反射と屈折", "浅間石", "空間音響", "Spat5", "StreamDiffusion"],
    en: ["shadow contour", "light refraction", "Asama stone", "spatial audio", "Spat5", "StreamDiffusion"],
    fr: ["contour de l’ombre", "réfraction de la lumière", "pierre d’Asama", "audio spatial", "Spat5", "StreamDiffusion"],
  },
  {
    pattern: /liberated frequencies|脳波|EEG|RAVE|心地よさ|brain activit|activité cérébrale/iu,
    ja: ["脳波", "脳波計測", "心地よさ", "聴取", "フィールドレコーディング", "RAVE", "AFTER"],
    en: ["EEG", "brain activity", "perceived pleasantness", "field recordings", "RAVE", "AFTER"],
    fr: ["EEG", "activité cérébrale", "agrément perçu", "enregistrements de terrain", "RAVE", "AFTER"],
  },
  {
    pattern: /IRCAM|イルカム|Paola Palumbo|Guillaume Piccarreta|MoN Takanawa/iu,
    names: ["IRCAM Forum Workshops", "Philippe Esling", "Diemo Schwarz", "Spat5", "RAVE", "SKataRT", "MuBu", "Somax2"],
  },
  {
    pattern: manabe,
    names: ["Daito Manabe", "Rhizomatiks", "Rhizomatiks Research", "Motoi Ishibashi", "ELEVENPLAY", "MIKIKO", "Perfume", "electromyography", "motion capture", "brain organoid"],
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

function regexFor(alias, caseSensitive = false, katakanaWord = false) {
  const parts = alias.split(cuts).filter(Boolean).map(part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const head = isLatinOrDigit.test(alias[0]) ? `(?<!${latinOrDigit})` : "";
  const dot = alias.endsWith("Inc.") ? "\\.?" : "";
  const shortKatakana = katakanaWord && /^[\p{Script=Katakana}ー]{1,5}$/u.test(alias);
  const tail = isLatinOrDigit.test(parts.at(-1).at(-1)) ? `(?!${latinOrDigit})` :
    (shortKatakana ? "(?![\\p{Script=Katakana}ー])" : "");
  return new RegExp(`${head}${parts.join(separator)}${tail}${dot}`, caseSensitive ? "gu" : "giu");
}

const patterns = terms.flatMap(entry => {
  const original = entry.nearOnly ? [] : [entry.english, entry.japanese, entry.french, ...entry.aliases];
  const exact = [...new Set(original)].map(alias => {
    const exactCase = entry.exactCase || entry.near?.includes(alias.toLowerCase());
    return { entry, pattern: regexFor(alias, exactCase, entry.katakanaWord), near: false };
  });
  return exact.concat((entry.near ?? []).map(alias => ({ entry, pattern: regexFor(alias, false, entry.katakanaWord), near: true })));
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

function isFilVenue(before, after, prior) {
  if (/^\s+(?:in|out|up|with|de|du|des|en)\b|^\s+d[’']/iu.test(after) &&
    !/^\s+in\s+(?:Tokyo|Daikanyama)\b/iu.test(after)) return false;
  if (eventVenue.test(before) || /^\s*(?:で(?:の)?(?:開催|展示|設営|公演|トーク|集合)|[（(]\s*(?:代官山|Daikanyama))/iu.test(after)) return true;
  const placePhrase = /(?:^|\s)(?:at|chez|au|à)\s*$/iu.test(before) || /^\s*(?:で|に|へ|から|の)/u.test(after);
  return placePhrase && filVenue.test(before + " " + after + " " + prior.slice(-150));
}

function plausibleNearMatch(entry, text, start, end, prior) {
  const before = text.slice(Math.max(0, start - 48), start);
  const after = text.slice(end, end + 36);
  if (entry.venue) {
    return isFilVenue(before, after, prior);
  }
  if (entry.english === "RAVE" || entry.english === "ACIDS") {
    return entry.context.test(`${before} ${after}`) || /^\s*(?:の)?(?:モデル|model\b|modèle\b|team\b|group\b|équipe\b)/iu.test(after);
  }
  if (entry.english === "De-symmetrical Core" && /^\s+(?:of|du|de la|des)\b/iu.test(after)) return false;
  if (entry.quoted && /[「『《«“"]\s*$/u.test(before) && /^\s*[」』》»”"]/u.test(after)) return true;
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

function renderTerms(text, language, matches) {
  return substitute(text, matches, ({ entry, start, end, rank }) => {
    if (entry.localize === false && rank !== 2) return text.slice(start, end);
    let preferred = printable(entry, language);
    if (entry.protect === false && /^\p{Lu}/u.test(text.slice(start)) && (start === 0 || /[.!?]\s*$/u.test(text.slice(0, start)))) {
      preferred = preferred[0].toLocaleUpperCase(language) + preferred.slice(1);
    }
    return preferred.endsWith(".") && text[end] === "." ? preferred.slice(0, -1) : preferred;
  });
}

export function correctTerminology(text, language, prior = "") {
  return renderTerms(text, language, terminologyMatches(text, prior));
}

export function isStandaloneTerm(text) {
  const cleaned = text.replace(/[\s.!?。！？]+$/u, "").trim();
  return terminologyMatches(cleaned).some(match => match.entry.protect !== false && match.rank === 3 && match.start === 0 && match.end === cleaned.length);
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

export function protectTerminology(text, source, target, prior = "") {
  const matches = terminologyMatches(text, prior).filter(({ entry }) => entry.localize !== false && entry.protect !== false);
  if (!matches.length) return null;

  const expected = new Map();
  for (const { entry } of matches) expected.set(entry, (expected.get(entry) ?? 0) + 1);

  let base = 627400;
  while (text.includes(String(base).slice(0, 4))) base += 100;
  // Keep the name in the input so the translator can use it to interpret the sentence.
  const input = substitute(text, matches, ({ entry }, index) => `[${printable(entry, source)} ${base + index}]`);
  const markers = /[⟦\[［【〔]([^⟦\[［【〔⟧\]］】〕\r\n]{1,144})[⟧\]］】〕]/gu;
  const markerId = /(?:^|\s)((?:[0-9０-９]\s*){6})$/u;
  return {
    input,
    correct(translated) {
      const recognized = terminologyMatches(translated, `${prior} ${text}`).filter(({ entry }) => expected.has(entry));
      const remaining = new Map(expected);
      for (const { entry } of recognized) remaining.set(entry, remaining.get(entry) - 1);
      return { text: renderTerms(translated, target, recognized), complete: [...remaining.values()].every(count => count <= 0) };
    },
    restore(translated) {
      const used = new Set();
      let duplicate = false;
      const result = translated.replace(markers, (marker, body) => {
        const digits = body.match(markerId)?.[1];
        if (!digits) return marker;
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

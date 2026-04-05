export type SlideType =
  | 'title'
  | 'sectionHeader'
  | 'bullets'
  | 'codeBlock'
  | 'table'
  | 'twoColumn'
  | 'quote';

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface CodeData {
  language: string;
  source: string;
}

export interface NarrationLine {
  speaker: 'A' | 'B'; // A=解説者, B=アシスタント
  text: string;
}

export interface SlideContent {
  title?: string;
  subtitle?: string;
  bullets?: string[];
  code?: CodeData;
  table?: TableData;
  leftColumn?: { heading: string; items: string[] };
  rightColumn?: { heading: string; items: string[] };
  quote?: string;
  author?: string;
  narration?: NarrationLine[];
}

export interface Slide {
  id: string;
  type: SlideType;
  section: number;
  durationInFrames: number;
  content: SlideContent;
  style?: {
    accentColor?: string;
  };
}

export const SLIDES: Slide[] = [
  // ========== Section 0: Title & Intro ==========
  {
    id: 'title',
    type: 'title',
    section: 0,
    durationInFrames: 540, // 18s
    content: {
      title: 'エージェント型開発環境における\n指示構造の再定義',
      subtitle: 'Claude Codeを核とした自律的ワークフローの構築と最適化',
      narration: [
        {speaker: 'A', text: 'こんにちは。今日はClaude Codeを中心としたエージェント型開発環境について、詳しく解説していきます。'},
        {speaker: 'B', text: 'よろしくお願いします！AIがコードを自律的に書く時代、どうやって制御するかがポイントですよね。'},
      ],
    },
  },
  {
    id: 'intro-overview',
    type: 'bullets',
    section: 0,
    durationInFrames: 1200, // 40s
    content: {
      title: '本動画の概要',
      bullets: [
        'AIエージェントは「コード補完」から「自律的エージェント」へ進化',
        'Claude Code：ターミナル直結型の自律エージェント',
        'CLAUDE.md による永続的プロジェクトメモリの構築',
        'Skills・Hooks・サブエージェントによる高度な制御体系',
        'コンテキスト・エンジニアリングと信頼性の担保',
      ],
      narration: [
        {speaker: 'A', text: '現代のAIは、単なるコード補完ツールから、コードベース全体を理解して自律的に開発を進めるエージェントへと進化しました。'},
        {speaker: 'B', text: 'Claude Codeはターミナルから直接操作できるんですよね。チャットUIとは全然違うアプローチです。'},
        {speaker: 'A', text: 'その通りです。そしてこのエージェントを最大限に活用するには、CLAUDE.mdという指示書の設計が極めて重要になります。'},
        {speaker: 'B', text: '今日はその設計方法から、Skills、Hooks、サブエージェントまで全部カバーするんですね。楽しみです！'},
      ],
    },
  },

  // ========== Section 1: CLAUDE.md & Hierarchy ==========
  {
    id: 'sec1-header',
    type: 'sectionHeader',
    section: 1,
    durationInFrames: 300, // 10s
    content: {
      title: 'CLAUDE.mdと階層構造',
      subtitle: 'プロジェクトメモリの設計論',
      narration: [
        {speaker: 'A', text: 'まず最初のテーマは、CLAUDE.mdファイルによるプロジェクトメモリの設計です。'},
      ],
    },
    style: {accentColor: '#3b82f6'},
  },
  {
    id: 'sec1-problem',
    type: 'bullets',
    section: 1,
    durationInFrames: 1200, // 40s
    content: {
      title: 'エージェントが直面する課題',
      bullets: [
        'セッションごとの「忘却」— 毎回同じ説明の繰り返し',
        'コンテキストの腐敗（Context Rot）— 長期対話での情報劣化',
        'CLAUDE.md = マークダウン形式の永続メモリファイル',
        'セッション開始時に自動読み込み → エージェントの「憲法」',
      ],
      narration: [
        {speaker: 'B', text: 'AIエージェントって、セッションが変わると全部忘れちゃいますよね。毎回同じことを説明するのが面倒で…'},
        {speaker: 'A', text: 'まさにそれが最大の課題です。セッションごとの忘却と、長い対話でコンテキストが劣化するContext Rotという問題があります。'},
        {speaker: 'B', text: 'CLAUDE.mdがその解決策なんですね？'},
        {speaker: 'A', text: 'はい。マークダウン形式の永続メモリファイルで、セッション開始時に自動的に読み込まれます。いわばエージェントの憲法のようなものです。'},
      ],
    },
  },
  {
    id: 'sec1-hierarchy',
    type: 'table',
    section: 1,
    durationInFrames: 1350, // 45s
    content: {
      title: '指示ファイルの階層と優先順位',
      table: {
        headers: ['スコープ', 'ファイルパス', '主な役割', '優先度'],
        rows: [
          ['グローバル', '~/.claude/CLAUDE.md', '個人の嗜好・命名規則・好みのライブラリ', '低'],
          ['プロジェクトルート', './CLAUDE.md', '技術スタック・ビルドコマンド・アーキテクチャ', '中'],
          ['サブディレクトリ', './[dir]/CLAUDE.md', 'モジュール固有の詳細ルール', '高'],
        ],
      },
      narration: [
        {speaker: 'B', text: '指示ファイルは一つだけじゃないんですか？'},
        {speaker: 'A', text: '実は3つの階層があります。ホームディレクトリのグローバル設定、プロジェクトルートの設定、そしてサブディレクトリごとの設定です。'},
        {speaker: 'B', text: 'サブディレクトリが一番優先度が高いんですね。モノレポだと便利そうです。'},
        {speaker: 'A', text: 'その通り。例えばグローバルでTypeScriptを指定しつつ、特定パッケージではVitestを使うといったオーバーライドが可能です。'},
      ],
    },
  },
  {
    id: 'sec1-init',
    type: 'bullets',
    section: 1,
    durationInFrames: 1200, // 40s
    content: {
      title: '指示書の初期化と反復的洗練',
      bullets: [
        '/init コマンドでリポジトリを走査し基礎的なCLAUDE.mdを自動生成',
        '依存関係・ディレクトリ構造・テストフレームワークを自動分析',
        '手動での洗練が不可欠：ドメイン固有の用語集・回避策(Gotchas)',
        '理想的な長さ：60〜80行（300行以内に収める）',
      ],
      narration: [
        {speaker: 'B', text: 'CLAUDE.mdを一から書くのは大変そうですが…'},
        {speaker: 'A', text: 'スラッシュinitコマンドを使えば、エージェントがリポジトリを走査して基礎的なファイルを自動生成してくれます。'},
        {speaker: 'B', text: 'でも、それだけでは不十分なんですよね？'},
        {speaker: 'A', text: 'はい。ドメイン固有の用語や、過去のバグの回避策など、コードだけでは推測できない情報を手動で追加する必要があります。理想的には60から80行程度に収めるのがベストです。'},
      ],
    },
  },

  // ========== Section 2: Instruction Design ==========
  {
    id: 'sec2-header',
    type: 'sectionHeader',
    section: 2,
    durationInFrames: 300, // 10s
    content: {
      title: '指示書の設計論',
      subtitle: 'CLAUDE.mdに含めるべき技術的構成要素',
      narration: [
        {speaker: 'A', text: '続いて、指示書に何を書くべきかという設計論に入ります。'},
      ],
    },
    style: {accentColor: '#8b5cf6'},
  },
  {
    id: 'sec2-elements',
    type: 'bullets',
    section: 2,
    durationInFrames: 1200, // 40s
    content: {
      title: '効果的な指示書の構成要素',
      bullets: [
        'プロジェクト概要：「何であり、何でないか」を一行で明示',
        '技術スタックの厳密な記述（バージョン含む）',
        '命名規則とコーディング規約（具体的・命令的に）',
        'ターミナルコマンドの網羅的な明文化',
      ],
      narration: [
        {speaker: 'A', text: '効果的な指示書には4つの構成要素があります。まずプロジェクト概要。「何であり、何でないか」を一行で明示することが重要です。'},
        {speaker: 'B', text: '例えば「Stripeを統合したNext.jsのEコマースアプリ」みたいな感じですか？'},
        {speaker: 'A', text: 'まさにそうです。そして技術スタックのバージョンも厳密に書きます。Next.js 14ならApp RouterかPages Routerかで全然違いますからね。'},
        {speaker: 'B', text: '命名規則やターミナルコマンドも明文化するんですね。エージェントが迷わないように。'},
      ],
    },
  },
  {
    id: 'sec2-conventions',
    type: 'table',
    section: 2,
    durationInFrames: 1350, // 45s
    content: {
      title: 'エージェント向けコーディング制約の具体例',
      table: {
        headers: ['カテゴリ', '指示内容', '理由'],
        rows: [
          ['変数・定数', 'グローバル定数はUPPER_CASE、変数はcamelCase', 'コードの一貫性と可読性'],
          ['エクスポート', 'デフォルトエクスポート禁止 → 名前付きエクスポート', 'リファクタリングの容易さ'],
          ['非同期処理', '.then()禁止 → async/await使用', 'エラーハンドリングの標準化'],
          ['型定義', 'any型の使用を禁止', '型安全性の最大化'],
        ],
      },
      narration: [
        {speaker: 'B', text: '具体的にはどんな制約を書けばいいんですか？'},
        {speaker: 'A', text: 'ここにいくつか例があります。例えば「綺麗なコードを書いて」ではなく、「グローバル定数はアッパーケース、変数はキャメルケース」と具体的に指示します。'},
        {speaker: 'B', text: 'デフォルトエクスポートの禁止は面白いですね。'},
        {speaker: 'A', text: 'はい。名前付きエクスポートを強制することで、リファクタリングが容易になり、検索性も向上します。非同期処理もasync awaitに統一するのが推奨です。'},
      ],
    },
  },

  // ========== Section 3: Skills System ==========
  {
    id: 'sec3-header',
    type: 'sectionHeader',
    section: 3,
    durationInFrames: 300, // 10s
    content: {
      title: 'Skillsシステム',
      subtitle: '専門知識のパッケージ化と動的拡張',
      narration: [
        {speaker: 'A', text: '次はSkillsシステムです。専門知識をモジュール化する仕組みを見ていきましょう。'},
      ],
    },
    style: {accentColor: '#10b981'},
  },
  {
    id: 'sec3-loading',
    type: 'bullets',
    section: 3,
    durationInFrames: 1200, // 40s
    content: {
      title: 'SKILL.mdの三段階読み込みモデル',
      bullets: [
        '第一階層：メタデータ（YAMLフロントマター）— セマンティック検索の対象',
        '第二階層：命令本体（Markdown）— ステップバイステップのプレイブック',
        '第三階層：関連ファイル — scripts/・assets/の追加リソース',
        'トークン消費効率を最大化する階層的読み込み',
      ],
      narration: [
        {speaker: 'B', text: 'Skillsって、CLAUDE.mdとは何が違うんですか？'},
        {speaker: 'A', text: 'CLAUDE.mdがリポジトリ全体の文脈を提供するのに対して、Skillsは特定のタスクに特化した専門知識のモジュールです。三段階で読み込まれます。'},
        {speaker: 'B', text: '三段階に分かれているのはなぜですか？'},
        {speaker: 'A', text: 'トークン消費の効率化です。まずメタデータだけ読んで関連性を判断し、必要な時だけ本文を読み込む。これで無駄なトークン消費を防げます。'},
      ],
    },
  },
  {
    id: 'sec3-metadata',
    type: 'table',
    section: 3,
    durationInFrames: 1200, // 40s
    content: {
      title: 'スキルメタデータの構成フィールド',
      table: {
        headers: ['フィールド', '必須', '機能'],
        rows: [
          ['name', '必須', 'スラッシュコマンド（/explain-code）として使用される識別子'],
          ['description', '必須', 'エージェントがスキル適用可否を判断するトリガー説明文'],
          ['disable-model-invocation', '任意', 'trueで自動呼び出し禁止（デプロイ等の破壊的操作に有効）'],
          ['context: fork', '任意', '別個のサブエージェントコンテキストで実行'],
        ],
      },
      narration: [
        {speaker: 'A', text: 'スキルのメタデータには、名前と説明が必須です。nameフィールドはスラッシュコマンドとして使われます。'},
        {speaker: 'B', text: 'disable-model-invocationというのは？'},
        {speaker: 'A', text: 'これをtrueにすると、エージェントが勝手にスキルを呼び出せなくなります。デプロイのような破壊的な操作に設定すると安全です。'},
        {speaker: 'B', text: 'context forkは？'},
        {speaker: 'A', text: '別個のサブエージェントで実行するオプションです。メインセッションのコンテキストを汚さずに済みます。'},
      ],
    },
  },

  // ========== Section 4: Hooks System ==========
  {
    id: 'sec4-header',
    type: 'sectionHeader',
    section: 4,
    durationInFrames: 300, // 10s
    content: {
      title: 'Hooksシステム',
      subtitle: '決定論的制御と品質ゲートの実装',
      narration: [
        {speaker: 'A', text: '次はHooksシステム。確率的なAIに決定論的な制御を加える仕組みです。'},
      ],
    },
    style: {accentColor: '#f59e0b'},
  },
  {
    id: 'sec4-events',
    type: 'table',
    section: 4,
    durationInFrames: 1350, // 45s
    content: {
      title: '主要なHookイベントと活用例',
      table: {
        headers: ['イベント名', '実行タイミング', '推奨シナリオ'],
        rows: [
          ['SessionStart', 'セッション開始/再開時', 'Gitログ読み込み・依存関係チェック'],
          ['PreToolUse', 'ツール実行直前', '破壊的コマンドのブロック・機密ファイルアクセス拒否'],
          ['PostToolUse', 'ツール実行成功直後', 'Prettierによる自動整形・ユニットテスト実行'],
          ['UserPromptSubmit', 'プロンプト送信直後', 'メタデータ付加・セキュリティスキャン'],
          ['Stop', 'エージェント応答完了時', '作業要約作成・CLAUDE.mdへの学習事項書き込み'],
        ],
      },
      narration: [
        {speaker: 'B', text: 'Hooksって、Gitフックみたいなものですか？'},
        {speaker: 'A', text: '似た概念です。Claude Codeは23以上のライフサイクルイベントをサポートしていて、各イベントに自動処理を挟み込めます。'},
        {speaker: 'B', text: 'PreToolUseが面白いですね。rm -rfみたいな危険なコマンドをブロックできる。'},
        {speaker: 'A', text: 'はい。PostToolUseではファイル保存後にPrettierを自動実行したり、Stopイベントで作業内容をCLAUDE.mdに自動記録することもできます。'},
      ],
    },
  },
  {
    id: 'sec4-prettier',
    type: 'codeBlock',
    section: 4,
    durationInFrames: 1050, // 35s
    content: {
      title: '自動整形Hookの実装パターン',
      code: {
        language: 'json',
        source: `{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "npx prettier --write $FILE"
      }
    ]
  }
}`,
      },
      narration: [
        {speaker: 'A', text: 'こちらが最も一般的なHookの実装例です。PostToolUseイベントで、WriteまたはEdit操作の後にPrettierを自動実行します。'},
        {speaker: 'B', text: 'これなら、エージェントがインデントやセミコロンの配置に悩む必要がなくなりますね。'},
        {speaker: 'A', text: 'その通り。エージェントは純粋なロジック構築に集中でき、整形はHooksが自動的に行ってくれます。'},
      ],
    },
  },

  // ========== Section 5: Remotion Optimization ==========
  {
    id: 'sec5-header',
    type: 'sectionHeader',
    section: 5,
    durationInFrames: 300, // 10s
    content: {
      title: 'Remotionフレームワーク最適化',
      subtitle: 'フレームベースのアニメーション規約',
      narration: [
        {speaker: 'A', text: '続いて、Remotionフレームワークにおけるアニメーションの規約です。'},
      ],
    },
    style: {accentColor: '#ef4444'},
  },
  {
    id: 'sec5-rules',
    type: 'twoColumn',
    section: 5,
    durationInFrames: 1200, // 40s
    content: {
      title: 'Remotionにおけるコード生成規約',
      leftColumn: {
        heading: '禁止事項',
        items: [
          'CSS Transition / Animation',
          'Tailwindアニメーションクラス',
          '標準の Date.now()',
          'setTimeout / setInterval',
        ],
      },
      rightColumn: {
        heading: '推奨事項',
        items: [
          'interpolate() フック',
          'spring() 関数',
          'useCurrentFrame()',
          'Sequence + Series',
        ],
      },
      narration: [
        {speaker: 'B', text: 'Remotionって普通のReactと何が違うんですか？'},
        {speaker: 'A', text: '最大の違いはフレームベースの決定論的レンダリングです。CSSアニメーションやsetTimeoutは使えません。ブラウザのクロックに依存するからです。'},
        {speaker: 'B', text: '代わりにinterpolateやspringを使うんですね。'},
        {speaker: 'A', text: 'はい。すべてのアニメーションはフレーム番号に厳密に束縛される必要があります。これがRemotionの鉄則です。'},
      ],
    },
  },
  {
    id: 'sec5-code',
    type: 'codeBlock',
    section: 5,
    durationInFrames: 1050, // 35s
    content: {
      title: 'フレームベースのアニメーション例',
      code: {
        language: 'tsx',
        source: `const frame = useCurrentFrame();
const opacity = interpolate(
  frame, [0, 30], [0, 1],
  { extrapolateRight: 'clamp' }
);
const scale = spring({
  frame, fps: 30,
  config: { damping: 12 }
});`,
      },
      narration: [
        {speaker: 'A', text: 'こちらが実際のコード例です。useCurrentFrameで現在のフレーム番号を取得し、interpolateで不透明度を制御します。'},
        {speaker: 'B', text: 'springは物理演算ベースのイージングですか？'},
        {speaker: 'A', text: 'その通りです。dampingパラメータで跳ね返りの強さを調整できます。フレーム間で一貫した結果が得られるのがポイントです。'},
      ],
    },
  },

  // ========== Section 6: Sub-agents & Teams ==========
  {
    id: 'sec6-header',
    type: 'sectionHeader',
    section: 6,
    durationInFrames: 300, // 10s
    content: {
      title: 'サブエージェントと\nチームオーケストレーション',
      subtitle: 'コンテキスト汚染の解決策',
      narration: [
        {speaker: 'A', text: '次はサブエージェントとチームオーケストレーションについて解説します。'},
      ],
    },
    style: {accentColor: '#06b6d4'},
  },
  {
    id: 'sec6-subagent',
    type: 'bullets',
    section: 6,
    durationInFrames: 1200, // 40s
    content: {
      title: 'サブエージェントによるタスク分離',
      bullets: [
        'メインの会話とは独立したコンテキストウィンドウ',
        'セキュリティ監査等の大量コード読み取りを委任',
        'メインスレッドは清潔な状態を保持',
        '監査結果のみを受け取る効率的な設計',
      ],
      narration: [
        {speaker: 'B', text: 'コンテキストが大きくなりすぎると問題になるんですか？'},
        {speaker: 'A', text: 'はい。何百ものファイルを走査するリサーチ作業をメインスレッドで行うと、コンテキストが汚染されて推論の質が下がります。'},
        {speaker: 'B', text: 'サブエージェントはそれを解決するんですね。'},
        {speaker: 'A', text: 'その通り。独立したコンテキストウィンドウで作業して、結果だけをメインスレッドに返します。メインは常に清潔な状態を保てます。'},
      ],
    },
  },
  {
    id: 'sec6-team',
    type: 'table',
    section: 6,
    durationInFrames: 1200, // 40s
    content: {
      title: 'エージェントチームの役割分担',
      table: {
        headers: ['役割', '責任範囲'],
        rows: [
          ['チームリード', 'ワークフロー調整・タスク割り当て・結果統合'],
          ['特化型メンバー', 'リサーチ・実装・テスト作成の完遂'],
          ['タスクリスト', '~/.claude/tasks/ に保存される共有状態'],
        ],
      },
      narration: [
        {speaker: 'B', text: 'エージェントチームというのは、複数のAIが協力するということですか？'},
        {speaker: 'A', text: 'はい。チームリードが全体を調整し、特化型メンバーがリサーチや実装を担当します。タスクリストで進捗を共有します。'},
        {speaker: 'B', text: 'ただし、5人を超えるとパフォーマンスが落ちるんでしたよね。'},
        {speaker: 'A', text: 'その通りです。協調コストがアウトプットの質を上回る収穫逓減が発生します。必要な時だけ使うのが鉄則です。'},
      ],
    },
  },

  // ========== Section 7: Context Engineering (WISC) ==========
  {
    id: 'sec7-header',
    type: 'sectionHeader',
    section: 7,
    durationInFrames: 300, // 10s
    content: {
      title: 'コンテキスト・エンジニアリング',
      subtitle: 'WISCフレームワーク',
      narration: [
        {speaker: 'A', text: '次はコンテキスト・エンジニアリング。WISCフレームワークについて解説します。'},
      ],
    },
    style: {accentColor: '#a855f7'},
  },
  {
    id: 'sec7-wisc',
    type: 'bullets',
    section: 7,
    durationInFrames: 1500, // 50s
    content: {
      title: 'WISCフレームワークの四原則',
      bullets: [
        'Write：重要な決定事項を常にディスク上のファイルに書き出す',
        'Isolate：調査フェーズと実装フェーズでセッションを分離',
        'Select：@シンボルで特定のファイルのみを参照（ノイズ最小化）',
        'Compress：/compact で過去の対話を要約・圧縮して保持',
      ],
      narration: [
        {speaker: 'B', text: 'WISCって何の略ですか？'},
        {speaker: 'A', text: 'Write、Isolate、Select、Compressの頭文字です。まずWriteは、重要な決定事項をメモリではなく必ずファイルに書き出すこと。'},
        {speaker: 'B', text: 'Isolateはセッションを分けるということですね。'},
        {speaker: 'A', text: 'はい。調査フェーズの大量データが実装時の推論を邪魔しないようにします。Selectは@シンボルで必要なファイルだけ参照し、Compressはcompactコマンドで対話を圧縮します。'},
        {speaker: 'B', text: '情報を戦略的に管理するということですね。なるほど。'},
      ],
    },
  },

  // ========== Section 8: Reliability ==========
  {
    id: 'sec8-header',
    type: 'sectionHeader',
    section: 8,
    durationInFrames: 300, // 10s
    content: {
      title: '信頼性の担保',
      subtitle: 'ハルシネーションの抑制',
      narration: [
        {speaker: 'A', text: '最後のテーマは、AIエージェントの信頼性をどう担保するかです。'},
      ],
    },
    style: {accentColor: '#ec4899'},
  },
  {
    id: 'sec8-verification',
    type: 'bullets',
    section: 8,
    durationInFrames: 1500, // 50s
    content: {
      title: '決定論的検証と敵対的レビュー',
      bullets: [
        '第一段階：物理的検証 — Hooksでユニットテスト・リンターを強制実行',
        '第二段階：敵対的エージェント査読 — 「3つの問題点を見つけよ」',
        'グラウンディング：推測を明示的に禁止し「不明」と回答させる',
        'JSON形式出力で自由な言語生成を抑制しスキーマ範囲内に制限',
      ],
      narration: [
        {speaker: 'B', text: 'AIのハルシネーション、つまり嘘をつく問題はどう対処するんですか？'},
        {speaker: 'A', text: '二段階の検証を行います。まず物理的検証として、Hooksでユニットテストとリンターを強制実行します。'},
        {speaker: 'B', text: '敵対的エージェント査読というのは？'},
        {speaker: 'A', text: '修正を行ったエージェントとは別のレビュアーエージェントに「少なくとも3つの問題点を見つけよ」という敵対的なプロンプトを与えます。これでお互いの忖度を防ぎます。'},
        {speaker: 'B', text: 'グラウンディングも重要ですよね。推測せず「不明」と答えさせる。'},
      ],
    },
  },

  // ========== Section 9: Conclusion ==========
  {
    id: 'sec9-header',
    type: 'sectionHeader',
    section: 9,
    durationInFrames: 300, // 10s
    content: {
      title: '戦略的結論',
      subtitle: '人間とエージェントの協調モデル',
      narration: [
        {speaker: 'A', text: 'それでは最後に、まとめと今後の展望です。'},
      ],
    },
    style: {accentColor: '#3b82f6'},
  },
  {
    id: 'sec9-conclusion',
    type: 'bullets',
    section: 9,
    durationInFrames: 1500, // 50s
    content: {
      title: '新しいパラダイムの鍵',
      bullets: [
        '開発者は「コードを書く人」から「指示書を設計する人」へシフト',
        'エージェントのミス = 指示書の欠陥 → CLAUDE.mdに即座に明文化',
        '自己改善ループでCLAUDE.mdは「生きた資産」へと進化',
        'MCP + Hooks + Skills = AIエージェントは真のパートナーへ',
      ],
      narration: [
        {speaker: 'A', text: 'Claude Codeを核とした開発環境は、ソフトウェア開発の文化そのものを変革します。開発者はコードを書く人から、指示書を設計する人へとシフトしていきます。'},
        {speaker: 'B', text: 'エージェントのミスは指示書の欠陥として捉えるんですよね。'},
        {speaker: 'A', text: 'はい。ミスが起きたら即座にCLAUDE.mdに明文化してコミットする。この自己改善ループが回ることで、CLAUDE.mdは生きた資産へと進化します。'},
        {speaker: 'B', text: 'MCPやHooksと組み合わさることで、AIは真のパートナーになるということですね。'},
      ],
    },
  },
  {
    id: 'ending',
    type: 'title',
    section: 9,
    durationInFrames: 540, // 18s
    content: {
      title: 'ご視聴ありがとうございました',
      subtitle: 'Claude Code — エージェント型開発の未来',
      narration: [
        {speaker: 'A', text: '以上で本動画の解説は終わりです。ご視聴ありがとうございました。'},
        {speaker: 'B', text: 'ありがとうございました！チャンネル登録もよろしくお願いします。'},
      ],
    },
  },
];

export const TOTAL_FRAMES = SLIDES.reduce(
  (sum, s) => sum + s.durationInFrames,
  0,
);

export const TOTAL_SECTIONS = 10; // 0-9

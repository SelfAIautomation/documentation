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
    durationInFrames: 300, // 10s
    content: {
      title: 'エージェント型開発環境における\n指示構造の再定義',
      subtitle:
        'Claude Codeを核とした自律的ワークフローの構築と最適化',
    },
  },
  {
    id: 'intro-overview',
    type: 'bullets',
    section: 0,
    durationInFrames: 600, // 20s
    content: {
      title: '本動画の概要',
      bullets: [
        'AIエージェントは「コード補完」から「自律的エージェント」へ進化',
        'Claude Code：ターミナル直結型の自律エージェント',
        'CLAUDE.md による永続的プロジェクトメモリの構築',
        'Skills・Hooks・サブエージェントによる高度な制御体系',
        'コンテキスト・エンジニアリングと信頼性の担保',
      ],
    },
  },

  // ========== Section 1: CLAUDE.md & Hierarchy ==========
  {
    id: 'sec1-header',
    type: 'sectionHeader',
    section: 1,
    durationInFrames: 180, // 6s
    content: {
      title: 'CLAUDE.mdと階層構造',
      subtitle: 'プロジェクトメモリの設計論',
    },
    style: { accentColor: '#3b82f6' },
  },
  {
    id: 'sec1-problem',
    type: 'bullets',
    section: 1,
    durationInFrames: 600, // 20s
    content: {
      title: 'エージェントが直面する課題',
      bullets: [
        'セッションごとの「忘却」— 毎回同じ説明の繰り返し',
        'コンテキストの腐敗（Context Rot）— 長期対話での情報劣化',
        'CLAUDE.md = マークダウン形式の永続メモリファイル',
        'セッション開始時に自動読み込み → エージェントの「憲法」',
      ],
    },
  },
  {
    id: 'sec1-hierarchy',
    type: 'table',
    section: 1,
    durationInFrames: 750, // 25s
    content: {
      title: '指示ファイルの階層と優先順位',
      table: {
        headers: ['スコープ', 'ファイルパス', '主な役割', '優先度'],
        rows: [
          [
            'グローバル',
            '~/.claude/CLAUDE.md',
            '個人の嗜好・命名規則・好みのライブラリ',
            '低',
          ],
          [
            'プロジェクトルート',
            './CLAUDE.md',
            '技術スタック・ビルドコマンド・アーキテクチャ',
            '中',
          ],
          [
            'サブディレクトリ',
            './[dir]/CLAUDE.md',
            'モジュール固有の詳細ルール',
            '高',
          ],
        ],
      },
    },
  },
  {
    id: 'sec1-init',
    type: 'bullets',
    section: 1,
    durationInFrames: 600, // 20s
    content: {
      title: '指示書の初期化と反復的洗練',
      bullets: [
        '/init コマンドでリポジトリを走査し基礎的なCLAUDE.mdを自動生成',
        '依存関係・ディレクトリ構造・テストフレームワークを自動分析',
        '手動での洗練が不可欠：ドメイン固有の用語集・回避策(Gotchas)',
        '理想的な長さ：60〜80行（300行以内に収める）',
      ],
    },
  },

  // ========== Section 2: Instruction Design ==========
  {
    id: 'sec2-header',
    type: 'sectionHeader',
    section: 2,
    durationInFrames: 180, // 6s
    content: {
      title: '指示書の設計論',
      subtitle: 'CLAUDE.mdに含めるべき技術的構成要素',
    },
    style: { accentColor: '#8b5cf6' },
  },
  {
    id: 'sec2-elements',
    type: 'bullets',
    section: 2,
    durationInFrames: 600, // 20s
    content: {
      title: '効果的な指示書の構成要素',
      bullets: [
        'プロジェクト概要：「何であり、何でないか」を一行で明示',
        '技術スタックの厳密な記述（バージョン含む）',
        '命名規則とコーディング規約（具体的・命令的に）',
        'ターミナルコマンドの網羅的な明文化',
      ],
    },
  },
  {
    id: 'sec2-conventions',
    type: 'table',
    section: 2,
    durationInFrames: 750, // 25s
    content: {
      title: 'エージェント向けコーディング制約の具体例',
      table: {
        headers: ['カテゴリ', '指示内容', '理由'],
        rows: [
          [
            '変数・定数',
            'グローバル定数はUPPER_CASE、変数はcamelCase',
            'コードの一貫性と可読性',
          ],
          [
            'エクスポート',
            'デフォルトエクスポート禁止 → 名前付きエクスポート',
            'リファクタリングの容易さ',
          ],
          [
            '非同期処理',
            '.then()禁止 → async/await使用',
            'エラーハンドリングの標準化',
          ],
          ['型定義', 'any型の使用を禁止', '型安全性の最大化'],
        ],
      },
    },
  },

  // ========== Section 3: Skills System ==========
  {
    id: 'sec3-header',
    type: 'sectionHeader',
    section: 3,
    durationInFrames: 180, // 6s
    content: {
      title: 'Skillsシステム',
      subtitle: '専門知識のパッケージ化と動的拡張',
    },
    style: { accentColor: '#10b981' },
  },
  {
    id: 'sec3-loading',
    type: 'bullets',
    section: 3,
    durationInFrames: 750, // 25s
    content: {
      title: 'SKILL.mdの三段階読み込みモデル',
      bullets: [
        '第一階層：メタデータ（YAMLフロントマター）— セマンティック検索の対象',
        '第二階層：命令本体（Markdown）— ステップバイステップのプレイブック',
        '第三階層：関連ファイル — scripts/・assets/の追加リソース',
        'トークン消費効率を最大化する階層的読み込み',
      ],
    },
  },
  {
    id: 'sec3-metadata',
    type: 'table',
    section: 3,
    durationInFrames: 600, // 20s
    content: {
      title: 'スキルメタデータの構成フィールド',
      table: {
        headers: ['フィールド', '必須', '機能'],
        rows: [
          ['name', '必須', 'スラッシュコマンド（/explain-code）として使用される識別子'],
          ['description', '必須', 'エージェントがスキル適用可否を判断するトリガー説明文'],
          [
            'disable-model-invocation',
            '任意',
            'trueで自動呼び出し禁止（デプロイ等の破壊的操作に有効）',
          ],
          [
            'context: fork',
            '任意',
            '別個のサブエージェントコンテキストで実行',
          ],
        ],
      },
    },
  },

  // ========== Section 4: Hooks System ==========
  {
    id: 'sec4-header',
    type: 'sectionHeader',
    section: 4,
    durationInFrames: 180, // 6s
    content: {
      title: 'Hooksシステム',
      subtitle: '決定論的制御と品質ゲートの実装',
    },
    style: { accentColor: '#f59e0b' },
  },
  {
    id: 'sec4-events',
    type: 'table',
    section: 4,
    durationInFrames: 750, // 25s
    content: {
      title: '主要なHookイベントと活用例',
      table: {
        headers: ['イベント名', '実行タイミング', '推奨シナリオ'],
        rows: [
          ['SessionStart', 'セッション開始/再開時', 'Gitログ読み込み・依存関係チェック'],
          [
            'PreToolUse',
            'ツール実行直前',
            '破壊的コマンドのブロック・機密ファイルアクセス拒否',
          ],
          [
            'PostToolUse',
            'ツール実行成功直後',
            'Prettierによる自動整形・ユニットテスト実行',
          ],
          [
            'UserPromptSubmit',
            'プロンプト送信直後',
            'メタデータ付加・セキュリティスキャン',
          ],
          [
            'Stop',
            'エージェント応答完了時',
            '作業要約作成・CLAUDE.mdへの学習事項書き込み',
          ],
        ],
      },
    },
  },
  {
    id: 'sec4-prettier',
    type: 'codeBlock',
    section: 4,
    durationInFrames: 600, // 20s
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
    },
  },

  // ========== Section 5: Remotion Optimization ==========
  {
    id: 'sec5-header',
    type: 'sectionHeader',
    section: 5,
    durationInFrames: 180, // 6s
    content: {
      title: 'Remotionフレームワーク最適化',
      subtitle: 'フレームベースのアニメーション規約',
    },
    style: { accentColor: '#ef4444' },
  },
  {
    id: 'sec5-rules',
    type: 'twoColumn',
    section: 5,
    durationInFrames: 750, // 25s
    content: {
      title: 'Remotionにおけるコード生成規約',
      leftColumn: {
        heading: '❌ 禁止事項',
        items: [
          'CSS Transition / Animation',
          'Tailwindアニメーションクラス',
          '標準の Date.now()',
          'setTimeout / setInterval',
        ],
      },
      rightColumn: {
        heading: '✅ 推奨事項',
        items: [
          'interpolate() フック',
          'spring() 関数',
          'useCurrentFrame()',
          'Sequence + Series',
        ],
      },
    },
  },
  {
    id: 'sec5-code',
    type: 'codeBlock',
    section: 5,
    durationInFrames: 600, // 20s
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
    },
  },

  // ========== Section 6: Sub-agents & Teams ==========
  {
    id: 'sec6-header',
    type: 'sectionHeader',
    section: 6,
    durationInFrames: 180, // 6s
    content: {
      title: 'サブエージェントと\nチームオーケストレーション',
      subtitle: 'コンテキスト汚染の解決策',
    },
    style: { accentColor: '#06b6d4' },
  },
  {
    id: 'sec6-subagent',
    type: 'bullets',
    section: 6,
    durationInFrames: 600, // 20s
    content: {
      title: 'サブエージェントによるタスク分離',
      bullets: [
        'メインの会話とは独立したコンテキストウィンドウ',
        'セキュリティ監査等の大量コード読み取りを委任',
        'メインスレッドは清潔な状態を保持',
        '監査結果のみを受け取る効率的な設計',
      ],
    },
  },
  {
    id: 'sec6-team',
    type: 'table',
    section: 6,
    durationInFrames: 600, // 20s
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
    },
  },

  // ========== Section 7: Context Engineering (WISC) ==========
  {
    id: 'sec7-header',
    type: 'sectionHeader',
    section: 7,
    durationInFrames: 180, // 6s
    content: {
      title: 'コンテキスト・エンジニアリング',
      subtitle: 'WISCフレームワーク',
    },
    style: { accentColor: '#a855f7' },
  },
  {
    id: 'sec7-wisc',
    type: 'bullets',
    section: 7,
    durationInFrames: 750, // 25s
    content: {
      title: 'WISCフレームワークの四原則',
      bullets: [
        'Write：重要な決定事項を常にディスク上のファイルに書き出す',
        'Isolate：調査フェーズと実装フェーズでセッションを分離',
        'Select：@シンボルで特定のファイルのみを参照（ノイズ最小化）',
        'Compress：/compact で過去の対話を要約・圧縮して保持',
      ],
    },
  },

  // ========== Section 8: Reliability ==========
  {
    id: 'sec8-header',
    type: 'sectionHeader',
    section: 8,
    durationInFrames: 180, // 6s
    content: {
      title: '信頼性の担保',
      subtitle: 'ハルシネーションの抑制',
    },
    style: { accentColor: '#ec4899' },
  },
  {
    id: 'sec8-verification',
    type: 'bullets',
    section: 8,
    durationInFrames: 750, // 25s
    content: {
      title: '決定論的検証と敵対的レビュー',
      bullets: [
        '第一段階：物理的検証 — Hooksでユニットテスト・リンターを強制実行',
        '第二段階：敵対的エージェント査読 — 「3つの問題点を見つけよ」',
        'グラウンディング：推測を明示的に禁止し「不明」と回答させる',
        'JSON形式出力で自由な言語生成を抑制しスキーマ範囲内に制限',
      ],
    },
  },

  // ========== Section 9: Conclusion ==========
  {
    id: 'sec9-header',
    type: 'sectionHeader',
    section: 9,
    durationInFrames: 180, // 6s
    content: {
      title: '戦略的結論',
      subtitle: '人間とエージェントの協調モデル',
    },
    style: { accentColor: '#3b82f6' },
  },
  {
    id: 'sec9-conclusion',
    type: 'bullets',
    section: 9,
    durationInFrames: 750, // 25s
    content: {
      title: '新しいパラダイムの鍵',
      bullets: [
        '開発者は「コードを書く人」から「指示書を設計する人」へシフト',
        'エージェントのミス = 指示書の欠陥 → CLAUDE.mdに即座に明文化',
        '自己改善ループでCLAUDE.mdは「生きた資産」へと進化',
        'MCP + Hooks + Skills = AIエージェントは真のパートナーへ',
      ],
    },
  },
  {
    id: 'ending',
    type: 'title',
    section: 9,
    durationInFrames: 300, // 10s
    content: {
      title: 'ご視聴ありがとうございました',
      subtitle: 'Claude Code — エージェント型開発の未来',
    },
  },
];

export const TOTAL_FRAMES = SLIDES.reduce(
  (sum, s) => sum + s.durationInFrames,
  0,
);

export const TOTAL_SECTIONS = 10; // 0-9

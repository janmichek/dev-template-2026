export type TextPair = {
  readonly before: string | undefined;
  readonly after: string | undefined;
};

export type GuardrailSnapshot = {
  readonly diff: string;
  readonly stryker: TextPair;
  readonly tsconfig: TextPair;
  readonly oxlint: TextPair;
  readonly claude: TextPair;
  readonly cursorHooks: TextPair;
  readonly preCommit: TextPair;
  readonly commitMsg: TextPair;
};

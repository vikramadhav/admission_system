/** One choice offered by dahc-select and dahc-ranked-selection. */
export interface DahcSelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

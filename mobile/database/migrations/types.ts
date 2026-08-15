export interface Migration {
  version: number;
  name: string;
  /** Raw SQL, may contain multiple statements separated by ";". */
  up: string;
}

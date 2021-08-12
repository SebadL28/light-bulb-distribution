import { Matrix } from "./matrix";

export interface GroupMatrix {
    vertical: {
      [key: string]: Matrix[]
    };
    horizontal: Matrix[][],
    all: Matrix[],
}
  
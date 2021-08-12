export interface Matrix {
    row: number;
    col: number;
    value: number;
    id: number;
    left: Matrix[];
    top: Matrix[];
    right: Matrix[];
    bottom: Matrix[];
}

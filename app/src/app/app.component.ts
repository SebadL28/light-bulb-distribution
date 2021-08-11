import { Component, OnInit } from '@angular/core';

interface  Matrix {
  row: number;
  col: number;
  value: number;
  left: Matrix[];
  top: Matrix[];
  right: Matrix[];
  bottom: Matrix[];
}

interface GroupMatrix {
  vertical: {
    [key: string]: Matrix[]
  };
  horizontal: Matrix[][],
  all: Matrix[],
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public matrixBase: number[][] = [
    [1,0,1,0,1],
    [1,0,1,1,1],
    [1,0,0,0,1],
    [1,0,1,0,1],
    [1,0,0,0,0]
  ];

  public matrixResult: Matrix[] = [];
  public matrixResults: Matrix[] = [];

  public levelValidation = 0;
  public logCounter = 1;

  private dataMatrix: GroupMatrix = {
    vertical: {},
    horizontal: [],
    all: []
  };

  ngOnInit() {
    this._solve();
  }

  public generateMatrix() {
    this._solve();
  }

  public readFile(event: any) {
    console.log(event);
    var file = event.srcElement.files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = (evt: any) => {
          this.matrixBase = JSON.parse(evt.target.result);
        }
        reader.onerror = function (evt) {
            console.log('error reading file');
        }
    }
  }

  private _generateMatrix() {
    const data: GroupMatrix = {
      vertical: {},
      horizontal: [],
      all: []
    };

    this.matrixBase.forEach((row, indexRow) => {
      const dataRow: Matrix[] = [];
      row.forEach((col, indexCol) => {
        const path: Matrix = {
          row: indexRow,
          col: indexCol,
          value: col,
          left: [],
          top: [],
          right: [],
          bottom: []
        };

        data.all.push(path);
        dataRow.push(path);


        if (!(indexCol in data.vertical)) {
          data.vertical[indexCol] = [];
        }

        data.vertical[indexCol].push(path);
      });

      data.horizontal.push(dataRow);
    });

    this.dataMatrix = data;
  }


  private _validateDirection(direction: 'left' | 'top' | 'right' | 'bottom', position: number, valueValidate: number): boolean {
    if (((direction === 'left' || direction === 'top') && position > valueValidate) ||
      ((direction === 'right' || direction === 'bottom') && position < valueValidate)
    ) {
      return true;
    }

    return false;
  }


  private _getLightsPath(light: Matrix, direction: 'left' | 'top' | 'right' | 'bottom') {
    const lightsDirection: Matrix[] = [];

    let colValidate: 'col' | 'row' = 'col';
    let posValidation: number = 0;
    let increasePos: number = -1;
    let directionMatrix: 'vertical' | 'horizontal' = 'horizontal'

    if (direction === 'top' || direction === 'bottom') {
      colValidate = 'row';
      directionMatrix = 'vertical';
      
      if (direction === 'top') {
        increasePos = -1;
      } else {
        posValidation = this.dataMatrix.horizontal.length - 1;
        increasePos = 1;
      }
    } else if (direction === 'right') {
      posValidation = Object.keys(this.dataMatrix.vertical).length - 1;
      increasePos = 1;
    }

    let currentPos = light[colValidate];
    if (this._validateDirection(direction, currentPos, posValidation) && light.value === 0) {

      while (this._validateDirection(direction, currentPos, posValidation)) {
        currentPos += increasePos;

        let row = null;
        if (directionMatrix === 'vertical') {
          row = this.dataMatrix.vertical[light.col];
        } else {
          row = this.dataMatrix.horizontal[light.row];
        }

        const selectLight = row.find(x => (x[colValidate] === currentPos));

        if (selectLight && selectLight.value == 0) {
          lightsDirection.push(selectLight);
        } else {
          break;
        }
      }
    }

    return lightsDirection;
  }

  private _lightsPaths() {
    this.dataMatrix.all.forEach((light) => {
      const left: Matrix[] = this._getLightsPath(light, 'left');
      const top: Matrix[] = this._getLightsPath(light, 'top');
      const right: Matrix[] = this._getLightsPath(light, 'right');
      const bottom: Matrix[] = this._getLightsPath(light, 'bottom');

      light.left = left;
      light.top = top;
      light.right = right;
      light.bottom = bottom;
    });
  }

  private _removeItemArray(arrayData: any[], item: any) {
    const i = arrayData.indexOf(item);

    if (i !== -1) {
      arrayData.splice(i, 1);
    }     
  }

  private _removeLight(light: Matrix, lights: Matrix[]) {
    let lightsRemove: Matrix[] = [];
    lightsRemove = lightsRemove.concat(light.top, light.right, light.bottom, light.left);

    lightsRemove.forEach((lightRemove) => {
      this._removeItemArray(lights, lightRemove);
    });

    this._removeItemArray(lights, light);

    return lights;
  }

  private _getNextLight(lights: Matrix[], combination: Matrix[] = []) {
    let selectLight: Matrix | null = null;
  
    lights.forEach((light) => {
      if (!selectLight) {
        if (light.value === 0) {
          selectLight = light;
        }
      }
    });

    if (selectLight) {
      combination.push(selectLight);
      lights = this._removeLight(selectLight, lights);

      if (lights.length > 0) {
        this._getNextLight(lights, combination);
      }
    }

    this.logCounter++;

    return combination;
  }

  private _generateCombination(light: Matrix, matrix: Matrix[], nextLigth: Matrix) {
    const combination = [light, nextLigth];
    matrix = this._removeLight(nextLigth, matrix);

    let ligthsCombination = this._getNextLight(matrix);
    ligthsCombination = combination.concat(ligthsCombination);

    return ligthsCombination;
  }

  private _generateLevelCombination(matrix: Matrix[], combination: Matrix[], combinations: Matrix[][], level: number) {
    let baseMatrix: Matrix[] = Object.assign([], matrix);
    let combinationsReturn = combinations;
    
    baseMatrix.forEach((selectLight) => {
      if (selectLight.value === 0) {
        const currentCombination: Matrix[] = Object.assign([], combination);
        currentCombination.push(selectLight);

        let newMatrix: Matrix[] = Object.assign([], baseMatrix);
        newMatrix = this._removeLight(selectLight, newMatrix);

        if (level > 0) {
          combinationsReturn = this._generateLevelCombination(newMatrix, currentCombination, combinations, level - 1);
        } else {
          let ligthsCombination = this._getNextLight(newMatrix);
          ligthsCombination = currentCombination.concat(ligthsCombination);

          combinationsReturn.push(ligthsCombination);
        }
      }
    });

    return combinationsReturn;
  }

  private _generateAllCombinations(light: Matrix, matrix: Matrix[]) {
    let minCombination: Matrix[] = [];

    matrix = this._removeLight(light, matrix);
    matrix.forEach((selectLight) => {
      if (selectLight.value === 0) {
        const newMatrix = Object.assign([], matrix);
        const combination = this._generateCombination(light, newMatrix, selectLight);
        if (minCombination.length === 0 || minCombination.length > combination.length) {
          minCombination = combination;
        }
      }
    });

    return minCombination;
  }

  private _generateAllLevelCombinations(light: Matrix, matrix: Matrix[]) {
    let minCombination: Matrix[] = [];

    const combinationPath = [light];
    let newMatrix: Matrix[] = Object.assign([], matrix);

    newMatrix = this._removeLight(light, newMatrix);
    const allCombinations = this._generateLevelCombination(newMatrix, combinationPath, [], this.levelValidation);

    allCombinations.forEach((combination) => {
      if (minCombination.length === 0 || minCombination.length > combination.length) {
        minCombination = combination;
      }
    });

    return minCombination;
  }

  private _generateMinCombinations() {
    let minCombination: Matrix[] = [];

    this.dataMatrix.all.forEach((light) => {
      const newMatrix = Object.assign([], this.dataMatrix.all);
      const combination = this._generateAllLevelCombinations(light, newMatrix);
      // const combination = this._generateAllCombinations(light, newMatrix);

      if (minCombination.length === 0 || minCombination.length > combination.length) {
        minCombination = combination;
      }
    });

    return minCombination;
  }

  private _solve() {
    this._generateMatrix();
    this._lightsPaths();

    this.matrixResult = this._generateMinCombinations();
    console.log(this.logCounter);
    console.log(this.matrixResult);
  }

}

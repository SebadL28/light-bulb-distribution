import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GroupMatrix } from './interfaces/group-matrix';
import { Matrix } from './interfaces/matrix';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public errorJsonFile = false;
  public showResult = false;
  public validating = false;
  public levelValidation = 0;

  public form = new FormGroup({
    file: new FormControl(),
    level: new FormControl(false)
  });

  public logCounter = 0;

  public matrixBase: number[][] = [];
  public matrixResults: Matrix[][] = [];
  public maxLights = 0;
  public indexResult = 0;

  private dataMatrix: GroupMatrix = {
    vertical: {},
    horizontal: [],
    all: []
  };

  ngOnInit() {
    this.form.controls.level.valueChanges.subscribe((value) => {
      if (value) {
        this.levelValidation = 1;
      } else {
        this.levelValidation = 0;
      }
    });
  }

  private _clearData() {
    this.indexResult = 0;
    this.matrixResults = [];
    this.dataMatrix = {
      vertical: {},
      horizontal: [],
      all: []
    };
    this.logCounter = 0;
    this.maxLights = 0;
  }

  private _initValidate() {
    const controls = this.form.controls;

    controls.file.disable();
    controls.level.disable();

    this.validating = true;
    this.showResult = false;

    this._clearData();
  }

  private _finishValidate() {
    const controls = this.form.controls;
    
    controls.file.enable();
    controls.level.enable();

    this.validating = false;
    this.showResult = true;
  }

  public generateMatrix() {
    this._initValidate();

    setTimeout(() => {
      this._solve();
    }, 100);
  }

  public nextResult() {
    const maxIndex = this.matrixResults.length - 1;
    if (this.indexResult < maxIndex) {
      this.indexResult++;
    } else {
      this.indexResult = 0;
    }
  }

  public prevResult() {
    if (this.indexResult > 0) {
      this.indexResult--;
    } else {
      this.indexResult = this.matrixResults.length - 1;
    }
  }

  public readFile(event: any) {
    console.log(event);
    var file = event.srcElement.files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = (evt: any) => {
          const contentFile = evt.target.result;

          try {
            this.matrixBase = JSON.parse(contentFile);
            this._clearData();
            this.errorJsonFile = false;
          } catch (e) {
            this.errorJsonFile = true;
          }
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

    let idAll = 0;
    let maxLights = 0;

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
          bottom: [],
          id: idAll
        };

        if (!(indexCol in data.vertical)) {
          data.vertical[indexCol] = [];
        }

        if (col === 0) {
          maxLights++;
        }

        idAll++;
        data.all.push(path);
        dataRow.push(path);
        data.vertical[indexCol].push(path);
      });

      data.horizontal.push(dataRow);
    });

    this.maxLights = maxLights;
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

  private _removeCombinationDuplicate(combinations: Matrix[][]) {
    const positions: number[][] = [];
    const totalCombinations: Matrix[][] = [];

    combinations.forEach((combination) => {
      const position: number[] = [];
      combination.forEach((lights) => {
        position.push(lights.id);
      });

      position.sort(function(a, b) {return a - b;});

      if (!this._inArray(position, positions)) {
        positions.push(position);
        totalCombinations.push(combination);
      }
    });

    return totalCombinations;
  }

  private _getMinCombinations(combinations: Matrix[][]) {
    let minCombinations: Matrix[][] = [];
    let minLength = 9999999;

    combinations.forEach((combination) => {
      if (combination.length < minLength) {
        minLength = combination.length;
        minCombinations = [combination];
      } else if (combination.length === minLength) {
        minCombinations.push(combination);
      }
    });

    minCombinations = this._removeCombinationDuplicate(minCombinations);

    return minCombinations;
  }

  private _generateAllLevelCombinations(light: Matrix, matrix: Matrix[]) {
    const combinationPath = [light];
    let newMatrix: Matrix[] = Object.assign([], matrix);

    newMatrix = this._removeLight(light, newMatrix);
    const levelValidation = (this.maxLights > 2)? this.levelValidation : 0;
    const allCombinations = this._generateLevelCombination(newMatrix, combinationPath, [], levelValidation);

    return this._getMinCombinations(allCombinations);
  }

  private _generateMinCombinations() {
    let allCombinations: Matrix[][] = [];

    if (this.maxLights > 1) {
      this.dataMatrix.all.forEach((light) => {
        const newMatrix = Object.assign([], this.dataMatrix.all);
        const combinations = this._generateAllLevelCombinations(light, newMatrix);

        allCombinations = allCombinations.concat(combinations);
      });
    } else {
      let selectLight: Matrix | null = null;
      this.dataMatrix.all.forEach((light) => {
        if (light.value === 0) {
          selectLight = light;
        }
      });

      if (selectLight) {
        allCombinations = [[selectLight]];
      }
    }


    return this._getMinCombinations(allCombinations);
  }

  private _solve() {
    this._generateMatrix();
    this._lightsPaths();

    this.indexResult = 0;
    this.matrixResults = this._generateMinCombinations();

    this.showResult = true;
    this.validating = false;
    this._finishValidate();
  }










  // Function search value in array
  private _arrayCompare(a1: any, a2: any) {
    if (a1.length != a2.length) return false;
    var length = a2.length;
    for (var i = 0; i < length; i++) {
        if (a1[i] !== a2[i]) return false;
    }
    return true;
  }

  private _inArray(needle: any, haystack: any) {
      var length = haystack.length;
      for(var i = 0; i < length; i++) {
          if(typeof haystack[i] == 'object') {
              if(this._arrayCompare(haystack[i], needle)) return true;
          } else {
              if(haystack[i] == needle) return true;
          }
      }
      return false;
  }

  private _isJsonValid(text: string) {
    if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').
      replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
      replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
    ) {
      return true;
    }

    return false;
  }

}

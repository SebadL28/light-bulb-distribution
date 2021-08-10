import { Component, OnInit } from '@angular/core';

interface  Matrix {
  row: number;
  col: number;
  value: number;
  left?: Matrix[];
  top?: Matrix[];
  right?: Matrix[];
  bottom?: Matrix[];
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
    [0,0,0,1,0,1,1,1],
    [0,1,0,0,0,0,0,0],
    [0,1,0,0,0,1,1,1],
    [0,1,1,1,1,0,0,0],
    [0,1,0,0,1,0,0,0],
    [0,1,0,0,1,0,1,0],
    [0,1,0,1,1,0,1,0],
    [0,0,0,0,1,0,0,0],
    [0,1,1,0,1,1,0,1],
    [0,0,0,0,1,0,0,0],
    [1,0,0,1,0,0,1,1],
    [0,0,1,0,0,0,0,0],
  ];

  private dataMatrix: GroupMatrix = {
    vertical: {},
    horizontal: [],
    all: []
  };

  ngOnInit() {
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
          this._solve();
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
          value: col
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

  private _solve() {
    this._generateMatrix();
    this._lightsPaths();
    console.log(this.dataMatrix);
  }

}

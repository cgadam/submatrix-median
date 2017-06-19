function MatrixView(selector){
  this._$root = $(selector);
  this._$generateButton = this._$root.find('#generateButton');
  this._$selectSubMatrixButton = this._$root.find('#selectSubmatrix');
  this._$calculateMedianButton = this._$root.find('#calculateMedian');
  this._$rowCount = this._$root.find('#rowCount');
  this._$colCount = this._$root.find('#colCount');
  this._query = {};
  this._query.$q0 = this._$root.find('#q0').attr('min', MatrixModel.MIN_ROWS).attr('max', MatrixModel.MAX_ROWS);
  this._query.$q1 = this._$root.find('#q1').attr('min', MatrixModel.MIN_COLS).attr('max', MatrixModel.MAX_COLS);
  this._query.$q2 = this._$root.find('#q2').attr('min', MatrixModel.MIN_ROWS).attr('max', MatrixModel.MAX_ROWS);
  this._query.$q3 = this._$root.find('#q3').attr('min', MatrixModel.MIN_COLS).attr('max', MatrixModel.MAX_COLS);;
  this._$matrix = this._$root.find('#matrix');
  this._evtHandlers = {};
  this._$median = this._$root.find('.median');
  this._init();
}

MatrixView.EVENTS = {
  GENERATE_MATRIX: 'generateMatrixClicked',
  SUBMATRIX_SELECT: 'selectSubMatrixClicked',
  CALCULATE_MEDIAN: 'calculateMedianClicked',
  CELL_VALUE_CHANGED: 'matrixCellValueChanged'
}

MatrixView.prototype._dispatchEvent = function(evt, args){
  var handlers = this._evtHandlers[evt];
  if(handlers && Array.isArray(handlers)){
    for(var i=0; i<this._evtHandlers[evt].length; i++){
      this._evtHandlers[evt][i].apply(null, args);
    }
  }
}

MatrixView.prototype.on = (function(evt, cb){
  this._evtHandlers[evt].push(cb);
});

MatrixView.prototype._init = function(){
  var self = this;

  for(var evtKey in MatrixView.EVENTS){
    this._evtHandlers[MatrixView.EVENTS[evtKey]] = [];
  }

  function isValidSubRange(range, subRange){
    var minFrom = range[0],
        maxTo = range[1],
        from = subRange[0],
        to = subRange[1];
    
    return (
      (
          /*
            All parameters must be integers
          */
        Number.isInteger(from) && Number.isInteger(to) && 
        Number.isInteger(minFrom) && Number.isInteger(maxTo) 
      )
      &&
      (
        /*
          Inside max range
        */
        from >= minFrom &&
        to <= maxTo 
      )
      &&
      (
        /*
          The range itself must make sense
        */
        from <= to
      )
    );
  };

  this._$generateButton.click(function(){
    var rowCount = parseInt(self._$rowCount.val()),
      colCount = parseInt(self._$colCount.val());
    
    if( !isValidSubRange([MatrixModel.MIN_ROWS, MatrixModel.MAX_ROWS], [MatrixModel.MIN_ROWS, rowCount]) ||
        !isValidSubRange([MatrixModel.MIN_COLS, MatrixModel.MAX_COLS], [MatrixModel.MIN_COLS, colCount], ) ){
        alert('Matrix rows and columns number must be valid integers belonging to the following ranges\n'+
              ' * Rows: Min: ' + MatrixModel.MIN_ROWS + ', Max: ' + MatrixModel.MAX_ROWS + '\n' +
              ' * Columns: Min: ' + MatrixModel.MIN_COLS + ', Max: ' + MatrixModel.MAX_COLS + '\n');
        return;
    }

    self._dispatchEvent(MatrixView.EVENTS.GENERATE_MATRIX, [rowCount, colCount]);

    self.updateQueryMax(rowCount, colCount);

    self.setQueryButtonStatus(true);
    self.setMedianButtonStatus(false);
    self.setMedian('-');

  });

  this._$selectSubMatrixButton.click(function(){

    var maxRowCount = parseInt(self._query.$q0.attr('max')),
      maxColCount = parseInt(self._query.$q2.attr('max'));

    var fromRow = parseInt(self._query.$q0.val()),
      fromCol = parseInt(self._query.$q1.val()),
      toRow = parseInt(self._query.$q2.val()),
      toCol = parseInt(self._query.$q3.val());

      if( !isValidSubRange([MatrixModel.MIN_ROWS, maxRowCount], [fromRow, toRow]) ||
          !isValidSubRange([MatrixModel.MIN_COLS, maxColCount], [fromCol, toCol])){
          alert('The query must be inside the boundaries of the matrix and should make sense!');
          return;
        }
    
    var coordinates = [fromRow, fromCol , toRow, toCol];
    
    self.paintSubMatrix(coordinates);

    self.setMedianButtonStatus(true);
    self.setMedian('-');
    
    self._dispatchEvent(MatrixView.EVENTS.SUBMATRIX_SELECT, [ coordinates ]);
    
  });

  this._$calculateMedianButton.click(function(){
    self._dispatchEvent(MatrixView.EVENTS.CALCULATE_MEDIAN);
  });

}

MatrixView._getCellId = function(i, j){
  return 'm_' + i + '_' + j; 
}

MatrixView._getRowId = function(i){
  return 'r_' + i; 
}

MatrixView.prototype.updateMatrix = function(model){
  var self = this;

  this._$matrix.empty();

  function createMatrixRow(i){
    var $matrixRow = $('<div id=\'' + MatrixView._getRowId(i) + '\'></div>');
    return $matrixRow;
  }

  function createMatrixCell(i, j, value){
    var $matrixCell = $('<input id=' + MatrixView._getCellId(i,j) +
                        ' type=\'number\' min=\'1\' max=\'99\'' +
                        ' value=\'' + value + '\'></input>');
    $matrixCell.change(function(evt){
      self._dispatchEvent(MatrixView.EVENTS.CELL_VALUE_CHANGED, [i, j, parseInt(evt.target.value)]);
    });
    $matrixCell.addClass('numInput');
    return $matrixCell;
  }

  for(var i=0; i < model.matrix.length; i++){
    var $matrixRow = createMatrixRow(i);
    for(var j=0; j < model.matrix[i].length; j++){
      var $matrixCell = createMatrixCell(i, j, model.matrix[i][j]);
      $matrixRow.append($matrixCell);
    }
    this._$matrix.append($matrixRow);
  }

};

MatrixView.prototype.setMedian = (function(median){
  this._$median.text(median);
});

MatrixView.prototype.paintSubMatrix = function(coordinates){

  var i = (coordinates && typeof coordinates[0] === 'number') ? coordinates[0] - 1 : 0,
  j = (coordinates && typeof coordinates[1] === 'number') ? coordinates[1] - 1 : i,
  k = (coordinates && typeof coordinates[2] === 'number') ? coordinates[2] - 1 : this.matrix.length - 1,
  l = (coordinates && typeof coordinates[3] === 'number') ? coordinates[3] - 1 : this.matrix[0].length - 1;

  this._$matrix.find('.numInput').removeClass('selected');

  var ic = i;

  while(ic <= k){
    //Iterate over rows
    var jc = j;
    while(jc <= l){
      //Iterate over columns
      $($(this._$matrix.children()[ic]).children()[jc]).addClass('selected');
      jc++;
    }
    ic++;
  }

};

MatrixView.prototype.setQueryButtonStatus = function(enabled){
  this._$selectSubMatrixButton.prop('disabled', !!!enabled);
}

MatrixView.prototype.setMedianButtonStatus = function(enabled){
  this._$calculateMedianButton.prop('disabled', !!!enabled);
}

MatrixView.prototype.updateQueryMax = function(rowCount, colCount){
  var $queryContainer = $('#queryContainer');
    $fromRow = $queryContainer.find('#q0'),
    $toRow =  $queryContainer.find('#q2'),
    $fromCol = $queryContainer.find('#q1'),
    $toCol = $queryContainer.find('#q3');
  $fromRow.attr('max', rowCount);
  $toRow.attr('max', rowCount);
  $fromCol.attr('max', colCount);
  $toCol.attr('max', colCount);
}

function MatrixModel(rowCount, colCount){
  this.matrix = [];
  for(var i=0; i < rowCount; i++){
    var newRow = [];
    for(var j=0; j < colCount; j++){
      newRow.push(parseInt(Math.random() * 100));
    }
    this.matrix.push(newRow);
  }
}

MatrixModel.MIN_ROWS = 1;
MatrixModel.MAX_ROWS = 99;
MatrixModel.MIN_COLS = 1;
MatrixModel.MAX_COLS = 99;

MatrixModel.prototype.setCellValue = function(i, j, value){
  this.matrix[i][j] = value;
}

MatrixModel.prototype.getSubMatrix = function(coordinates){
  
  var i = (coordinates && typeof coordinates[0] === 'number') ? coordinates[0] - 1 : 0,
    j = (coordinates && typeof coordinates[1] === 'number') ? coordinates[1] - 1 : i,
    k = (coordinates && typeof coordinates[2] === 'number') ? coordinates[2] - 1 : this.matrix.length - 1,
    l = (coordinates && typeof coordinates[3] === 'number') ? coordinates[3] - 1 : this.matrix[0].length - 1;

    var ic = i;
    var subMatrixModel = [];
    while(ic <= k){
      //Iterate over rows
      var jc = j;
      var subRow = [];
      while(jc <= l){
          //Iterate over columns
          subRow.push(this.matrix[ic][jc]);
          jc++;
      }
      subMatrixModel.push(subRow);
      ic++;
    }
    return subMatrixModel;
}

MatrixModel.getMatrixList = function(matrix){
  var matrixList = [];
  for(var i=0; i < matrix.length; i++){
      for(var j=0; j < matrix[i].length; j++){
          matrixList.push(matrix[i][j]);
      }
  }
  return matrixList;
}

function calculateMedian(list){
	var orderedMatrixList = list.sort(),
    median;
  if(orderedMatrixList.length % 2 === 0){
      median = parseInt((orderedMatrixList[orderedMatrixList.length / 2] + orderedMatrixList[(orderedMatrixList.length / 2)-1])/2);
  }else{
      median = parseInt(orderedMatrixList[parseInt((orderedMatrixList.length/2))]);
  }
  return median;
}

function MatrixController(uiSelector){
  var view = new MatrixView(uiSelector),
    model,
    submatrixCoordinates = [];
  view.on(MatrixView.EVENTS.GENERATE_MATRIX, function(rowCount, colCount){
    model = new MatrixModel(rowCount, colCount);
    view.updateMatrix(model);
  });
  view.on(MatrixView.EVENTS.CELL_VALUE_CHANGED, function(i, j, newValue){
    if(model){
      model.setCellValue(i, j, newValue);
    }
  });
  view.on(MatrixView.EVENTS.SUBMATRIX_SELECT, function(coordinates){
    submatrixCoordinates = coordinates;
  });
  view.on(MatrixView.EVENTS.CALCULATE_MEDIAN, function(){
    if(model && submatrixCoordinates.length !== 0){
      var submatrix = model.getSubMatrix(submatrixCoordinates),
        median = calculateMedian(MatrixModel.getMatrixList(submatrix));
      view.setMedian(median);
    }
  });
}

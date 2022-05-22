(function mySudokuWrapper() {
	if(!localStorage.getItem('user_id')){
		window.location.href="login.html";
	}
	// the bigger, shows more digits,  0-100
	var percent_digits_shown = 60;

	// the suduku board. 3x3 cells, and each cell is 9x9
	var suduku_object;

	// two buttons
	var start_btn = document.getElementById('start_btn');
	var submit_btn = document.getElementById('submit_btn');

	// if user clicks the start button
	start_btn.onclick = function() {
		start_the_game();
		$('#shareDiv').hide();
	}

	// if user clicks the submit button
	submit_btn.onclick = function() {
		// check if board valid
		if (!checkBoard(convertTdToSudukuObject(suduku_object))) {
			alert('fail');
			dailyGame(is_win);
			return;
		}
		// alert('valid');

		//weed out non wins
		var is_win = true;
		for (var i = 0; i < 81; i++) {
			if (suduku_object.board[i].val == ' ') {
				is_win = false;
				break;
			};
		}

		if (is_win) {
			alert('win');
		}else{
			alert('fail');
		}
		dailyGame(is_win);
		$('#shareDiv').show();
	}
	/**
	 * add Record
	 * 10 today first win   -10 today fist fail
	 * 1 today not first win  -1 today not first fail
	 */
	function dailyGame(is_win){
		let params={
			user_id: localStorage.getItem('user_id'),
		}
		$.ajax({
			url: "http://127.0.0.1:8888/daily_game",
			type: "POST",
			dataType: "json",
			contentType:"application/json;charset=utf-8",
			data:JSON.stringify(params),
			success: function (rest) {
				// let res = JSON.parse(rest)
				console.log(rest);
				if(rest){
					let score = is_win?10:-10
					addRecord(score)
				}else{
					let score = is_win?1:-1
					addRecord(score)
				}
				start_the_game();
			}
		});
	}
	/**
	 * add Record
	 */
	function addRecord(score){
		let params={
			user_id: localStorage.getItem('user_id'),
			score: score
		} 
		$.ajax({
			url: "http://127.0.0.1:8888/add_record",
			type: "POST",
			dataType: "json",
			contentType:"application/json;charset=utf-8",
			data:JSON.stringify(params),
			success: function (rest) {
				// let res = JSON.parse(rest)
				console.log(rest);
			}
		});
	}
	/**
	 * start the game
	 */
	function start_the_game() {
		while (true) {
			// try to init board
			suduku_object = new Sudoku();

			// connect board to html dom
			suduku_object.connectBoxesToTds();

			// populate cells, may be failed.
			suduku_object.populateCells(suduku_object);
			var success = checkBoard(suduku_object);
			// try again
			if (!success) {
				continue;
			}

			// clear some cells, so the user can find solution for it.
			suduku_object.clearSomeCells(percent_digits_shown);

			// show the board
			suduku_object.show();

			break;
		}
	}


	// the Sudoku class
	function Sudoku() {
		var board = [];
		var that = this;
		(function() {
			function Cell(original_index) {
				this.row_index;
				this.col_index;
				this.box_index = '';
				this.availableNums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
				this.original_index = original_index;
				this.val = ' ';
				this.dom;
				this.calculate_possible_numbers = calculate_possible_numbers;
			}
			for (var i = 0; i < 81; i++) {
				board[i] = new Cell(i);
			};
		}());

		this.board = board;
		this.rows = initRows(board);
		this.cols = initCols(board);
		this.boxes = initBoxes(board);

		this.populateCells = populateCells;

		this.connectBoxesToTds = function() {
			var tables = document.getElementById('board').getElementsByTagName('table');
			for (var i = 0; i < 9; i++) {
				var tds = tables[i].getElementsByTagName('td');
				for (var j = 0; j < 9; j++) {
					that.boxes[i][j].dom = tds[j];
					that.boxes[i][j].dom.innerText = ' ';
				};
			};
		};

		this.clearSomeCells = function(percent_digits_shown) {
			for (var i = 0; i < 9 * 9; i++) {
				var cell = that.board[i];
				// remove fix class of all the cells.
				cell.dom.classList.remove('fix');

				// clear the number in the cell
				if ((Math.floor(Math.random() * 100) + 1) > percent_digits_shown) {
					cell.val = ' ';
					continue;
				}

				//  do not clear this cell
				cell.dom.classList.add('fix');
			};
		}

		this.show = function() {
			for (var i = 0; i < 81; i++) {
				that.board[i].dom.innerHTML = that.board[i].val;
			};
		};
	}

	function initRows(board) {
		var rows = [];
		for (var i = 0; i < 9; i++) {
			rows.push([]);
			for (var j = 0; j < 9; j++) {
				var index = i * 9 + j;
				rows[i].push(board[index]);
				board[index].row_index = i;
				board[index].col_index = j;
			}
		};
		return rows;
	}

	function initCols(board) {
		var cols = [ [], [], [], [], [], [], [], [], []]; 
		for (var i = 0; i < 9; i++) {
			for (var j = 0; j < 9; j++) {
				var index = i * 9 + j;
				cols[j].push(board[index])
			}
		};
		return cols;
	}

	function initBoxes(board) {
		var row_index;
		var col_index;
		var boxes = [];

		for (var i = 0; i < 9; i++) {
			boxes.push([]);
		}

		for (i = 0; i < 9; i++) {
			if (i < 3) {
				row_index = 0;
			} else if (i < 6) {
				row_index = 3;
			} else {
				row_index = 6;
			}
			for (var j = 0; j < 9; j++) {
				if (j < 3) {
					col_index = 0;
				} else if (j < 6) {
					col_index = 1;
				} else {
					col_index = 2;
				}
				var index = 9 * i + j;
				board[index].box_index = row_index + col_index;
				boxes[row_index + col_index].push(board[index]);
			}
		}
		return boxes;
	}

	function convertTdToSudukuObject(board) {
		var tmp_object = new Sudoku();
		tmp_object.board = Object.create(board.board);
		tmp_object.rows = Object.create(board.rows);
		tmp_object.cols = Object.create(board.cols);
		tmp_object.boxes = Object.create(board.boxes);
		for (var i = 0; i < 81; i++) {
			tmp_object.board[i].val = tmp_object.board[i].dom.innerHTML;
		}
		return tmp_object;
	}

	function isDuplicate(line) {
		return line.some(function(e, i) {
			if (e.val == ' ') {
				return false;
			};
			return line.some(function(v, j) {
				return (e.val == v.val && i !== j)
			});
		});
	}

	// check if board valid.
	function checkBoard(board) {
		var is_row_duplicate = board.rows.some(function(line) {
			return isDuplicate(line);
		}) 
		var is_col_duplicate = board.cols.some(function(line) {
			return isDuplicate(line);
		}) 
		var is_box_duplicate = board.boxes.some(function(box) {
			return isDuplicate(box);
		});

		if (is_row_duplicate) {
			return false;
		}
		if (is_col_duplicate) {
			return false;
		}
		if (is_box_duplicate) {
			return false;
		}
		return true;
	}


	function shuffle(array) {
		  let curId = array.length;

		  // There remain elements to shuffle
		  while (0 !== curId) {
			// Pick a remaining element
			let randId = Math.floor(Math.random() * curId);
			curId -= 1;
			// Swap it with the current element.
			let tmp = array[curId];
			array[curId] = array[randId];
			array[randId] = tmp;
		  }
		  return array;
	}


	function findPossibleNumbers(numbers) {
		var nums = [];
		for (var i = 1; i <= 9; i++) {
			var not_contains = numbers.every(function(e) {
				return (e.val != i)
			});
			if (not_contains) {
				nums.push(i)
			};
		};
		return nums;
	}

	function populateLine(line, nums) {
		if (!nums) {
			nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
		}
		nums = shuffle(nums);
		for (var i = 0; i < line.length; i++) {
			line[i].val = nums[i];
		};
	}

	function calculate_possible_numbers(board, original_index) {
		var col_index = board.board[original_index].col_index;
		var row_index = board.board[original_index].row_index;
		var box_index = board.board[original_index].box_index;
		var list = []
		list = list.concat(board.cols[col_index]);
		list = list.concat(board.rows[row_index]);
		list = list.concat(board.boxes[box_index]);
		numbers = findPossibleNumbers(list);
		numbers = shuffle(numbers);
		board.board[original_index].availableNums = numbers;
	}


	function populateCells(board) {
		var cnt = 0;

		for (var i = 0; i < 8; i++) {
			for (var j = 0; j < 100; j++) {
				if (i == 2 || i == 5) {
					populateLine([board.rows[i][0], board.rows[i][1], board.rows[i][2]], findPossibleNumbers(board.boxes[board.rows[i][0].box_index]));
					populateLine([board.rows[i][3], board.rows[i][4], board.rows[i][5]], findPossibleNumbers(board.boxes[board.rows[i][3].box_index]));
					populateLine([board.rows[i][6], board.rows[i][7], board.rows[i][8]], findPossibleNumbers(board.boxes[board.rows[i][6].box_index]));
				} else if (i > 5) { 
					for (var v = 0; v < board.rows[i].length; v++) {
						board.rows[i][v].calculate_possible_numbers(board, board.rows[i][v].original_index);
						if (board.rows[i][v].availableNums.length == 0) {
							board.rows[i].forEach(function(ech) {
								ech.val = ' '
							});
							i--;
							break
						}
						populateLine([board.rows[i][v]], board.rows[i][v].availableNums);
					};
				} else {
					populateLine(board.rows[i]);
				}
				if (checkBoard(board)) {
					break
				};
				if (j == 99 && !checkBoard(board)) {
					i--;
				};
			};
			cnt++;
			if (cnt > 100) {
				console.log('fail, you should try to call populateCells() again');
				break;
			};
		};

		// fill the last row
		for (var i = 0; i < 9; i++) {
			for (var j = 1; j < 10; j++) {
				var not_contains = board.cols[i].every(function(e) {
					return (e.val != j)
				});
				if (not_contains) {
					board.cols[i][8].val = String(j)
				};
			};
		};

	}




	// inputter layer for boxes
	function bindInputterLayer() {
		for (var i = 0; i < 81; i++) {
			(function(j) {
				var cell = suduku_object.board[j].dom;
				cell.addEventListener('click', function() {
					// only blank cell can popup inputter layer.
					if (cell.classList.contains('fix')) {
						return
					};

					// create the inputter layer
					var inputter = document.getElementById('inputter').cloneNode(true);
					document.body.appendChild(inputter);

					// change the location of the inputter layer
					var inputterCoor = inputter.getBoundingClientRect();
					var cellRect = cell.getBoundingClientRect();
					var y = cellRect.top - inputterCoor.height / 2 + cellRect.height / 2; 
					var x = cellRect.left - inputterCoor.width / 2 + cellRect.width / 2;
					inputter.style.top = y + 'px';
					inputter.style.left = x + 'px';
					// show it
					inputter.style.visibility = 'visible';

					// bind onclick listener for each digits in the input layer
					var keys = inputter.getElementsByTagName('div');
					for (var v = 0; v < keys.length; v++) {
						(function(x) {
							keys[x].addEventListener('click', function() {
								// populate digit into the cell
								if (!keys[x].classList.contains('close')) {
									cell.innerHTML = keys[x].innerHTML;
								}
								// remove the inputter layer
								inputter.parentNode.removeChild(inputter);
							});
						})(v);
					};

				});
			})(i);
		}
	}

	// go
	start_the_game();
	bindInputterLayer();

})();

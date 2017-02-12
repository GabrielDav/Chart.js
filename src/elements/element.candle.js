'use strict';

module.exports = function(Chart) {

	var globalOpts = Chart.defaults.global;

	globalOpts.elements.candle = {
		backgroundFilledColor: '#6BA583',
		backgroundEmptyColor: '#D75442',
		borderWidth: 0,
		borderColor: '#000000'
	};

	/**
	 * Helper function to get the bounds of the candle
	 * @private
	 * @param candle {Chart.Element.Candle} the candle
	 * @return {Bounds} bounds of the candle
	 */
	function getCandleBounds(candle) {
		var vm = candle._view;
		var x1, x2, y1, y2;
		//vm.

		// if (isVertical(bar)) {
			// vertical
			var halfWidth = vm.width / 2;
			x1 = vm.x - halfWidth;
			x2 = vm.x + halfWidth;
			y1 = Math.min(vm.y, vm.base);
			y2 = Math.max(vm.y, vm.base);
		// } else {
		// 	// horizontal bar
		// 	var halfHeight = vm.height / 2;
		// 	x1 = Math.min(vm.x, vm.base);
		// 	x2 = Math.max(vm.x, vm.base);
		// 	y1 = vm.y - halfHeight;
		// 	y2 = vm.y + halfHeight;
		// }

		return {
			left: x1,
			top: y1,
			right: x2,
			bottom: y2
		};
	}

	Chart.elements.Candle = Chart.Element.extend({
		draw: function() {
			var ctx = this._chart.ctx;
			var vm = this._view;
			var left, right, top, bottom, shadowTop, shadowBottom, signX, signY;
			var borderWidth = vm.borderWidth;

			if (!vm.horizontal) {
				// bar
				left = vm.x - vm.width / 2;
				right = vm.x + vm.width / 2;
				top = vm.bodyTopY;
				bottom = vm.bodyBottomY;
				shadowTop = vm.shadowTopY;
				shadowBottom = vm.shadowBottomY;
				signX = 1;
				signY = bottom > top? 1: -1;
			} else {
				throw 'Horizontal candle chart is not supported';
			}

			// Canvas doesn't allow us to stroke inside the width so we can
			// adjust the sizes to fit if we're setting a stroke on the line
			if (borderWidth) {
				// borderWidth shold be less than bar width and bar height.
				var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
				borderWidth = borderWidth > barSize? barSize: borderWidth;
				var halfStroke = borderWidth / 2;
				// Adjust borderWidth when bar top position is near vm.base(zero).
				var borderLeft = left + (borderWidth > 0 ? halfStroke * signX: 0);
				var borderRight = right + (borderWidth > 0? -halfStroke * signX: 0);
				var borderTop = top + (borderWidth > 0? halfStroke * signY: 0);
				var borderBottom = bottom + (borderWidth > 0? -halfStroke * signY: 0);
				// not become a vertical line?
				if (borderLeft !== borderRight) {
					top = borderTop;
					bottom = borderBottom;
				}
				// not become a horizontal line?
				if (borderTop !== borderBottom) {
					left = borderLeft;
					right = borderRight;
				}
			}

			ctx.beginPath();
			ctx.fillStyle = vm.hollow? vm.backgroundEmptyColor : vm.backgroundFilledColor;
			ctx.strokeStyle = vm.borderColor;
			ctx.lineWidth = borderWidth;

			ctx.moveTo(left, bottom);
			ctx.lineTo(left, top);
			ctx.lineTo(right, top);
			ctx.lineTo(right, bottom);
			ctx.lineTo(left, bottom);

			ctx.fill();
			if (borderWidth) {
				var centerX = left + (right - left)/2;
				ctx.moveTo(centerX, top);
				ctx.lineTo(centerX, shadowTop);
				ctx.moveTo(centerX, bottom);
				ctx.lineTo(centerX, shadowBottom);
				ctx.stroke();
			}
		},
		height: function() {
			var vm = this._view;
			return vm.base - vm.y;
		},
		inRange: function(mouseX, mouseY) {
			var inRange = false;

			if (this._view) {
				var bounds = getCandleBounds(this);
				inRange = mouseX >= bounds.left && mouseX <= bounds.right && mouseY >= bounds.top && mouseY <= bounds.bottom;
			}

			return inRange;
		},
		inLabelRange: function(mouseX, mouseY) {
			var me = this;
			if (!me._view) {
				return false;
			}

			var inRange = false;
			var bounds = getCandleBounds(me);

			inRange = mouseX >= bounds.left && mouseX <= bounds.right;

			return inRange;
		},
		inXRange: function(mouseX) {
			var bounds = getCandleBounds(this);
			return mouseX >= bounds.left && mouseX <= bounds.right;
		},
		inYRange: function(mouseY) {
			var bounds = getCandleBounds(this);
			return mouseY >= bounds.top && mouseY <= bounds.bottom;
		},
		getCenterPoint: function() {
			var vm = this._view;
			var x, y;
			x = vm.x;
			y = (vm.y + vm.base) / 2;

			return {x: x, y: y};
		},
		getArea: function() {
			var vm = this._view;
			return vm.width * Math.abs(vm.y - vm.base);
		},
		tooltipPosition: function() {
			var vm = this._view;
			return {
				x: vm.x,
				y: vm.y
			};
		}
	});

};

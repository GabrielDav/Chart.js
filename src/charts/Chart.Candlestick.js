'use strict';

module.exports = function(Chart) {

	Chart.Candlestick = function(context, config) {
		config.type = 'candlestick';

		return new Chart(context, config);
	};

};

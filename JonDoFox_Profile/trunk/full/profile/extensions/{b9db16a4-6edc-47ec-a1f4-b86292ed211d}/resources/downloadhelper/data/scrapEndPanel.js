/* Copyright (C) 2006-2015 Michel Gutierrez <mig@downloadhelper.net>
 * All Rights Reserved
 * 
 * If you are interested in methods used in this project, follow the
 * open source project at https://github.com/mi-g/fang
 */


angular.module('VDH').controller('VDHScrapEndCtrl', 
	['$scope', 'VDH.util',
	 	function($scope,VDHUtil) {
			VDHUtil.prepareScope($scope);
			$scope.launch = function() {
				$scope.post("launch",{ });
			}
			$scope.container = function() {
				$scope.post("container",{ });
			}
			$scope.convert = function() {
				$scope.post("convert",{ });
			}
	}]);


'use strict';
angular.module('cat')
    .directive('catPaginated', function CatPaginatedDirective($log, catI18nService) {
        var SEARCH_PROP_KEY = 'cc.catalysts.cat-paginated.search.prop';

        return {
            replace: true,
            restrict: 'E',
            transclude: true,
            scope: {
                listData: '=?',
                syncLocation: '=?'
            },
            templateUrl: 'template/cat-paginated.tpl.html',
            link: function CatPaginatedLink(scope, element, attrs) {
                if (!!attrs.searchProps) {
                    scope.searchProps = _.filter(attrs.searchProps.split(','), function (prop) {
                        return !!prop;
                    });

                    scope.searchPropertyPlaceholders = {};

                    _.forEach(scope.searchProps, function (searchProp) {
                        scope.searchPropertyPlaceholders[searchProp] = 'Search by ' + searchProp;
                        catI18nService.translate(SEARCH_PROP_KEY, {prop: searchProp})
                            .then(function (message) {
                                scope.searchPropertyPlaceholders[searchProp] = message;
                            });
                    });
                }
            },
            controllerAs: 'catPaginatedController',
            controller: function CatPaginatedController($scope, $location, $timeout, $rootScope, catListDataLoadingService, catI18nService) {
                var that = this;
                var searchTimeout = null, DELAY_ON_SEARCH = 500;
                var PAGINATION_PREVIOUS_KEY = 'cc.catalysts.cat-paginated.pagination.previous';
                var PAGINATION_NEXT_KEY = 'cc.catalysts.cat-paginated.pagination.next';
                var PAGINATION_FIRST_KEY = 'cc.catalysts.cat-paginated.pagination.first';
                var PAGINATION_LAST_KEY = 'cc.catalysts.cat-paginated.pagination.last';

                if (_.isUndefined($scope.listData)) {
                    $scope.listData = $scope.$parent.listData;
                    if (_.isUndefined($scope.listData)) {
                        throw new Error('listData was not defined and couldn\'t be found with default value');
                    }
                }

                if (_.isUndefined($scope.syncLocation)) {
                    $scope.syncLocation = _.isUndefined($scope.$parent.detail);
                }

                $scope.paginationText = {
                    previous: 'Previous',
                    next: 'Next',
                    first: 'First',
                    last: 'Last'
                };

                function handlePaginationTextResponse(prop) {
                    return function (message) {
                        $scope.paginationText[prop] = message;
                    };
                }


                function _loadPaginationTranslations() {
                    catI18nService.translate(PAGINATION_PREVIOUS_KEY).then(handlePaginationTextResponse('previous'));
                    catI18nService.translate(PAGINATION_NEXT_KEY).then(handlePaginationTextResponse('next'));
                    catI18nService.translate(PAGINATION_FIRST_KEY).then(handlePaginationTextResponse('first'));
                    catI18nService.translate(PAGINATION_LAST_KEY).then(handlePaginationTextResponse('last'));
                }

                _loadPaginationTranslations();

                $rootScope.$on('cat-i18n-refresh', function () {
                    _loadPaginationTranslations();
                });


                $scope.listData.search = $scope.listData.search || $scope.listData.searchRequest.search() || {};

                var searchRequest = $scope.listData.searchRequest;

                var reload = function (delay) {
                    $timeout.cancel(searchTimeout);
                    searchTimeout = $timeout(function () {
                        if (searchRequest.isDirty()) {
                            catListDataLoadingService.load($scope.listData.endpoint, searchRequest).then(
                                function (data) {
                                    _.assign($scope.listData, data);
                                }
                            );
                        }
                    }, delay || 0);
                };

                $scope.$watch('listData.sort', function (newVal) {
                    if (!!newVal) {
                        console.log('broadcasting sort changed: ' + angular.toJson(newVal));
                        $scope.$parent.$broadcast('SortChanged', newVal);
                    }
                }, true);

                $scope.$on('SearchChanged', function (event, value, delay) {
                    searchChanged(value, delay);
                });

                function updateLocation() {
                    if ($scope.syncLocation !== false) {
                        searchRequest.setSearch($location);
                        $location.replace();
                    }
                }

                $scope.$watch('listData.pagination', function () {
                    updateLocation();
                    reload();
                }, true);

                var searchChanged = function (value, delay) {
                    searchRequest.search(value);
                    updateLocation();
                    $scope.listData.pagination.page = 1;
                    reload(delay);
                };

                var updateSearch = function (value) {
                    var search = searchRequest.search();
                    _.assign(search, value);
                    $rootScope.$broadcast('SearchChanged', search, DELAY_ON_SEARCH);
                };

                $scope.$watch('listData.search', updateSearch, true);

                this.sort = function (value) {
                    searchRequest.sort(value);
                    updateLocation();
                    $scope.listData.pagination.page = 1;
                    reload();
                };

                this.getSearch = function () {
                    return searchRequest.search();
                };

                this.getSearchRequest = function () {
                    return searchRequest;
                };

                $scope.$on('SortChanged', function (event, value) {
                    that.sort(value);
                });
            }
        };
    });

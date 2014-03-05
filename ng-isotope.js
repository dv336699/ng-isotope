/**
 * ng-isotope v0.0.2
 * AngularJS directives for Isotope by Metafizzy
 * http://isotope.metafizzy.co

 * Copyright 2014 Diego Vieira <diego@protos.inf.br>
 */
 
 'use strict';

angular.module('ng-isotope', [])
    .directive('isotopeGrid', function ($timeout) {
        return {
            restrict: 'A',
            scope: {
                items: '=isotopeGrid',
                sortBy: '=isotopeSort',
                sortData: '=isotopeSortData'
            },
            link: function (scope, element, attrs) {
                var options = {
                    itemSelector: attrs.isotopeItemSelector || 'div',
                    layoutMode: attrs.isotopeLayoutMode || 'fitRows',
                    getSortData: scope.sortData || {}
                };

                element.isotope(options);

                scope.$watch('items', function () {
                    $timeout(function () {
                        element.isotope('reloadItems').isotope(options);
                    });
                }, true);

                if (typeof attrs.isotopeSortEvent !== 'undefined') {
                    scope.$on(attrs.isotopeSortEvent, function (data, sort) {
                        // @todo search direction
                        options.sortBy = sort.sort || 'original-order';
                        element.isotope(options);
                    });
                }

                if (typeof attrs.isotopeFilterEvent !== 'undefined') {
                    scope.$on(attrs.isotopeFilterEvent, function (data, filter) {
                        options.filter = filter.filter;
                        element.isotope(options);
                    });
                }

                scope.$watch('items', function () {
                    $timeout(function () {
                        element.isotope('reloadItems').isotope(options);
                    });
                }, true);

                if (typeof attrs.isotopeReloadEvent !== 'undefined') {
                    scope.$on(attrs.isotopeReloadEvent, function (data, filter) {
                        $timeout(function () {
                            element.isotope('reloadItems').isotope(options);
                        });
                    });
                }
            }
        };
    })
    .directive('isotopeSortBy', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('click', function () {
                    var elm = angular.element(element);
                    var parent = elm.parent();
                    parent.find('.active').removeClass('active');
                    elm.addClass('active');
                    var sortEvent = parent.attr('isotope-sort-event');
                    if (typeof sortEvent !== 'undefined') {
                        scope.$broadcast(sortEvent, { sort: elm.attr('isotope-sort-by') });
                    }
                });
            }
        };
    })
    .directive('isotopeFilter', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                // @todo make this more user friendly
                var elm = angular.element(element);
                var elementType = elm.prop('tagName');
                if (elementType == 'DIV') {
                    elm.find('*[isotope-filter-by]').bind('click', function (i, e) {
                        angular.element(this).parent().find('.active').removeClass('active');
                        angular.element(this).addClass('active');

                        var filter = angular.element(this).attr('isotope-filter-by');
                        var group = attrs.isotopeFilterGroup;
                        if (typeof group !== 'undefined') {
                            var filterArray = [];

                            angular.element('body').find('*[isotope-filter-group=' + group + ']').each(function (i, e) {
                                angular.element(e).find('*[isotope-filter-by]').each(function (i, e) {
                                    if (angular.element(e).hasClass('active')) {
                                        var selectedFilter = angular.element(e).attr('isotope-filter-by');
                                        if (selectedFilter !== '*') {
                                            filterArray.push(selectedFilter);
                                        }
                                    }
                                });
                            });

                            if (filterArray.length > 0) {
                                filter = filterArray.join('');
                            }
                        }

                        if (typeof attrs.isotopeFilterEvent !== 'undefined') {
                            scope.$broadcast(attrs.isotopeFilterEvent, { filter: filter });
                        }
                    });
                }

                if (elementType == 'SELECT') {
                    element.bind('change', function () {
                        var filter = elm.find('option:selected').attr('isotope-filter-by');
                        var group = attrs.isotopeFilterGroup;
                        if (typeof group !== 'undefined') {
                            var filterArray = [];

                            angular.element('body').find('*[isotope-filter-group=' + group + ']').each(function (i, e) {
                                var selectedFilter = angular.element(e).find('option:selected').attr('isotope-filter-by');
                                if (selectedFilter !== '*') {
                                    filterArray.push(selectedFilter);
                                }
                            });

                            if (filterArray.length > 0) {
                                filter = filterArray.join('');
                            }
                        }

                        if (typeof attrs.isotopeFilterEvent !== 'undefined') {
                            scope.$broadcast(attrs.isotopeFilterEvent, { filter: filter });
                        }
                    });
                }
            }
        };
    });
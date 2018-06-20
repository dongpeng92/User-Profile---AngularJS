var app = angular.module('myapp', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'home.html',
        resolve: ['authService', function (authService) {
            return authService.checkUserStatus();
        }]
    })
        .when('/login', {
            templateUrl: 'login.html',
            controller: 'loginController'
        })
        .when('/register', {
            templateUrl: 'register.html',
            controller: 'registerController'
        })
        .when('/profile', {
            templateUrl: 'profile.html',
            resolve: ['authService', function (authService) {
                return authService.checkUserStatus();
            }]
        })
        .when('/message', {
            templateUrl: 'message.html',
            // controller: 'userController',
            resolve: ['authService', function (authService) {
                return authService.checkUserStatus();
            }]
        })
        .when('/logout', {
            template: `<h3>Loging out...</h3>`,
            // controller: 'logoutController',
            resolve: ['authService', function (authService) {
                return authService.logout();
            }]
        })
        .otherwise({
            redirectTo: '/'
        })
});

app.controller('registerController', function ($scope, $http, $location) {
    $scope.register = function () {
        $http.post('http://localhost:3000/postuser', $scope.authform)
            .then(function (resp) {
                if(resp.data.flg) {
                    alert("Data saved!!");
                    $location.path('/login');
                }
            })
    }
});

app.controller('loginController', function ($scope, $location, $http, $rootScope) {
    $scope.login = function () {
        console.log($scope.auth);
        var username = $scope.auth.username;
        $http.get(`http://localhost:3000/finduser?username=${username}&password=${$scope.auth.password}`)
            .then(function (resp) {
                if(resp.data.length) {
                    $rootScope.user = resp.data[0];
                    console.log($rootScope.user);
                    $rootScope.isLoggedIn = resp.data[0].isLoggedin;
                    alert("Login Success");
                    $location.path('/');
                }
            })
    };
    $scope.signup = function () {
        $location.path('/register');
    };
});

app.factory('authService', function ($q, $http, $rootScope, $location) {
    return {
        'checkUserStatus': function () {
            var defer = $q.defer();
            // $http.get(`http://localhost:3000/checkStatus/${$rootScope.user_id}`)
            //     .then(function (resp) {
            //         // console.log(resp.data);
            //         if(resp.data.isLoggedin) {
            //             console.log("Logged in");
            //             defer.resolve();
            //         } else {
            //             $location.path('/login');
            //             defer.reject();
            //         }
            //     })
            // return defer.promise;
            if($rootScope.isLoggedIn){
                console.log("Logged in");
                defer.resolve();
            } else {
                $location.path('/login');
                defer.reject();
            }
        },
        'logout': function () {
            console.log($rootScope.user);
            $http.get(`http://localhost:3000/deleteFlag?user=${$rootScope.user}`)
                .then(function (resp) {
                    if(!resp.data.isLoggedin){
                        $rootScope.isLoggedIn = false;
                        alert('Please Login!');
                        $location.path('/');
                    }
                })
        }
    }
});

app.controller('logoutController', function ($scope, $rootScope, $http) {
    $scope.logout = function () {
        $rootScope.isLoggedIn = false;
        $http.get(`http://localhost:3000/deleteFlag?user=${$rootScope.user}`)
            .then(function (resp) {
                alert('Please Login!')
            })
    }
});
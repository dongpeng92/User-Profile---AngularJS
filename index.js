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
            controller: 'profileController',
            resolve: ['authService', function (authService) {
                return authService.checkUserStatus();
            }]
        })
        .when('/message', {
            templateUrl: 'message.html',
            controller: 'messageController',
            resolve: ['authService', function (authService) {
                return authService.checkUserStatus();
            }]
        })
        .when('/message/:mId', {
            templateUrl: 'details.html',
            controller: 'detailController',
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
            $http.get(`http://localhost:3000/checkStatus`)
                .then(function (resp) {
                    // console.log(resp.data);
                    if(resp.data.length > 0) {
                        console.log("Logged in");
                        $rootScope.user = resp.data[0];
                        defer.resolve();
                    } else {
                        $location.path('/login');
                        defer.reject();
                    }
                });
            return defer.promise;
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

app.controller('profileController', function ($scope, $rootScope, $http, $location) {
    // $http.get(`http://localhost:3000/checkStatus`)
    //     .then(function (resp) {
    //         $scope.userprofile = resp.data[0];
    //         console.log($scope.userprofile);
    //     });

    $scope.userprofile = $rootScope.user;
    $scope.changeProfile = function () {
        $http.post('http://localhost:3000/updateuser', $scope.userprofile)
            .then(function (resp) {
                if(resp.data.update) {
                    alert("Data updated!!");
                    $location.path('/profile');
                }
            })
    };
});

app.controller('messageController', function ($scope, $rootScope, $http) {
    // $http.get(`http://localhost:3000/checkStatus`)
    //     .then(function (resp) {
    //         $scope.username = resp.data[0].username;
    //         console.log($scope.username);
    //         $http.get(`http://localhost:3000/getmessage?username=${$scope.username}`)
    //             .then(function (resp) {
    //                 if(resp.data.length > 0) {
    //                     $rootScope.messages = resp.data;
    //                 } else {
    //                     $rootScope.messages = ""
    //                 }
    //             })
    //     });
    $scope.username = $rootScope.user.username;
    $http.get(`http://localhost:3000/getmessage?username=${$scope.username}`)
        .then(function (resp) {
            if(resp.data.length > 0) {
                $scope.messages = resp.data;
            } else {
                $scope.messages = ""
            }
        })
});

app.controller('detailController', function ($scope, $rootScope, $routeParams, $location, $http) {
    $scope.username = $rootScope.user.username;
    $http.get(`http://localhost:3000/getmessage?username=${$scope.username}`)
        .then(function (resp) {
            $scope.messages = resp.data;
            $scope.msg_details =  $scope.messages[$routeParams.mId];
            $scope.back = function () {
                $location.path('/message');
            };
            $scope.reply = function () {
                document.getElementById("reply").style.display="inline";
            };
            $scope.submitReply = function () {
                $scope.msgs = $scope.msg_details.reply ? $scope.msg_details.reply : [];
                $scope.msgs.push($scope.msg);
                console.log($scope.msgs);
                $scope.reply_msg = {
                    "reply": $scope.msgs
                };
                $http.post(`http://localhost:3000/addreply?id=${$scope.msg_details._id}`, $scope.reply_msg)
                    .then(function (resp) {
                        console.log(resp)
                    });
            };
            console.log($scope.msg_details.important);
            if($scope.msg_details.important == "important"){
                document.getElementById("mark").disabled=true;
            }
            $scope.mark = function () {
                $http.get(`http://localhost:3000/mark?id=${$scope.msg_details._id}`)
                    .then(function (resp) {
                        console.log(resp);
                        document.getElementById("mark").disabled=true;
                        $scope.msg_details.important = "important";
                    })
            };
            $scope.delete = function () {
                $http.get(`http://localhost:3000/deletemsg?id=${$scope.msg_details._id}`)
                    .then(function (resp) {
                        alert("Deleted!");
                        $location.path('/message');
                    })
            };
        })
});
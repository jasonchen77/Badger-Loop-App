angular.module('starter.controllers', [])


// Authentication controller
// Put your login, register functions here
.controller('AuthCtrl', function($scope, $ionicHistory, $ionicSideMenuDelegate) {
    // hide back butotn in next view
    $ionicHistory.nextViewOptions({
        disableBack: true
    });

    // disabled swipe menu
    $ionicSideMenuDelegate.canDragContent(false);
})

.controller('MenuCtrl', function($scope, Chats) {
    $scope.Chats = Chats;

    $scope.goToURL = function(url){
        window.open(url, '_system', 'location=yes');
    }
})

.controller('InstaCtrl', function($scope, $timeout, PhotoService) {
    $scope.items = [];
    $scope.newItems = [];
    $scope.noMoreItemsAvailable = false;

    PhotoService.GetFeed().then(function(items) {

      $scope.items = items.concat($scope.items);

    });

    $scope.doRefresh = function() {
      if ($scope.newItems.length > 0) {
        $scope.items = $scope.newItems.concat($scope.items);

        //Stop the ion-refresher from spinning
        $scope.$broadcast('scroll.refreshComplete');

        $scope.newItems = [];
      } else {
        PhotoService.GetNewPhotos().then(function(items) {


          $scope.items = items.concat($scope.items);

          //Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });
      }
    };
    $scope.loadMore = function() {
      PhotoService.GetOldPhotos().then(function(items) {

        $scope.items = $scope.items.concat(items);

        $scope.$broadcast('scroll.infiniteScrollComplete');
        
        // an empty array indicates that there are no more items
        if (items.length === 0) {
          $scope.noMoreItemsAvailable = true;
        }

      });
    };
})

.controller('HomeCtrl', function($rootScope, $scope, TDCardDelegate, $state, $http) {
    console.log('CARDS CTRL');
    var cardTypes = [

        { image: 'img/Frame.png', link: 'https://sketchfab.com/models/78ff061f402948c7a9ddf34d59231f33/embed?autostart=1', name: 'Aluminum Frame'},
        { image: 'img/Carbon.png', link: 'https://sketchfab.com/models/831debd4b0974d3fb55e39c1318eb704/embed?autostart=1', name: 'Carbon Shell'},
        { image: 'img/halbachwheel.png', link: 'https://sketchfab.com/models/753e97d889b04378abfbadd7e5e5796a/embed?autostart=1', name: 'Halbach Wheel'},
        { image: 'img/Braking.png', link: 'https://sketchfab.com/models/7199f633568340c389c4cf1e92063c90/embed?autostart=1', name: 'Braking System'},
        { image: 'img/batterybox.png', link: 'https://sketchfab.com/models/f8afc5ddc991445e854b3f0f46374999/embed?autostart=1', name: 'Battery Box'}
    ];

    $scope.postUpdate = {}; 

    //Get new update from DB
    $http({
      method: 'POST',
      url: SERVER_SIDE_URL + '/postGet'
    }).then(function successCallback(post) {
        $scope.postUpdate.author = post.data.author;
        $scope.postUpdate.timeStamp = post.data.createdAt;
        $scope.postUpdate.text = post.data.text;
    }, function errorCallback(err) {
        
    });

    $scope.cards = Array.prototype.slice.call(cardTypes, 0);
    $rootScope.unseenMsg = 2;

    $scope.cardDestroyed = function(index) {
        $scope.cards.splice(index, 1);
        if ($scope.cards.length == 0){
            //load 5 more cards
            for (i = 0; i<5; i++){
                $scope.addCard();
            }
            //hack to reset index in ng-repeat
            $scope.cards = $scope.cards;
        }
    };

    $scope.addCard = function() {
        var newCard1 = cardTypes[Math.floor(Math.random() * cardTypes.length)];
        newCard1.id = Math.random();
        $scope.cards.push(angular.extend({}, newCard1));
    };

    $scope.cardSwipedLeft = function(index) {
        console.log('LEFT SWIPE');
        //$scope.addCard();
    };
    $scope.reloadCards = function() {
        //console.log('RELOAD CARDS');
        $scope.cards = Array.prototype.slice.call(cardTypes, 0);
        //$scope.addCard();
    };
    $scope.cardPartialSwipe = function(index){
        //console.log('PARTIAL SWIPE')
        return null;
    }
    $scope.cardSwipedRight = function(index) {
        console.log('RIGHT SWIPE');
        //$scope.addCard();
        $state.go('render', { link: $scope.cards[index].link, name: $scope.cards[index].name });
    };
})

// Render controller
.controller('RenderCtrl', function($scope, $state, $sce, $stateParams, $timeout) {
    $scope.link = $sce.trustAsResourceUrl($stateParams.link);
    $scope.name = $stateParams.name;
    $timeout(function () {
   $('.ex-link').click(function () {
     var url = $(this).attr('href');
     window.open(encodeURI(url), '_system', 'location=yes');
     return false;
   })
})
})

// News controller
.controller('NewsCtrl', function($scope, Posts, $state, $cordovaSocialSharing, $http) {
    // get list posts froms service
    Posts.all().then(function(data) {
        $scope.posts = data;
    });

    $scope.sharePost = function(post) {
        if (post.isArticle) {
            $cordovaSocialSharing
                .share("Check out the article BadgerLoop was mentioned in!", "The BadgerLoop team knows what they're doing!", null, post.link) // Share via native share sheet
                .then(function(result) {
                    // Success!
                }, function(err) {
                    // An error occured. Show a message to the user
                });
        } else {
            $cordovaSocialSharing
                .share("Check out the BadgerLoop Team!", "The BadgerLoop team knows what they're doing!", null, 'https://badgerloop.com') // Share via native share sheet
                .then(function(result) {
                    // Success!
                }, function(err) {
                    // An error occured. Show a message to the user
                });
        }
    }

    // view post
    $scope.viewPost = function(post) {
        //Open in different viewer
        if (post.isArticle) {
            $state.go('articles', { link: post.link, name: post.name });
        } else {
            $state.go('post', { postId: post.id });
        }
    }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats, $ionicScrollDelegate, $ionicActionSheet, $timeout, $ionicModal) {
    $scope.chatadd = Chats;
    $scope.chat = Chats.get(0);
    $scope.focusManager = {focusInputOnBlur: true};

    $scope.$on('$ionicView.afterEnter', function () {
        Chats.markAllRead();
    });

    $ionicModal.fromTemplateUrl('templates/chat-info-modal.html', {        
            scope: $scope,        
            animation: 'slide-in-up'      
        }).then(function(modal) {     
            $scope.modal = modal;        
        });       
          
        $scope.openModal = function() {       
        $scope.modal.show();      
        };        
        $scope.closeModal = function() {      
        $scope.modal.hide();      
        };        
        //Cleanup the modal when we're done with it!      
        $scope.$on('$destroy', function() {       
        $scope.modal.remove();        
        });       
        // Execute action on hide modal       
        $scope.$on('modal.hidden', function() {       
        // Execute action     
        });       
        // Execute action on remove modal     
        $scope.$on('modal.removed', function() {      
        // Execute action     
        });

    $scope.sendMessage = function() {
        var d = new Date();
        var message = {
            type: 'sent',
            time: d.toLocaleTimeString(),
            text: $scope.input.message
        };

        $scope.input.message = '';

        // push to massages list
        Chats.addMsg(message);
    };

    $scope.shouldNotFocusOnBlur = function() {
        // console.log("should not focus");
      $scope.focusManager.focusInputOnBlur = false;
    };

    // hover menu
    $scope.onMessageHold = function(e, itemIndex, message) {
        // show hover menu
        $ionicActionSheet.show({
            buttons: [{
                text: 'Copy Text'
            }, {
                text: 'Delete Message'
            }],
            buttonClicked: function(index) {
                switch (index) {
                    case 0: // Copy Text
                        //cordova.plugins.clipboard.copy(message.text);

                        break;
                    case 1: // Delete
                        // no server side secrets here :~)
                        $scope.chat.messages.splice(itemIndex, 1);
                        break;
                }

                return true;
            }
        });
    };

})

.controller('PostCtrl', function($scope, Posts, $state, $stateParams) {

    console.log($stateParams.postId);

    // get list posts froms service
    $scope.post = Posts.get($stateParams.postId);
})

.controller('ArticlesCtrl', function($scope, Posts, $state, $stateParams, $sce) {
    // set up variables
    $scope.link = $sce.trustAsResourceUrl($stateParams.link);
    $scope.name = $stateParams.name;
    console.log($scope.link, $scope.name);
})

// Notifications controller
.controller('NotificationsCtrl', function($scope, Notifications) {
    // get list posts from service
    $scope.notifications = Notifications.all();
})

// ContactsCtrl controller
.controller('TeamCtrl', function($scope, Contacts, $state) {
    // get list posts froms service
    $scope.contacts = Contacts.all();

    // view contact function
    $scope.viewContact = function(link) {
        if (link != null && link != undefined){
            window.open(link, '_blank', 'location=yes');
        }
        else{
            console.log('no link')
        }
    }
})

// Funding controller
.controller('FundCtrl', function($scope, StripeCharge) {
    $scope.ProductMeta = {
        title: "BadgerLoop Fundraising",
        description: "Thank you!",
        priceUSD: 1,
    };

    $scope.status = {
        loading: false,
        message: "",
    };

    $scope.charge = function(amount) {
        if (typeof amount === "string") {
            $scope.ProductMeta.priceUSD = parseInt(amount);
        } else {
            $scope.ProductMeta.priceUSD = amount;
        }
        console.log($scope.ProductMeta.priceUSD);
        $scope.status['loading'] = true;
        $scope.status['message'] = "Retrieving your Stripe Token...";

        // first get the Stripe token
        StripeCharge.getStripeToken($scope.ProductMeta).then(
            function(stripeToken) {
                // -->
                proceedCharge(stripeToken);
            },
            function(error) {
                console.log(error)

                $scope.status['loading'] = false;
                if (error != "ERROR_CANCEL") {
                    $scope.status['message'] = "Oops... something went wrong";
                } else {
                    $scope.status['message'] = "";
                }
            }
        ); // ./ getStripeToken

        function proceedCharge(stripeToken) {

            $scope.status['message'] = "Processing your payment...";

            // then chare the user through your custom node.js server (server-side)
            StripeCharge.chargeUser(stripeToken, $scope.ProductMeta).then(
                function(StripeInvoiceData) {
                    $scope.status['loading'] = false;
                    $scope.status['message'] = "Success! Check your Stripe Account";
                    console.log(StripeInvoiceData)
                },
                function(error) {
                    console.log(error);

                    $scope.status['loading'] = false;
                    $scope.status['message'] = "Oops... something went wrong";
                }
            );

        }; // ./ proceedCharge

    };
})

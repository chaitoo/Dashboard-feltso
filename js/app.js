angular.module('myApp',['AngularChart', 'AngularPieChart'])
.factory('dataFactory', function ($q, $http) {
    return {
      getData: function () {
        var deferred = $q.defer(),
          httpPromise = $http.get('data/overview.json');

        httpPromise.then(function (response) {
          deferred.resolve(response);
        }, function (error) {
          console.error(error);
        });

        return deferred.promise;
      }
    };
  })
.service('positiveService', function($http, dataFactory){
  var datax = {
              "xdata": [],
              "ydata" : []
            };
  var yd = {
    "name" : "",
    "data" :[]
  };


  dataFactory.getData()
  .then(function (response) {
    var x = 0, y = 0, i=0, p=0;

    window.localStorage['sotp'] = angular.toJson(response.data.overview.sentiment_over_time.positive);

    var senti = window.localStorage['sotp'];

    var sentiment_pos = JSON.parse(senti);

    yd.name="positive"

    angular.forEach(sentiment_pos, function(){

      datax.xdata.push(sentiment_pos[x++].time);
      yd.data.push(sentiment_pos[y++].count);

  });
  datax.ydata.push(yd);
}, function (error) {
  console.error(error);
});

return datax;
})
.service('negativeService', function($http, dataFactory){
  var datas = {
              "xdata": [],
              "ydata" : []
            };
  var yd = {
    "name" : "",
    "data" :[]
  };


  dataFactory.getData()
  .then(function (response) {
    var x = 0, y = 0, i=0, p=0;


    window.localStorage['sotn'] = angular.toJson(response.data.overview.sentiment_over_time.negative);

    var senti = window.localStorage['sotn'];

    var sentiment_neg = JSON.parse(senti);

    yd.name="Negative"

    angular.forEach(sentiment_neg, function(){
      //console.log(datax.ydata.name);
      datas.xdata.push(sentiment_neg[x++].time);
      yd.data.push(sentiment_neg[y++].count);

  });
  datas.ydata.push(yd);
}, function (error) {
  console.error(error);
});

return datas;
})
.controller('mainCtrl',['$scope', '$http', 'positiveService', 'negativeService', 'dataFactory', function($scope, $http, positiveService, negativeService, dataFactory){
  $scope.heading='Dashboard-FeltSo';

$scope.lineChartYData_pos=positiveService.ydata;
$scope.lineChartXData_pos=positiveService.xdata;

$scope.lineChartYData_neg=negativeService.ydata;
$scope.lineChartXData_neg=negativeService.xdata;



  //-----------------------------------

  dataFactory.getData()
  .then(function(response){

    window.localStorage['pos_count'] = response.data.overview.source_wise_stats.facebook.positive_count;
    window.localStorage['neg_count'] = response.data.overview.source_wise_stats.facebook.negative_count;




  });
  var y1 = window.localStorage['pos_count'];
  $scope.pieData = [{
                        name: "Positive Count",
                        y: 63
                    }, {
                        name: "Negative Count",
                        y: 52
                      }];
  
  console.dir($scope.pieData);
  //------------------------------------
//------------- Top lIkers and Dislikers -----------------
  dataFactory.getData()
      .then(function(response){
        $scope.topLikers = response.data.overview.top_likers;
        $scope.topDislikers = response.data.overview.top_dis_likers;
      });

 //-----------------------------------------------------------

 //------------ Top Positive and Negative Posts -------------
  dataFactory.getData()
      .then(function(response){
        $scope.topPosPosts = response.data.overview.top_pos_posts;
        $scope.topNegPosts = response.data.overview.top_neg_posts;
        //console.dir($scope.topPosPosts[0].created_time.timezone);
      });
 //--------------------------------------------------------------

 //---------------- Top Positive and Negative Comments ------------

 dataFactory.getData()
      .then(function(response){
        $scope.topPosComments = response.data.overview.top_pos_comments;
        $scope.topNegComments = response.data.overview.top_neg_comments;
      });

 //----------------------------------------------------------------

 //-------------------------Sorting--------------------------------
 $scope.order = 'date';
 $scope.getscore = function(){
   $scope.order = 'score';
 }
 $scope.getpercent = function(){
   $scope.order = 'percentage';
 }
 $scope.sort = function(attr) {
       if (  $scope.order == 'date') {
            return new Date(attr.created_at);
        }
        else{
          if($scope.order == 'sccore')
          {
              return attr.score;
          }
          else{
            return attr.percentage;
          }
        }

   }
 //-----------------------------------------------------------------

 //----------------------pdfmake----------------------------
 $scope.download = function(){
   dataFactory.getData()
        .then(function(response){
          $scope.overview = response.data.overview;
          $scope.sentimentovertimepos = response.data.overview.sentiment_over_time.positive;
          $scope.sentimentovertimeneg = response.data.overview.sentiment_over_time.negative;
          $scope.toplike = response.data.overview.top_likers;
          $scope.topdislike = response.data.overview.top_dis_likers;
          $scope.topposposts = response.data.overview.top_pos_posts;
          $scope.topnegposts = response.data.overview.top_neg_posts;
          $scope.topPosComments = response.data.overview.top_pos_comments;
          $scope.topNegComments = response.data.overview.top_neg_comments;
          //console.log( $scope.topPosComments[0].text);
          var doc = { content: [] };
          var i = 0;
          var head = {
            text: '',
            style: 'header'
          };
          var body = {
            ol: []
          };
          //-----sot -------
          var head = {
            text: '',
            style: 'header'
          };
          head.text = "\nPositive-Sentiments Over Time";
          doc.content.push(head);
          angular.forEach($scope.sentimentovertimepos, function(){
            body.ol.push('Time: '+$scope.sentimentovertimepos[i].time+'\nCount: '+$scope.sentimentovertimepos[i++].count)
          });
          doc.content.push(body);

          var i = 0;
          var head = {
            text: '',
            style: 'header'
          };
          var body = {
            ol: []
          };
          head.text = "\nNegative-Sentiments Over Time";
          doc.content.push(head);
          angular.forEach($scope.sentimentovertimeneg, function(){
            body.ol.push('Time: '+$scope.sentimentovertimeneg[i].time+'\nCount: '+$scope.sentimentovertimeneg[i++].count)
          });
          doc.content.push(body);
          //--------------------

          //-------------source_wise_stats--------------
          var i = 0;
          var head = {
            text: '',
            style: 'header'
          };
          var body = {
            ol: []
          };
          head.text = "\nSource Wise Stats - Facebook";
          doc.content.push(head);
          body.ol.push('Positive Count: '+$scope.overview.source_wise_stats.facebook.positive_count);
          body.ol.push('Negative Count: '+$scope.overview.source_wise_stats.facebook.negative_count);
          doc.content.push(body);
          //----------------------------------------------

          //-----------------likers and dislikers ----------------------

          var i = 0;
          var head = {
            text: '',
            style: 'header'
          };
          var body = {
            ol: []
          };
          head.text = "\nTop Likers";
          doc.content.push(head);
          angular.forEach($scope.toplike, function(){
            body.ol.push('Name: '+$scope.toplike[i].name+'\nScore: '+$scope.toplike[i].score+'\nPercentage: '+$scope.toplike[i++].percentage)
          });
          doc.content.push(body);

          var i = 0;
          var head = {
            text: '',
            style: 'header'
          };
          var body = {
            ol: []
          };
          head.text = "\nTop dislikers";
          doc.content.push(head);
          angular.forEach($scope.topdislike, function(){
            body.ol.push('Name: '+$scope.topdislike[i].name+'\nScore: '+$scope.topdislike[i].score+'\nPercentage: '+$scope.topdislike[i++].percentage)
          });
          doc.content.push(body);
          //---------------------------------------------------------------

          //------------------Posts --------------------------------------
          var i = 0;
          var head = {
            text: '',
            style: 'header'
          };
          var body = {
            ol: []
          };
          head.text = "\nTop Positive Posts";
          doc.content.push(head);
          angular.forEach($scope.topposposts, function(){
            body.ol.push('Date: '+$scope.topposposts[i].created_time.date+'\nMessage: '+$scope.topposposts[i].message+'\nScore: '+$scope.topposposts[i].score+'\nPercentage: '+$scope.topposposts[i++].percentage)
          });
          doc.content.push(body);

          var i = 0;
          var head = {
            text: '',
            style: 'header'
          };
          var body = {
            ol: []
          };
          head.text = "\nTop Negative Posts";
          doc.content.push(head);
          angular.forEach($scope.topnegposts, function(){
            body.ol.push('Date: '+$scope.topnegposts[i].created_time.date+'\nMessage: '+$scope.topnegposts[i].message+'\nScore: '+$scope.topnegposts[i].score+'\nPercentage: '+$scope.topnegposts[i++].percentage)
          });
          doc.content.push(body);
          //--------------------------------------------------------------

          //--------------

          //----positive n neg Comments------------------------
          i = 0;
          var head = {
            text: '',
            style: 'header'
          };
          var body = {
            ol: []
          };
          head.text = "\nTop Positive Comments";
          //console.log(head);
          angular.forEach($scope.topPosComments, function(){
            console.log($scope.topPosComments);
            body.ol.push('Name: '+$scope.topPosComments[i].user_info.name+'\nComment: '+$scope.topPosComments[i].text+'\nScore: '+$scope.topPosComments[i].score+'\nDate: '+$scope.topPosComments[i++].created_at)
          });
          doc.content.push(head);
          doc.content.push(body);
          //console.log(doc);

          i = 0;
          var head = {
            text: '',
            style: 'header'
          };
          var body = {
            ol: []
          };
          head.text = "\nTop Negative Comments";
          //console.log(head);
          angular.forEach($scope.topNegComments, function(){
            console.log($scope.topNegComments);
            body.ol.push('Name: '+$scope.topNegComments[i].user_info.name+'\nComment: '+$scope.topNegComments[i].text+'\nScore: '+$scope.topNegComments[i].score+'\nDate: '+$scope.topNegComments[i++].created_at)
          });
          doc.content.push(head);
          doc.content.push(body);
          //-----------------------------
          pdfMake.createPdf(doc).download("Dashboard-FeltSo.pdf");
        });

 }
 //---------------------------------------------------------
}]);

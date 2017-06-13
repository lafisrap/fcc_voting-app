'use strict';

(function () {

   var addButton = document.querySelector('.btn-add');
   var deleteButton = document.querySelector('.btn-delete');
   var clickNbr = document.querySelector('#click-nbr');
   var clickTmp = document.querySelector('#clickimg');
   var apiUrl = appUrl + '/api/:id/polls';
   var apiUrl2 = appUrl + '/api/:id/vote';

   function updateClickCount (data) {
      var clicksObject = JSON.parse(data);
      clickNbr.innerHTML = clicksObject.clicks;
   }

   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount));

   addButton.addEventListener('click', function () {

      ajaxFunctions.ajaxRequest('POST', apiUrl, function () {
         ajaxFunctions.ajaxRequest('GET', apiUrl, function(req, res) {
            console.log("pollController 1: ", req, res);
         });
      }, {
         title: "Intrigante Frage ...",
         question: "wer ist besser?",
         answers: [
            "Ich!", "Du", "Er, sie es"
         ]
      });

   }, false);

   deleteButton.addEventListener('click', function () {

      ajaxFunctions.ajaxRequest('DELETE', apiUrl, function (req, res) {
         console.log("pollController 2: ", req, res);
         ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount);
      }, {id : "593147b2b3330e0dd122258b"}); // That's an mongo db id

   }, false);

   clickTmp.addEventListener('click', function () {

      console.log("pollController 3a: ");
      ajaxFunctions.ajaxRequest('POST', apiUrl2, function (req, res) {
         console.log("pollController 3b: ", req, res);
      }, {id : "59314db7701fad0e23af6fd9", answer: 1, ownAnswer: "Weiß nicht!"});

   }, false);

})();

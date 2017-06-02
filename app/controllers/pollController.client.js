'use strict';

(function () {

   var addButton = document.querySelector('.btn-add');
   var deleteButton = document.querySelector('.btn-delete');
   var clickNbr = document.querySelector('#click-nbr');
   var apiUrl = appUrl + '/api/:id/polls';

   function updateClickCount (data) {
      var clicksObject = JSON.parse(data);
      clickNbr.innerHTML = clicksObject.clicks;
   }

   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount));

   addButton.addEventListener('click', function () {

      ajaxFunctions.ajaxRequest('POST', apiUrl, function () {
         ajaxFunctions.ajaxRequest('GET', apiUrl, function(req, res) {
            console.log("pollController: ", req, res);
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

      ajaxFunctions.ajaxRequest('DELETE', apiUrl, function () {
         ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount);
      });

   }, false);

})();

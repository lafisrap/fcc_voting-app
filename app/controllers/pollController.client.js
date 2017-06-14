'use strict';

(function () {

   var voteButton = document.querySelector('.btn-vote');
   var deleteButton = document.querySelector('.btn-delete');
   var clickNbr = document.querySelector('#click-nbr');
   var clickTmp = document.querySelector('#clickimg');
   var pollsUrl = appUrl + '/api/:id/polls';
   var voteUrl = appUrl + '/api/:id/vote';
   
   function updatePolls (data) {
      var polls = JSON.parse(data);

      if( polls.latestPolls && $("#latest-polls").length ) {
         showPolls("latest-polls", polls.latestPolls);
      }
      
      console.log(polls);
      if( polls.activePolls && $("#active-polls").length ) {
         showPolls("active-polls", polls.activePolls);
      }

      if( polls.userPolls && $("#user-polls").length ) {
         showPolls("user-polls", polls.userPolls);
      }
      
      activateButtons();
   }

   function showPolls( ref, polls ) {
      console.log(ref, polls);
      
      var html = `
         <div class="panel-group" id="${ref}-accordion">
         ${ polls.map((poll, i) => showPoll(poll, i, ref)).join("") }
         </div>`;

      $("#"+ref).html(html);
   }
   
   function showPoll( poll, i, ref ) {
      return `
         <div id="panel-${i}" class="panel panel-default">
            <div class="panel-heading">
               <h4 class="panel-title">
                  <a data-toggle="collapse" data-parent="#${ref}-accordion" href="#${ref}-collapse${i}">
                  ${poll.title}</a>
               </h4>
            </div>
            <div id="${ref}-collapse${i}" class="panel-collapse collapse${i===0?' in':''}">
               <div class="panel-body">
                  <div class="row">
                     <div class="poll-selection col col-sm-6">
                        <div class="question">${poll.question}</div>
                        <div class="answers">${showAnswers(poll.answers)}</div>
                        <div class="btn btn-primary btn-vote" vote-id="${poll._id}">Vote</div>
                        <div class="btn btn-default btn-tweet">Tweet</div>
                     </div>
                     <div class="poll-selection col col-sm-6">
                        ${ showDiagram() }
                     </div>
                  </div>
               </div>
            </div>
         </div>
      `      
   }
   
   function showDiagram( ) {
      return `<div>Diagram</div>`;
   }
   
   function showAnswers(answers) {
      
      let html = answers.map((answer, i) => {
         return `
            <div class="radio radio${i}">
               <label><input type="radio" name="optradio" i="${i}">${answer}</label>
            </div>               
         `;
      }).join("");
      
      html += `
            <div class="radio radio${answers.length}">
               <label><input type="radio" name="optradio" i="${answers.length}">
                  <input class="own-answer" type="text" size="30" name="ownAnswer" />
               </label>
            </div>               
      `;
      
      return html;
   }
   
   function selectRadio() {
      $(this).parent().find('input[type="radio"]').prop("checked", "true");
   }

   function activateButtons() {
      
      // For Voting
      $( ".btn-vote" ).on("click", function () {
         
         let self=$(this),
            radio = self.parent().find("input[type='radio']:checked"),
            id = self.attr("vote-id"),
            answers = self.parent().find("input[type='radio']").length,
            answer = radio.length && radio.attr("i") || null,
            ownAnswer = answers-1==answer? self.parent().find("input[type='text']").val():undefined;
   
         console.log("voteButton;", radio, id, answer, answers, ownAnswer);
         
         if( answer ) {
            ajaxFunctions.ajaxRequest('POST', voteUrl, function (req, res) {
               console.log("pollController Vote received: ", req, res);
            }, {id, answer, ownAnswer});
         }
      });

      $( ".own-answer ").on("focus", selectRadio );   
   }


   ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', pollsUrl, updatePolls));

/*
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
*/




})();

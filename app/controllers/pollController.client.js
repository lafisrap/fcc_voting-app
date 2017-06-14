'use strict';

(function () {

   var pollsUrl = appUrl + '/api/:id/polls';
   var voteUrl = appUrl + '/api/:id/vote';
   
   function updatePolls (data) {
      var polls = JSON.parse(data);

      if( polls.latestPolls && $("#latest-polls").length ) {
         showPolls("latest-polls", polls.latestPolls);
      }
      
      if( polls.activePolls && $("#active-polls").length ) {
         showPolls("active-polls", polls.activePolls);
      }

      if( polls.userPolls && $("#user-polls").length ) {
         showPolls("user-polls", polls.userPolls);

         document.pollClientNewPoll = {
            title: "",
            question: "",
            answers: [],
         };
         
         showNewPoll( html => $( "#new-poll" ).html(html) );
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

   function showNewPoll( refresh ) {
      let poll = document.pollClientNewPoll;
      
      document.pollClientAddAnswer = function(id) {
         let answer = $("#"+id).val();
         
         if( answer.length > 0 ) {
            poll.answers.push(answer);
            refresh(makeNewPoll());
         }
      }; 
      
      document.pollClientRemoveAnswer = function(i) {
         poll.answers.splice(i,1);
         refresh(makeNewPoll());
      };

      document.pollClientDSetTitle = function(id) {
         poll.title = $("#"+id).val();
      };
         
      document.pollClientSetQuestion = function(id) {
         poll.question = $("#"+id).val();
      };
         
      document.pollClientAddPoll = function() {
         if( poll.title.length && poll.question.length && poll.answers.length ) {
            ajaxFunctions.ajaxRequest('POST', pollsUrl, function () {
               ajaxFunctions.ajaxRequest('GET', pollsUrl, function(req, res) {
                  console.log("pollController 1: ", req, res);
                  
                  poll.title = "";
                  poll.question = "";
                  poll.answers = [];

                  refresh(makeNewPoll());
               });
            }, poll );
         }
      };
         
      refresh(makeNewPoll());
   }
   
   function makeNewPoll() {
      let poll = document.pollClientNewPoll;
      
      return `
         <div id="panel-new-poll" class="panel panel-default">
            <div class="panel-heading">
               <h4 class="panel-title">
                  <input 
                     id="new-poll-title"
                     type="text"
                     size="50"
                     name="title"
                     value="${poll.title}"
                     placeholder="Give me a title ..."
                     onchange="pollClientDSetTitle('new-poll-title')"
                  />
               </h4>
            </div>
            <div class="panel-body">
               <div class="row">
                  <div class="poll-selection col col-sm-6">
                     <input
                        id="new-poll-question"
                        type="text"
                        size="50"
                        name="title"
                        value="${poll.question}"
                        placeholder="And a question ..."
                        onchange="pollClientSetQuestion('new-poll-question')"
                     />
                     <div class="answers">${showAnswers(poll.answers, true)}</div>
                      <input id="new-answer" type="text" size="50" name="newAnswer" placeholder="Type an answer ..." />
                     <div class="btn btn-primary btn-add-answer" onclick="pollClientAddAnswer('new-answer')">Add</div>
                     <div class="btn btn-success btn-block btn-add-poll" onclick="pollClientAddPoll()">Create Poll</div>
                  </div>
                  <div class="poll-selection col col-sm-6">
                     ${ showDiagram() }
                  </div>
               </div>
            </div>
         </div>
      `
   }
   
   function showDiagram( ) {
      return `<div>Diagram</div>`;
   }
   
   function showAnswers(answers, edit, removeAnswer) {
      
      let html = answers.length && answers.map((answer, i) => {
         return `
            <div class="radio radio${i}">
               <label><input type="radio" name="optradio" i="${i}">${answer}</label>
               ${ edit? '<div class="btn btn-default btn-remove-answer" onclick="pollClientRemoveAnswer('+i+')">Remove</div>' : "" }
            </div>               
         `;
      }).join("") || "<div>No answers yet ...</div>";
      
      if( !edit ) {
         html += `
               <div class="radio radio${answers.length}">
                  <label><input type="radio" name="optradio" i="${answers.length}">
                     <input class="own-answer" type="text" size="30" name="ownAnswer" />
                  </label>
               </div>               
         `;
      }
      
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
   deleteButton.addEventListener('click', function () {

      ajaxFunctions.ajaxRequest('DELETE', apiUrl, function (req, res) {
         console.log("pollController 2: ", req, res);
         ajaxFunctions.ajaxRequest('GET', apiUrl, updateClickCount);
      }, {id : "593147b2b3330e0dd122258b"}); // That's an mongo db id

   }, false);
*/




})();

'use strict';

(function () {

   const pollsUrl = appUrl + '/api/:id/polls';
   const pollUrl = appUrl + '/../api/:id/poll';
   const voteUrl = appUrl + '/../api/:id/vote';
   const MAX_ANSWERS = 10;
   const ANSWER_COLORS = [
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(239, 31, 234, 0.2)',
      'rgba(136, 84, 84, 0.2)',
      'rgba(22, 95, 154, 0.2)',
      'rgba(20, 163, 22, 0.2)',
      'rgba(255, 159, 64, 0.2)'
   ];
   const ANSWER_BORDERS = [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(239, 31, 234, 1)',
      'rgba(136, 84, 84, 1)',
      'rgba(22, 95, 154, 1)',
      'rgba(20, 163, 22, 1)',
      'rgba(255, 159, 64, 1)'
   ]

   document.pollClientPollsVoted = localStorage.pollClientPollsVoted && JSON.parse(localStorage.pollClientPollsVoted) || [];
   
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

   function updatePoll (data) {
      var poll = JSON.parse(data);
      
      var html = showPoll( poll, 0, "single" );

      $("#poll").html(html);
      
      drawCharts([poll], "single-poll");
      
      activateButtons();
   }

   function showPolls( ref, polls ) {
      var html = `
         <div class="panel-group" id="${ref}-accordion">
         ${ polls.map((poll, i) => showPoll(poll, i, ref)).join("") }
         </div>`;

      $("#"+ref).html(html);
      
      drawCharts(polls, ref);
   }
   
   function showPoll( poll, i, ref ) {
      return `
         <div id="panel-${ref}-${i}" class="panel panel-default panel-poll">
            <div class="panel-heading">
               <h4 class="panel-title">
                  <a data-toggle="collapse" data-parent="#${ref}-accordion" href="#${ref}-collapse${i}">
                  ${poll.title}</a>
               </h4>
            </div>
            <div id="${ref}-collapse${i}" class="panel-collapse collapse${i===0?' in':''}">
               <div class="panel-body-${poll._id} panel-body">
                  ${ makePoll( poll, ref ) }
               </div>
            </div>
         </div>
      `      
   }
   
   function makePoll( poll, ref ) {
      
      let voted = document.pollClientPollsVoted,
          vote = voted.filter(p => poll._id === p.id)[0],
          answers = poll.answers.map((a,i) => a).join(" / "),
          tweet= encodeURI((poll.question+": "+answers).slice(0,116)),
          buttons = vote? `
               <span>You voted!</span>
               <a href="https://twitter.com/intent/tweet?text=${tweet}&url=https://voting-server-lafisrap.c9users.io/single/${poll._id}" target="_blank">
                  <div class="btn btn-tweet btn-default btn-xs">
                     <img src="/public/img/twitter_32px.png" class="img img-responsive" /> Tweet it
                  </div>
               </a>
          ` : `
               <div class="btn btn-primary btn-vote" poll-id='${poll._id}'>Vote</div>
          `;
          
          if( ref === "user-polls" ) {
            buttons += `
               <div class="btn btn-danger btn-delete" poll-id='${poll._id}'>Delete Poll</div>
            `;
          }
      
      return `
         <div class="row">
            <div class="poll-selection col col-sm-6">
               <div class="question">${poll.question}</div>
               <div class="answers">${showAnswers(poll, ref, false, vote)}</div>
               ${buttons}
            </div>
            <div class="poll-diagram col col-sm-6">
               <canvas class="poll-chart poll-chart-${poll._id}" width="370" height="270"></canvas>
            </div>
         </div>
      `;
   }

   function showNewPoll( refresh ) {
      let poll = document.pollClientNewPoll;
      
      document.pollClientAddAnswer = function(id) {
         let answer = $("#"+id).val();
         
         if( answer.length > 0 && poll.answers.length < MAX_ANSWERS && poll.answers.indexOf(answer) === -1 ) {
            poll.answers.push(answer);
            refresh(makeNewPoll());
         } else {
            BootstrapDialog.alert("That's either a duplicate, or too many answers or no answer a all.");
         }
      }; 
      
      document.pollClientRemoveAnswer = function(i) {
         poll.answers.splice(i,1);
         refresh(makeNewPoll());
      };

      document.pollClientSetTitle = function(id) {
         poll.title = $("#"+id).val();
      };
         
      document.pollClientSetQuestion = function(id) {
         poll.question = $("#"+id).val();
      };
         
      document.pollClientAddPoll = function() {
         if( poll.title.length && poll.question.length && poll.answers.length ) {
            ajaxFunctions.ajaxRequest('POST', pollsUrl, function () {
               ajaxFunctions.ajaxRequest('GET', pollsUrl, function(req, res) {
                  console.log("Poll added: ", req, res);
                  
                  poll.title = "";
                  poll.question = "";
                  poll.answers = [];
                  
                  location.reload();
               });
            }, poll );
         } else {
            BootstrapDialog.alert("We need a title, a question and at least one answer (two might be better).");
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
                     onchange="pollClientSetTitle('new-poll-title')"
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
                     <div class="answers">${showAnswers(poll, "new-poll", true)}</div>
                     <input id="new-answer" type="text" size="50" name="newAnswer" placeholder="Type an answer ..." />
                     <div class="btn btn-primary btn-add-answer" onclick="pollClientAddAnswer('new-answer')">Add</div>
                     <div class="btn btn-success btn-block btn-add-poll" onclick="pollClientAddPoll()">Create Poll</div>
                  </div>
               </div>
            </div>
         </div>
      `
   }
   
   function drawCharts( polls, ref ) {
      polls.map(poll => {
         let str = `#${ref}-accordion .poll-chart-${poll._id}`;
         let elem = $(`#${ref}-accordion .poll-chart-${poll._id}`);
         
         if( !elem.length ) return;
         
         let ctx = elem[0].getContext('2d');

         poll.chart = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
               labels: poll.votes.concat(["","","","","","","","","",""]).slice(0,10),
               datasets: [{
                  label: '# of Votes',
                  data: poll.votes,
                  backgroundColor: ANSWER_COLORS.slice(0, poll.votes.length),
                  borderColor: ANSWER_BORDERS.slice(0, poll.votes.length),
                  borderWidth: 1
               }]
            },
            options: {
               scales: {
                  xAxes: [{
                     ticks: {
                        beginAtZero:true,
                        callback: function(value, index, values) {
                           if (Math.floor(value) === value) {
                              return value;
                           }
                        }
                     }
                  }]
               }
            }
         });
      });
      
      let poll = polls[0],
          title = $("head meta[name='twitter:title']"),
          text = $("head meta[name='twitter:description']"),
          image = $("head meta[name='twitter:image']");
          
      //title.attr("content", poll.title);
      //text.attr("content", poll.question);
      //image.attr("content", $(`#single-poll-accordion .poll-chart-${poll._id}`)[0].toDataURL());
   }
   
   function showAnswers(poll, ref, edit, vote) {
      
      let html = poll.answers.length && poll.answers.map((answer, i) => {

         let radio = vote? `
            <label><input type="radio" disabled="true"${vote.answer == i? ' checked="checked"': ''} i="${i}"><span style="color: ${ ANSWER_BORDERS[i] };">${answer}</span></label>
         ` : edit? `
            <label><span>${answer}</span></label>
         ` : `
            <label><input type="radio" name="radio-${ref}-${poll._id}" i="${i}" /><span style="color: ${ ANSWER_BORDERS[i] };">${answer}</span></label>
         `;

         return `
            <div class="radio radio${i}">
               ${ radio }
               ${ edit? '<div class="btn btn-warning btn-xs btn-remove-answer" onclick="pollClientRemoveAnswer('+i+')">Remove</div>' : "" }
            </div>               
         `;
      }).join("") || "<div>No answers yet ...</div>";
      
      if( !edit && !vote && poll.answers.length < MAX_ANSWERS ) {
         html += `
               <div class="radio radio${poll.answers.length}">
                  <label><input type="radio" name="radio-${ref}-${poll._id}" i="${poll.answers.length}">
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
            id = self.attr("poll-id"),
            answers = self.parent().find("input[type='radio']").length,
            answer = radio.length && radio.attr("i") || null,
            ownAnswer = answers-1==answer? self.parent().find("input[type='text']").val():undefined;
   
         if( answer ) {
            ajaxFunctions.ajaxRequest('POST', voteUrl, function (req, res) {
               if( req.error ) {
                  console.error( req.error );
                  return;
               } 

               document.pollClientPollsVoted.push({id,answer});
               localStorage.pollClientPollsVoted = JSON.stringify(document.pollClientPollsVoted);

               let poll = JSON.parse(req),
                   html = makePoll(poll);
                   
               $(".panel-body-" + poll._id ).html(html);
               drawCharts([poll], "latest-polls");
               drawCharts([poll], "active-polls");
               drawCharts([poll], "user-polls"); 
               drawCharts([poll], "single-poll");
            }, {id, answer, ownAnswer});
         }
      });
         
         // For Deleting
      $( ".btn-delete" ).on('click', function () {

         let id = $(this).attr("poll-id");

         BootstrapDialog.show({
            title: 'Delete Poll',
            message: 'Do you want to delete the poll?',
            buttons: [{
                  label: 'Cancel',
                  action: function(dialog) {
                        dialog.close();
                  }
            }, {
                  label: 'OK',
                  action: function(dialog) {
                     
                     ajaxFunctions.ajaxRequest('DELETE', pollsUrl, function (req, res) {
                        console.log("Poll deleted: ", req, res);
                        
                        dialog.close();
                        location.reload();
            
                     }, { id }); // That's an mongo db id
                  }
            }]
         });
      });
      
      $( ".own-answer ").on("focus", selectRadio );
   }
   
   let id = document.pollClientPollId;
   
   if( id ) {
      ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', pollUrl, updatePoll, {id}));
   }  else { 
      ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', pollsUrl, updatePolls));
   }
})();

const numberOfPages = $('input[name=numberOfPages]').val();
const paginationEle = $('#pagination');
const liveMatchContEle = $('#live_container_reload');
insertPaginationToPage(numberOfPages);

// functions

function insertPaginationToPage(numberOfPages) {
  numberOfPages = Math.floor(parseInt(numberOfPages));
  let ele = `
    <button class="hidden" id='previous'><i class="fas fa-chevron-left"></i></button>
    <p>Page Number <span id='page_number'>1</span> // <span id="number_of_pages">${numberOfPages}</span></p>
    <button id='next'><i class="fas fa-chevron-right"></i></button>
  `;
  paginationEle.append(ele);
}

function renderMatches(array) {
  liveMatchContEle.html('');
  liveMatchContEle.append(`
      <div class="cente-tilte">
            <h2 id="afterRun">Todays Matches</h2>
      </div>
      `);
  array.forEach((match) => {
    let element = `
            <div id="live-match" class="live-match-content column">
        <a href="/leaguematches/${match.league_id}"
          ><h2>${match.league_name}</h2>
          <img src="${match.league_logo} " alt="${match.league_name} "
        /></a>
        <p>Match time: ${match.match_time}</p>
        <div class="score row">
          <div class="live-match-image column">
            <a href="/team/${match.match_hometeam_id} " class="column">
              <img
                class="row"
                src="${match.team_home_badge} "
                alt="${match.match_hometeam_name} "
              />
              <small class="row">${match.match_hometeam_name} </small></a
            >
          </div>
          <div class="time-score column">
            <p>${match.match_status}</p>
            <p>${match.score}</p>
          </div>
          <div class="live-match-image column">
            <a href="/team/${match.match_awayteam_id}" class="column">
              <img
                class="row"
                src="${match.team_away_badge} "
                alt="${match.match_awayteam_name} "
              />
              <small class="row">${match.match_awayteam_name} </small></a
            >
          </div>
        </div>
        <form
          class="row"
          action="/match_detail/${match.match_id} "
          method="get"
        >
          <input type="submit" value="Get Match Details" />
        </form>
        <div class="match-ref row" style="margin-bottom: 20px">
          <p class="column" style="margin: 10px 10px">
            Match Referee : ${match.match_referee}
          </p>
          <p class="column" style="margin: 10px 10px">
            Stadum: ${match.match_stadium}
          </p>
        </div>
      </div>
            `;

    liveMatchContEle.append(element);
  });
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function getMatchesPage(event) {
  let id = event.target.id;
  let pageNumber = $('#page_number').html();
  if (id === 'next') {
    pageNumber++;
    $('#page_number').html(pageNumber);
    callingRouts(pageNumber);
    visibleOrHidden(pageNumber);
  } else if (id === 'previous') {
    pageNumber--;
    $('#page_number').html(pageNumber);
    callingRouts(pageNumber);
    visibleOrHidden(pageNumber);
  }
}

function callingRouts(pageNumber) {
  $.ajax({
    type: 'GET',
    url: `/live/${pageNumber}`,
    dataType: 'json',
  }).then((data) => {
    renderMatches(data.matchArray);
  });
}

function visibleOrHidden(pageNumber) {
  if (pageNumber >= 1) {
    $('#previous').removeClass('hidden');
  }
  if (pageNumber == Math.floor(numberOfPages)) {
    $('#next').addClass('hidden');
  } else {
    $('#next').removeClass('hidden');
  }

  if (pageNumber === 1) {
    $('#previous').addClass('hidden');
  }
}

// Events

// paginationEle.click(getMatchesPage);
$('#next').click(getMatchesPage);
$('#previous').click(getMatchesPage);

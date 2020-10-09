const numberOfPages = $('input[name=numberOfPages]').val();
const paginationEle = $('#pagination');
const liveMatchContEle = $('#live_container_reload');
insertPaginationToPage(numberOfPages);

// functions

function insertPaginationToPage(numberOfPages) {
  for (i = 1; i < numberOfPages; i++) {
    let ele = `
                  <li><a href="" class="pages">${i}</a></li>
            `;
    paginationEle.append(ele);
  }
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
}

function getMatchesPage(event) {
  event.preventDefault();
  let element = event.target;
  if ([[...element.classList].includes('pages')]) {
    let pageNumber = parseInt(element.innerText);
    $.ajax({
      type: 'GET',
      url: `/live/${pageNumber}`,
      dataType: 'json',
    }).then((data) => {
      renderMatches(data.matchArray);
    });
  } else {
    console.log('wow');
  }
}

// Events

paginationEle.click(getMatchesPage);

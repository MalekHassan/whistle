let asaid = $('#aside');
// functions
function renderPersonalInfoForm() {
  // Empty the inside of asaid section
  asaid.html('');
  asaid.html(`
  <h2 class='user-title'>Basic Information</h2>
  <div class="update-form-container row">
  <form action="/changePersonalInfo" class="column" method="post">
    <div class="form-content row">
      <label for="name">Name</label>
      <input type="text" name="name" />
    </div>
    <div class="form-content row">
      <label for="email">Email</label>
      <input type="text" name="email" />
    </div>
    <div class="form-content row">
      <label for="gender">Gender</label>
      <div class="form-content-inside row">
        <input type="radio" name="gender" value="Male" />
        <p>Male</p>
      </div>
      <div class="form-content-inside row">
        <input type="radio" name="gender" value="Female" />
        <p>Female</p>
      </div>
    </div>
    <div class="form-content row">
      <label for="phone">Phone Number</label>
      <input type="text" name="phone-number" />
    </div>
    <input type="submit" value="Update" />
  </form>
</div>
  `);
}

function changeUserPassword() {
  asaid.html('');
  asaid.html(`
      <h2 class='user-title'>Change Password</h2>
      <div class="update-form-container row">
      <form action="/changePersonalInfo" class="column" method="post">
        <div class="form-content row">
          <label for="password">Password</label>
          <input type="text" name="newpass" />
        </div>
        <div class="form-content row">
          <label for="password">Comform New Password</label>
          <input type="text" name="compass" />
        </div>
        <input type="submit" value="Change Password" />
      </form>
    </div>
      `);
}

function renderMatches(match) {
  console.log(match);
  let content = `
            <div id="fav-match" class="live-match-content column">
        <h2>${match.league_name}</h2>
        <div class="score row">
          <div class="live-match-image column">
            <img id="home-team-badge"
              src="${match.team_home_badge} "
              alt="${match.match_hometeam_name} "
            />
            <small>${match.match_hometeam_name} </small>
          </div>
          <div class="time-score column">
            <p>${match.match_status}</p>
            <p>${match.score}</p>
          </div>
          <div class="live-match-image column">
            <img id="away-team-badge"
              src="${match.team_away_badge} "
              alt="${match.match_awayteam_name} "
            />
            <small>${match.match_awayteam_name} </small>
          </div>
        </div>
        <form
          class="row"
          action="/match_detail/${match.match_id} "
          method="get"
        >
          <input type="submit" value="Get Match Details" />
        </form>
        <form
          class="row"
          action="/match_delete/${match.match_id}?_method=delete"
          method="POST"
        >
          <input type="submit" value="Delete Match" />
        </form>
      </div>            
            `;
  $('#fav-match-container').append(content);
}

function getFavMatches() {
  asaid.html('');
  asaid.append(`<div id="fav-match-container" class="row">
  <h2 class='user-title'>Favorite Matchs</h2>
  </div>`);
  let ids = $('input[type="hidden"]').val();
  let matchResultUrl = `https://apiv2.apifootball.com/?action=get_events&match_id=${ids}&APIkey=b2fec2eb69e6174d9c6a0c3d5187b0661eb4e4b4a708387c3b1e8d9c7ed3951a`;
  $.ajax(matchResultUrl).then((result) => {
    result.forEach((match) => {
      renderMatches(new liveMatches(match));
    });
  });
}

// Constructor

function liveMatches(matchData) {
  this.match_id = matchData.match_id;
  this.match_status = matchData.match_status;
  this.league_logo = matchData.league_logo;
  this.league_name = matchData.league_name;
  this.match_time = matchData.match_time;
  this.match_hometeam_name = matchData.match_hometeam_name;
  this.match_awayteam_name = matchData.match_awayteam_name;
  this.team_home_badge = matchData.team_home_badge
    ? matchData.team_home_badge
    : 'https://apiv2.apifootball.com/badges/17691_hafnarfjordur-w.png';
  this.team_away_badge = matchData.team_away_badge
    ? matchData.team_away_badge
    : 'https://apiv2.apifootball.com/badges/17691_hafnarfjordur-w.png';
  this.score = `${matchData.match_hometeam_score} : ${matchData.match_awayteam_score}`;
}
// Events

$('#user-info').click(renderPersonalInfoForm);
$('#password').click(changeUserPassword);
$('#favMatchesForm').click(getFavMatches);

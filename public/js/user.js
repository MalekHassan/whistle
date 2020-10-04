let asaid = $('#aside');
let userID = $('#userID').val().trim();
let userFName = $('#fName').val().trim();
let userLName = $('#lName').val().trim();
let userEmail = $('#email').val().trim();
let userGender = $('#gender').val().trim();
let userPhone = $('#phone_number').val().trim();
let userIfnoArr = [userFName, userLName, userEmail, userPhone];
setCheckedAttribut();
setValues();
// functions
function renderPersonalInfoForm() {
  // Empty the inside of asaid section
  asaid.html('');
  asaid.html(`
  <h2 class='user-title'>Basic Information</h2>
  <div class="update-form-container row">
  <form
      action="/changePersonalInfo/${userID}?_method=put "
      class="column"
       method="post"
   >
    <div class="form-content row">
      <label for="name">First Name</label>
      <input type="text" name="first_name" value="${userFName}" />
    </div>
    <div class="form-content row">
      <label for="name">Last Name</label>
      <input type="text" name="last_name" value="${userLName}" />
    </div>
    <div class="form-content row">
      <label for="email">Email</label>
      <input type="text" name="email" value="${userEmail}" />
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
      <input type="text" name="phone_number" ${userPhone} />
    </div>
    <input type="submit" value="Update" />
  </form>
</div>
  `);
  setCheckedAttribut();
  setValues();
}

function changeUserPassword() {
  asaid.html('');
  asaid.html(`
      <h2 class='user-title'>Change Password</h2>
      <div class="update-form-container row">
      <form action="/changeUserPass/${userID}?_method=put" class="column" method="post">
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
            
            <h2><a href="/leaguematches/${match.league_id}">${match.league_name}</a></h2>
        <div class="score row">
          <div class="live-match-image column">
          <a href="/team/${match.match_hometeam_id}">
            <img id="home-team-badge"
              src="${match.team_home_badge} "
              alt="${match.match_hometeam_name} "
            />
            <small>${match.match_hometeam_name} </small></a>
          </div>
          <div class="time-score column">
            <p>${match.match_status}</p>
            <p>${match.score}</p>
          </div>
          <div class="live-match-image column">
          <a href="/team/${match.match_awayteam_id}">
            <img id="away-team-badge"
              src="${match.team_away_badge} "
              alt="${match.match_awayteam_name} "
            />
            <small>${match.match_awayteam_name} </small></a>
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

  let ids = $('#ids').val();
  console.log(ids);
  if (ids) {
    asaid.append(`<div id="fav-match-container" class="row">
  <h2 class='user-title'>Favorite Matchs</h2>
  </div>`);
    let matchResultUrl = `https://apiv2.apifootball.com/?action=get_events&match_id=${ids}&APIkey=b2fec2eb69e6174d9c6a0c3d5187b0661eb4e4b4a708387c3b1e8d9c7ed3951a`;
    $.ajax(matchResultUrl).then((result) => {
      result.forEach((match) => {
        renderMatches(new liveMatches(match));
      });
    });
  } else {
    asaid.append(`<h2>There Is No Favorite Matches<h2>`);
  }
}

function setCheckedAttribut() {
  let radios = [...$('input[type=radio]')];
  radios.forEach((item) => {
    if (item.value == userGender) {
      item.checked = true;
    }
  });
}

function setValues() {
  let inputText = [...$('input[type=text]')];
  inputText.forEach((item, index) => {
    item.value = userIfnoArr[index];
  });
}

// Constructor

function liveMatches(matchData) {
  this.league_id = matchData.league_id
  this.match_id = matchData.match_id;
  this.match_status = matchData.match_status;
  this.league_logo = matchData.league_logo;
  this.league_name = matchData.league_name;
  this.match_time = matchData.match_time;
  this.match_hometeam_id = matchData.match_hometeam_id;
  this.match_hometeam_name = matchData.match_hometeam_name;
  this.match_awayteam_id = matchData.match_awayteam_id;
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

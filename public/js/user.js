// Values of the hidden from
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
// Functions

// Render Pesonal Into Form
function renderPersonalInfoForm() {
  // Empty the inside of asaid section
  asaid.html('');
  asaid.html(`
  <h2 class='user-title'>Basic Information</h2>
  <div class="update-form-container row">
  <form
      id="personalInfoFrom"
      class="column"
       onsubmit="updateUserInfo(event)"
   >
    <div class="form-content row">
      <label for="name">First Name</label>
      <input  type="text" name="first_name" value="${userFName}"   />
      <i class="fas fa-exclamation-circle"></i>
    </div>
    <div class="form-content row">
      <label for="name">Last Name</label>
      <input  type="text" name="last_name" value="${userLName}"   />
      <i class="fas fa-exclamation-circle"></i>
    </div>
    <div class="form-content row">
      <label for="email">Email</label>
      <input readonly type="text" name="email" value="${userEmail}" />
      <i class="fas fa-exclamation-circle"></i>
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
      <i class="fas fa-exclamation-circle"></i>
    </div>
    <input onclick="showMessage()" type="submit" value="Update" />
  </form>
</div>
  `);
  setCheckedAttribut();
  setValues();
}

// Render Change Password Form
function changeUserPassword() {
  asaid.html('');
  asaid.html(`
      <h2 class='user-title'>Change Password</h2>
      <ul class="user-instuctions">
      <li>Password Min length=5 and Max length=15</li>
      <li>Password and Comform Password should be equal</li>
      </ul>
      <div class="update-form-container row">
      <form 
      class="column" 
      onsubmit="updateUserPassword(event)"
      >
        <div class="form-content row">
          <label for="password">Password</label>
          <input type="password" name="newpass" min="5" max="15" required  />
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <div class="form-content row">
          <label for="password">Comform New Password</label>
          <input type="password" name="compass" min="5" max="15" required  />
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <input onclick="showMessage()" type="submit" value="Change Password" />
      </form>
    </div>
      `);
}

// Render Matches
function renderMatches(match) {
  console.log(match);
  let content = `
            <div class="fav-match live-match-content column">
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

// Get Matchs From DB
function getFavMatches() {
  asaid.html('');
  asaid.append(`<div id="fav-match-container" class="row">
  <h2 class='user-title'>Favorite Matchs</h2>
  </div>`);
  let ids = $('#ids').val();
  if (ids) {
    $.ajax({
      type: 'GET',
      url: '/getmatches',
      dataType: 'json',
    }).then((data) => {
      data.forEach((match) => {
        renderMatches(match);
      });
    });
  } else {
    $('#fav-match-container').append(
      `<h2 class="fav_error">There Is No Favorite Matches<h2>`
    );
  }
}

// Update User Info in DB
function updateUserInfo(event) {
  event.preventDefault();
  if (basicInfoValidation()) {
    $.ajax({
      type: 'PUT',
      url: `/changePersonalInfo/${userID}`,
      dataType: 'json',
      data: {
        first_name: $('input[name="first_name"]').val(),
        last_name: $('input[name="last_name"]').val(),
        email: $('input[name="email"]').val(),
        phone_number: $('input[name="phone_number"]').val(),
        gender: [...$('input[type=radio]')].reduce((wanted, item) => {
          if (item.checked) {
            console.log();
            wanted = item;
          }
          return wanted;
        }).value,
      },
    }).then((data) => {
      asaid.append(`<h3 class='message'>${data.message}</h3>`);
    });
  } else {
    asaid.append(`<h3 class='message'>Please Fix The Errors</h3>`);
  }
}
// Change user Password

function updateUserPassword(event) {
  event.preventDefault();
  if (checkPasswords()) {
    $.ajax({
      type: 'PUT',
      url: `/changeUserPass/${userID}`,
      dataType: 'json',
      data: {
        newpass: $('input[name="newpass"]').val(),
      },
    }).then((data) => {
      console.log(data.message);
      asaid.append(`<h3 class='message'>${data.message}</h3>`);
      $('.message').eq(1).remove();
    });
  } else {
    asaid.append(`<h3 class='message'>Please Fix The Errors</h3>`);
  }
}

// Set Male or Female checked
function setCheckedAttribut() {
  let radios = [...$('input[type=radio]')];
  radios.forEach((item) => {
    if (item.value == userGender) {
      item.checked = true;
    }
  });
}
// Set from backend into front end
function setValues() {
  let inputText = [...$('input[type=text]')];
  inputText.forEach((item, index) => {
    item.value = userIfnoArr[index];
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

// Check the Basic Infromation form validation
function basicInfoValidation() {
  // Get the values of inputes
  let firstNameEle = $('input[name="first_name"]');
  let lastNameEle = $('input[name="last_name"]');
  let email = $('input[name="email"]');
  let phoneNumberEle = $('input[name="phone_number"]');
  let checkArray = checkEmpty([
    firstNameEle,
    lastNameEle,
    email,
    phoneNumberEle,
  ]);
  checkArray.push(checkphoneNumber(phoneNumberEle));
  return !checkArray.includes(false);
}

// Check password and comform password

function checkPasswords() {
  // Get the Values of passwords
  let passwordsArray = [...$('input[type="password"]')];
  let checkArray = checkEmptyPass(passwordsArray);
  checkArray.push(checkPassAndComPass(passwordsArray));
  console.log(checkArray);
  return !checkArray.includes(false);
}

// Check inputs if empty
function checkEmpty(elements) {
  let checkArray = [];
  elements.forEach((element, index) => {
    if (element.val().trim() === '') {
      $('.fa-exclamation-circle').eq(index).show();
      element.addClass('error');
      checkArray.push(false);
    } else {
      $('.fa-exclamation-circle').eq(index).hide();
      element.removeClass('error');
      element.addClass('sucsses');
      checkArray.push(true);
    }
  });
  return checkArray;
}

// Check passwords if empty
function checkEmptyPass(elements) {
  let checkArray = [];
  elements.forEach((element, index) => {
    if (element.value.trim() === '') {
      $('.fa-exclamation-circle').eq(index).show();
      element.classList.add('error');
      checkArray.push(false);
    } else {
      $('.fa-exclamation-circle').eq(index).hide();
      element.classList.remove('error');
      element.classList.add('sucsses');
      checkArray.push(true);
    }
  });
  return checkArray;
}
// check if password and comform password are equal
function checkPassAndComPass(elements) {
  let str = true;
  if (elements[0].value !== elements[1].value) {
    $('.fa-exclamation-circle').eq(1).show();
    elements[1].classList.add('error');
    str = false;
  }
  return str;
}

// Check Phone Number length and if it is number

function checkphoneNumber(element) {
  let regix = /^\d{10}$/g;
  let str = false;
  if (regix.test(element.val())) {
    $('.fa-exclamation-circle').eq(3).hide();
    element.removeClass('error');
    element.addClass('sucsses');
    str = true;
  } else {
    $('.fa-exclamation-circle').eq(3).show();
    element.addClass('error');
  }
  return str;
}

// Events

$('#user-info').click(renderPersonalInfoForm);
$('#password').click(changeUserPassword);
// $('#favMatchesForm').click(getFavMatches);
$('#favMatchesForm').click(getFavMatches);
$('#personalInfoFrom').submit(updateUserInfo);

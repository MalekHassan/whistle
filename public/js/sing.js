'use strict';
// Functions

// Check the Sign In Form
function checkSignInForm() {
  // Get the values of inputes
  let passwordEle = $('input[name="password"]');
  let email = $('input[name="email"]');
  let checkArray = checkEmpty([email, passwordEle]);
  checkArray.push(emailIsValid(email));
  console.log(checkArray);
  return !checkArray.includes(false);
}

// Check the Sign Up Form

function checkSignUpForm() {
  // Get the values of inputes
  let passwordEle = $('input[name="uppassword"]');
  let firstNameEle = $('input[name="firstname"]');
  let lastNameEle = $('input[name="lastname"]');
  let email = $('input[name="upemail"]');
  let checkArray = checkEmpty([email, passwordEle, firstNameEle, lastNameEle]);
  checkArray.push(emailIsValid(email));
  console.log(checkArray);
  return !checkArray.includes(false);
}

// Check inputs if empty
function checkEmpty(elements) {
  let checkArray = [];
  elements.forEach((element, index) => {
    if (element.val().trim() === '') {
      element.addClass('error');
      checkArray.push(false);
    } else {
      element.removeClass('error');
      element.addClass('sucsses');
      checkArray.push(true);
    }
  });
  return checkArray;
}

function emailIsValid(element) {
  let str = false;
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (re.test(element.val().trim())) {
    element.removeClass('error');
    element.addClass('sucsses');
    str = true;
  } else {
    element.addClass('error');
    element.removeClass('sucsses');
  }
  return str;
}
// Events

// Switch Between signin and signup forms
$('#signin').click(() => {
  $('#signupform').toggle();
  $('#signinform').toggle();
});

$('#signup').click(() => {
  $('#signupform').toggle();
  $('#signinform').toggle();
});

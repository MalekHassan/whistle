const numberOfPages = $('input[name=numberOfPages]').val();
const paginationEle = $('#pagination');
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
      console.log(data);
    });
  } else {
    console.log('wow');
  }
}

// Events

paginationEle.click(getMatchesPage);

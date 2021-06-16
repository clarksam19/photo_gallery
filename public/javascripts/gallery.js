document.addEventListener('DOMContentLoaded', () => {
  let data;
  let slides;
  const visible = document.getElementsByClassName("visible");
  const previousSlideBtn = document.querySelector("a.prev");
  const nextSlideBtn = document.querySelector("a.next");
  const commentSection = document.getElementById("comments");

  // Perhaps we should refactor all templates into the function scope like this so they are resuable? Also in order to finish functionality we will need to filter comments for each photo ID. Part of a bigger refactor?
  let commentPartialSource = document.getElementById("photo_comment")
    .innerHTML;
  Handlebars.registerPartial("photo_comment", commentPartialSource);
  let commentsTemplateSource = document.getElementById("photo_comments")
    .innerHTML;
  let commentTemplateFunction = Handlebars.compile(commentPartialSource);
  let commentsTemplateFunction = Handlebars.compile(commentsTemplateSource);

  let request = new XMLHttpRequest();
  request.open('GET', 'http://localhost:3000/photos');
  request.addEventListener('load', (e) => {
    data = JSON.parse(request.response);
    loadPhotos(data);
    loadPhotoInfo(data);
    loadComments(data);

    slides = document.querySelectorAll('#slides figure');
  
    slides.forEach((slide, idx) => {
      idx === 0 ? slide.classList.add('visible')
      : slide.classList.add('invisible');
    });
  });

  request.addEventListener('error', (e) => {
    console.log('Request could not be completed');
  });

  request.send();

  previousSlideBtn.addEventListener('click', (event) => {
    let currentSlide = visible[0];
    const dataId = Number(currentSlide.dataset.id);
    const photoIdx = dataId === 1 ? slides.length - 1 : dataId - 2;
    const prevSlide = slides[photoIdx];

    [currentSlide, prevSlide].forEach(toggleVisibility);
    //Pass in outer scope data variable
    loadPhotoInfo(data, photoIdx);
    loadComments(data, photoIdx);
  });

  nextSlideBtn.addEventListener('click', (event) => {
    let currentSlide = visible[0];
    const dataId = Number(currentSlide.dataset.id);
    const photoIdx = data[dataId] ? dataId : 0;
    const nextSlide = slides[photoIdx];
    
    [currentSlide, nextSlide].forEach(toggleVisibility);

    loadPhotoInfo(data, photoIdx);
    loadComments(data, photoIdx);
  });

  //like and favorite button functionality
  document.querySelector('section > header').addEventListener("click", function(event) {
    event.preventDefault();
    let button = event.target;
    let dataId = button.getAttribute("data-id");
    if (dataId === '1') {
      let path = button.getAttribute("href");
      
      let request = new XMLHttpRequest();
      request.open('POST', path);
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      request.send('photo_id=' + dataId);

      request.addEventListener('load', () => {
        let newTotal = JSON.parse(request.response).total;
        button.textContent = button.textContent.replace(/\d+/, newTotal);
      });
    }
  });
  
  //comment submission event handler
  document.getElementById('submit-comment').addEventListener("submit", function (event) {
    event.preventDefault();
    let form = event.target;
    let http = new XMLHttpRequest();
    let fields = new FormData(form);
    let queryString = new URLSearchParams(fields).toString();
    fields.set("photo_id", visible[0].dataset.id);

    http.open(form.method, form.action);
    http.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded; charset=UTF-8"
    );
    http.onload = function () {
      let newComment = JSON.parse(http.response);
      
      form.insertAdjacentHTML(
        "beforebegin",
        commentTemplateFunction(newComment)
      );
      form.reset();
    };
    http.send(queryString);
  });
  
  function loadPhotos(data) {
    let photosTemplateSource = document.getElementById('photos').innerHTML;
    let photosTemplateFunction = Handlebars.compile(photosTemplateSource);
    let photosTemplate = photosTemplateFunction({photos: data});
  
    document.getElementById('slides').innerHTML = photosTemplate;
  }
  
  function loadPhotoInfo(data, index = 0) {
    let photoInfoTemplateSource = document.getElementById('photo_information').innerHTML;
    let photoInfoTemplateFunction = Handlebars.compile(photoInfoTemplateSource);
    let photoInfoTemplate = photoInfoTemplateFunction(data[index]);
    document.querySelector('section > header').innerHTML = photoInfoTemplate;
  }
  
  function loadComments(data, index = 0) {
    let request = new XMLHttpRequest();
    request.open('GET', `http://localhost:3000/comments?photo_id=${data[index].id}`);
  
    request.addEventListener('load', (e) => {
      let commentData = JSON.parse(request.response);
      let commentsTemplate = commentsTemplateFunction({comments: commentData});
      // TODO: filter comments by current image id (photo_id)
      commentSection.insertAdjacentHTML('afterbegin', commentsTemplate);
    });
    
    request.send();
  }
});

function toggleVisibility({classList}) {
  if (typeof classList !== undefined && classList.length > 0) {
    if (classList.contains('invisible')) {
      classList.add('visible');
      classList.remove('invisible');
    } else if(classList.contains('visible')) {
      classList.add('invisible');
      classList.remove('visible');
    }
  }
}
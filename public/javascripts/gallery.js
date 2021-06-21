document.addEventListener('DOMContentLoaded', () => {
  let data;
  let slides;
  const visible = document.getElementsByClassName("visible");
  const previousSlideBtn = document.querySelector("a.prev");
  const nextSlideBtn = document.querySelector("a.next");
  const commentSection = document.getElementById("comments");

  let commentPartialSource = document.getElementById("photo_comment")
    .innerHTML;
  Handlebars.registerPartial("photo_comment", commentPartialSource);
  let commentsTemplateSource = document.getElementById("photo_comments")
    .innerHTML;
  let commentsTemplateFunction = Handlebars.compile(commentsTemplateSource);
  
  function loadPhotos() {
    let photosTemplateSource = document.getElementById("photos").innerHTML;
    let photosTemplateFunction = Handlebars.compile(photosTemplateSource);
    let photosTemplate = photosTemplateFunction({ photos: data });

    document.getElementById("slides").innerHTML = photosTemplate;
  }

  function loadPhotoInfo(index = 0) {
    let photoInfoTemplateSource = document.getElementById("photo_information")
      .innerHTML;
    let photoInfoTemplateFunction = Handlebars.compile(photoInfoTemplateSource);
    let photoInfoTemplate = photoInfoTemplateFunction(data[index]);
    document.querySelector("section > header").innerHTML = photoInfoTemplate;
  }

  function loadComments(index = 0) {
    let request = new XMLHttpRequest();
    request.open(
      "GET",
      `http://localhost:3000/comments?photo_id=${data[index].id}`
    );

    request.addEventListener("load", (e) => {
      let commentData = JSON.parse(request.response);
      let commentsTemplate = commentsTemplateFunction({
        comments: commentData,
      });
      commentSection.innerHTML = commentsTemplate;
    });

    request.send();
  }

  let request = new XMLHttpRequest();
  request.open('GET', 'http://localhost:3000/photos');
  request.addEventListener('load', (e) => {
    data = JSON.parse(request.response);
    loadPhotos();
    loadPhotoInfo();
    loadComments();

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
    
    loadPhotoInfo(photoIdx);
    loadComments(photoIdx);
  });

  nextSlideBtn.addEventListener('click', (event) => {
    let currentSlide = visible[0];
    const dataId = Number(currentSlide.dataset.id);
    const photoIdx = data[dataId] ? dataId : 0;
    const nextSlide = slides[photoIdx];
    
    [currentSlide, nextSlide].forEach(toggleVisibility);

    loadPhotoInfo(photoIdx);
    loadComments(photoIdx);
  });

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
  
  document.getElementById('submit-comment').addEventListener("submit", function (event) {
    event.preventDefault();
    let form = event.target;
    let http = new XMLHttpRequest();
    let fields = new FormData(form);
    let queryString = new URLSearchParams(fields).toString();
    fields.set("photo_id", visible[0].dataset.id);
    let photoIdx = Number(visible[0].dataset.id) - 1;

    http.open(form.method, form.action);
    http.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded; charset=UTF-8"
    );

    http.onload = function () {
      //reload comments using index instead of inserting html
      loadComments(photoIdx);
      form.reset();
    };
    
    http.send(queryString);
  });
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
document.addEventListener('DOMContentLoaded', () => {
  //outer scope data variable
  let data;
  let slides;
  const previousSlideBtn = document.querySelector("a.prev");
  const nextSlideBtn = document.querySelector("a.next");

  let request = new XMLHttpRequest();
  request.open('GET', 'http://localhost:3000/photos');
  request.addEventListener('load', (e) => {
    data = JSON.parse(request.response);
    loadPhotos(data);
    loadPhotoInfo(data);
    loadComments(data);

    slides = document.querySelectorAll('#slides figure');
    // Generalized addition of classes, regardless of slides length
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
    const currentSlide = document.querySelector(".visible");
    const dataId = Number(currentSlide.dataset.id);
    //wrapping index based on slides length and direction
    const photoIdx = dataId === 1 ? slides.length - 1 : dataId - 2;
    const prevSlide = slides[photoIdx];

    [currentSlide, prevSlide].forEach(toggleVisibility);
    //Pass in outer scope data variable
    loadPhotoInfo(data, photoIdx);
    loadComments(data, photoIdx);
  });

  nextSlideBtn.addEventListener('click', (event) => {
    const currentSlide = document.querySelector(".visible");
    const dataId = Number(currentSlide.dataset.id);
    //wrapping index based on slides length and direction
    const photoIdx = data[dataId] ? dataId : 0;
    const nextSlide = slides[photoIdx];
    
    [currentSlide, nextSlide].forEach(toggleVisibility);
    //Pass in outer scope data variable
    loadPhotoInfo(data, photoIdx);
    loadComments(data, photoIdx);
  });
  
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

    let commentPartialSource = document.getElementById('photo_comment').innerHTML;
    Handlebars.registerPartial('photo_comment', commentPartialSource);

    let commentsTemplateSource = document.getElementById('photo_comments').innerHTML;
    let commentsTemplateFunction = Handlebars.compile(commentsTemplateSource);
    let commentsTemplate = commentsTemplateFunction({comments: commentData});
    
    document.getElementById('comments').innerHTML = commentsTemplate;
  });
  
  request.send();
}
//removed helper function for determining index
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
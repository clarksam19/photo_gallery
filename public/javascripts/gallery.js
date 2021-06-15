document.addEventListener('DOMContentLoaded', () => {
  let slides;

  let request = new XMLHttpRequest();
  request.open('GET', 'http://localhost:3000/photos');
  request.addEventListener('load', (e) => {
    let data = JSON.parse(request.response);
    loadPhotos(data);
    //below two functions take second index arg for accessing current photo/comments
      //might end up being better to use photo_id
    loadPhotoInfo(data);
    loadComments(data);

    slides = document.querySelectorAll('#slides figure');
    // Add classes to rendered html
    slides[0].classList.add('visible');
    slides[1].classList.add('invisible');
    slides[2].classList.add('invisible');
  });

  request.addEventListener('error', (e) => {
    console.log('Request could not be completed');
  });

  request.send();
  
  const previousSlideBtn = document.querySelector('a.prev');
  previousSlideBtn.addEventListener('click', (event) => {
    const currentSlide = document.querySelector(".visible");
    const dataId = currentSlide && currentSlide.dataset.id;
    const prevSlide = slides[chooseAdjacentPhotoId(+dataId, 'prev') - 1];

    [currentSlide, prevSlide].forEach(toggleVisibility);
  });
  
  const nextSlideBtn = document.querySelector('a.next');  
  nextSlideBtn.addEventListener('click', (event) => {
    const currentSlide = document.querySelector(".visible");
    const dataId = currentSlide && currentSlide.dataset.id;
    const nextSlide = slides[chooseAdjacentPhotoId(+dataId, 'next') - 1];
    [currentSlide, nextSlide].forEach(toggleVisibility);
  });
  
  // Each slide transition will also render the photo details for that photo below it
  // When the slideshow is advanced, request and render the comments for that photo
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

function chooseAdjacentPhotoId(currentId, direction = 'next') {
  if (currentId === 1) {
    return direction === 'next' ? 2 : 3
  } else if (currentId === 3) {
    return direction === 'next' ? 1 : 2
  } else {
    return direction === 'next' ? 3 : 1
  }
}

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
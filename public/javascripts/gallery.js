document.addEventListener('DOMContentLoaded', () => {
  let request = new XMLHttpRequest();
  request.open('GET', 'http://localhost:3000/photos');
  request.addEventListener('load', (e) => {
    let data = JSON.parse(request.response);
    loadPhotos(data);
    //below two functions take second index arg for accessing current photo/comments
      //might end up being better to use photo_id
    loadPhotoInfo(data);
    loadComments(data);
  });

  request.addEventListener('error', (e) => {
    console.log('Request could not be completed');
  });

  request.send();

  const slides = document.querySelectorAll('#slides figure');
  slides[0].classList.add('visible');
  console.log('firstSlide :>> ', slides);
  debugger;
  const previousSlideBtn = document.querySelector('a.prev');
  const nextSlideBtn = document.querySelector('a.next');  
  
  previousSlideBtn.addEventListener('click', (event) => {
    const currentVisiblePhoto = document.querySelector(".visible");
    const dataId = +currentVisiblePhoto?.dataset.id;
    const prevSlide = chooseNextVisiblePhotoId(dataId, 'prev');
  });
  nextSlideBtn.addEventListener('click', (event) => {
    const currentVisiblePhoto = document.querySelector(".visible");
    const dataId = +currentVisiblePhoto?.dataset.id;
    const nextSlide = chooseNextVisiblePhotoId(dataId, 'next');
  });
    // Attach events to the previous and next anchors to fade out the current photo and fade in the new one at the same time
  
  // If we're on the first photo and click "previous", we loop to the last one. 
      //Clicking "next" when on the last one should bring the first photo.
  
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

function chooseNextVisiblePhotoId(currentId, direction = 'next') {
  if (currentId === 1) {
    return direction === 'next' ? 2 : 3
  } else if (currentId === 3) {
    return direction === 'next' ? 1 : 2
  } else {
    return direction === 'next' ? 3 : 1
  }
}

function toggleVisibility(slide) {
  if (typeof slide !== undefined) {
    slide.classList.toggle('visible');
    slide.classList.toggle('invisible');
  }
}
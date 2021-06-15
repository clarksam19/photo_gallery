document.addEventListener('DOMContentLoaded', () => {
  let slides;
  const previousSlideBtn = document.querySelector("a.prev");
  const nextSlideBtn = document.querySelector("a.next");

  let request = new XMLHttpRequest();
  request.open('GET', 'http://localhost:3000/photos');
  request.addEventListener('load', (e) => {
    let data = JSON.parse(request.response);
    loadPhotos(data);
    loadPhotoInfo(data);
    loadComments(data);

    // Assign newly rendered slide DOM nodes
    slides = document.querySelectorAll('#slides figure');
    // Add classes to rendered nodes
    slides[0].classList.add('visible');
    slides[1].classList.add('invisible');
    slides[2].classList.add('invisible');
  });

  request.addEventListener('error', (e) => {
    console.log('Request could not be completed');
  });

  request.send();

  previousSlideBtn.addEventListener('click', (event) => {
    const currentSlide = document.querySelector(".visible");
    const dataId = currentSlide && currentSlide.dataset.id;
    const photoIdx = chooseAdjacentPhotoId(+dataId, "prev");
    const prevSlide = slides[photoIdx - 1];

    [currentSlide, prevSlide].forEach(toggleVisibility);
    loadPhotoInfo(photoIdx); // TODO: Refactor loadPhotoInfo function to suit this implementation
    loadComments(photoIdx); // TODO: Refactor loadComments function to suit this implementation
  });

  nextSlideBtn.addEventListener('click', (event) => {
    const currentSlide = document.querySelector(".visible");
    const dataId = currentSlide && currentSlide.dataset.id;
    const photoIdx = chooseAdjacentPhotoId(+dataId, "next");
    const nextSlide = slides[photoIdx- 1];
    
    [currentSlide, nextSlide].forEach(toggleVisibility);
    loadPhotoInfo(photoIdx);
    loadComments(photoIdx);
  });
  
  // Each slide transition will also render the photo details for that photo below it
  // When the slideshow is advanced, request and render the comments for that photo
});

//NOTE: The following implementations are dependent on the 'data' argument, so it is making it difficult to call them from an event listener without refetching the data. Could you have a go at implementing a solution where the data is stored in memory after fetching? Then we could switch out the details/comments just by passing an index.
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
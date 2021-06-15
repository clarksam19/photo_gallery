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

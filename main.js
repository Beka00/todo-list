//? API для запросов
const API ='http://localhost:8000/products';
//? блок куда мы добавляем карточки
const list = document.querySelector('#products-list');
const addForm =document.querySelector('#add-form')
const titleInp = document.querySelector('#title');
const priceInp = document.querySelector('#price');
const descriptionInp = document.querySelector('#description');
const imageInp = document.querySelector('#image');

//? вытаскиваем  инпуты и кнопка из модалки
const editTitleInp = document.querySelector('#edit-title');
const editPriceInp = document.querySelector('#edit-price');
const editDescriptionInp = document.querySelector('#edit-descr');
const editImageInp = document.querySelector('#edit-image');
const editSaveBtn = document.querySelector('#btn-save-edit');

const searchInput =document.querySelector('.search');
let searchVal ='';

const paginationList = document.querySelector('.pagination-list');
const prev =document.querySelector('.prev');
const next =document.querySelector('.next');
const limit =3;
let currentPage=1;
let pageTotalCount=1;

//? Стягиваем данные с сервера 


//? первоначальное отображение данных
getProducts();
async function getProducts (){
    const res = await fetch(`${API}?title_like=${searchVal}&_limit=${limit}&_page=${currentPage}`);
    const count =res.headers.get('x-total-count');
    pageTotalCount= Math.ceil(count/limit);
    const data = await res.json();//? расшифровка данных
    //? отображаем актуальные данные
    render(data);
}

async function addProduct(product){
    await fetch(API,{
        method:'POST',
        body:JSON.stringify(product),
        headers: {
            'Content-Type':'application/json'
        }
    });
    getProducts(); 
}

//? Функция для удаление из db json
//? await для того что бы гетпродукст подождал пока данные удалятся
async function deleteProduct (id) {
    await fetch (`${API}/${id}` ,{
        method:'DELETE'
    });
    getProducts();
};

//? функция для получения одного продукта
async function getOneProduct (id) {
    const res =await fetch(`${API}/${id}`);
    const data = await res.json(); //? расшифровка данных
    return data; //? возвращаем продукт с db jsona
}


//? функция что бы изменить данные 
async function editProduct (id,editedProduct) {
     await fetch (`${API}/${id}`, {
        method:'PATCH',
        body:JSON.stringify(editedProduct),
        headers:{
            'Content-Type':'application/json'
        },
     });
     getProducts();
}

//? отображаем на странице 
function render (arr) {
    //? очищаем что бы карточки не дублировались
    list.innerHTML = ''; 
    arr.forEach(item => {
        list.innerHTML += ` <div class="card m-5" style="width: 18rem;">
        <img src="${item.image}" class="card-img-top" alt="...">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
          <p class="card-text">${item.description.slice(0,70)}...</p>
          <p class="card-text">${item.price}</p>
          <button  id="${item.id}" class="btn btn-danger btn-delete">DELETE</button>
          <button data-bs-toggle="modal" data-bs-target="#exampleModal" id="${item.id}" class="btn btn-dark btn-edit">EDIT</button>
        </div>
      </div>`
    });
    renderPagination();
}
addForm.addEventListener('submit',(e) => {
    e.preventDefault();
    if(!titleInp.value.trim() || 
    !titleInp.value.trim() ||
    !titleInp.value.trim() ||
    !titleInp.value.trim()
     ) {
        alert('Заполните все поля');
        return;
     }

     const product = {
        title: titleInp.value,
        price: priceInp.value,
        description:descriptionInp.value,
        image:imageInp.value,
     };
     addProduct(product);
     titleInp.value ="";
     priceInp.value ="";
     descriptionInp.value ="";
     imageInp.value ="";

});

document.addEventListener('click', (e) => {
    if(e.target.classList.contains('btn-delete')){
        deleteProduct(e.target.id)
    }
});


//? переменная что бы сохранить айди продукта , на который мы нажали
let id = null;
//? обработчки события на открытие и заполнение модалки
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-edit')){
        //? сохраняем айди продукта 
        id =e.target.id;

        //? получаем обьект продукта на который мы нажали
      const product = await getOneProduct(e.target.id);

      //? заполняем импуты данными с сервера (из продуктов)
         editTitleInp.value =product.title;
         editPriceInp.value =product.price;
         editDescriptionInp.value =product.description;
         editImageInp.value =product.image;
         


    }
})

//?  обработчик события на сохранения данных
editSaveBtn.addEventListener('click',() => {
    //? проверка на пк\устоту импутов 
    if(   
         !editTitleInp.value.trim() ||
    !editPriceInp.value.trim() ||
    !editDescriptionInp.value.trim()||
    !editImageInp.value.trim()
    ){

        alert ('Заполните поле');
        //? если хотя бы один импут пустой выводим предупреждение и останавливаем 
        return;
    }
    //? собираем измененный обьект для изменения продукта
    const editedProduct={
        title:editTitleInp.value,
        price:editPriceInp.value,
        description:editDescriptionInp.value,
        image:editImageInp.value,
    };
    //?  вызываем функцию
    editProduct(id,editedProduct);
});

searchInput.addEventListener('input', () => {
    searchVal=searchInput.value;
    getProducts();
    
});

function renderPagination() {
    paginationList.innerHTML="";
    for (let i =1;i<=pageTotalCount;i++){
        paginationList.innerHTML+=`<li class="page-item ${currentPage == i ? 'active':""}">
        <a class="page-link page_number"href="#">${i}</a>
    </li>`
    }
    if(currentPage == 1){
        prev.classList.add('disabled')
    }else{
        prev.classList.remove('disabled')
    }

    if (currentPage == pageTotalCount){
        next.classList.add('disabled')
    }else {
        next.classList.remove('disabled')
    }
};

document.addEventListener('click',(e) => {
    if(e.target.classList.contains('page_number')){
        currentPage = e.target.innerText;
        getProducts();
    }
});

next.addEventListener('click', () => {
    if(currentPage == pageTotalCount){
        return;
    }
    currentPage++;
    getProducts();
})
prev.addEventListener('click',() =>{
    if(currentPage == 1){
        return;
    }
    currentPage--;
    getProducts();
});




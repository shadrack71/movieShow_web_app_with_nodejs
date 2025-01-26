const express = require('express')
//const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Book = require('../models/book')
const Author = require('../models/author')
const coverImageBasePath = 'uploads/bookCovers'
const uploadPath = path.join('public', coverImageBasePath)
const router = express.Router()
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
// const upload = multer({
//     dest:uploadPath,
//     fileFilter:(req,file,callback)=>{
//         callback(null,imageMimeTypes.includes(file.mimetype))

//     }
// })

// book Route
router.get('/',async (req,res) => {
    let query = Book.find()

    if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', req.query.publishedAfter)
  }


    try{
         const books = await query.exec()
        res.render('books/index',{
            books:books,
            searchOptions: req.query

})
    }catch{
        res.render('/')

}
   

})

router.get('/new',async(req,res) => {
   renderNewPage(res,new Book())
     
    

})

router.post('/',async (req,res) => {
   //const fileName =  req.file != null ? req.file.filename: null
    
     const book =  new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
        //coverImageName:fileName
     })
     saveCover(book,req.body.cover)
     try{
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`);
        res.redirect('/books');


     }catch ($e){
        // if(book.coverImageName !=null){

        //     removeBookCover(book.coverImageName)
        // }
        console.log($e)
         renderNewPage(res,new Book(),true)

     }
    

  
})
// function removeBookCover(fileName) {
//   fs.unlink(path.join(uploadPath, fileName), err => {
//     if (err) console.error(err)
//   })
// }
async function renderNewPage(res,book,hasError = false) {

     try{
        const author = await Author.find({})
        const params = {
             author: author, book: book
        }
        if (hasError)params.errorMessage = 'Error Creating Book'
        res.render('books/new', params)

    }catch{
        res.redirect('/books')

    }

}

// Show Book Route
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
                           .populate('author')
                           .exec()
    res.render('books/show', { book: book })
  } catch {
    res.redirect('/')
  }
})

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    renderEditPage(res, book)
  } catch {
    res.redirect('/')
  }
})

// Update Book Route
router.put('/:id', async (req, res) => {
  let book

  try {
    book = await Book.findById(req.params.id)
    book.title = req.body.title
    book.author = req.body.author
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(book, req.body.cover)
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
  } catch {
    if (book != null) {
      renderEditPage(res, book, true)
    } else {
      redirect('/')
    }
  }
})

// Delete Book Page
router.delete('/:id', async (req, res) => {
  let book
  try {
    book = await Book.findById(req.params.id)
    await book.remove()
    res.redirect('/books')
  } catch {
    if (book != null) {
      res.render('books/show', {
        book: book,
        errorMessage: 'Could not remove book'
      })
    } else {
      res.redirect('/')
    }
  }
})

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({})
    const params = {
      authors: authors,
      book: book
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Book'
      } else {
        params.errorMessage = 'Error Creating Book'
      }
    }
    res.render(`books/${form}`, params)
  } catch {
    res.redirect('/books')
  }
}




function saveCover(book,coverEncoded){
  if(coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if(cover != null && imageMimeTypes.includes(file.type)){
    book.coverImage = new Buffer.from(cover.data,'base64')
    book.coverImageType = cover.type

  }

}



module.exports = router
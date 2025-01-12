const express = require('express')
const Author = require('../models/author')
const router = express.Router()

// Authors Route
router.get('/',async (req,res) => {
    let searchOptions = {}
    if(req.query.name != null && req.query.name !==' '){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }

    try{
        const authors =  await Author.find(searchOptions)
        res.render('authors/index',
            {authors: authors,searchOptions:req.query})

    }catch(err){
        res.redirect('/')

    }

})

router.get('/new',(req,res) => {
    res.render('authors/new',{author: new Author()})

})

router.post('/',async (req,res) => {
    const author = new Author({
        name:req.body.name

    })


    try {
         const newAuthor = await author.save();
        // Redirect to the author's page (update the URL if needed)
        // res.redirect(`author/${newAuthor.id}`);
        res.redirect('/authors');
    } catch (err) {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error saving author',
        });
}

  
})



module.exports = router
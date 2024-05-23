const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController')








// App route (home)
router.get('/', mainController.homepage);
//router.get('/mylist',isLoggedIn ,  mainController.mylist);
router.get('/login', mainController.login )
router.get('/register', mainController.register )
router.get('/home', mainController.home )
//router.post('/addToLibrary', mainController.addToLibrary);





module.exports = router;
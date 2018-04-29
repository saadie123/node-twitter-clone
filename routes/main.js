const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('main/landing');
});


module.exports = router;
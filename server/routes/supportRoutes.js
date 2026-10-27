const router=require('express').Router();const c=require('../controllers/supportController');const {protect}=require('../middleware/auth');
router.post('/',(req,res,next)=>{if(req.cookies?.token||req.headers.authorization?.startsWith('Bearer '))return protect(req,res,next);next();},c.create);module.exports=router;

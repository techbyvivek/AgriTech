const router=require('express').Router();const c=require('../controllers/soilController');const {protect,allowRoles}=require('../middleware/auth');
router.use(protect,allowRoles('farmer','admin'));router.get('/',c.list);router.post('/',c.create);router.delete('/:id',c.remove);module.exports=router;

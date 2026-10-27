const router=require('express').Router();const c=require('../controllers/cropController');const {protect,allowRoles}=require('../middleware/auth');
router.use(protect,allowRoles('farmer','admin'));router.get('/',c.list);router.post('/',c.create);router.get('/:id',c.getOne);router.patch('/:id',c.update);router.delete('/:id',c.remove);module.exports=router;

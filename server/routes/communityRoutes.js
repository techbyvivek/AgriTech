const router=require('express').Router();const c=require('../controllers/communityController');const {protect}=require('../middleware/auth');
router.get('/posts',c.listPosts);router.post('/posts',protect,c.createPost);router.delete('/posts/:id',protect,c.deletePost);router.get('/posts/:id/comments',c.comments);router.post('/posts/:id/comments',protect,c.addComment);module.exports=router;

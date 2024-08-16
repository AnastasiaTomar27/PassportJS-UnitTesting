const { Router } = require('express');
const usersRouter = require('@users');
const productsRouter = require('@products');
const authRouter = require('@auth');
const cartRouter = require('@cart');

const router = Router();

router.use(usersRouter);
router.use(productsRouter);
router.use(authRouter);
router.use(cartRouter);

module.exports = router;

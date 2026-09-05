const router = require("express").Router();
const { protect } = require("../middleware/auth");
const controller = require("../controllers/address");

router.use(protect);
router.get("/", controller.list);
router.post("/", controller.create);
router.delete("/:id", controller.remove);
module.exports = router;

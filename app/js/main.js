import { router } from "./router.js";
import { Home } from "./components/home/home.js";
import { About } from "./components/about/about.js";

router.register("/", Home);
router.register("/about", About);

if (location.hash) router.navigate(location.hash.replace("#", ""));
else router.navigate("/");

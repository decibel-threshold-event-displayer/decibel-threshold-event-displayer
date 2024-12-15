import { router } from "./router.js";
import { Home } from "./components/home/home.js";

router.register("/", Home);

if (location.hash) router.navigate(location.hash.replace("#", ""));
else router.navigate("/");

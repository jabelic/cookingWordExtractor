import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import daisyui from "daisyui-vue";
const app = createApp(App);
app.mount("#app");
app.use(daisyui);

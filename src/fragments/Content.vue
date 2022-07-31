<script setup lang="ts">
import { onMounted, Ref, ref } from "vue";
import { Program, Programs } from "../types/custom";
// import axios from "axios";
// import jsonpAdapter from "axios-jsonp";

defineProps({
  msg: String,
});
const areas = ref({ 東京: 130 });
const channels = ref({ NHK総合1: "g1" });
const area = areas.value["東京"];
const channel = channels.value["NHK総合1"];
const date = new Date();
const month =
  date.getMonth() + 1 < 10
    ? `0${date.getMonth() + 1}`
    : `${date.getMonth() + 1}`;
const today = `${date.getFullYear()}-${month}-${date.getDate()}`;
console.debug(date);

const programs = ref<Programs>();
(async () => {
  programs.value = await fetch(
    `https://api.nhk.or.jp/v2/pg/list/${area}/${channel}/${today}.json?key=${process.env.VUE_APP_NHK}`,
    {
      method: "GET",
      mode: "cors",
    }
  )
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      return data;
    });
})().then(() => {
  contents.value = setContents(programs);
  //   console.debug(contents.value);
});

const contents = ref<Array<{ content: string; id: string }>>();
const setContents = (programs: Ref<Programs>): Array<Program> => {
  const ary = programs.value.list;
  const contents = [];
  for (let i = 0; i < ary[channel].length; i++) {
    // console.debug({ id: ary[channel][i].id, content: ary[channel][i].content });
    contents.push({ id: ary[channel][i].id, content: ary[channel][i].content });
  }
  return contents;
};

const getFoodWord = () => {};

/** ===========形態素解析================= */
const tokenized = ref();
const getMorphologicalAnalysis = async (text: string) => {
  const url = "https://labs.goo.ne.jp/api/morph";
  tokenized.value = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app_id: process.env.VUE_APP_GOO,
      sentence: text,
    }),
  })
    .then(async (res) => {
      return res;
    })
    .then((data) => {
      return data.json();
    });
};
onMounted(async () => {
  await getMorphologicalAnalysis("カレー");
  console.debug(tokenized.value);
});

//   const deployId =
//     "AKfycbyjVk185-FqRQIhkPjR1UN1_Dx6yWSAbTxDp39AhGWI-yzV9Jqha-MuulFrZnum6EBJ";
//   const url =
//     "https://script.google.com/macros/s/AKfycbyjVk185-FqRQIhkPjR1UN1_Dx6yWSAbTxDp39AhGWI-yzV9Jqha-MuulFrZnum6EBJ/exec";
// const gurl =
//   'https://script.googleusercontent.com/macros/echo?user_content_key=n0e-1vU9J-4EClsBMqFy6W37iahGEw4PPAreYOaortkha9jPVUKvdiKWXTGaXiWEgMQC98_zgftYr-VVZS_vWdXbmFwh1Y9TOJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMWojr9NvTBuBLhyHCd5hHayDwmzNUapfE8h_J5TORQoOY8o6UkXgzL2GyC24AuRqChh9ZUMAflOLgtMF4aBmL8tLslR8KXaFqTYlmcHcLermzWFhs_pqNtuw0EGajgc79r4-y9Cj4L9tNJ_yEgJsQbg&lib=MZ7ovDmtIqK4jG6bOevUvLjvSXAXKOPem?name="this is it"';
</script>

<template>
  <h1>{{ msg }}</h1>
  <div>{{ contents }}</div>
  <a href="http://www.goo.ne.jp/">
    <img
      src="//u.xgoo.jp/img/sgoo.png"
      alt="supported by goo"
      title="supported by goo"
    />
  </a>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>

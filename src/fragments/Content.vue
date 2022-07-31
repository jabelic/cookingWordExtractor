<script setup lang="ts">
import { onMounted, Ref, ref } from "vue";
import { Program, Programs } from "../types/custom";
// import kuromoji from "kuromoji";
import TinySegmenter from "tiny-segmenter";

defineProps({
  msg: String,
});

const areas = ref({ 東京: 130 });
const channels = ref({ NHK総合1: "g1" });
const area: number = areas.value["東京"];
const channel: string = channels.value["NHK総合1"];
const date: Date = new Date();
const month: string =
  date.getMonth() + 1 < 10
    ? `0${date.getMonth() + 1}`
    : `${date.getMonth() + 1}`;
const today: string = `${date.getFullYear()}-${month}-${date.getDate()}`;

const programs = ref<Programs>();
const getNhkPrograms = async () =>
  await fetch(
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

const contents = ref<Array<{ content: string; id: string; title: string }>>();
const setContents = (programs: Ref<Programs>): Array<Program> => {
  const ary = programs.value.list;
  const contents = [];
  for (let i = 0; i < ary[channel].length; i++) {
    contents.push({
      id: ary[channel][i].id,
      title: ary[channel][i].title,
      content: ary[channel][i].content,
    });
  }
  return contents;
};

const googleSearchUrl = "https://www.google.com/search?q=";

const isWordFood = async (word) => {
  try {
    const tmp = await fetch(
      `https://script.google.com/macros/s/AKfycbzO6IMoPPbtBLb_AnRwgB1OheJyF5XwgNyj28NZdyjg76q4AzX0/exec/exec?name=${word}`,
      {
        method: "GET",
      }
    )
      .then((res) => res)
      .then((data) => {
        return data.json();
      });
    return tmp;
  } catch (e) {}
};

// const extractNoun = (tokenized) => {
//   let noun = [];
//   console.debug(tokenized);
//   if ("word_list" in tokenized) {
//     tokenized.word_list.forEach((outer) => {
//       outer.forEach((inner) => {
//         const word_info = {
//           word: inner[0],
//           part: inner[1],
//           furigana: inner[2],
//         };
//         if (word_info.part == "名詞") noun.push(word_info.word);
//       });
//     });
//   }
//   console.debug(noun);
//   return noun;
// };

const tinySegmenter = new TinySegmenter();
const wordToExplore = ref([
  "カニ",
  "うに",
  "小松菜",
  "こまつな",
  "胡麻豆腐",
  "魚",
  "牛",
  "バナナ",
]);

const get_words = (sentence): string[] => {
  const segments = tinySegmenter.segment(sentence);
  return segments.filter((it) => {
    return wordToExplore.value.some((wants) => it.includes(wants));
  });
};

const interestedProgs = ref([]);

const index = (async () => {
  /** NHKの今日の番組一覧 */
  programs.value = await getNhkPrograms();
  /** タイトルと説明を抽出 */
  contents.value = setContents(programs);
  console.debug(contents.value);
  /** 興味関心ワードに一致する番組を抽出 */
  contents.value.forEach(async (item) => {
    if (item.content.length) {
      const detected = get_words(item.content);
      if (detected.length) {
        console.debug(item.title, detected);
        interestedProgs.value.push({
          title: item.title,
          detectedWords: detected,
        });
      }
    }
  });
})();

onMounted(async () => {});
</script>

<template>
  <h1>{{ msg }}</h1>
  <div>{{ interestedProgs }}</div>
  <!-- <a href="http://www.goo.ne.jp/">
    <img
      src="//u.xgoo.jp/img/sgoo.png"
      alt="supported by goo"
      title="supported by goo"
    />
  </a> -->
  <div class="text-center">
    <dv-input class="w-full max-w-xs" placeholder="Type Foods!" />
  </div>
  <details>
    <summary>Details</summary>
    Something small enough to escape casual notice.
  </details>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>

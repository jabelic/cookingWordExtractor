<script setup lang="ts">
import { computed, onMounted, Ref, ref } from "vue";
import { Program, Programs } from "../types/custom";
import TinySegmenter from "tiny-segmenter";
defineProps({
  msg: String,
});
const isLoading = ref(false);
/** あいまい検索
 * 参考: https://qiita.com/H40831/items/5b44ef00cebf532087db
 */
const useAimaiSearch = () => {
  function katakanaToHiragana(src) {
    return src.replace(/[\u30a1-\u30f6]/g, function (match) {
      const chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });
  }

  function hiraganaToKatagana(src) {
    return src.replace(/[\u3041-\u3096]/g, function (match) {
      const chr = match.charCodeAt(0) + 0x60;
      return String.fromCharCode(chr);
    });
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
  }

  function generateFuzzyRegExp(searchWord) {
    searchWord = escapeRegExp(searchWord);
    const chars = searchWord.split("").map((char) => {
      const hiragana = this.katakanaToHiragana(char);
      const katakana = this.hiraganaToKatagana(char);
      if (hiragana === katakana) return char;
      return `(${hiragana}|${katakana})`;
    });
    const fuzzyRegExp = new RegExp(`(${chars.join("")})`, "ig");
    return fuzzyRegExp;
  }
  return {
    katakanaToHiragana,
    hiraganaToKatagana,
    escapeRegExp,
    generateFuzzyRegExp,
  };
};

const {
  katakanaToHiragana,
  hiraganaToKatagana,
  escapeRegExp,
  generateFuzzyRegExp,
} = useAimaiSearch();

/** NHK */
const useNHK = () => {
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
      .then((res) => res.json())
      .then((data) => data);
  /** 抽出された番組情報 */
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
  return {
    areas,
    channels,
    area,
    channel,
    programs,
    getNhkPrograms,
    contents,
    setContents,
  };
};

/** validation */
const isWordFood = async (word) => {
  const getFoodInfo = async (_word) => {
    const tmp = await fetch(
      `https://script.google.com/macros/s/AKfycbzO6IMoPPbtBLb_AnRwgB1OheJyF5XwgNyj28NZdyjg76q4AzX0/exec/exec?name=${_word}`,
      {
        method: "GET",
      }
    );
    return tmp;
  };
  isLoading.value = true;
  try {
    const word1 = hiraganaToKatagana(word); // カタカナに変換
    const word2 = katakanaToHiragana(word); // 平仮名に変換
    const tmp = await getFoodInfo(word);
    if (Object.keys(tmp).length > 0) return { result: tmp, word: word };
    else {
      const tmp = await getFoodInfo(word1);
      if (Object.keys(tmp).length > 0) return { result: tmp, word: word1 };
      else {
        const tmp = await getFoodInfo(word2);
        if (Object.keys(tmp).length > 0) return { result: tmp, word: word2 };
        else throw new Error("");
      }
    }
  } catch (e) {
    alert(`${word}は食材と認識されませんでした。他のワードをお試しください。`);
    inputVal.value = "";
  } finally {
    isLoading.value = false;
  }
};

/** 構文解析器 */
const tinySegmenter = new TinySegmenter();
/** 番組の内容から興味関心ワードを検索する */
const useWordToExplore = () => {
  const wordToExplore = ref([
    "うに",
    "こまつな",
    "魚",
    "くじら",
    "ねぎ",
    "たまご",
    "カニ",
  ]);
  const inputVal = ref();
  const addToWordToExplore = async () => {
    /** すでにリストにあるかないかを確認 */
    if (!wordToExplore.value.includes(inputVal.value)) {
      const { result, word } = await isWordFood(inputVal.value);
      if (Object.keys(result).length) wordToExplore.value.push(word);
      else
        alert(
          `${inputVal.value}は食材と認識されませんでした。他のワードをお試しください。`
        );
    } else {
      alert("すでに登録されています");
    }
    inputVal.value = "";
  };
  const removeWordToExplore = (arg) => {
    wordToExplore.value.forEach((item, index) => {
      if (item === arg) wordToExplore.value.splice(index, 1);
    });
  };

  const get_words = (sentence): string[] => {
    /** 分かち書きされた言葉リスト */
    const segments = tinySegmenter.segment(sentence);
    /** 興味関心ワードを含む単語を取り出す(配列) */
    return segments.filter((it) => {
      return wordToExplore.value.some((wants) =>
        katakanaToHiragana(it).includes(katakanaToHiragana(wants))
      );
    });
  };
  return {
    wordToExplore,
    addToWordToExplore,
    get_words,
    inputVal,
    removeWordToExplore,
  };
};

const useSearchForGoogle = () => {
  const googleSearchUrl = "https://www.google.com/search?q=";
  const getGoogleSearchUrl = (arg: string) => googleSearchUrl + arg;
  return { googleSearchUrl, getGoogleSearchUrl };
};

const {
  areas,
  channels,
  area,
  channel,
  programs,
  getNhkPrograms,
  contents,
  setContents,
} = useNHK();

const {
  wordToExplore,
  addToWordToExplore,
  get_words,
  inputVal,
  removeWordToExplore,
} = useWordToExplore();

/**興味関心ワードに一致する番組の配列 */
const interestedProgs = ref([]);
/** 興味関心ワードに一致する番組を抽出 */
const getMatchProgsWithWords = () => {
  /** 配列初期化 */
  interestedProgs.value.length = 0;
  contents.value.forEach(async (item) => {
    if (item.content.length) {
      const detected = get_words(item.content);
      if (detected.length) {
        console.debug(item.title, detected);
        // if (interestedProgs.value.some((it) => it.title == item.title)) return;
        interestedProgs.value.push({
          title: item.title,
          detectedWords: detected,
        });
      }
    }
  });
};
const { googleSearchUrl, getGoogleSearchUrl } = useSearchForGoogle();

const setProgs = (async () => {
  /** NHKの今日の番組一覧 */
  programs.value = await getNhkPrograms();
  /** タイトルと説明を抽出 */
  contents.value = setContents(programs);
  /** 興味関心ワードに一致する番組を抽出 */
  getMatchProgsWithWords();
})();

const updateOnClick = async () => {
  if (inputVal.value.length == 0) return;
  await addToWordToExplore();
  getMatchProgsWithWords();
};

const removeWordOnClick = (arg) => {
  removeWordToExplore(arg);
  getMatchProgsWithWords();
};

onMounted(async () => {});
</script>

<template>
  <div>
    <div class="progress_back">
      <div v-if="isLoading" class="progress_front_unknown"></div>
    </div>
  </div>

  <h2>{{ msg }}</h2>
  <h4>番組一覧</h4>
  <div class="card">
    <div v-for="item of interestedProgs" :key="item.id" class="card-skin">
      <div class="card__textbox">
        <a
          :href="getGoogleSearchUrl(item.title)"
          target="_blank"
          rel="noopener"
        >
          <div class="card__titletext">
            {{ item.title }}
          </div>
          <div class="card__overviewtext">
            <p v-for="it of item.detectedWords" :key="it">{{ it }}</p>
          </div>
        </a>
      </div>
    </div>
  </div>

  <div class="group">
    <label for="text2">食材ワードリストに追加します</label>
    <div class="search_bar">
      <div class="search_bar_content">
        <i class="fas fa-search search_icon"></i>
        <input
          id="text2"
          type="text"
          placeholder="食材を入力"
          v-model="inputVal"
        />
        <i class="fas fa-times search_icon"></i>
      </div>
    </div>
  </div>
  <div class="add_words">
    <input type="button" value="追加" @click="updateOnClick" />
  </div>

  <div class="word_list">
    <details class="word_list_details" open>
      <summary>フードリスト</summary>
      <ul>
        <li v-for="item of wordToExplore" :key="item" class="list">
          <div>
            {{ item }}
          </div>
          <input
            class="delete_button"
            type="button"
            @click="removeWordOnClick(item)"
            value="削除"
          />
        </li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
/** ローディングバー */
.progress_front_unknown {
  display: block;
  width: 100%;
  height: 7px;
  background: #ccc;
  position: absolute;
  left: 0;
  top: 0;
  border-radius: 10px;
  transition: 0.5s ease-in-out;
  overflow: hidden;
}
.progress_front_unknown::before {
  position: absolute;
  content: "";
  display: inline-block;
  top: 0px;
  left: -48%;
  width: 50%;
  height: 7px;
  background-color: #e31787;
  animation: bar-unknown 3s ease-out infinite;
  border-radius: 50px;
}
@keyframes bar-unknown {
  0% {
    transform: translateX(0%);
  }
  45% {
    transform: translateX(294%);
  }
  50% {
    transform: translateX(294%);
  }
  98% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(0%);
  }
}

h2,
h4 {
  align: center;
}

.read-the-docs {
  color: #888;
}
.word_list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.word_list_details {
  width: 50vw;
  color: rgba(40, 40, 50, 100%);
}
summary {
  position: relative;
  display: block; /* 矢印を消す */
  padding: 10px 10px 10px 30px; /* アイコンの余白を開ける */
  cursor: pointer; /* カーソルをポインターに */
  font-weight: bold;
  background-color: #e2f0f7;
  transition: 0.2s;
}
summary::hover {
  background-color: #ccebfb;
}
summary::-webkit-details-marker {
  display: none; /* 矢印を消す */
}

/* 疑似要素でアイコンを表示 */
summary::before,
summary::after {
  content: "";
  margin: auto 0 auto 10px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
}
summary::before {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background-color: #1da1ff;
}
summary:after {
  left: 6px;
  width: 5px;
  height: 5px;
  border: 4px solid transparent;
  border-left: 5px solid #fff;
  box-sizing: border-box;
  transition: 0.1s;
}

/* オープン時のスタイル */
details[open] summary {
  background-color: #ccebfb;
}
details[open] summary:after {
  transform: rotate(90deg); /* アイコンを回転 */
  left: 4px; /* 位置を調整 */
  top: 5px; /* 位置を調整 */
}

/* アニメーション */
details[open] .details-content {
  animation: fadeIn 0.5s ease;
}
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}

/** ===== フードリスト ===== */
ul,
ol {
  padding: 0;
  position: relative;
}

ul li,
ol li {
  color: rgba(50, 50, 50, 100%);
  font-weight: bold;
  border-left: solid 6px #2d8fdd; /*左側の線*/
  background: #f1f8ff; /*背景色*/
  margin-bottom: 3px; /*下のバーとの余白*/
  line-height: 1.5;
  padding: 0.5em;
  margin: 0.1em;
  list-style-type: none !important; /*ポチ消す*/
}
li {
  display: flex;
}
li >>> div {
  padding-left: 10%;
}
.delete_button {
  margin-left: auto;
  background-color: red;
}

/** ===== input ===== */

.group {
  margin: 1%;
}
.group >>> label {
  color: rgba(200, 200, 100, 70%);
}
.search_bar {
  display: flex; /*アイコン、テキストボックスを調整する*/
  align-items: center; /*アイコン、テキストボックスを縦方向の中心に*/
  justify-content: center; /*アイコン、テキストボックスを横方向の中心に*/
  flex-wrap: wrap;
  /* height: 50px; */
  /* width: 50vw; */
  /* background-color: #ddd; */
}

.search_bar_content {
  height: 50px;
  width: 50vw;
  background-color: #ddd;
}

.search_icon {
  /*アイコンに一定のスペースを設ける*/
  height: 15px;
  width: 15px;
  padding: 5px 5px;
}

#text2 {
  font-size: 16px;
  width: 95%; /*flexの中で100%広げる*/
  height: 100%;
  background-color: rgba(50, 50, 50, 60%);
  border: none; /*枠線非表示*/
  outline: none; /*フォーカス時の枠線非表示*/
  box-sizing: border-box; /*横幅の解釈をpadding, borderまでとする*/
}
#text2::placeholder {
  color: #ddd;
}

.add_words {
  display: flex;
  justify-content: center;
  margin: 2%;
  margin-bottom: 5%;
}
.add_words >>> input[type="button"] {
  width: 50vw;
  height: 5vh;
  font-weight: bold;
  font-size: 1em;
}

/** カード */
.card {
  width: 90%;
  height: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
/* .card__imgframe {
  width: 100%;
  height: auto;
  padding-top: 56.25%;
  background: url(https://placehold.jp/640x360.png) no-repeat center;
  background-size: cover;
  box-sizing: border-box;
} */
.card__textbox {
  width: 100%;
  height: 100%;
  padding: 20px 18px;
  background: #ffffff;
  box-sizing: border-box;
}
.card__textbox > * + * {
  margin-top: 10px;
}
.card__titletext {
  font-size: 20px;
  font-weight: bold;
  line-height: 125%;
}
.card__overviewtext {
  font-size: 12px;
  line-height: 150%;
}
.card-skin {
  flex-flow: wrap;
  width: 35vw;
  overflow: hidden;
  margin-bottom: 1%;
  margin-left: 1%;
  margin-right: 1%;
  border-radius: 8px;
  border-left: solid 1px #ddd;
  border-right: solid 1px #ddd;
  border-bottom: solid 5px #888;
}
</style>

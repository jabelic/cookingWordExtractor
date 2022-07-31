import { defineStore } from "pinia";
import { ref } from "vue";

export const useIndexStore = defineStore("index", () => {
  const count = ref(0);
  const timestamp = ref("");
  function increment() {
    count.value++;
  }
  function setTimeStamp() {
    const _date = new Date();
    const _month: string =
      _date.getMonth() + 1 < 10
        ? `0${_date.getMonth() + 1}`
        : `${_date.getMonth() + 1}`;
    const today: string = `${_date.getFullYear()}-${_month}-${_date.getDate()}`;
    timestamp.value = today;
  }

  const data = ref();
  const _areas = ref({ 東京: 130 });
  const _channels = ref({ NHK総合1: "g1" });
  const _area: number = _areas.value["東京"];
  const _channel: string = _channels.value["NHK総合1"];
  const _date: Date = new Date();
  const _month: string =
    _date.getMonth() + 1 < 10
      ? `0${_date.getMonth() + 1}`
      : `${_date.getMonth() + 1}`;
  const _today: string = `${_date.getFullYear()}-${_month}-${_date.getDate()}`;
  //   const programs = ref<Programs>();
  const getNhkPrograms = async () =>
    await fetch(
      `${process.env.VUE_APP_NHK_END_POINT}${_area}/${_channel}/${_today}.json?key=${process.env.VUE_APP_NHK}`,
      {
        method: "GET",
        mode: "cors",
      }
    )
      .then((res) => res.json())
      .then((_data) => {
        data.value = _data;
      });
  return { count, increment, timestamp, setTimeStamp, getNhkPrograms, data };
});

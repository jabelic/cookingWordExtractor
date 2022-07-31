export interface Programs {
  list: Array<{ [key: string]: Array<Program> }>;
}
export interface Program {
  id: string;
  event_id: string;
  act: string;
  area: { id: string; name: string };
  content: string;
  end_time: Date;
  genres: Array<string>;
  service: {
    id: string;
    name: string;
    logo_s: {
      height: string;
      url: string;
      width: string;
    };
    logo_m: {
      height: string;
      url: string;
      width: string;
    };
    logo_l: {
      height: string;
      url: string;
      width: string;
    };
  };
  start_time: string;
  subtitle: string;
  title: string;
}

//   const deployId =
//     "AKfycbyjVk185-FqRQIhkPjR1UN1_Dx6yWSAbTxDp39AhGWI-yzV9Jqha-MuulFrZnum6EBJ";
//   const url =
//     "https://script.google.com/macros/s/AKfycbyjVk185-FqRQIhkPjR1UN1_Dx6yWSAbTxDp39AhGWI-yzV9Jqha-MuulFrZnum6EBJ/exec";
// const gurl =
//   'https://script.googleusercontent.com/macros/echo?user_content_key=n0e-1vU9J-4EClsBMqFy6W37iahGEw4PPAreYOaortkha9jPVUKvdiKWXTGaXiWEgMQC98_zgftYr-VVZS_vWdXbmFwh1Y9TOJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMWojr9NvTBuBLhyHCd5hHayDwmzNUapfE8h_J5TORQoOY8o6UkXgzL2GyC24AuRqChh9ZUMAflOLgtMF4aBmL8tLslR8KXaFqTYlmcHcLermzWFhs_pqNtuw0EGajgc79r4-y9Cj4L9tNJ_yEgJsQbg&lib=MZ7ovDmtIqK4jG6bOevUvLjvSXAXKOPem?name="this is it"';

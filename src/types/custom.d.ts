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

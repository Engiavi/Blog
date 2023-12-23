import axios from "axios";
const FilterPaginationData = async ({
  create_new_arr = false,
  data,
  page,
  countRoute,
  data_to_send = {},
  state,
}) => {
  let obj;
  if (state != null && !create_new_arr) {
    obj = { ...state, results: [...state.results, ...data], page: page,totalDocs: data.totalDocs, };
  } else {
    await axios
      .post(`${import.meta.env.VITE_SERVER_DOMAIN}${countRoute}`, data_to_send)
      .then(({ data: { totalDocs } }) => {
        obj = { results: data, page: 1, totalDocs };
      })
      .catch((err) => {
        console.log(err);
      });
    }
    return obj;
};

export default FilterPaginationData;
